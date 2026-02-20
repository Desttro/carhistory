import { Slot, Stack } from 'one'

export function Layout() {
  if (process.env.VITE_NATIVE) {
    return <Stack screenOptions={{ headerShown: false }} />
  }
  return <Slot />
}
