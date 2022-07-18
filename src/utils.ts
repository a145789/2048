import Color from 'color'
import { type BG_COLOR, GRID_SIZE, GameStatus, INIT_BG_COLOR, WIN_COUNT } from "./constants"

export type CountType = keyof typeof BG_COLOR
export type ColorType = typeof BG_COLOR[CountType]
export type Grid = {
  count: CountType | null
  bg: ColorType | typeof INIT_BG_COLOR
}[][]

export function getTransformColor(color: ColorType, rotate = 180) {
  return Color(color).rotate(rotate).toString()
}

export function getIsEmptySquare(count: CountType | null): count is null {
  return count === null
}

export function getAroundHasSameCount(y: number, x: number, grid: Grid) {
  const count = grid[y][x].count
  if (
    count === grid[y - 1]?.[x].count ||
    count === grid[y + 1]?.[x].count ||
    count === grid[y][x - 1]?.count ||
    count === grid[y][x + 1]?.count
  ) {
    return true
  }
  return false
}

export function getIsWinOrLoss(grid: Grid): GameStatus {
  let i = 0
  for (let y = 0; y < GRID_SIZE.axisY; y++) {
    for (let x = 0; x < GRID_SIZE.axisX; x++) {
      if (grid[y][x].count === WIN_COUNT) {
        return GameStatus.win
      }
      if (
        !getIsEmptySquare(grid[y][x].count) &&
        !getAroundHasSameCount(y, x, grid)
      ) {
        i++
      }
    }
  }

  if (i === GRID_SIZE.axisX * GRID_SIZE.axisY) {
    return GameStatus.loss
  }
  return GameStatus.normal
}

export function getInitGame(): Grid {
  return Array.from({ length: GRID_SIZE.axisY }, () =>
    Array.from({ length: GRID_SIZE.axisX }, () => ({
      count: null,
      bg: INIT_BG_COLOR,
    }))
  )
}

export function getRandomCount(num: number, grid: Grid) {
  if (
    grid.every((line) => line.every((square) => !getIsEmptySquare(square.count)))
  ) {
    return []
  }
  let i = 0
  const squares: {
    position: [number, number]
    count: CountType
  }[] = []
  while (i < num) {
    const y = Math.floor(Math.random() * GRID_SIZE.axisY)
    const x = Math.floor(Math.random() * GRID_SIZE.axisX)
    if (grid[y][x].count !== null) {
      continue
    }
    squares.push({ position: [y, x], count: Math.random() > 0.5 ? 2 : 4 })
    i++
  }

  return squares
}
