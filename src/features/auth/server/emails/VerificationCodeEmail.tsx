import {
  Body,
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

interface VerificationCodeEmailProps {
  code: string
  email: string
}

export const VerificationCodeEmail = ({ code, email }: VerificationCodeEmailProps) => (
  <Html>
    <Head />
    <Body style={main}>
      <Preview>{`${code} is your ${APP_NAME} verification code`}</Preview>
      <Container style={container}>
        <Section style={box}>
          <Heading as="h2" style={heading}>
            {APP_NAME}
          </Heading>
          <Hr style={hr} />
          <Text style={paragraph}>Enter the following code to verify your identity:</Text>
          <Section style={codeContainer}>
            <Text style={codeStyle}>{code}</Text>
          </Section>
          <Text style={paragraph}>This code expires in 5 minutes.</Text>
          <Hr style={hr} />
          <Text style={footer}>
            If you didn&apos;t request this code, you can safely ignore this email.
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

VerificationCodeEmail.PreviewProps = {
  code: '483921',
  email: 'user@example.com',
} as VerificationCodeEmailProps

export const createVerificationCodeEmail = (props: VerificationCodeEmailProps) => (
  <VerificationCodeEmail {...props} />
)

export default VerificationCodeEmail

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

const codeContainer = {
  background: 'rgba(0,0,0,.05)',
  borderRadius: '4px',
  margin: '16px auto 14px',
  width: '280px',
}

const codeStyle = {
  color: '#1a1a1a',
  fontFamily: 'monospace',
  fontSize: '32px',
  fontWeight: 700,
  letterSpacing: '6px',
  lineHeight: '40px',
  padding: '12px 0',
  margin: '0 auto',
  width: '100%',
  textAlign: 'center' as const,
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
