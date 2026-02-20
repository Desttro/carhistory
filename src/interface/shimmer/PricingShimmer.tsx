import { View, XStack, YStack } from 'tamagui'

import { CircleShimmer } from './CircleShimmer'
import { LineShimmer } from './LineShimmer'
import { Shimmer } from './Shimmer'
import { ShimmerProvider } from './ShimmerContext'

export const PricingShimmer = () => {
  return (
    <ShimmerProvider duration={1500}>
      <YStack gap="$4" items="center" py="$4" width="100%">
        <YStack gap="$2" items="center">
          <CircleShimmer size={56} />
          <LineShimmer height={24} width={160} />
          <LineShimmer height={16} width={220} />
        </YStack>

        <LineShimmer height={32} width={140} rounded="$10" />

        <YStack gap="$3" width="100%">
          <LineShimmer height={18} width={110} self="center" />
          <XStack gap="$3" width="100%" justify="center">
            {Array.from({ length: 3 }).map((_, i) => (
              <PackageCardShimmer key={i} />
            ))}
          </XStack>
        </YStack>
      </YStack>
    </ShimmerProvider>
  )
}

const PackageCardShimmer = () => {
  return (
    <YStack
      flex={1}
      maxW={200}
      gap="$3"
      p="$4"
      rounded="$4"
      bg="$color2"
      borderWidth={1}
      borderColor="$color4"
      items="center"
    >
      <CircleShimmer size={36} />
      <LineShimmer height={20} width="70%" />
      <LineShimmer height={14} width="50%" />
      <View height={36} width="100%" rounded="$4" overflow="hidden">
        <Shimmer />
      </View>
    </YStack>
  )
}
