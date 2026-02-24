#!/usr/bin/env bun

import { cmd } from '@take-out/cli'

await cmd`Deploy to preview`.run(async ({ run, colors, fs, path, prompt }) => {
  // env is loaded by op run (op run --env-file=.env --env-file=.env.preview -- ...)
  const { buildMigrations, buildWeb, buildDockerImage } = await import('./helpers/build')
  const { processComposeEnv } = await import('./helpers/processEnv')
  const { checkSSHKey, testSSHConnection, buildSSHFlags, isAgentMode } =
    await import('./helpers/ssh')
  const { checkUncloudCLI, initUncloud, pushImage, deployStack, showStatus } =
    await import('./helpers/uncloud')
  const { acquireDeployLock, releaseDeployLock } =
    await import('@take-out/scripts/helpers/deploy-lock')

  // parse args
  const args = process.argv.slice(2)
  const skipBuild = args.includes('--skip-build')
  const skipDocker = args.includes('--skip-docker')
  const skipLock = args.includes('--skip-lock')
  const fresh = args.includes('--fresh')

  const DEPLOY_HOST = process.env.DEPLOY_HOST
  const DEPLOY_USER = process.env.DEPLOY_USER || 'root'
  const DEPLOY_SSH_KEY =
    process.env.DEPLOY_SSH_KEY || `${process.env.HOME}/.ssh/uncloud_deploy`

  const pgUser = process.env.POSTGRES_USER || 'user'

  function getSSHCmd(host: string, sshKey: string): string {
    return `ssh ${buildSSHFlags(sshKey)} ${host}`
  }

  function buildSCPFlags(sshKey: string): string {
    if (isAgentMode(sshKey)) return '-o StrictHostKeyChecking=no -o ConnectTimeout=10'
    return `-i ${sshKey} -o StrictHostKeyChecking=no -o ConnectTimeout=10`
  }

  async function tagPreviousImage(host: string, sshKey: string): Promise<void> {
    const ssh = getSSHCmd(host, sshKey)
    try {
      await run(
        `${ssh} "docker tag takeout-web:latest takeout-web:previous 2>/dev/null || true"`,
        { silent: true }
      )
      console.info(colors.gray('  tagged current image as takeout-web:previous'))
    } catch {
      console.info(colors.gray('  no existing image to tag (first deploy?)'))
    }
  }

  async function gracefulStopZero(host: string, sshKey: string): Promise<void> {
    const ssh = getSSHCmd(host, sshKey)
    try {
      const { stdout } = await run(`${ssh} "docker ps -qf name=zero"`, {
        captureOutput: true,
        silent: true,
      })
      const containerId = stdout.trim()
      if (!containerId) return

      console.info(colors.gray('  stopping zero gracefully (15s timeout)...'))
      await run(`${ssh} "docker stop -t 15 ${containerId}"`, { silent: true })
      console.info(colors.gray('  zero stopped cleanly'))
    } catch {
      console.info(colors.gray('  zero: not running or already stopped'))
    }
  }

  async function gracefulStopPgdb(host: string, sshKey: string): Promise<void> {
    const ssh = getSSHCmd(host, sshKey)
    try {
      const { stdout } = await run(`${ssh} "docker ps -qf name=pgdb"`, {
        captureOutput: true,
        silent: true,
      })
      const containerId = stdout.trim()
      if (!containerId) return

      const { stdout: ready } = await run(
        `${ssh} "docker exec ${containerId} pg_isready -U ${pgUser} 2>&1 || echo NOT_READY"`,
        { captureOutput: true, silent: true }
      )

      if (ready.includes('NOT_READY')) {
        console.info(colors.gray('  pgdb: not ready, skipping graceful stop'))
        return
      }

      console.info(colors.gray('  pgdb: issuing CHECKPOINT before stop...'))
      await run(
        `${ssh} "docker exec ${containerId} psql -U ${pgUser} -d postgres -c 'CHECKPOINT;'"`,
        { silent: true }
      )

      console.info(colors.gray('  stopping pgdb gracefully (60s timeout)...'))
      await run(`${ssh} "docker stop -t 60 ${containerId}"`, { silent: true })
      console.info(colors.gray('  pgdb stopped cleanly'))
    } catch {
      console.info(colors.gray('  pgdb: not running or already stopped'))
    }
  }

  async function removeVolumes(host: string, sshKey: string): Promise<void> {
    const ssh = getSSHCmd(host, sshKey)
    console.info(colors.red('\n🗑️  removing all containers and volumes for fresh deploy...'))

    // remove all containers first — stopped containers still hold volume references
    // and docker volume rm refuses to remove volumes referenced by any container
    try {
      const { stdout } = await run(
        `${ssh} "docker ps -aq"`,
        { captureOutput: true, silent: true }
      )
      const containers = stdout.trim().split('\n').filter(Boolean)
      if (containers.length > 0) {
        await run(`${ssh} "docker rm -f ${containers.join(' ')}"`, { silent: true })
        console.info(colors.gray(`  removed ${containers.length} container(s)`))
      }
    } catch {
      console.info(colors.gray('  no containers to remove'))
    }

    // now remove volumes
    for (const volumePattern of ['pgdb_data', 'zero_data']) {
      try {
        const { stdout } = await run(
          `${ssh} "docker volume ls -q | grep '${volumePattern}' || true"`,
          { captureOutput: true, silent: true }
        )
        const volumes = stdout.trim().split('\n').filter(Boolean)
        if (volumes.length === 0) {
          console.info(colors.gray(`  no ${volumePattern} volume found (first deploy?)`))
          continue
        }
        for (const vol of volumes) {
          await run(`${ssh} "docker volume rm -f ${vol}"`)
          console.info(colors.gray(`  removed volume: ${vol}`))
        }
      } catch (err) {
        console.error(colors.red(`  failed to remove ${volumePattern}: ${err instanceof Error ? err.message : err}`))
      }
    }
  }

  async function checkPrerequisites(): Promise<void> {
    console.info('📋 checking prerequisites...\n')

    if (!DEPLOY_HOST) {
      throw new Error(
        'DEPLOY_HOST not set\n\nFor local use, run: bun tko onboard\nFor CI, ensure DEPLOY_HOST is in GitHub secrets'
      )
    }

    console.info(`✅ deploy host: ${DEPLOY_HOST}`)
    console.info(`✅ deploy user: ${DEPLOY_USER}`)
    console.info(`✅ using self-hosted database (pgdb container)`)

    await checkUncloudCLI()
    await checkSSHKey(DEPLOY_SSH_KEY)
  }

  async function uploadOriginCACerts(host: string, sshKey: string): Promise<void> {
    const certPath = process.env.ORIGIN_CA_CERT
    const keyPath = process.env.ORIGIN_CA_KEY

    if (!certPath || !keyPath) {
      return
    }

    const resolvedCert = path.resolve(process.cwd(), certPath)
    const resolvedKey = path.resolve(process.cwd(), keyPath)

    if (!fs.existsSync(resolvedCert)) {
      console.warn(colors.yellow(`⚠️  origin ca cert not found: ${resolvedCert}`))
      console.warn(colors.gray("   falling back to let's encrypt"))
      return
    }

    if (!fs.existsSync(resolvedKey)) {
      console.warn(colors.yellow(`⚠️  origin ca key not found: ${resolvedKey}`))
      console.warn(colors.gray("   falling back to let's encrypt"))
      return
    }

    console.info('\n🔐 uploading origin ca certificates...')

    const ssh = getSSHCmd(host, sshKey)
    const scpFlags = buildSCPFlags(sshKey)

    try {
      await run(
        `${ssh} "sudo mkdir -p /etc/uncloud/certs /var/lib/uncloud/caddy/certs"`,
        { silent: true }
      )

      await run(`scp ${scpFlags} ${resolvedCert} ${host}:/tmp/origin.pem`)
      await run(`scp ${scpFlags} ${resolvedKey} ${host}:/tmp/origin.key`)

      await run(
        `${ssh} "sudo mv /tmp/origin.pem /etc/uncloud/certs/origin.pem && sudo mv /tmp/origin.key /etc/uncloud/certs/origin.key"`,
        { silent: true }
      )

      await run(
        `${ssh} "sudo cp /etc/uncloud/certs/origin.* /var/lib/uncloud/caddy/certs/"`,
        { silent: true }
      )

      await run(
        `${ssh} "sudo chmod 600 /etc/uncloud/certs/origin.key /var/lib/uncloud/caddy/certs/origin.key"`,
        { silent: true }
      )

      console.info(colors.green('✓ origin ca certificates uploaded'))
      console.info(
        colors.gray('  certs available at /config/certs inside caddy container')
      )
    } catch (err) {
      console.warn(colors.yellow('⚠️  failed to upload origin ca certs'))
      console.warn(colors.gray(`   ${err instanceof Error ? err.message : err}`))
      console.warn(colors.gray("   falling back to let's encrypt"))
    }
  }

  async function deployCaddyWithTLS(host: string, sshKey: string): Promise<void> {
    const certPath = process.env.ORIGIN_CA_CERT
    const keyPath = process.env.ORIGIN_CA_KEY

    if (!certPath || !keyPath) {
      return
    }

    const webHost = process.env.VITE_WEB_HOSTNAME
    const zeroHost = process.env.VITE_ZERO_HOSTNAME
    const domains = [webHost, zeroHost].filter(Boolean)

    if (domains.length === 0) {
      console.warn(
        colors.yellow(
          '⚠️  no custom domains configured (VITE_WEB_HOSTNAME, VITE_ZERO_HOSTNAME)'
        )
      )
      console.warn(colors.gray("   caddy will use let's encrypt for tls"))
      return
    }

    const caddyfilePath = path.resolve(process.cwd(), 'src/uncloud/Caddyfile')
    const caddyConfig = [
      '# origin ca certificates for cloudflare proxied domains',
      '# auto-generated during deploy from VITE_WEB_HOSTNAME/VITE_ZERO_HOSTNAME env vars',
      '',
      ...domains.map(
        (domain) =>
          `${domain} {\n\ttls /config/certs/origin.pem /config/certs/origin.key\n}`
      ),
      '',
    ].join('\n')

    await fs.promises.writeFile(caddyfilePath, caddyConfig)
    console.info(colors.gray(`   generated caddyfile for: ${domains.join(', ')}`))

    console.info('\n🔄 deploying caddy with custom tls config...')

    const ssh = getSSHCmd(host, sshKey)

    try {
      await run(`echo "y" | uc caddy deploy --caddyfile ${caddyfilePath}`)

      await run(`${ssh} "docker restart \\$(docker ps -qf name=caddy)"`, {
        silent: true,
      })
      console.info(colors.green('✓ caddy deployed with origin ca certificates'))
    } catch (err) {
      console.warn(colors.yellow('⚠️  failed to deploy caddy with custom config'))
      console.warn(colors.gray(`   ${err instanceof Error ? err.message : err}`))
      console.warn(
        colors.gray(
          '   you may need to run: uc caddy deploy --caddyfile src/uncloud/Caddyfile'
        )
      )
    }
  }

  if (fresh) {
    console.info(colors.red('\n⚠️  --fresh: this will DELETE all database and zero data on the preview server'))
    console.info(colors.red('   the preview environment will start completely from scratch\n'))
    const confirmed = await prompt.confirm({ message: 'are you sure you want to wipe all preview data?' })
    if (prompt.isCancel(confirmed) || !confirmed) {
      console.info('cancelled.')
      process.exit(0)
    }
  }

  console.info('🎯 deploying takeout to preview\n')

  await checkPrerequisites()

  // build steps
  if (!skipBuild) {
    await buildMigrations()
    await buildWeb()
  } else {
    console.info('⏭️  skipping web build (--skip-build)')
  }

  if (!skipDocker) {
    await buildDockerImage()
  } else {
    console.info('⏭️  skipping docker build (--skip-docker)')
  }

  const host = `${DEPLOY_USER}@${DEPLOY_HOST}`

  await testSSHConnection(host, DEPLOY_SSH_KEY)

  const ssh = getSSHCmd(host, DEPLOY_SSH_KEY)

  if (!skipLock) {
    await acquireDeployLock(ssh)
    console.info(colors.gray('  acquired deploy lock'))
  }

  try {
    await tagPreviousImage(host, DEPLOY_SSH_KEY)

    await initUncloud(host, DEPLOY_SSH_KEY)

    await uploadOriginCACerts(host, DEPLOY_SSH_KEY)

    if (!skipDocker) {
      await pushImage('takeout-web:latest')
    } else {
      console.info('⏭️  skipping image push (--skip-docker)')
    }

    // process environment variables in compose file
    // no need to override ZERO_UPSTREAM_DB/CVR/CHANGE — compose defaults point to pgdb
    console.info('\n📝 processing compose file with preview env...\n')
    const processedCompose = 'src/uncloud/docker-compose.processed.yml'
    console.info(colors.gray(`   zero version: ${process.env.ZERO_VERSION}`))
    processComposeEnv('src/uncloud/docker-compose.yml', processedCompose, {
      ...(process.env as Record<string, string | undefined>),
    })

    await gracefulStopZero(host, DEPLOY_SSH_KEY)
    await gracefulStopPgdb(host, DEPLOY_SSH_KEY)

    if (fresh) {
      await removeVolumes(host, DEPLOY_SSH_KEY)
    }

    // deploy with self-hosted-db profile to include pgdb service
    await deployStack(processedCompose, { profile: 'self-hosted-db' })

    await deployCaddyWithTLS(host, DEPLOY_SSH_KEY)

    await showStatus()

    console.info('\n🎉 preview deployment ready!')
    console.info('\naccess your app:')
    console.info(`  web app:     http://${DEPLOY_HOST}:8081`)
    console.info(`  zero sync:   http://${DEPLOY_HOST}:4848`)
    console.info(`  ssh:         ssh ${DEPLOY_USER}@${DEPLOY_HOST}`)
    console.info('\nuseful commands:')
    console.info('  uc ls                    # list services')
    console.info('  uc logs web              # view web logs')
    console.info('  uc logs web -f           # follow web logs')
    console.info(`  ssh ${DEPLOY_USER}@${DEPLOY_HOST}  # ssh to server`)
    console.info('\nto skip builds on redeploy:')
    console.info(
      '  op run --env-file=.env --env-file=.env.preview -- bun tko uncloud deploy-preview --skip-build --skip-docker'
    )
    console.info('\nto wipe all data and start fresh:')
    console.info('  bun deploy:preview --fresh')
  } finally {
    if (!skipLock) {
      await releaseDeployLock(ssh)
      console.info(colors.gray('  released deploy lock'))
    }
  }
})
