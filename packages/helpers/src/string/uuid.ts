const hex: string[] = []
for (let i = 0; i < 256; i++) hex.push((i + 0x100).toString(16).slice(1))

const h = (n: number) => hex[n & 0xff]!

let _msecs = -Infinity
let _seq = 0

export const uuid = (): string => {
  const rnds = crypto.getRandomValues(new Uint8Array(16))
  const r = (i: number) => rnds[i]!

  const now = Date.now()

  if (now > _msecs) {
    _seq = ((r(6) & 0x7f) << 24) | (r(7) << 16) | (r(8) << 8) | r(9)
    _msecs = now
  } else {
    _seq++
    if (_seq === 0) {
      _msecs++
    }
  }

  const ms = _msecs
  const seq = _seq

  return (
    h(ms / 0x10000000000) +
    h(ms / 0x100000000) +
    h(ms / 0x1000000) +
    h(ms / 0x10000) +
    '-' +
    h(ms / 0x100) +
    h(ms) +
    '-' +
    h(0x70 | ((seq >>> 28) & 0x0f)) +
    h(seq >>> 20) +
    '-' +
    h(0x80 | ((seq >>> 14) & 0x3f)) +
    h(seq >>> 6) +
    '-' +
    h(((seq & 0x3f) << 2) | (r(10) & 0x03)) +
    h(r(11)) +
    h(r(12)) +
    h(r(13)) +
    h(r(14)) +
    h(r(15))
  )
}
