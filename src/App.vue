<script lang="ts" setup>
import vTouchdir, { Direction } from 'vtouchdir'
import { computed, reactive, ref } from 'vue'
import Color from 'color'

import { useToast } from 'vue-toast-notification'
import 'vue-toast-notification/dist/theme-sugar.css'
import { BG_COLOR, GRID_SIZE, INIT_BG_COLOR, WIN_COUNT } from './constants'

type CountType = keyof typeof BG_COLOR
type ColorType = typeof BG_COLOR[CountType]

const toast = useToast({ position: 'top' })

const isOver = ref(false)
const grid = ref<
  { count: CountType | null; bg: ColorType | typeof INIT_BG_COLOR }[][]
>([])
const record = reactive({
  score: 0,
  step: 0,
})

const currentMaxCount = computed(() => {
  return grid.value.reduce<CountType>((initCount, line) => {
    return line.reduce((p, c) => {
      if (isEmptySquare(c.count)) {
        return p
      }
      return c.count > p ? c.count : p
    }, initCount)
  }, 2)
})
const tone = computed(() => ({
  mainColor: `${BG_COLOR[currentMaxCount.value]}`,
  inverseColor: `${transformColor(BG_COLOR[currentMaxCount.value])}`,
}))

function transformColor(color: ColorType, rotate = 180) {
  return Color(color).rotate(rotate).toString()
}
function isEmptySquare(count: CountType | null): count is null {
  return count === null
}
function aroundHasSameCount(y: number, x: number) {
  const theGrid = grid.value
  const count = theGrid[y][x].count
  if (
    count === theGrid[y - 1]?.[x].count ||
    count === theGrid[y + 1]?.[x].count ||
    count === theGrid[y][x - 1]?.count ||
    count === theGrid[y][x + 1]?.count
  ) {
    return true
  }
  return false
}
function isWinOrLoss() {
  let i = 0
  for (let y = 0; y < GRID_SIZE.axisY; y++) {
    for (let x = 0; x < GRID_SIZE.axisX; x++) {
      if (grid.value[y][x].count === WIN_COUNT) {
        toast.success('恭喜你，你赢了!')
        isOver.value = true
        return
      }
      if (!isEmptySquare(grid.value[y][x].count) && !aroundHasSameCount(y, x)) {
        i++
      }
    }
  }

  if (i === GRID_SIZE.axisX * GRID_SIZE.axisY) {
    isOver.value = true
    toast.default('貌似无路可走了!')
  }
}
function genSquare(y: number, x: number, count: CountType | null) {
  grid.value[y][x].count = count
  grid.value[y][x].bg = isEmptySquare(count) ? INIT_BG_COLOR : BG_COLOR[count]
}

function genGame() {
  grid.value = Array.from({ length: GRID_SIZE.axisY }, () =>
    Array.from({ length: GRID_SIZE.axisX }, () => ({
      count: null,
      bg: INIT_BG_COLOR,
    }))
  )
}
function genRandomCount(num: number) {
  if (
    grid.value.every((line) =>
      line.every((square) => !isEmptySquare(square.count))
    )
  ) {
    return
  }
  let i = 0
  while (i < num) {
    const y = Math.floor(Math.random() * GRID_SIZE.axisY)
    const x = Math.floor(Math.random() * GRID_SIZE.axisX)
    if (grid.value[y][x].count !== null) {
      continue
    }
    genSquare(y, x, Math.random() > 0.5 ? 2 : 4)

    i++
  }
}
function moveHandle(
  [currentY, currentX]: [number, number],
  [nextY, nextX]: [number, number]
) {
  if (isEmptySquare(grid.value[nextY][nextX].count)) {
    genSquare(nextY, nextX, grid.value[currentY][currentX].count)
    genSquare(currentY, currentX, null)
    return false
  }
  if (grid.value[currentY][currentX].count === grid.value[nextY][nextX].count) {
    const count = (grid.value[currentY][currentX].count! << 1) as CountType
    genSquare(nextY, nextX, count)
    genSquare(currentY, currentX, null)

    record.score += count
  }
  return true
}
function move(dir: Direction) {
  if (isOver.value) {
    toast.clear()
    toast.default('貌似无路可走了!')
    return
  }

  switch (dir) {
    case Direction.UP: {
      for (let y = 0; y < GRID_SIZE.axisY; y++) {
        for (let x = 0; x < GRID_SIZE.axisY; x++) {
          if (isEmptySquare(grid.value[y][x].count)) {
            continue
          }

          let currentY = y
          let nextY = currentY - 1
          while (true) {
            if (nextY < 0) {
              break
            }
            if (moveHandle([currentY, x], [nextY, x])) {
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
          if (isEmptySquare(grid.value[y][x].count)) {
            continue
          }

          let currentY = y
          let nextY = currentY + 1
          while (true) {
            if (nextY >= GRID_SIZE.axisY) {
              break
            }
            if (moveHandle([currentY, x], [nextY, x])) {
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
          if (isEmptySquare(grid.value[y][x].count)) {
            continue
          }

          let currentX = x
          let nextX = currentX - 1
          while (true) {
            if (nextX < 0) {
              break
            }
            if (moveHandle([y, currentX], [y, nextX])) {
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
          if (isEmptySquare(grid.value[y][x].count)) {
            continue
          }

          let currentX = x
          let nextX = currentX + 1
          while (true) {
            if (nextX >= GRID_SIZE.axisY) {
              break
            }
            if (moveHandle([y, currentX], [y, nextX])) {
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

  genRandomCount(1)
  record.step++
  isWinOrLoss()
}

function keyDownHandling(e: KeyboardEvent) {
  let dir: Direction
  switch (e.key) {
    case 'ArrowUp':
      dir = Direction.UP
      break
    case 'ArrowDown':
      dir = Direction.DOWN
      break
    case 'ArrowLeft':
      dir = Direction.LEFT
      break
    case 'ArrowRight':
      dir = Direction.RIGHT
      break
    default:
      return
  }
  move(dir)
}
function registerEvent() {
  window.addEventListener('keydown', keyDownHandling)
}

function beginGame() {
  isOver.value = false
  record.step = 0
  record.score = 0
  genGame()
  genRandomCount(2)
}
function init() {
  beginGame()
  registerEvent()
}

init()
</script>

<template>
  <div
    class="w-full h-full flex items-center flex-col transition duration-400"
    :class="`bg-${tone.mainColor}`"
  >
    <h1 class="text-#ce74bc mb-0">2048</h1>
    <h3 class="text-#94afff">
      <span class="mr-20px">分数：{{ record.score }}</span>
      <span>步数：{{ record.step }}</span>
    </h3>

    <div
      v-touchdir.prevent="move"
      class="grid grid-cols-1 grid-rows-4 p-8px gap-8px"
      :style="{
        backgroundColor: tone.inverseColor,
      }"
    >
      <div
        v-for="(line, index) of grid"
        :key="index"
        class="grid grid-cols-4 grid-rows-1 gap-8px"
      >
        <div
          v-for="({ count, bg }, idx) of line"
          :key="idx"
          class="w-72px h-72px text-light-1009 flex items-center justify-center text-28px font-bold"
          :class="`bg-${bg}`"
          :style="{
            color: bg !== INIT_BG_COLOR ? transformColor(bg as ColorType, 160) : '',
          }"
        >
          {{ count }}
        </div>
      </div>
    </div>

    <button
      class="mt-24px w-110px h-46px flex items-center justify-center rounded-md bg-#e56363 text-white outline-none border-none active:bg-#ce567b"
      @click="beginGame"
    >
      New Game
    </button>
  </div>
</template>

<style>
html,
body,
#app {
  height: 100%;
  width: 100%;
  margin: 0;
  padding: 0;
}
</style>
