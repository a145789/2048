<script lang="ts" setup>
import vTouchdir, { Direction } from 'vtouchdir'
import { computed, reactive, ref } from 'vue'

import { useToast } from 'vue-toast-notification'
import 'vue-toast-notification/dist/theme-sugar.css'
import { BG_COLOR, GameStatus, INIT_BG_COLOR } from './constants'
import {
  type ColorType,
  type Grid,
  getDeepCloneGridCount,
  getInitGame,
  getIsWinOrLoss,
  getMaxCount,
  getNextGrid,
  getRandomCount,
  getTransformColor,
  showGameStatusToast,
  updateSquare,
} from './utils'

const toast = useToast({ position: 'top' })

const gameStatus = ref(GameStatus.normal)
const $grid = ref<Grid>([])
const record = reactive({
  score: 0,
  step: 0,
})

const currentMaxCount = computed(() => {
  return getMaxCount($grid.value)
})
const tone = computed(() => ({
  mainColor: `${BG_COLOR[currentMaxCount.value]}`,
  inverseColor: `${getTransformColor(BG_COLOR[currentMaxCount.value])}`,
}))

let timer: number
/** 自动操作 */
function autoMove() {
  if (gameStatus.value !== GameStatus.normal) {
    clearTimeout(timer)
    return
  }
  timer = setTimeout(() => {
    const nextGrid: {
      direction: Direction
      grid: Grid
      score: number
    }[] = []
    let i = 0
    while (i < 4) {
      switch (i) {
        case 0:
          nextGrid.push({
            ...getNextGrid(
              Direction.LEFT,
              getDeepCloneGridCount($grid.value),
              record.score
            ),
            direction: Direction.LEFT,
          })
          break
        case 1:
          nextGrid.push({
            ...getNextGrid(
              Direction.RIGHT,
              getDeepCloneGridCount($grid.value),
              record.score
            ),
            direction: Direction.RIGHT,
          })
          break
        case 2:
          nextGrid.push({
            ...getNextGrid(
              Direction.UP,
              getDeepCloneGridCount($grid.value),
              record.score
            ),
            direction: Direction.UP,
          })
          break
        case 3:
          nextGrid.push({
            ...getNextGrid(
              Direction.DOWN,
              getDeepCloneGridCount($grid.value),
              record.score
            ),
            direction: Direction.DOWN,
          })
          break

        default:
          break
      }
      i++
    }

    const { direction } = nextGrid.reduce(
      (p, { grid, score, direction }) => {
        const maxCount = getMaxCount(grid)
        const emptySquare = grid.reduce((acc, cur) => {
          return acc + cur.filter((item) => item === null).length
        }, 0)
        const maxScore = maxCount * 1000 + score * 100 + emptySquare
        return maxScore > p.maxScore ? { maxScore, direction } : p
      },
      { direction: Direction.LEFT, maxScore: 0 }
    )

    manualMove(direction)
    autoMove()
  }, 300)
}

/** 手动操作 */
function manualMove(dir: Direction) {
  if (gameStatus.value !== GameStatus.normal) {
    showGameStatusToast(gameStatus.value, toast)
    return
  }

  const { grid, score } = getNextGrid(
    dir,
    getDeepCloneGridCount($grid.value),
    record.score
  )

  for (const {
    position: [y, x],
    count,
  } of getRandomCount(1, grid)) {
    updateSquare(y, x, count, grid)
  }

  gameStatus.value = getIsWinOrLoss(grid)
  showGameStatusToast(gameStatus.value, toast)
  record.score = score
  record.step++
  $grid.value = grid
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
  manualMove(dir)
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
    updateSquare(y, x, count, $grid.value)
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
      v-touchdir.prevent="manualMove"
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

    <div class="flex">
      <button
      class="mt-24px w-110px h-46px flex items-center justify-center rounded-md bg-#e56363 text-white outline-none border-none active:bg-#ce567b mr-12px"
      @click="beginGame"
    >
      New Game
    </button>
    <button
      class="mt-24px w-110px h-46px flex items-center justify-center rounded-md bg-#ce567b text-white outline-none border-none active:bg-#e56363"
      @click="autoMove"
    >
      Auto Game
    </button>
    </div>
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
