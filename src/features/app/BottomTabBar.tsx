import { usePathname, type Href } from 'one'
import { View, XStack } from 'tamagui'

import { useAuth } from '~/features/auth/client/authClient'
import { Link } from '~/interface/app/Link'
import { CoinsIcon } from '~/interface/icons/phosphor/CoinsIcon'
import { FileTextIcon } from '~/interface/icons/phosphor/FileTextIcon'
import { MagnifyingGlassIcon } from '~/interface/icons/phosphor/MagnifyingGlassIcon'
import { UserCircleIcon } from '~/interface/icons/phosphor/UserCircleIcon'

type TabRoute = {
  name: string
  href: Href
  icon: any
}

const routes: TabRoute[] = [
  { name: 'vin-lookup', href: '/home/vin-lookup', icon: MagnifyingGlassIcon },
  { name: 'reports', href: '/home/reports', icon: FileTextIcon },
  { name: 'pricing', href: '/home/pricing', icon: CoinsIcon },
  { name: 'profile', href: '/home/profile', icon: UserCircleIcon },
]

export function BottomTabBar() {
  const pathname = usePathname()
  const { state } = useAuth()
  const isLoggedIn = state === 'logged-in'
  const visibleRoutes = isLoggedIn
    ? routes
    : routes.filter((r) => r.name === 'vin-lookup' || r.name === 'pricing')
  const currentTab =
    visibleRoutes.find((r) => r.href && pathname.startsWith(r.href as string))?.name ??
    'vin-lookup'

  return (
    <View
      position="fixed"
      b={0}
      l={0}
      r={0}
      bg="$background08"
      boxShadow="0 0 10px $shadow4"
      display="flex"
      $lg={{ display: 'none' }}
      z={100}
      style={{
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
    >
      <XStack justify="space-around" height={60} items="center" px="$4">
        {visibleRoutes.map((route) => {
          const Icon = route.icon
          const isActive = currentTab === route.name

          return (
            <Link key={route.name} href={route.href} items="center" p="$2" rounded="$4">
              <Icon size={24} />
            </Link>
          )
        })}
      </XStack>
    </View>
  )
}
