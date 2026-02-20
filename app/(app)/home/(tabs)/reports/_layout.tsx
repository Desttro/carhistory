import { Slot, Stack } from 'one'

export const ReportsLayout = () => {
  if (process.env.VITE_NATIVE) {
    return (
      <Stack
        screenOptions={{
          headerTransparent: true,
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="[reportId]"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
    )
  }

  return <Slot />
}
