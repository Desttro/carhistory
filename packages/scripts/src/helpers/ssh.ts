import { run } from './run'

export function isAgentMode(sshKeyPath: string): boolean {
  return !sshKeyPath || sshKeyPath === 'agent'
}

export function buildSSHFlags(sshKey: string): string {
  if (isAgentMode(sshKey)) return '-o StrictHostKeyChecking=no -o ConnectTimeout=10'
  return `-i ${sshKey} -o StrictHostKeyChecking=no -o ConnectTimeout=10`
}

export async function checkSSHKey(sshKeyPath: string): Promise<void> {
  if (isAgentMode(sshKeyPath)) {
    try {
      const { stdout } = await run('ssh-add -l', { silent: true, captureOutput: true })
      if (stdout.includes('no identities') || stdout.trim() === '') {
        throw new Error('ssh agent has no keys loaded')
      }
      console.info('✅ ssh agent mode (keys available)')
    } catch {
      throw new Error('ssh agent has no keys — ensure 1Password SSH agent or ssh-agent is running')
    }
    return
  }

  try {
    await run(`test -f ${sshKeyPath}`, { silent: true })
    console.info('✅ ssh key exists')
  } catch {
    throw new Error(`ssh key not found: ${sshKeyPath}`)
  }
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function testSSHConnection(
  host: string,
  sshKey: string,
  options?: { retries?: number; retryDelayMs?: number }
): Promise<void> {
  const maxRetries = options?.retries ?? 3
  const retryDelay = options?.retryDelayMs ?? 5000
  const flags = buildSSHFlags(sshKey)

  console.info('\n🔑 testing ssh connection...\n')

  let lastError: Error | null = null

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await run(`ssh ${flags} ${host} "echo 'SSH connection successful'"`, {
        silent: attempt > 1,
      })
      console.info('✅ ssh connection verified')
      return
    } catch (err) {
      lastError = err as Error
      if (attempt < maxRetries) {
        console.info(
          `  ssh attempt ${attempt}/${maxRetries} failed, retrying in ${retryDelay / 1000}s...`
        )
        await sleep(retryDelay)
      }
    }
  }

  throw new Error(
    `cannot connect to ${host} after ${maxRetries} attempts - check ssh key: ${sshKey}`
  )
}
