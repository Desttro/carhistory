import { Resend } from 'resend'

import { APP_NAME, DOMAIN } from '~/constants/app'
import { RESEND_API_KEY } from '~/server/env-server'

const resend = new Resend(RESEND_API_KEY)

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}) {
  const { error } = await resend.emails.send({
    from: `${APP_NAME} <noreply@${DOMAIN}>`,
    to,
    subject,
    html,
  })

  if (error) {
    throw new Error(`failed to send email: ${error.message}`)
  }
}
