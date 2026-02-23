import { memo } from 'react'
import { AnimatePresence, SizableText, Spinner, View, XStack, YStack } from 'tamagui'

import { animationClamped } from '~/interface/animations/animationClamped'
import { Button } from '~/interface/buttons/Button'
import { ArrowClockwiseIcon } from '~/interface/icons/phosphor/ArrowClockwiseIcon'
import { InfoIcon } from '~/interface/icons/phosphor/InfoIcon'
import { MagnifyingGlassIcon } from '~/interface/icons/phosphor/MagnifyingGlassIcon'
import { XCircleIcon } from '~/interface/icons/phosphor/XCircleIcon'

import { VinInput } from './VinInput'

import type { VinErrorType } from './useVinLookup'

interface VinSearchFormProps {
  vin: string
  onVinChange: (vin: string) => void
  onSearch: () => void
  isLoading: boolean
  error?: string | null
  errorType?: VinErrorType
}

const VinSearchError = memo(
  ({
    error,
    errorType,
    onRetry,
  }: {
    error: string
    errorType: VinErrorType
    onRetry: () => void
  }) => {
    const isNoRecords = errorType === 'no-records'

    return (
      <YStack
        bg={isNoRecords ? '$orange2' : '$red2'}
        p="$3"
        rounded="$4"
        gap="$2"
        key="vin-error"
        enterStyle={{ opacity: 0, y: -8 }}
        exitStyle={{ opacity: 0, y: -8 }}
        transition={animationClamped('quick')}
        opacity={1}
        y={0}
      >
        <XStack items="center" gap="$2">
          {isNoRecords ? (
            <InfoIcon size={18} color="$orange10" />
          ) : (
            <XCircleIcon size={18} color="$red10" />
          )}
          <SizableText
            size="$4"
            fontWeight="600"
            color={isNoRecords ? '$orange10' : '$red10'}
          >
            {isNoRecords ? 'No Records Found' : 'Something Went Wrong'}
          </SizableText>
        </XStack>
        <SizableText size="$3" color={isNoRecords ? '$orange11' : '$red11'}>
          {error}
        </SizableText>
        {!isNoRecords && (
          <Button
            size="small"
            variant="outlined"
            onPress={onRetry}
            icon={<ArrowClockwiseIcon size={14} />}
            self="flex-start"
            mt="$1"
          >
            Try Again
          </Button>
        )}
      </YStack>
    )
  }
)

export const VinSearchForm = memo(
  ({ vin, onVinChange, onSearch, isLoading, error, errorType }: VinSearchFormProps) => {
    const handleChange = (text: string) => {
      const cleaned = text.toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/gi, '')
      onVinChange(cleaned.slice(0, 17))
    }

    const handleSubmit = () => {
      if (vin.length === 17 && !isLoading) {
        onSearch()
      }
    }

    const isValid = vin.length === 17
    const progress = (vin.length / 17) * 100

    return (
      <YStack gap="$2" width="100%">
        <VinInput theme={error ? 'red' : undefined}>
          <VinInput.Icon>
            <MagnifyingGlassIcon size={20} color="$color10" />
          </VinInput.Icon>

          <VinInput.Area
            placeholder="1HGBH41JXMN109186"
            value={vin}
            onChangeText={handleChange}
            onSubmitEditing={handleSubmit}
            autoCapitalize="characters"
            autoCorrect="off"
            maxLength={17}
            returnKeyType="search"
          />

          {/* inline button: visible on $sm+ (tablet/desktop) */}
          <View pr="$2" display="none" $sm={{ display: 'flex' }}>
            <Button
              size="medium"
              variant="action"
              onPress={handleSubmit}
              disabled={!isValid || isLoading}
              icon={
                isLoading ? <Spinner size="small" /> : <MagnifyingGlassIcon size={14} />
              }
            >
              {isLoading ? 'Checking' : 'Check'}
            </Button>
          </View>
        </VinInput>

        {/* stacked button: visible on small screens only */}
        <View display="flex" $sm={{ display: 'none' }}>
          <Button
            size="large"
            variant="action"
            onPress={handleSubmit}
            disabled={!isValid || isLoading}
            width="100%"
            icon={
              isLoading ? <Spinner size="small" /> : <MagnifyingGlassIcon size={16} />
            }
          >
            {isLoading ? 'Checking...' : 'Check VIN'}
          </Button>
        </View>

        <XStack items="center" gap="$2" px="$1">
          <View flex={1} height={3} bg="$color4" rounded="$2" overflow="hidden">
            <View
              height="100%"
              rounded="$2"
              bg={isValid ? '$green10' : '$color10'}
              width={`${progress}%`}
            />
          </View>
          <SizableText
            size="$2"
            color={isValid ? '$green10' : '$color8'}
            fontFamily="$mono"
          >
            {vin.length}/17
          </SizableText>
        </XStack>

        <AnimatePresence>
          {error && (
            <VinSearchError
              error={error}
              errorType={errorType ?? 'network'}
              onRetry={handleSubmit}
            />
          )}
        </AnimatePresence>
      </YStack>
    )
  }
)
