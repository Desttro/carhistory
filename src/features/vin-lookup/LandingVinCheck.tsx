import { useState } from 'react'
import { H3, SizableText, XStack, YStack } from 'tamagui'

import { Link } from '~/interface/app/Link'
import { Button } from '~/interface/buttons/Button'
import { ArrowRightIcon } from '~/interface/icons/phosphor/ArrowRightIcon'
import { CarIcon } from '~/interface/icons/phosphor/CarIcon'
import { ShieldCheckIcon } from '~/interface/icons/phosphor/ShieldCheckIcon'

import { VinSearchForm } from './VinSearchForm'

import type { VinCheckResult } from '~/features/bulkvin/types'

function LandingVinResult({ result }: { result: VinCheckResult }) {
  const totalRecords = (result.carfaxRecords ?? 0) + (result.autocheckRecords ?? 0)

  return (
    <YStack
      gap="$3"
      bg="$color2"
      p="$4"
      rounded="$6"
      borderWidth={1}
      borderColor="$color4"
    >
      <XStack items="center" gap="$3">
        <YStack
          bg="$green3"
          rounded="$4"
          width={36}
          height={36}
          items="center"
          justify="center"
        >
          <CarIcon size={20} color="$green10" />
        </YStack>
        <YStack gap="$0.5">
          <SizableText size="$2" color="$green10" fontWeight="600">
            Vehicle Identified
          </SizableText>
          {(result.year || result.model) && (
            <H3 size="$5" fontWeight="700" color="$color12">
              {result.year} {result.model}
            </H3>
          )}
        </YStack>
      </XStack>

      <XStack gap="$3">
        <YStack flex={1} bg="$color3" rounded="$4" p="$2.5" gap="$0.5">
          <SizableText size="$1" color="$color10">
            Carfax
          </SizableText>
          <SizableText size="$6" fontWeight="700" color="$color12">
            {result.carfaxRecords ?? 0}
          </SizableText>
          <SizableText size="$1" color="$color10">
            records
          </SizableText>
        </YStack>
        <YStack flex={1} bg="$color3" rounded="$4" p="$2.5" gap="$0.5">
          <SizableText size="$1" color="$color10">
            AutoCheck
          </SizableText>
          <SizableText size="$6" fontWeight="700" color="$color12">
            {result.autocheckRecords ?? 0}
          </SizableText>
          <SizableText size="$1" color="$color10">
            records
          </SizableText>
        </YStack>
      </XStack>

      <XStack items="center" justify="center" gap="$2">
        <ShieldCheckIcon size={14} color="$color9" />
        <SizableText size="$1" color="$color9">
          {totalRecords} records found across Carfax & AutoCheck
        </SizableText>
      </XStack>

      <Link href={`/home/vin-lookup?vin=${encodeURIComponent(result.vin ?? '')}`}>
        <Button theme="accent" size="large" icon={ArrowRightIcon} iconAfter width="100%">
          Get Full Report
        </Button>
      </Link>
    </YStack>
  )
}

export function LandingVinCheck() {
  const [vin, setVin] = useState('')
  const [isChecking, setIsChecking] = useState(false)
  const [result, setResult] = useState<VinCheckResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const checkVin = async () => {
    const normalized = vin.toUpperCase().trim()
    if (normalized.length !== 17) {
      setError('VIN must be exactly 17 characters')
      return
    }

    setIsChecking(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch(`/api/vin/check?vin=${encodeURIComponent(normalized)}`)
      const data = (await res.json()) as VinCheckResult

      if (!data.success) {
        setError(data.error || 'No records found for this VIN')
        return
      }

      setResult({ ...data, vin: normalized })
    } catch (err) {
      console.info('vin check error:', err)
      setError(err instanceof Error ? err.message : 'Failed to check VIN')
    } finally {
      setIsChecking(false)
    }
  }

  return (
    <YStack gap="$3" width="100%">
      <VinSearchForm
        vin={vin}
        onVinChange={setVin}
        onSearch={checkVin}
        isLoading={isChecking}
        error={error}
      />
      {result && <LandingVinResult result={result} />}
    </YStack>
  )
}
