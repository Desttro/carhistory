import { useSafeAreaInsets } from 'react-native-safe-area-context'

export const TAB_BAR_HEIGHT = 50
export const TAB_BAR_EXTRA_MARGIN = 16

export function useTabBarBottomPadding() {
  const insets = useSafeAreaInsets()
  return TAB_BAR_HEIGHT + TAB_BAR_EXTRA_MARGIN + Math.max(insets.bottom, 10)
}
