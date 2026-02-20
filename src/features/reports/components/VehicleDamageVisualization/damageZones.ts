import type { CarDetailPath, ZonePathDefinition } from './types'

// viewBox for top-down sedan silhouette (~1:2.2 aspect ratio)
export const carViewBox = '0 0 200 440'

// realistic top-down sedan outline with wheel arch indentations
export const carOutlinePath = [
  // start at front center, trace clockwise
  'M100,8',
  // hood curves right
  'C130,8 155,18 162,40',
  // right front fender down to front wheel arch
  'L164,70',
  // front-right wheel arch indent
  'C164,80 170,82 170,95 C170,108 164,110 164,120',
  // right side body
  'L166,200 L166,240',
  // rear-right wheel arch indent
  'L164,320 C164,330 170,332 170,345 C170,358 164,360 164,370',
  // right rear fender to trunk
  'L162,400 C155,422 130,432 100,432',
  // trunk curves left
  'C70,432 45,422 38,400',
  // left rear fender up to rear wheel arch
  'L36,370 C36,360 30,358 30,345 C30,332 36,330 36,320',
  // left side body
  'L34,240 L34,200',
  // left front wheel arch indent
  'L36,120 C36,110 30,108 30,95 C30,82 36,80 36,70',
  // left front fender to hood
  'L38,40 C45,18 70,8 100,8 Z',
].join(' ')

// decorative detail paths (non-interactive)
export const carDetailPaths: CarDetailPath[] = [
  // windshield
  {
    id: 'windshield',
    d: 'M62,130 C65,118 80,112 100,112 C120,112 135,118 138,130 L135,168 C130,172 115,175 100,175 C85,175 70,172 65,168 Z',
    type: 'window',
  },
  // rear window
  {
    id: 'rear-window',
    d: 'M65,275 C70,271 85,268 100,268 C115,268 130,271 135,275 L138,308 C135,320 120,326 100,326 C80,326 65,320 62,308 Z',
    type: 'window',
  },
  // front-left wheel
  {
    id: 'wheel-fl',
    d: 'M30,78 C24,82 22,90 22,95 C22,100 24,108 30,112',
    type: 'wheel',
  },
  // front-right wheel
  {
    id: 'wheel-fr',
    d: 'M170,78 C176,82 178,90 178,95 C178,100 176,108 170,112',
    type: 'wheel',
  },
  // rear-left wheel
  {
    id: 'wheel-rl',
    d: 'M30,326 C24,330 22,338 22,345 C22,352 24,358 30,362',
    type: 'wheel',
  },
  // rear-right wheel
  {
    id: 'wheel-rr',
    d: 'M170,326 C176,330 178,338 178,345 C178,352 176,358 170,362',
    type: 'wheel',
  },
  // headlight left
  {
    id: 'headlight-l',
    d: 'M52,32 C56,24 66,20 72,20 L68,38 C62,38 55,36 52,32 Z',
    type: 'light',
  },
  // headlight right
  {
    id: 'headlight-r',
    d: 'M148,32 C144,24 134,20 128,20 L132,38 C138,38 145,36 148,32 Z',
    type: 'light',
  },
  // taillight left
  {
    id: 'taillight-l',
    d: 'M52,408 C56,416 66,420 72,420 L68,402 C62,402 55,404 52,408 Z',
    type: 'light',
  },
  // taillight right
  {
    id: 'taillight-r',
    d: 'M148,408 C144,416 134,420 128,420 L132,402 C138,402 145,404 148,408 Z',
    type: 'light',
  },
  // center line (hood)
  {
    id: 'line-hood',
    d: 'M100,25 L100,110',
    type: 'line',
  },
  // center line (trunk)
  {
    id: 'line-trunk',
    d: 'M100,330 L100,415',
    type: 'line',
  },
]

// damage zone paths that follow car contours
export const damageZonePaths: ZonePathDefinition[] = [
  {
    id: 'front',
    label: 'Front',
    d: 'M100,8 C130,8 155,18 162,40 L162,60 L38,60 L38,40 C45,18 70,8 100,8 Z',
  },
  {
    id: 'rear',
    label: 'Rear',
    d: 'M38,380 L162,380 L162,400 C155,422 130,432 100,432 C70,432 45,422 38,400 Z',
  },
  {
    id: 'left-side',
    label: 'Left Side',
    d: 'M34,130 L34,200 L34,240 L36,310 L50,310 L50,240 L50,200 L50,130 Z',
  },
  {
    id: 'right-side',
    label: 'Right Side',
    d: 'M150,130 L150,200 L150,240 L150,310 L166,310 L166,240 L166,200 L164,130 Z',
  },
  {
    id: 'roof',
    label: 'Roof',
    d: 'M65,175 C70,179 85,182 100,182 C115,182 130,179 135,175 L135,268 C130,264 115,261 100,261 C85,261 70,264 65,268 Z',
  },
  {
    id: 'left-front',
    label: 'Left Front',
    d: 'M38,40 L36,70 C36,80 30,82 30,95 C30,108 36,110 36,120 L34,130 L50,130 L50,60 L38,60 Z',
  },
  {
    id: 'right-front',
    label: 'Right Front',
    d: 'M162,40 L162,60 L150,60 L150,130 L164,130 L164,120 C164,110 170,108 170,95 C170,82 164,80 164,70 L162,40 Z',
  },
  {
    id: 'left-rear',
    label: 'Left Rear',
    d: 'M36,310 L36,320 C36,330 30,332 30,345 C30,358 36,360 36,370 L38,400 L38,380 L50,380 L50,310 Z',
  },
  {
    id: 'right-rear',
    label: 'Right Rear',
    d: 'M150,310 L150,380 L162,380 L162,400 L164,370 C164,360 170,358 170,345 C170,332 164,330 164,320 L166,310 Z',
  },
]
