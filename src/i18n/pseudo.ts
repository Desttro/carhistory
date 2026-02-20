// character replacement map for pseudo-localization
const charMap: Record<string, string> = {
  a: 'à',
  b: 'ƀ',
  c: 'ç',
  d: 'ð',
  e: 'é',
  f: 'ƒ',
  g: 'ĝ',
  h: 'ĥ',
  i: 'ì',
  j: 'ĵ',
  k: 'ķ',
  l: 'ĺ',
  m: 'ɱ',
  n: 'ñ',
  o: 'ö',
  p: 'þ',
  q: 'ǫ',
  r: 'ŕ',
  s: 'š',
  t: 'ţ',
  u: 'ü',
  v: 'ṽ',
  w: 'ŵ',
  x: 'ẋ',
  y: 'ý',
  z: 'ž',
  A: 'À',
  B: 'Ɓ',
  C: 'Ç',
  D: 'Ð',
  E: 'É',
  F: 'Ƒ',
  G: 'Ĝ',
  H: 'Ĥ',
  I: 'Ì',
  J: 'Ĵ',
  K: 'Ķ',
  L: 'Ĺ',
  M: 'Ṁ',
  N: 'Ñ',
  O: 'Ö',
  P: 'Þ',
  Q: 'Ǫ',
  R: 'Ŕ',
  S: 'Š',
  T: 'Ţ',
  U: 'Ü',
  V: 'Ṽ',
  W: 'Ŵ',
  X: 'Ẋ',
  Y: 'Ý',
  Z: 'Ž',
}

export function pseudoLocalize(message: string): string {
  let result = ''
  let inPlaceholder = 0

  for (let i = 0; i < message.length; i++) {
    const ch = message[i]!

    // track ICU placeholder depth
    if (ch === '{') {
      inPlaceholder++
      result += ch
      continue
    }
    if (ch === '}') {
      inPlaceholder = Math.max(0, inPlaceholder - 1)
      result += ch
      continue
    }

    // don't transform characters inside placeholders
    if (inPlaceholder > 0) {
      result += ch
      continue
    }

    result += charMap[ch] ?? ch
  }

  // add ~30% padding for text expansion testing
  const pad = Math.ceil(result.length * 0.3)
  const padding = '~'.repeat(pad)

  return `[${result}${padding}]`
}

export function pseudoLocalizeMessages(
  messages: Record<string, string>
): Record<string, string> {
  const result: Record<string, string> = {}
  for (const [key, value] of Object.entries(messages)) {
    result[key] = pseudoLocalize(value)
  }
  return result
}
