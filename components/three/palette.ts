// Hex mirrors of the oklch palette in app/globals.css so three.js can use them.
export const P = {
  ink: '#201d33',
  cloud: '#f7f2e6',
  wall: '#f2ead9',
  wallShade: '#e6dac2',
  floor: '#e3c99b',
  floorAlt: '#d8bb88',
  grape: '#2a4bb0',
  grapeSoft: '#d8dff3',
  bubblegum: '#c0431f',
  bubblegumSoft: '#f4d9cd',
  mint: '#4f9d78',
  mintSoft: '#d5e9dd',
  sky: '#5b79c9',
  skySoft: '#dde4f6',
  lemon: '#cf9f3a',
  lemonSoft: '#f1e3c1',
  peach: '#cf6a3a',
  peachSoft: '#f4dccb',
  wood: '#b98a55',
  woodDark: '#916638',
  board: '#223055',
  boardDark: '#1a2540',
  white: '#fffdf7',
  chalk: '#f6f1e4',
} as const

export type Palette = typeof P
