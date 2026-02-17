import { memo, useEffect, useRef, useState } from 'react'
import { H1, Paragraph, Text, View, XStack, YStack, styled } from 'tamagui'

import { LandingVinCheck } from '~/features/vin-lookup/LandingVinCheck'
import { Link } from '~/interface/app/Link'

import { BetaBadge } from '../app/BetaBadge'
import { Span, Strong } from '../text/Text'

const HeroTitle = styled(H1, {
  letterSpacing: -1,
  color: '$color12',
  size: '$12',
  fontWeight: '800',
  maxW: 520,

  '$max-lg': {
    size: '$10',
    fontWeight: '800',
  },
})

const HeroSubtitle = styled(Paragraph, {
  color: '$color9',
  size: '$6',
  maxW: 490,
  $xl: {
    size: '$7',
  },
  '$platform-web': {
    textWrap: 'balance',
  },
})

const HighlightText = styled(Text, {
  render: 'span',
  backgroundImage: 'linear-gradient(90deg, $red10 0%, $orange11 100%)',
  color: 'transparent',
  '$platform-web': {
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
  },
})

const TerminalContainer = styled(YStack, {
  bg: '#0d0d0d',
  rounded: '$6',
  overflow: 'hidden',
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.1)',
  width: '100%',
  maxW: 520,
  shadowColor: '#000',
  shadowRadius: 40,
  shadowOffset: { width: 0, height: 20 },
  shadowOpacity: 0.4,
  display: 'none',
  $md: {
    display: 'flex',
  },
})

const TerminalHeader = styled(XStack, {
  bg: '#1a1a1a',
  pointerEvents: 'none',
  px: '$4',
  py: '$2',
  items: 'center',
  gap: '$2',
  borderBottomWidth: 1,
  borderBottomColor: 'rgba(255,255,255,0.1)',
})

const TerminalDot = styled(YStack, {
  width: 12,
  height: 12,
  rounded: 999,
})

const TERMINAL_HEIGHT = 260

interface CommandStep {
  command: string
  output: string[]
}

// memoized window dots to prevent re-renders
const TerminalDots = memo(function TerminalDots() {
  return (
    <XStack gap="$2">
      <TerminalDot bg="#ff5f57" />
      <TerminalDot bg="#ffbd2e" />
      <TerminalDot bg="#28ca42" />
    </XStack>
  )
})

// memoized history entry to prevent re-renders
const HistoryEntry = memo(function HistoryEntry({
  command,
  output,
}: {
  command: string
  output: string[]
}) {
  return (
    <YStack opacity={0.5} mb="$3" gap="$1">
      <XStack>
        <Paragraph
          fontFamily="$mono"
          fontSize={13}
          color="#22c55e"
          mr="$2"
          style={{ lineHeight: '1.7' }}
        >
          $
        </Paragraph>
        <Paragraph
          fontFamily="$mono"
          fontSize={13}
          color="#e5e5e5"
          style={{ lineHeight: '1.7' }}
        >
          {command}
        </Paragraph>
      </XStack>
      {output.map((line, j) => (
        <Paragraph
          key={j}
          fontFamily="$mono"
          fontSize={13}
          color="#888"
          style={{ lineHeight: '1.7' }}
        >
          {line}
        </Paragraph>
      ))}
    </YStack>
  )
})

const steps: CommandStep[] = [
  {
    command: 'lookup 1HGBH41JXMN109186',
    output: [
      '  Decoding VIN...',
      '  2021 Honda Civic EX identified',
      '  Searching USA records...',
      '  Searching Europe records...',
    ],
  },
  {
    command: 'check accidents',
    output: [
      '  Scanning accident databases...',
      '  0 accidents found',
      '  No structural damage reported',
    ],
  },
  {
    command: 'check title',
    output: [
      '  Verifying title history...',
      '  Clean title confirmed',
      '  No salvage or flood brands',
      '  2 owners reported',
    ],
  },
  {
    command: 'generate report',
    output: [
      '  Compiling 47 records...',
      '  Report ready',
      '  carhistory.io/reports/ch_r91x',
    ],
  },
]

function HeroTerminal() {
  const [currentStep, setCurrentStep] = useState(0)
  const [typedCommand, setTypedCommand] = useState('')
  const [showOutput, setShowOutput] = useState(false)
  const [outputLines, setOutputLines] = useState<string[]>([])
  const [history, setHistory] = useState<{ command: string; output: string[] }[]>([])
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTo({
        top: contentRef.current.scrollHeight,
        behavior: 'smooth',
      })
    }
  }, [typedCommand, outputLines, history])

  useEffect(() => {
    const step = steps[currentStep]
    if (!step) return

    let charIndex = 0
    let outputInterval: ReturnType<typeof setInterval> | null = null
    let transitionTimeout: ReturnType<typeof setTimeout> | null = null
    let resetTimeout: ReturnType<typeof setTimeout> | null = null
    let cancelled = false

    setTypedCommand('')
    setShowOutput(false)
    setOutputLines([])

    const typeInterval = setInterval(() => {
      if (cancelled) return
      if (charIndex < step.command.length) {
        setTypedCommand(step.command.slice(0, charIndex + 1))
        charIndex++
      } else {
        clearInterval(typeInterval)
        setShowOutput(true)

        let lineIndex = 0
        outputInterval = setInterval(() => {
          if (cancelled) return
          if (lineIndex < step.output.length) {
            const line = step.output[lineIndex]!
            setOutputLines((prev) => [...prev, line])
            lineIndex++
          } else {
            if (outputInterval) clearInterval(outputInterval)

            transitionTimeout = setTimeout(() => {
              if (cancelled) return
              setHistory((prev) => [
                ...prev,
                { command: step.command, output: step.output },
              ])
              setTypedCommand('')
              setOutputLines([])
              setShowOutput(false)

              const nextStep = currentStep + 1
              if (nextStep < steps.length) {
                setCurrentStep(nextStep)
              } else {
                resetTimeout = setTimeout(() => {
                  if (cancelled) return
                  setHistory([])
                  setCurrentStep(0)
                }, 2800)
              }
            }, 1500)
          }
        }, 250)
      }
    }, 120)

    return () => {
      cancelled = true
      clearInterval(typeInterval)
      if (outputInterval) clearInterval(outputInterval)
      if (transitionTimeout) clearTimeout(transitionTimeout)
      if (resetTimeout) clearTimeout(resetTimeout)
    }
  }, [currentStep])

  return (
    <TerminalContainer>
      <TerminalHeader>
        <TerminalDots />
        <Paragraph
          fontSize={12}
          color="#999"
          fontFamily="$mono"
          flex={1}
          text="center"
          mr="$8"
          select="none"
        >
          CarHistory
        </Paragraph>
      </TerminalHeader>

      <YStack
        ref={contentRef as any}
        className="terminal-content"
        p="$4"
        height={TERMINAL_HEIGHT}
        overflow="scroll"
        gap="$1"
      >
        {history.map((entry, i) => (
          <HistoryEntry key={i} command={entry.command} output={entry.output} />
        ))}

        {!!typedCommand && (
          <YStack gap="$1">
            <XStack items="center">
              <Paragraph fontFamily="$mono" fontSize={13} color="#22c55e" mr="$2">
                $
              </Paragraph>
              <Paragraph fontFamily="$mono" fontSize={13} color="#e5e5e5">
                {typedCommand}
              </Paragraph>
              {!showOutput && (
                <YStack
                  className="terminal-cursor"
                  width={8}
                  height={16}
                  bg="#e5e5e5"
                  ml="$1"
                />
              )}
            </XStack>
          </YStack>
        )}

        {outputLines.map((line, i) => (
          <Paragraph key={i} fontFamily="$mono" fontSize={13} color="#888">
            {line}
          </Paragraph>
        ))}

        {!typedCommand && history.length === 0 && (
          <XStack items="center">
            <Paragraph fontFamily="$mono" fontSize={13} color="#22c55e" mr="$2">
              $
            </Paragraph>
            <YStack className="terminal-cursor" width={8} height={16} bg="#e5e5e5" />
          </XStack>
        )}
      </YStack>
    </TerminalContainer>
  )
}

function PhoneMockup() {
  return (
    <YStack
      maxW="100%"
      maxH="100%"
      items="center"
      justify="center"
      self="center"
      aspectRatio="588 / 1176"
      $lg={{
        x: 0,
        y: 20,
      }}
    >
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <clipPath id="iphone-screen-clip-1" clipPathUnits="objectBoundingBox">
            <rect x="0" y="0" width="1" height="1" rx="0.19" ry="0.081" />
          </clipPath>
          <clipPath
            id="iphone-screen-clip"
            clipPathUnits="objectBoundingBox"
            clipPath="url(#iphone-screen-clip-1)"
          >
            <rect x="0" y="0" width="1" height="1" rx="0.17" ry="0.088" />
          </clipPath>
        </defs>
      </svg>
      <YStack filter="drop-shadow(0 35px 50px rgba(0,0,0,0.6))">
        <YStack
          overflow="hidden"
          position="relative"
          style={{
            width: 286,
            height: 593,
            clipPath: 'url(#iphone-screen-clip)',
            WebkitClipPath: 'url(#iphone-screen-clip)',
          }}
        >
          <video
            autoPlay
            loop
            muted
            playsInline
            poster="/iphone-frame.webp"
            ref={(el) => {
              if (el) el.playbackRate = 1.3
            }}
            style={{
              position: 'absolute',
              top: -3,
              left: -6,
              width: 294 + 4,
              height: 588 + 12,
              objectFit: 'cover',
            }}
          >
            <source
              src="https://pub-836fc09a8b0e484f900cd6aa05105026.r2.dev/videos/appdemo2_h265.mp4"
              type="video/mp4; codecs=hvc1"
            />
            <source
              src="https://pub-836fc09a8b0e484f900cd6aa05105026.r2.dev/videos/appdemo2_h264.mp4"
              type="video/mp4"
            />
          </video>
        </YStack>
      </YStack>
    </YStack>
  )
}

export function HeroSection() {
  return (
    <YStack
      $md={{
        flex: 1,
        items: 'center',
        gap: '$8',
        px: '$4',
        minH: 'calc(max(90vh, 850px))',
        maxH: 1000,
        justify: 'center',
      }}
    >
      <View
        gap="$2"
        items="center"
        justify="space-between"
        maxW={1200}
        width="100%"
        pb="$14"
        $md={{
          flexDirection: 'row',
        }}
      >
        {/* left side - hero content */}
        <YStack
          scale={0.95}
          transition="medium"
          gap="$5"
          minW={320}
          maxW={640}
          items="flex-start"
          $max-sm={{
            maxW: '80%',
            self: 'center',
          }}
          $lg={{
            scale: 1,
          }}
        >
          <YStack gap="$1">
            <HeroTitle>
              Check any car's <Span $max-xl={{ display: 'none' }}>complete </Span>
              <HighlightText fontStyle="italic">history</HighlightText> before you buy.
            </HeroTitle>
          </YStack>

          <HeroSubtitle>
            <Strong color="$color11">
              Buying a used car is <HighlightText fontWeight="700">risky</HighlightText>
            </Strong>
            . <Strong color="$color11">CarHistory makes it safer.</Strong>{' '}
            Get&nbsp;detailed vehicle&nbsp;history reports powered by USA and EU databases
            — covering accidents, title&nbsp;records, odometer&nbsp;checks,
            service&nbsp;history, and <Link href="/help">more</Link>.
          </HeroSubtitle>

          <HeroSubtitle>
            The{' '}
            <Strong fontWeight="600" color="$color11">
              fastest and most affordable way to run a VIN&nbsp;check
            </Strong>{' '}
            — reports start at just $4.99 per check.
          </HeroSubtitle>

          <YStack width="100%" maxW={480} mt="$2">
            <LandingVinCheck />
          </YStack>

          <Paragraph size="$6" $lg={{ size: '$7' }} color="$color9">
            See{' '}
            <Link href="/pricing" target="_blank">
              <Span color="$color12">pricing and credits</Span>
            </Link>{' '}
            or check out our{' '}
            <Link href="/help" target="_blank">
              <Span color="$color12">help center</Span>
            </Link>
            .
          </Paragraph>
        </YStack>

        {/* right side */}
        <YStack
          my="$12"
          minW={300}
          maxW={480}
          x={0}
          items="center"
          transition="medium"
          position="relative"
          minH={600}
          $sm={{
            scale: 0.9,
            x: 20,
            y: 20,
          }}
          $lg={{
            scale: 1,
            y: 20,
            x: -50,
          }}
        >
          <PhoneMockup />
          <YStack position="absolute" z={-1} x={-200} y={200} scale={0.8}>
            <HeroTerminal />
          </YStack>
        </YStack>
      </View>
    </YStack>
  )
}
