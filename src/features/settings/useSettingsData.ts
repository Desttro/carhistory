import { useLogout } from '~/features/auth/useLogout'
import { useNotificationStatus } from '~/features/notification/useNotificationsStatus'
import { useT } from '~/i18n/context'
import { dialogConfirm } from '~/interface/dialogs/actions'
import { BellIcon } from '~/interface/icons/phosphor/BellIcon'
import { BookmarkIcon } from '~/interface/icons/phosphor/BookmarkIcon'
import { ChatCircleIcon } from '~/interface/icons/phosphor/ChatCircleIcon'
import { DoorIcon } from '~/interface/icons/phosphor/DoorIcon'
import { FileIcon } from '~/interface/icons/phosphor/FileIcon'
import { GlobeIcon } from '~/interface/icons/phosphor/GlobeIcon'
import { InfoIcon } from '~/interface/icons/phosphor/InfoIcon'
import { LockIcon } from '~/interface/icons/phosphor/LockIcon'
import { UserIcon } from '~/interface/icons/phosphor/UserIcon'
import { useToggleTheme } from '~/interface/theme/ThemeSwitch'

import type { Href } from 'one'
import type { IconComponent } from '~/interface/icons/types'

export interface SettingItem {
  id: string
  title: string
  icon?: IconComponent
  onPress?: () => void
  href?: Href
  external?: boolean
  toggle?: {
    value: boolean
    onValueChange: () => void
  }
}

export interface SettingSection {
  title: string
  items: SettingItem[]
}

export function useSettingsData() {
  const { logout } = useLogout()
  const t = useT()
  const {
    onPress: toggleTheme,
    Icon: ThemeIcon,
    setting: themeSetting,
  } = useToggleTheme()
  const { isToggleActive: notificationsEnabled, handleToggle: toggleNotifications } =
    useNotificationStatus()
  const themeLabel = themeSetting[0]?.toUpperCase() + themeSetting.slice(1)

  const handleDeleteAccount = async () => {
    await dialogConfirm({
      title: t('settings.deleteAccount'),
      description: t('settings.deleteAccountUnavailable'),
    })
  }

  const sections: SettingSection[] = [
    {
      title: t('settings.account'),
      items: [
        {
          id: 'theme',
          title: t('settings.theme', { theme: themeLabel }),
          icon: ThemeIcon,
          onPress: toggleTheme,
        },
        {
          id: 'notifications',
          title: t('settings.pushNotifications'),
          icon: BellIcon,
          toggle: {
            value: notificationsEnabled,
            onValueChange: toggleNotifications,
          },
        },
        {
          id: 'profile',
          title: t('settings.editProfile'),
          icon: UserIcon,
          href: '/home/settings/edit-profile',
        },
        {
          id: 'language',
          title: t('settings.language'),
          icon: GlobeIcon,
        },
      ],
    },
    {
      title: t('settings.support'),
      items: [
        {
          id: 'help',
          title: t('settings.helpSupport'),
          icon: ChatCircleIcon,
          href: '/help',
          external: true,
        },
        {
          id: 'documentation',
          title: t('settings.documentation'),
          icon: BookmarkIcon,
          href: '/docs/introduction',
          external: true,
        },
        {
          id: 'terms',
          title: t('settings.termsOfService'),
          icon: FileIcon,
          href: '/terms-of-service',
          external: true,
        },
        {
          id: 'privacy',
          title: t('settings.privacyPolicy'),
          icon: LockIcon,
          href: '/privacy-policy',
          external: true,
        },
        {
          id: 'delete',
          title: t('settings.deleteAccount'),
          icon: InfoIcon,
          onPress: handleDeleteAccount,
        },
      ],
    },
    {
      title: t('settings.other'),
      items: [
        {
          id: 'logout',
          title: t('settings.logOut'),
          icon: DoorIcon,
          onPress: logout,
        },
      ],
    },
  ]

  return { sections, themeLabel }
}
