export const BG_COLOR = {
  2: '#ffe05a',
  4: '#ffa45b',
  8: '#ffe6ae',
  16: '#ff9d8b',
  32: '#ff7a97',
  64: '#ffbfae',
  128: '#ffc072',
  256: '#ffe59f',
  512: '#ffa397',
  1024: '#ff84a2',
  2048: '#ff848c',
} as const

export const INIT_BG_COLOR = '#ffd0ad'

export const GRID_SIZE = { axisY: 4, axisX: 4 } as const

export const WIN_COUNT = 2048

export enum GameStatus {
  normal,
  win,
  loss,
}
