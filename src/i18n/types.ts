import type { messages as enMessages } from './messages/en'

export type Messages = typeof enMessages
export type MessageKey = keyof Messages

export type InterpolationValues = Record<string, string | number | Date>

export type TFunction = (key: MessageKey, values?: InterpolationValues) => string

export type CompiledToken =
  | string
  | { type: 'var'; name: string }
  | {
      type: 'plural'
      name: string
      offset: number
      forms: Record<string, CompiledToken[]>
    }
  | { type: 'select'; name: string; forms: Record<string, CompiledToken[]> }
  | { type: 'number'; name: string; style?: string }
  | { type: 'date'; name: string; style?: string }
  | { type: 'hash' }

export type CompiledMessage = CompiledToken[]
