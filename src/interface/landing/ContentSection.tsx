import { H1, H2, H3, H4, Paragraph, styled, Text, XStack, YStack } from 'tamagui'

import { Link } from '~/interface/app/Link'
import { DatabaseIcon } from '~/interface/icons/phosphor/DatabaseIcon'
import { FileTextIcon } from '~/interface/icons/phosphor/FileTextIcon'
import { MagnifyingGlassIcon } from '~/interface/icons/phosphor/MagnifyingGlassIcon'
import { ShieldCheckIcon } from '~/interface/icons/phosphor/ShieldCheckIcon'
import { Em, InlineLink, Strong } from '~/interface/text/Text'

const SectionContainer = styled(YStack, {
  maxW: 680,
  self: 'center',
  width: '100%',
  px: '$4',
})

const SectionHeading = styled(H2, {
  size: '$6',
  fontWeight: '600',
  color: '$color10',
})

const ContentParagraph = styled(Paragraph, {
  size: '$7',
  color: '$color10',
})

const GoalTitle = styled(H4, {
  size: '$9',
  fontWeight: '200',
})

const TechTitle = styled(H3, {
  size: '$7',
  fontWeight: '700',
})

const SectionDivider = styled(XStack, {
  items: 'center',
  gap: '$4',
  my: '$8',
})

const DividerLine = styled(YStack, {
  flex: 1,
  height: 1,
  bg: '$color3',
  mx: '$6',
})

const GoalItem = styled(YStack, {
  gap: '$2',
  pl: '$4',
  borderLeftWidth: 2,
  ml: -2,
  borderLeftColor: '$color5',
})

const TechCard = styled(YStack, {
  gap: '$3',
  p: '$5',
  bg: '$color2',
  rounded: '$6',
  borderWidth: 0.5,
  borderColor: '$color4',
})

const LogoWrapper = styled(YStack, {
  width: 40,
  height: 40,
  rounded: '$4',
  items: 'center',
  justify: 'center',
})

const ContentTitle = styled(H1, {
  size: '$9',
  fontWeight: '800',
  color: '$color12',
  text: 'center',

  $md: {
    size: '$12',
  },
})

const GradientText = styled(Text, {
  fontWeight: '800',
  render: 'span',
  backgroundImage: 'linear-gradient(90deg, $red10 0%, $orange11 100%)',
  color: 'transparent',
  '$platform-web': {
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
  },
})

export function ContentSection() {
  return (
    <SectionContainer gap="$6">
      {/* title */}
      <ContentTitle>
        <GradientText>Every accident.</GradientText> Every owner. Every mile.{' '}
        <GradientText>One report.</GradientText>
      </ContentTitle>

      {/* tldr */}
      <ContentParagraph color="$color12">
        CarHistory gives you{' '}
        <Strong>
          comprehensive vehicle history reports combining data from Carfax and AutoCheck
        </Strong>
        . One VIN check reveals accident records, title history, odometer readings,
        service logs, and ownership changes.
      </ContentParagraph>

      <ContentParagraph>
        Every report pulls from{' '}
        <Strong color="$color11">industry-leading automotive databases</Strong>, covering
        DMV records, insurance claims, auction results, dealer service records, recall
        notices, and inspection history — all cross-referenced to flag discrepancies.
      </ContentParagraph>

      <ContentParagraph>
        Whether you're <Strong color="$color11">buying a used car</Strong>, selling your
        vehicle, or just curious about its past — a{' '}
        <Link href="/home/vin-lookup">
          <InlineLink fontWeight="600">CarHistory report</InlineLink>
        </Link>{' '}
        shows you what the seller might not.
      </ContentParagraph>

      {/* goals section */}
      <SectionDivider>
        <DividerLine />
        <SectionHeading>What every report covers</SectionHeading>
        <DividerLine />
      </SectionDivider>

      <YStack gap="$8">
        <GoalItem>
          <GoalTitle>Accident and damage history</GoalTitle>
          <ContentParagraph>
            Find out if a vehicle has been in any collisions — including{' '}
            <Em>severity, structural damage, airbag deployment, and repair records</Em>.
            Reports include visual damage mapping so you can see exactly where impact
            occurred.
          </ContentParagraph>
        </GoalItem>

        <GoalItem>
          <GoalTitle>Title and ownership records</GoalTitle>
          <ContentParagraph>
            Check for <Em>salvage, rebuilt, flood, and lemon title brands</Em> that can
            drastically reduce a car's value and safety. Know how many people have owned
            the car and trace the full chain of registration history.
          </ContentParagraph>
        </GoalItem>

        <GoalItem>
          <GoalTitle>Odometer verification</GoalTitle>
          <ContentParagraph>
            Detect odometer rollbacks and mileage discrepancies by cross-referencing{' '}
            <Em>inspection records, service visits, and title transfers</Em>. Odometer
            fraud affects hundreds of thousands of vehicles every year — our reports flag
            it automatically.
          </ContentParagraph>
        </GoalItem>

        <GoalItem>
          <GoalTitle>Service and maintenance history</GoalTitle>
          <ContentParagraph>
            See a vehicle's maintenance timeline including{' '}
            <Em>
              oil changes, brake repairs, tire rotations, and dealer service records
            </Em>
            . A well-maintained car is a better buy — and a missing service history is a
            red flag.
          </ContentParagraph>
        </GoalItem>

        <GoalItem>
          <GoalTitle>Recall and safety alerts</GoalTitle>
          <ContentParagraph>
            Check for open manufacturer recalls and safety defects. Know whether{' '}
            <Em>recall repairs have been completed or are still outstanding</Em> before
            you drive off the lot.
          </ContentParagraph>
        </GoalItem>

        <GoalItem>
          <GoalTitle>Auction and listing history</GoalTitle>
          <ContentParagraph>
            See if a vehicle has been through{' '}
            <Em>wholesale auctions, dealer lots, or multiple listings</Em>. Auction data
            reveals pricing trends and can detect vehicles being flipped quickly — a
            common sign of hidden problems.
          </ContentParagraph>
        </GoalItem>
      </YStack>

      {/* how it works section */}
      <SectionDivider>
        <DividerLine />
        <SectionHeading>How it works</SectionHeading>
        <DividerLine />
      </SectionDivider>

      <YStack gap="$5">
        <TechCard>
          <XStack items="center" gap="$3">
            <LogoWrapper bg="rgba(59, 130, 246, 0.15)">
              <MagnifyingGlassIcon size={24} color="$blue10" />
            </LogoWrapper>
            <TechTitle color="$color12">Enter your VIN</TechTitle>
          </XStack>

          <ContentParagraph>
            Every vehicle has a unique 17-character Vehicle Identification Number. You'll
            find it on the{' '}
            <Strong color="$color11">
              driver's side dashboard, door jamb, or vehicle registration
            </Strong>
            . Paste it into our{' '}
            <Link href="/home/vin-lookup">
              <InlineLink fontWeight="600">VIN lookup tool</InlineLink>
            </Link>{' '}
            and we'll start searching instantly.
          </ContentParagraph>
        </TechCard>

        <TechCard>
          <XStack items="center" gap="$3">
            <LogoWrapper bg="rgba(34, 197, 94, 0.15)">
              <DatabaseIcon size={24} color="$green10" />
            </LogoWrapper>
            <TechTitle color="$color12">We search the databases</TechTitle>
          </XStack>

          <ContentParagraph>
            Your VIN is checked against{' '}
            <Strong color="$color11">both Carfax and AutoCheck</Strong> databases
            simultaneously. We cross-reference DMV records, insurance claims, auction
            results, dealer service records, law enforcement reports, and more to build a
            complete picture.
          </ContentParagraph>
        </TechCard>

        <TechCard>
          <XStack items="center" gap="$3">
            <LogoWrapper bg="rgba(168, 85, 247, 0.15)">
              <FileTextIcon size={24} color="$purple10" />
            </LogoWrapper>
            <TechTitle color="$color12">Get your report</TechTitle>
          </XStack>

          <ContentParagraph>
            Your report is ready in seconds — complete with visual damage mapping,
            timeline view, and easy-to-read summaries. One credit gets you one full
            report, starting at just{' '}
            <Link href="/home/pricing">
              <InlineLink fontWeight="600">$4.99</InlineLink>
            </Link>
            .
          </ContentParagraph>
        </TechCard>

        <TechCard>
          <XStack items="center" gap="$3">
            <LogoWrapper bg="rgba(234, 179, 8, 0.15)">
              <ShieldCheckIcon size={24} color="$yellow10" />
            </LogoWrapper>
            <TechTitle color="$color12">Buy with confidence</TechTitle>
          </XStack>

          <ContentParagraph>
            Hidden accidents, salvage titles, odometer fraud — a CarHistory report helps
            you{' '}
            <Strong color="$color11">avoid surprises and negotiate a fair price</Strong>.
            Know exactly what you're buying before you sign.
          </ContentParagraph>
        </TechCard>
      </YStack>

      {/* fin section */}
      <SectionDivider>
        <DividerLine />
      </SectionDivider>

      <YStack gap="$4">
        <ContentParagraph>
          We built CarHistory because buying a used car shouldn't be a gamble. Every
          vehicle has a story — and you deserve to read it before you sign. Our mission is
          to bring transparency to the used car market, one VIN at a time.
        </ContentParagraph>

        <ContentParagraph>
          -{' '}
          <Link href="/help">
            <InlineLink>The CarHistory Team</InlineLink>
          </Link>
        </ContentParagraph>
      </YStack>
    </SectionContainer>
  )
}
