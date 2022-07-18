<script lang="ts" setup>
import vTouchdir, { Direction } from 'vtouchdir'
import { computed, reactive, ref } from 'vue'

import { useToast } from 'vue-toast-notification'
import 'vue-toast-notification/dist/theme-sugar.css'
import { BG_COLOR, GRID_SIZE, GameStatus, INIT_BG_COLOR } from './constants'
import type { CountType, Grid } from './utils'
import {
  type ColorType,
  getInitGame,
  getIsEmptySquare,
  getIsWinOrLoss,
  getRandomCount,
  getTransformColor,
} from './utils'

const toast = useToast({ position: 'top' })

const gameStatus = ref(GameStatus.normal)
const $grid = ref<Grid>([])
const record = reactive({
  score: 0,
  step: 0,
})

const currentMaxCount = computed(() => {
  return $grid.value.reduce<CountType>((initCount, line) => {
    return line.reduce((p, c) => {
      if (getIsEmptySquare(c.count)) {
        return p
      }
      return c.count > p ? c.count : p
    }, initCount)
  }, 2)
})
const tone = computed(() => ({
  mainColor: `${BG_COLOR[currentMaxCount.value]}`,
  inverseColor: `${getTransformColor(BG_COLOR[currentMaxCount.value])}`,
}))

function showGameStatusToast(status: GameStatus) {
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

function updateSquare(y: number, x: number, count: CountType | null) {
  $grid.value[y][x].count = count
  $grid.value[y][x].bg = getIsEmptySquare(count)
    ? INIT_BG_COLOR
    : BG_COLOR[count]
}

function moveHandle(
  [currentY, currentX]: [number, number],
  [nextY, nextX]: [number, number]
) {
  if (getIsEmptySquare($grid.value[nextY][nextX].count)) {
    updateSquare(nextY, nextX, $grid.value[currentY][currentX].count)
    updateSquare(currentY, currentX, null)
    return false
  }
  if (
    $grid.value[currentY][currentX].count === $grid.value[nextY][nextX].count
  ) {
    const count = ($grid.value[currentY][currentX].count! << 1) as CountType
    updateSquare(nextY, nextX, count)
    updateSquare(currentY, currentX, null)

    record.score += count
  }
  return true
}
function move(dir: Direction) {
  if (gameStatus.value !== GameStatus.normal) {
    showGameStatusToast(gameStatus.value)
    return
  }

  switch (dir) {
    case Direction.UP: {
      for (let y = 0; y < GRID_SIZE.axisY; y++) {
        for (let x = 0; x < GRID_SIZE.axisY; x++) {
          if (getIsEmptySquare($grid.value[y][x].count)) {
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
          if (getIsEmptySquare($grid.value[y][x].count)) {
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
          if (getIsEmptySquare($grid.value[y][x].count)) {
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
          if (getIsEmptySquare($grid.value[y][x].count)) {
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

  const [
    {
      position: [y, x],
      count,
    },
  ] = getRandomCount(1, $grid.value)
  updateSquare(y, x, count)

  gameStatus.value = getIsWinOrLoss($grid.value)
  showGameStatusToast(gameStatus.value)

  record.step++
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
  gameStatus.value = GameStatus.normal
  record.step = 0
  record.score = 0
  $grid.value = getInitGame()

  for (const {
    position: [y, x],
    count,
  } of getRandomCount(2, $grid.value)) {
    updateSquare(y, x, count)
  }
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
        v-for="(line, index) of $grid"
        :key="index"
        class="grid grid-cols-4 grid-rows-1 gap-8px"
      >
        <div
          v-for="({ count, bg }, idx) of line"
          :key="idx"
          class="w-72px h-72px text-light-1009 flex items-center justify-center text-28px font-bold"
          :class="`bg-${bg}`"
          :style="{
            color: bg !== INIT_BG_COLOR ? getTransformColor(bg as ColorType, 160) : '',
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
