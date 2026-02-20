import { router } from 'one'
import { memo } from 'react'
import { SizableText, styled, View, XStack, YStack } from 'tamagui'

import { vehicleReportsByUserId } from '~/data/queries/vehicleReport'
import { useAuth } from '~/features/auth/client/authClient'
import { useT } from '~/i18n/context'
import { useFormat } from '~/i18n/format'
import { Avatar } from '~/interface/avatars/Avatar'
import { PencilSimpleIcon } from '~/interface/icons/phosphor/PencilSimpleIcon'
import { Text } from '~/interface/text/Text'
import { useQuery } from '~/zero/client'

import type { User } from '~/data/types'

const ProfileActionPill = styled(XStack, {
  items: 'center',
  rounded: '$10',
  borderWidth: 1,
  borderColor: '$color5',
  bg: '$color2',
  overflow: 'hidden',
})

const ProfileActionItem = styled(XStack, {
  items: 'center',
  justify: 'center',
  gap: '$2',
  px: '$5',
  height: 40,
  cursor: 'pointer',

  pressStyle: {
    bg: '$color4',
  },
})

interface ProfileHeaderProps {
  userInfo?: User
  isOwnProfile: boolean
}

const StatItem = ({ value, label }: { value: string; label: string }) => (
  <YStack items="center" gap="$1">
    <SizableText size="$6" fontWeight="700">
      {value}
    </SizableText>
    <SizableText size="$2" color="$color11">
      {label}
    </SizableText>
  </YStack>
)

export const ProfileHeader = memo(({ userInfo, isOwnProfile }: ProfileHeaderProps) => {
  const t = useT()
  const { date } = useFormat()
  const { user: authUser } = useAuth()
  const [vehicleReports] = useQuery(
    vehicleReportsByUserId,
    { userId: authUser?.id || '' },
    { enabled: !!authUser?.id }
  )

  const reportsCount = vehicleReports?.length || 0
  const vehiclesCount = new Set(vehicleReports?.map((r) => r.vehicleId)).size
  const memberSince = userInfo?.joinedAt
    ? date(new Date(userInfo.joinedAt), { month: 'short', year: 'numeric' })
    : '—'

  return (
    <View py="$6">
      <YStack gap="$5" items="center">
        <Avatar
          image={userInfo?.image || ''}
          name={userInfo?.name ?? userInfo?.username ?? 'User'}
          size={120}
        />

        <YStack gap="$2" items="center">
          <Text size="$7" fontWeight="600">
            {userInfo?.name || userInfo?.username}
          </Text>
          {userInfo?.name && (
            <SizableText size="$4" color="$color11">
              @{userInfo?.username}
            </SizableText>
          )}
        </YStack>

        <XStack gap="$8" py="$2">
          <StatItem value={String(reportsCount)} label={t('profile.reports')} />
          <StatItem value={String(vehiclesCount)} label={t('profile.vehicles')} />
          <StatItem value={memberSince} label={t('profile.memberSince')} />
        </XStack>

        {isOwnProfile && (
          <ProfileActionPill>
            <ProfileActionItem
              onPress={() => router.push('/home/settings/edit-profile')}
            >
              <PencilSimpleIcon size={18} color="$color11" />
            </ProfileActionItem>
          </ProfileActionPill>
        )}
      </YStack>
    </View>
  )
})
