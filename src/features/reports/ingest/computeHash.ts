import { createHash } from 'node:crypto'

// compute SHA-256 hash of content for deduplication
export function computeContentHash(content: string): string {
  return createHash('sha256').update(content, 'utf8').digest('hex')
}

// compute a shorter fingerprint for event deduplication
export function computeFingerprint(parts: string[]): string {
  const normalized = parts.map((p) => p.toLowerCase().replace(/[^a-z0-9]/g, '')).join('|')

  return createHash('sha256').update(normalized, 'utf8').digest('hex').slice(0, 16)
}
