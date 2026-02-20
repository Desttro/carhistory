import { XStack, YStack } from 'tamagui'

import { CircleShimmer } from './CircleShimmer'
import { LineShimmer } from './LineShimmer'
import { ShimmerProvider } from './ShimmerContext'

export const ReportsShimmer = () => {
  return (
    <ShimmerProvider duration={1500}>
      <YStack gap="$4" items="center" py="$4" width="100%">
        <YStack gap="$2" items="center">
          <CircleShimmer size={56} />
          <LineShimmer height={24} width={140} />
          <LineShimmer height={16} width={200} />
        </YStack>

        <YStack gap="$3" width="100%">
          <LineShimmer height={18} width={120} />
          {Array.from({ length: 3 }).map((_, i) => (
            <ReportCardShimmer key={i} />
          ))}
        </YStack>
      </YStack>
    </ShimmerProvider>
  )
}

const ReportCardShimmer = () => {
  return (
    <XStack
      gap="$3"
      p="$3"
      rounded="$4"
      bg="$color2"
      borderWidth={1}
      borderColor="$color4"
      items="center"
    >
      <CircleShimmer size={40} rounded={8} />
      <YStack flex={1} gap="$2">
        <LineShimmer height={16} width="60%" />
        <LineShimmer height={12} width="40%" />
        <LineShimmer height={10} width="30%" />
      </YStack>
    </XStack>
  )
}
