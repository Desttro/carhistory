const hex: string[] = new Array(256)
for (let i = 0; i < 256; i++) hex[i] = (i + 0x100).toString(16).slice(1)

const h = (n: number) => hex[n & 0xff]!

let lastMs = -Infinity
let counter = 0

export const uuid = (): string => {
  const now = Date.now()

  if (now > lastMs) {
    const buf = new Uint32Array(1)
    crypto.getRandomValues(buf)
    counter = buf[0]! >>> 0
    lastMs = now
  } else {
    counter = (counter + 1) >>> 0
    if (counter === 0) {
      lastMs++
    }
  }

  const ms = lastMs
  const seq = counter

  const rnds = crypto.getRandomValues(new Uint8Array(6))
  const r = (i: number) => rnds[i]!

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
    h(((seq & 0x3f) << 2) | (r(0) & 0x03)) +
    h(r(1)) +
    h(r(2)) +
    h(r(3)) +
    h(r(4)) +
    h(r(5))
  )
}
