import * as DropdownMenu from 'zeego/dropdown-menu'
import { SizableText, XStack } from 'tamagui'

import { useAuth } from '~/features/auth/client/authClient'
import { useLocale, useSetLocale } from '~/i18n/context'
import { LOCALE_META } from '~/i18n/locales'
import { CaretDownIcon } from '~/interface/icons/phosphor/CaretDownIcon'

import { useLocaleSwitch } from './useLocaleSwitch'

import type { SupportedLocale } from '~/i18n/locales'

interface LocaleSwitcherProps {
  userId?: string
  contextLocale?: SupportedLocale
  onLocaleChange?: (locale: SupportedLocale) => void
  size?: 'small' | 'default'
}

export function LocaleSwitcher({
  userId,
  contextLocale,
  onLocaleChange,
  size = 'default',
}: LocaleSwitcherProps) {
  const { currentLocale, setLocale, localeItems } = useLocaleSwitch({
    userId,
    contextLocale,
    onLocaleChange,
  })
  const textSize = size === 'small' ? '$3' : '$4'

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <XStack gap="$1.5" items="center" cursor="pointer" hitSlop={8}>
          <SizableText size={textSize} color="$color11" hoverStyle={{ color: '$color12' }}>
            {LOCALE_META[currentLocale].name}
          </SizableText>
          <CaretDownIcon size={12} color="$color11" />
        </XStack>
      </DropdownMenu.Trigger>

      <DropdownMenu.Content>
        {localeItems.map((item) => (
          <DropdownMenu.CheckboxItem
            key={item.key}
            value={item.selected ? 'on' : 'off'}
            onValueChange={(next) => {
              if (next === 'on') setLocale(item.key)
            }}
          >
            <DropdownMenu.ItemIndicator />
            <DropdownMenu.ItemTitle>{item.label}</DropdownMenu.ItemTitle>
          </DropdownMenu.CheckboxItem>
        ))}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  )
}

export function ConnectedLocaleSwitcher(
  props: Omit<LocaleSwitcherProps, 'userId' | 'contextLocale' | 'onLocaleChange'>
) {
  const auth = useAuth()
  const locale = useLocale()
  const setLocale = useSetLocale()
  return (
    <LocaleSwitcher
      userId={auth?.user?.id}
      contextLocale={locale}
      onLocaleChange={setLocale}
      {...props}
    />
  )
}
