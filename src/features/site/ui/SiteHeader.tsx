import { memo, useState } from 'react'
import { ScrollView, Separator, Sheet, Spacer, XStack, YStack } from 'tamagui'

import { LoginButton } from '~/features/auth/ui/LoginButton'
import { LoginListItem } from '~/features/auth/ui/LoginListItem'
import { LocaleSwitcher } from '~/features/locale/LocaleSwitcher'
import { SocialLinksRow } from '~/features/site/ui/SocialLinksRow'
import { Link } from '~/interface/app/Link'
import { Logo } from '~/interface/app/Logo'
import { Button } from '~/interface/buttons/Button'
import { ScrollHeader } from '~/interface/headers/ScrollHeader'
import { CoinsIcon } from '~/interface/icons/phosphor/CoinsIcon'
import { ListIcon } from '~/interface/icons/phosphor/ListIcon'
import { MagnifyingGlassIcon } from '~/interface/icons/phosphor/MagnifyingGlassIcon'
import { PageContainer } from '~/interface/layout/PageContainer'
import { ListItem } from '~/interface/lists/ListItem'
import { ThemeSwitch } from '~/interface/theme/ThemeSwitch'

export const SiteHeader = memo(() => {
  return (
    <ScrollHeader>
      <PageContainer>
        <YStack width="100%" py="$2">
          <XStack position="relative" width="100%" items="center" $md={{ px: '$4' }}>
            <XStack display="none" $lg={{ display: 'flex' }} gap="$2" items="center">
              <SocialLinksRow />
            </XStack>

            <Spacer flex={1} />

            <XStack
              position="absolute"
              l="$4"
              $lg={{
                l: '50%',
                t: '50%',
                transform: 'translate(-50%, -50%)',
              }}
            >
              <Link href="/" aria-label="Home">
                <Logo />
              </Link>
            </XStack>

            <XStack gap="$2" items="center" display="none" $md={{ display: 'flex' }}>
              <Link href="/home/vin-lookup">
                <Button icon={<MagnifyingGlassIcon size={16} />}>VIN Lookup</Button>
              </Link>

              <Link href="/home/pricing">
                <Button icon={<CoinsIcon size={16} />}>Pricing</Button>
              </Link>

              <LoginButton />

              {/* <Link href="/docs/introduction">
                <Button>Docs</Button>
              </Link> */}

              <LocaleSwitcher size="small" />
              <ThemeSwitch />
            </XStack>

            <SiteHeaderMenu />
          </XStack>
        </YStack>
      </PageContainer>
    </ScrollHeader>
  )
})

const SiteHeaderMenu = memo(() => {
  const [open, setOpen] = useState(false)

  const closeMenu = () => {
    setTimeout(() => setOpen(false), 250)
  }

  return (
    <>
      <Button
        size="large"
        variant="transparent"
        circular
        icon={<ListIcon size="$1" />}
        aria-label="Menu"
        onPress={() => setOpen(true)}
        $md={{ display: 'none' }}
      />

      <Sheet
        open={open}
        onOpenChange={setOpen}
        transition="quickLessBouncy"
        modal
        dismissOnSnapToBottom
        snapPoints={[50]}
      >
        <Sheet.Overlay
          bg="$background"
          opacity={0.5}
          transition="quick"
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
        />

        <Sheet.Frame bg="$color2" boxShadow="0 0 10px $shadow3">
          <YStack flex={1} flexBasis="auto" gap="$2">
            <XStack p="$4" pb="$3" justify="space-between" items="center">
              <Logo />
              <XStack gap="$2" items="center">
                {/* <PromoLinksRow /> */}
                <LocaleSwitcher size="small" />
                <ThemeSwitch />
              </XStack>
            </XStack>

            <Separator />

            <ScrollView group="frame" flex={1} px="$4" pt="$4" gap="$2">
              <Link href="/home/vin-lookup" asChild>
                <ListItem onPressOut={closeMenu}>
                  <ListItem.Icon>
                    <MagnifyingGlassIcon />
                  </ListItem.Icon>
                  <ListItem.Text>VIN Lookup</ListItem.Text>
                </ListItem>
              </Link>

              <Link href="/home/pricing" asChild>
                <ListItem onPressOut={closeMenu}>
                  <ListItem.Icon>
                    <CoinsIcon />
                  </ListItem.Icon>
                  <ListItem.Text>Pricing</ListItem.Text>
                </ListItem>
              </Link>

              <LoginListItem onPressOut={closeMenu} />

              {/* <Link href="/docs/introduction" asChild>
                <ListItem onPressOut={closeMenu}>
                  <ListItem.Icon>
                    <FileIcon />
                  </ListItem.Icon>
                  <ListItem.Text>Docs</ListItem.Text>
                </ListItem>
              </Link> */}
            </ScrollView>

            <YStack p="$4" pt="$2">
              <Separator mb="$3" />
              <XStack width="100%" items="center" justify="center">
                <Spacer />
                <SocialLinksRow />
                <Spacer />
              </XStack>
            </YStack>
          </YStack>
        </Sheet.Frame>
      </Sheet>
    </>
  )
})
