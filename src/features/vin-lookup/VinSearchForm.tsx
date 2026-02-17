import { memo } from 'react'
import { SizableText, Spinner, View, XStack, YStack } from 'tamagui'

import { Button } from '~/interface/buttons/Button'
import { MagnifyingGlassIcon } from '~/interface/icons/phosphor/MagnifyingGlassIcon'

import { VinInput } from './VinInput'

interface VinSearchFormProps {
  vin: string
  onVinChange: (vin: string) => void
  onSearch: () => void
  isLoading: boolean
  error?: string | null
}

export const VinSearchForm = memo(
  ({ vin, onVinChange, onSearch, isLoading, error }: VinSearchFormProps) => {
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

          <View pr="$2">
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

        {error && (
          <YStack bg="$red2" p="$3" rounded="$4">
            <SizableText size="$3" color="$red10">
              {error}
            </SizableText>
          </YStack>
        )}
      </YStack>
    )
  }
)
