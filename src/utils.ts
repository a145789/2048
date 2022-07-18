import Color from 'color'
import { Direction } from 'vtouchdir'
import type { ToastPluginApi } from 'vue-toast-notification'
import {
  BG_COLOR,
  GRID_SIZE,
  GameStatus,
  INIT_BG_COLOR,
  WIN_COUNT,
} from './constants'

export type CountType = keyof typeof BG_COLOR
export type ColorType = typeof BG_COLOR[CountType]
export type Grid = {
  count: CountType | null
  bg: ColorType | typeof INIT_BG_COLOR
}[][]
type MoveHandle = 'move' | 'overlay' | 'none'

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
    grid.every((line) =>
      line.every((square) => !getIsEmptySquare(square.count))
    )
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
    if (
      grid[y][x].count !== null ||
      squares.some(({ position: [py, px] }) => py === y && px === x)
    ) {
      continue
    }
    squares.push({ position: [y, x], count: Math.random() > 0.5 ? 2 : 4 })
    i++
  }

  return squares
}

export function getDeepCloneGridCount(grid: Grid) {
  return grid.map((line) => line.map((s) => ({ ...s })))
}

export function showGameStatusToast(status: GameStatus, toast: ToastPluginApi) {
  toast.clear()
  switch (status) {
    case GameStatus.win:
      toast.success('恭喜你，你赢了!')
      break
    case GameStatus.loss:
      toast.default('貌似无路可走了!')
      break

    default:
      break
  }
}

export function updateSquare(
  y: number,
  x: number,
  count: CountType | null,
  grid: Grid
) {
  grid[y][x].count = count
  grid[y][x].bg = getIsEmptySquare(count) ? INIT_BG_COLOR : BG_COLOR[count]
}

export function getNextGrid(dir: Direction, grid: Grid, score = 0) {
  function moveHandle(
    [currentY, currentX]: [number, number],
    [nextY, nextX]: [number, number]
  ): MoveHandle {
    // 如果下一个位置是空的，则直接移动
    if (getIsEmptySquare(grid[nextY][nextX].count)) {
      updateSquare(nextY, nextX, grid[currentY][currentX].count, grid)
      updateSquare(currentY, currentX, null, grid)
      return 'move'
    }
    // 如果下一个位置是有数字的，则要判断是否可以合并
    if (grid[currentY][currentX].count === grid[nextY][nextX].count) {
      const count = (grid[currentY][currentX].count! << 1) as CountType
      updateSquare(nextY, nextX, count, grid)
      updateSquare(currentY, currentX, null, grid)
      score += count
      return 'overlay'
    }
    // 下一个位置是有数字但不能叠加，走到头了
    return 'none'
  }

  switch (dir) {
    case Direction.UP: {
      for (let y = 0; y < GRID_SIZE.axisY; y++) {
        for (let x = 0; x < GRID_SIZE.axisY; x++) {
          // 如果是空方块，则跳过
          if (getIsEmptySquare(grid[y][x].count)) {
            continue
          }

          let currentY = y
          let nextY = currentY - 1
          while (nextY >= 0) {
            if (moveHandle([currentY, x], [nextY, x]) !== 'move') {
              break
            }
            currentY = nextY
            nextY--
          }
        }
      }
      break
    }
    case Direction.DOWN: {
      for (let y = GRID_SIZE.axisY - 1; y >= 0; y--) {
        for (let x = 0; x < GRID_SIZE.axisY; x++) {
          if (getIsEmptySquare(grid[y][x].count)) {
            continue
          }

          let currentY = y
          let nextY = currentY + 1
          while (nextY < GRID_SIZE.axisY) {
            if (moveHandle([currentY, x], [nextY, x]) !== 'move') {
              break
            }
            currentY = nextY
            nextY++
          }
        }
      }
      break
    }
    case Direction.LEFT: {
      for (let x = 0; x < GRID_SIZE.axisY; x++) {
        for (let y = 0; y < GRID_SIZE.axisY; y++) {
          if (getIsEmptySquare(grid[y][x].count)) {
            continue
          }

          let currentX = x
          let nextX = currentX - 1
          while (nextX >= 0) {
            if (moveHandle([y, currentX], [y, nextX]) !== 'move') {
              break
            }
            currentX = nextX
            nextX--
          }
        }
      }
      break
    }
    case Direction.RIGHT: {
      for (let x = GRID_SIZE.axisY - 1; x >= 0; x--) {
        for (let y = 0; y < GRID_SIZE.axisY; y++) {
          if (getIsEmptySquare(grid[y][x].count)) {
            continue
          }

          let currentX = x
          let nextX = currentX + 1
          while (nextX < GRID_SIZE.axisY) {
            if (moveHandle([y, currentX], [y, nextX]) !== 'move') {
              break
            }
            currentX = nextX
            nextX++
          }
        }
      }
      break
    }

    default:
      break
  }

  return { grid, score }
}

export function getMaxCount(grid: Grid) {
  return grid.reduce<CountType>((initCount, line) => {
    return line.reduce((p, c) => {
      if (getIsEmptySquare(c.count)) {
        return p
      }
      return c.count > p ? c.count : p
    }, initCount)
  }, 2)
}
