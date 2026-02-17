import { H1, Paragraph, Text, View, XStack, YStack, styled } from 'tamagui'

import { Link } from '~/interface/app/Link'
import { ArrowRightIcon } from '~/interface/icons/phosphor/ArrowRightIcon'
import { CarIcon } from '~/interface/icons/phosphor/CarIcon'
import { CheckCircleIcon } from '~/interface/icons/phosphor/CheckCircleIcon'
import { ShieldCheckIcon } from '~/interface/icons/phosphor/ShieldCheckIcon'

import { Button } from '../buttons/Button'

const HeroTitle = styled(H1, {
  letterSpacing: -1,
  color: '$color12',
  size: '$12',
  fontWeight: '800',
  maxW: 600,

  '$max-lg': {
    size: '$10',
    fontWeight: '800',
  },
})

const HeroSubtitle = styled(Paragraph, {
  color: '$color9',
  size: '$6',
  maxW: 520,
  $xl: {
    size: '$7',
  },
  '$platform-web': {
    textWrap: 'balance',
  },
})

const HighlightText = styled(Text, {
  render: 'span',
  backgroundImage: 'linear-gradient(90deg, $blue10 0%, $green10 100%)',
  color: 'transparent',
  '$platform-web': {
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
  },
})

const FeatureItem = ({
  children,
}: {
  children: React.ReactNode
}) => (
  <XStack gap="$2" items="center">
    <CheckCircleIcon size={18} color="$green10" />
    <Paragraph size="$5" color="$color11">
      {children}
    </Paragraph>
  </XStack>
)

export function HeroSection() {
  return (
    <YStack
      $md={{
        flex: 1,
        items: 'center',
        gap: '$8',
        px: '$4',
        minH: 'calc(max(80vh, 700px))',
        maxH: 900,
        justify: 'center',
      }}
    >
      <View
        gap="$4"
        items="center"
        justify="center"
        maxW={1200}
        width="100%"
        pb="$14"
        $md={{
          gap: '$8',
        }}
      >
        <YStack
          gap="$5"
          maxW={700}
          items="center"
          $max-sm={{
            maxW: '90%',
          }}
        >
          <XStack gap="$2" items="center">
            <CarIcon size={28} color="$color11" />
            <Paragraph size="$5" fontWeight="600" color="$color11" letterSpacing={1}>
              CARHISTORY
            </Paragraph>
          </XStack>

          <HeroTitle text="center">
            Know your car's{' '}
            <HighlightText fontStyle="italic">full story</HighlightText>{' '}
            before you buy.
          </HeroTitle>

          <HeroSubtitle text="center">
            Get comprehensive vehicle history reports combining Carfax & AutoCheck data.
            Instant results, one credit per report.
          </HeroSubtitle>

          <XStack gap="$3" mt="$2" items="center" flexWrap="wrap" justify="center">
            <Link href="/auth/login">
              <Button theme="accent" size="large" icon={ArrowRightIcon} iconAfter>
                Check a VIN
              </Button>
            </Link>

            <Link href="/pricing">
              <Button size="large" variant="outlined">
                View Pricing
              </Button>
            </Link>
          </XStack>
        </YStack>

        <YStack
          gap="$3"
          mt="$4"
          bg="$color2"
          p="$5"
          rounded="$6"
          borderWidth={1}
          borderColor="$color4"
          maxW={500}
          width="100%"
        >
          <XStack gap="$2" items="center" mb="$1">
            <ShieldCheckIcon size={20} color="$color10" />
            <Paragraph size="$4" fontWeight="600" color="$color11">
              Why CarHistory?
            </Paragraph>
          </XStack>
          <FeatureItem>Carfax + AutoCheck combined in one report</FeatureItem>
          <FeatureItem>Instant VIN lookup with record counts</FeatureItem>
          <FeatureItem>Accident history, title brands, odometer checks</FeatureItem>
          <FeatureItem>Credits never expire - buy once, use anytime</FeatureItem>
        </YStack>
      </View>
    </YStack>
  )
}
