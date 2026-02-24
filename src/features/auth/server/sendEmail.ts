import { render } from '@react-email/components'
import { Resend } from 'resend'

import { APP_NAME } from '~/constants/app'
import { RESEND_API_KEY } from '~/server/env-server'

import type { ReactElement } from 'react'

const NOTIFICATIONS_DOMAIN = 'notifications.carhistory.io'

const resend = new Resend(RESEND_API_KEY)

export async function sendEmail({
  to,
  subject,
  react,
}: {
  to: string
  subject: string
  react: ReactElement
}) {
  const html = await render(react)

  const { error } = await resend.emails.send({
    from: `${APP_NAME} <noreply@${NOTIFICATIONS_DOMAIN}>`,
    to,
    subject,
    html,
  })

  if (error) {
    throw new Error(`failed to send email: ${error.message}`)
  }
}
