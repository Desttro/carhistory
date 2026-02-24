import { PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'

import { s3Client } from '~/features/upload/s3client'
import { CLOUDFLARE_R2_BUCKET } from '~/server/env-server'

import { computeContentHash } from './computeHash'

import type { ReportProvider } from '../types'

const DEFAULT_BUCKET = CLOUDFLARE_R2_BUCKET || 'chat'

interface StoreHtmlResult {
  r2Key: string
  r2Bucket: string
  contentHash: string
  fileSizeBytes: number
}

// store HTML content in R2 storage
export async function storeHtml(
  html: string,
  vin: string,
  provider: ReportProvider,
  bucket: string = DEFAULT_BUCKET
): Promise<StoreHtmlResult> {
  const contentHash = computeContentHash(html)
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const r2Key = `${vin}/${provider}/${timestamp}.html`

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: r2Key,
    Body: html,
    ContentType: 'text/html',
    Metadata: {
      vin,
      provider,
      contentHash,
    },
  })

  await s3Client.send(command)

  return {
    r2Key,
    r2Bucket: bucket,
    contentHash,
    fileSizeBytes: Buffer.byteLength(html, 'utf8'),
  }
}

// retrieve HTML content from R2 storage
export async function retrieveHtml(
  r2Key: string,
  bucket: string = DEFAULT_BUCKET
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: r2Key,
  })

  const response = await s3Client.send(command)

  if (!response.Body) {
    throw new Error(`No content found for key: ${r2Key}`)
  }

  return response.Body.transformToString('utf-8')
}
