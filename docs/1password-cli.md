---
name: 1password-cli
description: Use this skill when working with the 1Password CLI (`op` command) for secrets management, retrieving API keys, injecting secrets into development environments, or any task involving 1Password vault operations. Triggers on: "1password", "op command", "secrets management", "api keys from vault", "op run", "op read", "service account token".
---

# 1Password CLI Skill

Use this skill when working with the 1Password CLI (`op` command) for secrets management, retrieving API keys, or injecting secrets into development environments.

> **IMPORTANT**: All operations in this project MUST use the **CarHistory** vault exclusively. Never store project secrets in Personal, Private, or other vaults.

## Project Defaults

```bash
VAULT="CarHistory"
```

All commands below use `--vault CarHistory`. When scripting, always pass `--vault CarHistory` explicitly.

## Installation

```bash
# macOS
brew install 1password-cli

# Verify installation
op --version
```

## Authentication Methods

### 1. Desktop App Integration (Recommended for Development)

1. Open 1Password app > Settings > Developer
2. Enable "Integrate with 1Password CLI"
3. Run any `op` command - authenticates via Touch ID/Windows Hello

```bash
op vault list
```

### 2. Service Account Token (CI/CD & Automation)

```bash
export OP_SERVICE_ACCOUNT_TOKEN="ops_..."
op vault list
```

Create service accounts at 1Password.com > Developer Tools > Service Accounts. Grant access **only** to the CarHistory vault.

### 3. Manual Sign In (Legacy)

```bash
eval $(op signin)
```

## Secret Reference Syntax

Format: `op://vault/item/[section/]field`

```
op://CarHistory/item-name/field-name
op://CarHistory/item-name/section-name/field-name
```

### Get a Reference

```bash
op item get "Cloudflare R2" --vault CarHistory --fields secret-key --format json | jq -r '.reference'
# op://CarHistory/Cloudflare R2/secret-key
```

## Reading Secrets

```bash
# single secret
op read "op://CarHistory/Resend/api-key"

# full item as json
op item get "Cloudflare R2" --vault CarHistory --format json

# specific fields
op item get "Database Production" --vault CarHistory --fields username,password

# list all items in vault
op item list --vault CarHistory

# search by tag
op item list --vault CarHistory --tags production
```

## Environment Files — .env.production & .env.preview

`op run` resolves **only** values that start with `op://`. Plain values pass through unchanged. This means you can mix config and secrets in the same env file.

### How It Works

```bash
# plain values pass through as-is
DEPLOYMENT_PLATFORM=uncloud
DEPLOY_HOST=carhistory.io
NODE_ENV=production

# op:// references get resolved at runtime
BETTER_AUTH_SECRET="op://CarHistory/Auth Production/secret"
CLOUDFLARE_R2_SECRET_KEY="op://CarHistory/Cloudflare R2/secret-key"
RESEND_API_KEY="op://CarHistory/Resend/api-key"
```

```bash
# run with secrets injected — works with any env file
op run --env-file=.env.production -- bun ops release
op run --env-file=.env.preview -- bun dev
```

### .env.production — Secret References

Replace these hardcoded secrets with `op://` references. All other values (URLs, hostnames, ports, public keys, file paths) stay as plain text.

```bash
# database
DEPLOY_DB="op://CarHistory/Database Production/connection-string"

# auth
BETTER_AUTH_SECRET="op://CarHistory/Auth Production/secret"

# cloudflare r2 storage
CLOUDFLARE_R2_ACCESS_KEY="op://CarHistory/Cloudflare R2/access-key"
CLOUDFLARE_R2_SECRET_KEY="op://CarHistory/Cloudflare R2/secret-key"

# email
RESEND_API_KEY="op://CarHistory/Resend/api-key"

# vin lookup
BULKVIN_API_KEY="op://CarHistory/BulkVIN/api-key"

# polar (payments)
POLAR_ACCESS_TOKEN="op://CarHistory/Polar Production/access-token"
POLAR_WEBHOOK_SECRET="op://CarHistory/Polar Production/webhook-secret"

# revenuecat
REVENUECAT_API_KEY="op://CarHistory/RevenueCat/secret-key"
REVENUECAT_WEBHOOK_AUTH="op://CarHistory/RevenueCat/webhook-auth"

# apple auth
APPLE_CLIENT_SECRET="op://CarHistory/Apple Auth Production/client-secret"

# google auth
GOOGLE_CLIENT_SECRET="op://CarHistory/Google Auth/client-secret"

# deploy
DEPLOY_SSH_KEY="op://CarHistory/Deploy SSH Production/private-key"
```

### .env.preview — Secret References

Same items, different environment tags where applicable:

```bash
# database
DEPLOY_DB="op://CarHistory/Database Preview/connection-string"

# auth
BETTER_AUTH_SECRET="op://CarHistory/Auth Preview/secret"

# cloudflare r2 storage (shared with production)
CLOUDFLARE_R2_ACCESS_KEY="op://CarHistory/Cloudflare R2/access-key"
CLOUDFLARE_R2_SECRET_KEY="op://CarHistory/Cloudflare R2/secret-key"

# email (shared with production)
RESEND_API_KEY="op://CarHistory/Resend/api-key"

# vin lookup (shared with production)
BULKVIN_API_KEY="op://CarHistory/BulkVIN/api-key"

# polar (sandbox)
POLAR_ACCESS_TOKEN="op://CarHistory/Polar Preview/access-token"
POLAR_WEBHOOK_SECRET="op://CarHistory/Polar Preview/webhook-secret"

# revenuecat (shared with production)
REVENUECAT_API_KEY="op://CarHistory/RevenueCat/secret-key"
REVENUECAT_WEBHOOK_AUTH="op://CarHistory/RevenueCat/webhook-auth"

# apple auth
APPLE_CLIENT_SECRET="op://CarHistory/Apple Auth Preview/client-secret"

# google auth (shared with production)
GOOGLE_CLIENT_SECRET="op://CarHistory/Google Auth/client-secret"

# deploy
DEPLOY_SSH_KEY="op://CarHistory/Deploy SSH Preview/private-key"
```

### Values That Stay Plain Text (Not Secrets)

These are config, not secrets — leave them hardcoded in env files:

```bash
# deployment config
DEPLOYMENT_PLATFORM=uncloud
DEPLOYMENT_ARCH=linux/amd64
DEPLOY_HOST=carhistory.io
DEPLOY_USER=root
NODE_ENV=production

# app urls
ONE_SERVER_URL=https://carhistory.io
BETTER_AUTH_URL=https://carhistory.io
VITE_ZERO_HOSTNAME=zero.carhistory.io
VITE_WEB_HOSTNAME=carhistory.io

# public endpoints
CLOUDFLARE_R2_ENDPOINT=https://....cloudflarestorage.com
CLOUDFLARE_R2_PUBLIC_URL=https://media.carhistory.io

# public keys (safe to commit)
VITE_POSTHOG_API_KEY=phc_...
VITE_POSTHOG_HOST=https://eu.i.posthog.com
VITE_REVENUECAT_API_PUBLIC=appl_...
REVENUECAT_PROJECT_ID=proj...
APPLE_CLIENT_ID=io.carhistory.app.si
APPLE_APP_BUNDLE_IDENTIFIER=io.carhistory.app
GOOGLE_CLIENT_ID=...apps.googleusercontent.com
POLAR_MODE=production

# file paths
ORIGIN_CA_CERT=certs/origin.pem
ORIGIN_CA_KEY=certs/origin.key
```

## Item Templates — Create All Project Items

Field type syntax: `field-name[type]=value`

Available types: `text`, `concealed`, `url`, `email`, `date`, `phone`, `totp`, `monthYear`

Default type is `text` when `[type]` is omitted.

### Database Production

```bash
op item create \
  --vault CarHistory \
  --category Database \
  --title "Database Production" \
  --tags "database,production" \
  'type[text]=PostgreSQL' \
  'server[text]=HOST' \
  'port[text]=5432' \
  'database[text]=postgres' \
  'username[text]=user' \
  'password[concealed]=PASSWORD' \
  'connection-string[concealed]=postgresql://user:PASSWORD@HOST:5432/postgres' \
  'ssl[text]=require'
```

### Database Preview

```bash
op item create \
  --vault CarHistory \
  --category Database \
  --title "Database Preview" \
  --tags "database,preview" \
  'type[text]=PostgreSQL' \
  'server[text]=HOST' \
  'port[text]=5432' \
  'database[text]=postgres' \
  'username[text]=user' \
  'password[concealed]=PASSWORD' \
  'connection-string[concealed]=postgresql://user:PASSWORD@HOST:5432/postgres' \
  'ssl[text]=require'
```

### Auth Production

```bash
op item create \
  --vault CarHistory \
  --category Password \
  --title "Auth Production" \
  --tags "auth,production" \
  --generate-password='64,letters,digits' \
  'secret[concealed]=BETTER_AUTH_SECRET_VALUE'
```

### Auth Preview

```bash
op item create \
  --vault CarHistory \
  --category Password \
  --title "Auth Preview" \
  --tags "auth,preview" \
  --generate-password='64,letters,digits' \
  'secret[concealed]=BETTER_AUTH_SECRET_VALUE'
```

### Cloudflare R2

```bash
op item create \
  --vault CarHistory \
  --category "API Credential" \
  --title "Cloudflare R2" \
  --tags "storage,cloudflare" \
  --url "https://dash.cloudflare.com" \
  'access-key[concealed]=ACCESS_KEY' \
  'secret-key[concealed]=SECRET_KEY' \
  'endpoint[url]=https://....cloudflarestorage.com' \
  'public-url[url]=https://media.carhistory.io'
```

### Resend

```bash
op item create \
  --vault CarHistory \
  --category "API Credential" \
  --title "Resend" \
  --tags "email,shared" \
  --url "https://resend.com/api-keys" \
  'api-key[concealed]=re_...'
```

### BulkVIN

```bash
op item create \
  --vault CarHistory \
  --category "API Credential" \
  --title "BulkVIN" \
  --tags "vin,shared" \
  --url "https://www.bulkvin.com" \
  'api-key[concealed]=282_...'
```

### Polar Production

```bash
op item create \
  --vault CarHistory \
  --category "API Credential" \
  --title "Polar Production" \
  --tags "payments,production" \
  --url "https://polar.sh" \
  'access-token[concealed]=polar_oat_...' \
  'webhook-secret[concealed]=polar_whs_...' \
  'mode[text]=production'
```

### Polar Preview

```bash
op item create \
  --vault CarHistory \
  --category "API Credential" \
  --title "Polar Preview" \
  --tags "payments,preview,sandbox" \
  --url "https://sandbox.polar.sh" \
  'access-token[concealed]=polar_oat_...' \
  'webhook-secret[concealed]=polar_whs_...' \
  'mode[text]=sandbox'
```

### RevenueCat

```bash
op item create \
  --vault CarHistory \
  --category "API Credential" \
  --title "RevenueCat" \
  --tags "payments,subscriptions,shared" \
  --url "https://app.revenuecat.com" \
  'secret-key[concealed]=sk_...' \
  'webhook-auth[concealed]=WEBHOOK_AUTH_VALUE' \
  'project-id[text]=proj...' \
  'public-key[text]=appl_...'
```

### Apple Auth Production

```bash
op item create \
  --vault CarHistory \
  --category "API Credential" \
  --title "Apple Auth Production" \
  --tags "auth,apple,production" \
  --url "https://developer.apple.com" \
  'client-id[text]=io.carhistory.app.si' \
  'client-secret[concealed]=eyJ...' \
  'bundle-identifier[text]=io.carhistory.app'
```

### Apple Auth Preview

```bash
op item create \
  --vault CarHistory \
  --category "API Credential" \
  --title "Apple Auth Preview" \
  --tags "auth,apple,preview" \
  --url "https://developer.apple.com" \
  'client-id[text]=io.carhistory.app.preview.si' \
  'client-secret[concealed]=eyJ...' \
  'bundle-identifier[text]=io.carhistory.app.preview'
```

### Google Auth

```bash
op item create \
  --vault CarHistory \
  --category "API Credential" \
  --title "Google Auth" \
  --tags "auth,google,shared" \
  --url "https://console.cloud.google.com/apis/credentials" \
  'client-id[text]=...apps.googleusercontent.com' \
  'client-secret[concealed]=GOCSPX-...'
```

### Deploy SSH Production

```bash
op item create \
  --vault CarHistory \
  --category "SSH Key" \
  --title "Deploy SSH Production" \
  --tags "deploy,ssh,production" \
  'private-key[concealed]=-----BEGIN OPENSSH PRIVATE KEY-----...' \
  'public-key[text]=ssh-ed25519 AAAA...' \
  'host[text]=carhistory.io' \
  'user[text]=root'
```

### Deploy SSH Preview

```bash
op item create \
  --vault CarHistory \
  --category "SSH Key" \
  --title "Deploy SSH Preview" \
  --tags "deploy,ssh,preview" \
  'private-key[concealed]=-----BEGIN OPENSSH PRIVATE KEY-----...' \
  'public-key[text]=ssh-ed25519 AAAA...' \
  'host[text]=preview.carhistory.io' \
  'user[text]=root'
```

## Modifying Items

### Edit Fields

```bash
# update a single field
op item edit "Resend" --vault CarHistory 'api-key[concealed]=re_new...'

# update multiple fields
op item edit "Database Production" --vault CarHistory \
  'password[concealed]=new_password' \
  'connection-string[concealed]=postgresql://user:new_password@HOST:5432/postgres'

# change title
op item edit "Old Name" --vault CarHistory --title "New Name"

# add/change tags
op item edit "Resend" --vault CarHistory --tags "email,shared,v2"

# change url
op item edit "Polar Production" --vault CarHistory --url "https://polar.sh/settings"
```

### Add Fields to Existing Items

```bash
# add a new field
op item edit "Cloudflare R2" --vault CarHistory 'bucket-name[text]=carhistory-media'

# add a field in a section
op item edit "Database Production" --vault CarHistory 'Replica.connection-string[concealed]=postgresql://...'
```

### Delete Items

```bash
op item delete "Old API Key" --vault CarHistory
```

## Common Workflows

### Export Secrets to Shell

```bash
export RESEND_API_KEY=$(op read "op://CarHistory/Resend/api-key")
export DEPLOY_DB=$(op read "op://CarHistory/Database Production/connection-string")
```

### Run With Environment

```bash
# production deploy
op run --env-file=.env.production -- bun ops release

# preview deploy
op run --env-file=.env.preview -- bun uncloud deploy-preview

# local dev with production secrets (if needed)
op run --env-file=.env.production -- bun dev
```

### Inline in Commands

```bash
curl -H "Authorization: Bearer $(op read 'op://CarHistory/BulkVIN/api-key')" \
  https://api.bulkvin.com/v2/decode/...
```

## Security Best Practices

1. **CarHistory vault only** — never store project secrets elsewhere
2. **Use `op run` over export** — secrets exist only during command execution
3. **Service accounts for CI/CD** — grant access only to CarHistory vault
4. **Tag consistently** — use `production`, `preview`, `shared` tags
5. **Separate items per environment** — Database Production vs Database Preview
6. **Share when safe** — Resend, BulkVIN, Google Auth can be `shared` across envs
7. **Use `[concealed]` type** — for any sensitive value (keys, passwords, tokens, JWTs)
8. **Sections for grouping** — use `Section.field` syntax for related fields (e.g., `Replica.connection-string`)

## Troubleshooting

```bash
# check session
op whoami

# re-authenticate
eval $(op signin)

# verify vault access
op vault list

# find an item
op item list --vault CarHistory | grep "item-name"

# debug: show full item json
op item get "item-name" --vault CarHistory --format json

# test env file resolution (secrets masked in output)
op run --env-file=.env.production -- printenv RESEND_API_KEY
```

## Quick Reference

| Command | Description |
|---------|-------------|
| `op item list --vault CarHistory` | List all items |
| `op item get "Name" --vault CarHistory` | Get item details |
| `op item get "Name" --vault CarHistory --format json` | Get item as JSON |
| `op read "op://CarHistory/..."` | Read a secret value |
| `op item create --vault CarHistory --category "..." ...` | Create new item |
| `op item edit "Name" --vault CarHistory 'field=val'` | Edit item fields |
| `op item delete "Name" --vault CarHistory` | Delete item |
| `op run --env-file=.env.production -- cmd` | Run with production secrets |
| `op run --env-file=.env.preview -- cmd` | Run with preview secrets |
| `op whoami` | Check current session |
