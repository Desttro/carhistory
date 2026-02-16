import type { ZonePathDefinition } from './types'

// zone paths for top-view car SVG
// viewBox: 0 0 47.032 47.032
export const damageZonePaths: ZonePathDefinition[] = [
  {
    id: 'front',
    label: 'Front',
    d: 'M23.516 2.5 C18 2.5 14 4 12 6 L12 10 L35.032 10 L35.032 6 C33 4 29 2.5 23.516 2.5 Z',
  },
  {
    id: 'rear',
    label: 'Rear',
    d: 'M12 37 L12 41 C14 43 18 44.5 23.516 44.5 C29 44.5 33 43 35.032 41 L35.032 37 Z',
  },
  {
    id: 'left-side',
    label: 'Left Side',
    d: 'M6 14 L6 33 L12 33 L12 14 Z',
  },
  {
    id: 'right-side',
    label: 'Right Side',
    d: 'M35.032 14 L35.032 33 L41.032 33 L41.032 14 Z',
  },
  {
    id: 'roof',
    label: 'Roof',
    d: 'M14 16 L14 31 L33.032 31 L33.032 16 Z',
  },
  {
    id: 'left-front',
    label: 'Left Front',
    d: 'M6 6 C6 4 8 2 12 2 L12 14 L6 14 Z',
  },
  {
    id: 'right-front',
    label: 'Right Front',
    d: 'M35.032 2 C39 2 41 4 41.032 6 L41.032 14 L35.032 14 Z',
  },
  {
    id: 'left-rear',
    label: 'Left Rear',
    d: 'M6 33 L6 41 C6 43 8 45 12 45 L12 33 Z',
  },
  {
    id: 'right-rear',
    label: 'Right Rear',
    d: 'M35.032 33 L35.032 45 C39 45 41 43 41.032 41 L41.032 33 Z',
  },
]

export const carOutlinePath =
  'M23.516,0C11.699,0,5,4.984,5,9.969v27.095c0,4.984,6.699,9.969,18.516,9.969 c11.815,0,18.516-4.984,18.516-9.969V9.969C42.032,4.984,35.331,0,23.516,0z M7.5,9.5c0-3.5,5.5-7,16.016-7 c10.5,0,16.016,3.5,16.016,7v28.032c0,3.5-5.516,7-16.016,7c-10.516,0-16.016-3.5-16.016-7V9.5z'
