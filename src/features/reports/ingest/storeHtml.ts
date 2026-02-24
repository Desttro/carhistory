import { PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'

import { s3Client } from '~/features/upload/s3client'
import { CLOUDFLARE_R2_BUCKET } from '~/server/env-server'

import { computeContentHash } from './computeHash'

import type { ReportProvider } from '../types'

const DEFAULT_BUCKET = CLOUDFLARE_R2_BUCKET || 'chat'

export interface HtmlMetadata {
  r2Key: string
  r2Bucket: string
  contentHash: string
  fileSizeBytes: number
}

// pure computation - prepare metadata without uploading
export function prepareHtmlMetadata(
  html: string,
  vin: string,
  provider: ReportProvider,
  bucket: string = DEFAULT_BUCKET
): HtmlMetadata {
  const contentHash = computeContentHash(html)
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const r2Key = `${vin}/${provider}/${timestamp}.html`

  return {
    r2Key,
    r2Bucket: bucket,
    contentHash,
    fileSizeBytes: Buffer.byteLength(html, 'utf8'),
  }
}

// upload HTML to R2 - call after transaction commits
export async function uploadHtmlToR2(
  html: string,
  r2Key: string,
  vin: string,
  provider: ReportProvider,
  contentHash: string,
  bucket: string = DEFAULT_BUCKET
): Promise<void> {
  const start = Date.now()
  const sizeBytes = Buffer.byteLength(html, 'utf8')

  console.info('[storeHtml] starting R2 upload', { r2Key, vin, provider, sizeBytes })

  try {
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

    console.info('[storeHtml] R2 upload completed', {
      r2Key,
      vin,
      provider,
      durationMs: Date.now() - start,
    })
  } catch (error) {
    console.info('[storeHtml] R2 upload failed', {
      r2Key,
      vin,
      provider,
      durationMs: Date.now() - start,
      error: error instanceof Error ? error.message : String(error),
    })
    throw error
  }
}

// store HTML content in R2 storage (backward compat - calls both prepare + upload)
export async function storeHtml(
  html: string,
  vin: string,
  provider: ReportProvider,
  bucket: string = DEFAULT_BUCKET
): Promise<HtmlMetadata> {
  const metadata = prepareHtmlMetadata(html, vin, provider, bucket)
  await uploadHtmlToR2(html, metadata.r2Key, vin, provider, metadata.contentHash, bucket)
  return metadata
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
