import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'

import { APP_NAME, DOMAIN, ADMIN_EMAIL } from '~/constants/app'

interface MagicLinkEmailProps {
  url: string
  email: string
}

export const MagicLinkEmail = ({ url, email }: MagicLinkEmailProps) => (
  <Html>
    <Head />
    <Body style={main}>
      <Preview>{`Sign in to ${APP_NAME}`}</Preview>
      <Container style={container}>
        <Section style={box}>
          <Heading as="h2" style={heading}>
            {APP_NAME}
          </Heading>
          <Hr style={hr} />
          <Text style={paragraph}>
            Click the button below to sign in to your account:
          </Text>
          <Button style={button} href={url}>
            Sign in to {APP_NAME}
          </Button>
          <Text style={secondaryText}>Or copy and paste this URL into your browser:</Text>
          <code style={code}>{url}</code>
          <Hr style={hr} />
          <Text style={footer}>
            If you didn&apos;t request this link, you can safely ignore this email.
            Contact{' '}
            <Link href={`mailto:${ADMIN_EMAIL}`} style={link}>
              {ADMIN_EMAIL}
            </Link>{' '}
            if you have concerns.
          </Text>
          <Text style={footer}>
            &copy; {APP_NAME} &middot;{' '}
            <Link href={`https://${DOMAIN}`} style={link}>
              {DOMAIN}
            </Link>
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

MagicLinkEmail.PreviewProps = {
  url: 'https://carhistory.io/api/auth/magic-link/verify?token=abc123',
  email: 'user@example.com',
} as MagicLinkEmailProps

export const createMagicLinkEmail = (props: MagicLinkEmailProps) => (
  <MagicLinkEmail {...props} />
)

export default MagicLinkEmail

const fontFamily =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Ubuntu, sans-serif"

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily,
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  maxWidth: '480px',
}

const box = {
  padding: '0 48px',
}

const heading = {
  color: '#1a1a1a',
  fontSize: '20px',
  fontWeight: 700,
  textAlign: 'center' as const,
  margin: '24px 0 0',
}

const hr = {
  borderColor: '#e6ebf1',
  margin: '20px 0',
}

const paragraph = {
  color: '#525f7f',
  fontSize: '16px',
  lineHeight: '24px',
  textAlign: 'center' as const,
}

const button = {
  backgroundColor: '#1a1a1a',
  borderRadius: '5px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  width: '100%',
  padding: '12px',
  margin: '8px 0 16px',
}

const secondaryText = {
  color: '#8898aa',
  fontSize: '13px',
  lineHeight: '20px',
  textAlign: 'center' as const,
  margin: '0 0 8px',
}

const code = {
  display: 'block',
  padding: '12px 16px',
  backgroundColor: '#f4f4f4',
  borderRadius: '4px',
  border: '1px solid #eee',
  color: '#333',
  fontSize: '13px',
  lineHeight: '20px',
  wordBreak: 'break-all' as const,
}

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  textAlign: 'center' as const,
}

const link = {
  color: '#556cd6',
  textDecoration: 'underline',
}
