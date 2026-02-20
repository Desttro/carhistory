import { useState } from 'react'
import { Separator, SizableText, Spinner, XStack } from 'tamagui'

import { authClient } from '~/features/auth/client/authClient'
import { Button } from '~/interface/buttons/Button'
import { AppleIcon } from '~/interface/icons/AppleIcon'
import { GoogleIcon } from '~/interface/icons/GoogleIcon'
import { showToast } from '~/interface/toast/helpers'

export const LoginSocialButtons = () => {
  const [loading, setLoading] = useState<'google' | 'apple' | null>(null)

  if (process.env.NODE_ENV === 'development') return null

  const handleSocialLogin = async (provider: 'google' | 'apple') => {
    setLoading(provider)
    const { error } = await authClient.signIn.social({ provider })
    setLoading(null)
    if (error) {
      showToast(`${provider} login failed`, { type: 'error' })
    }
  }

  return (
    <>
      <XStack items="center" gap="$4">
        <Separator />
        <SizableText size="$2" color="$color9">
          or continue with
        </SizableText>
        <Separator />
      </XStack>

      <XStack gap="$3">
        <Button
          flex={1}
          size="large"
          haptic
          onPress={() => handleSocialLogin('google')}
          disabled={loading !== null}
          pressStyle={{ scale: 0.98, bg: '$color3' }}
          icon={
            loading === 'google' ? <Spinner size="small" /> : <GoogleIcon size={20} />
          }
        >
          Google
        </Button>
        <Button
          flex={1}
          size="large"
          haptic
          onPress={() => handleSocialLogin('apple')}
          disabled={loading !== null}
          pressStyle={{ scale: 0.98, opacity: 0.9 }}
          icon={loading === 'apple' ? <Spinner size="small" /> : <AppleIcon size={22} />}
        >
          <SizableText fontWeight="600">Apple</SizableText>
        </Button>
      </XStack>
    </>
  )
}
