import { useState } from 'react'
import {
  Input as TInput,
  View,
  XStack,
  createStyledContext,
  isWeb,
  styled,
  useMedia,
  withStaticProperties,
} from 'tamagui'

const FocusContext = createStyledContext({
  setFocused: (_val: boolean) => {},
  focused: false,
})

const VinInputBoxFrame = styled(XStack, {
  items: 'center',
  borderWidth: 1,
  borderColor: '$borderColor',
  bg: '$color2',
  height: 56,
  rounded: '$6',
  overflow: 'hidden',
  minW: 0,

  hoverStyle: {
    borderColor: '$borderColorHover',
  },

  focusStyle: {
    borderColor: '$borderColorFocus',
    ...(isWeb && {
      outlineColor: '$outlineColor',
      outlineWidth: 2,
      outlineStyle: 'solid',
    }),
  },
})

const VinInputBoxImpl = VinInputBoxFrame.styleable((props, ref) => {
  const { children, ...rest } = props
  const [focused, setFocused] = useState(false)

  return (
    <FocusContext.Provider focused={focused} setFocused={setFocused}>
      <VinInputBoxFrame
        ref={ref}
        {...rest}
        {...(focused && {
          borderColor: '$borderColorFocus',
          ...(isWeb && {
            outlineColor: '$outlineColor',
            outlineWidth: 2,
            outlineStyle: 'solid',
          }),
        })}
      >
        {children}
      </VinInputBoxFrame>
    </FocusContext.Provider>
  )
})

const InputFrame = styled(TInput, {
  unstyled: true,
  fontFamily: '$mono',
  letterSpacing: 2,
  fontSize: '$5',
  color: '$color12',
  placeholderTextColor: '$color8',
  flex: 1,
  height: '100%',
  bg: 'transparent',
  borderWidth: 0,
  outlineWidth: 0,
  py: '$2',

  variants: {
    compact: {
      true: {
        letterSpacing: 1,
      },
    },
  } as const,
})

const Area = InputFrame.styleable<{
  onChangeText?: (text: string) => void
}>((props, ref) => {
  const { setFocused } = FocusContext.useStyledContext()
  const { onChangeText, ...rest } = props
  const media = useMedia()

  return (
    <View flex={1}>
      <InputFrame
        ref={ref}
        compact={!media.sm}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onChange={
          onChangeText
            ? (e: any) => onChangeText(e.target?.value ?? e.nativeEvent?.text ?? '')
            : undefined
        }
        {...rest}
      />
    </View>
  )
})

const Icon = styled(View, {
  justify: 'center',
  items: 'center',
  px: '$3',
})

export const VinInput = withStaticProperties(VinInputBoxImpl, {
  Area,
  Icon,
})
