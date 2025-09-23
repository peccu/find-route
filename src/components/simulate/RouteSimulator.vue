<template>
  <div class="space-y-2">
    <div class="space-x-2">
      <label class="block text-sm">出発時刻 (HH:MM)</label>
      <input
        @focus="selectAll"
        v-model="departureTime"
        class="border rounded p-2 w-32"
      />
      <button
        @click="run"
        class="px-3 py-2 bg-blue-600 text-white rounded cursor-pointer"
      >
        シミュレート
      </button>
    </div>
    <div class="space-x-2">
      <button
        @click="add(-1)"
        class="px-3 py-2 bg-blue-600 text-white rounded cursor-pointer"
      >
        -1min
      </button>
      <button
        @click="setNow()"
        class="px-3 py-2 bg-blue-600 text-white rounded cursor-pointer"
      >
        now
      </button>
      <button
        @click="add(1)"
        class="px-3 py-2 bg-blue-600 text-white rounded cursor-pointer"
      >
        +1min
      </button>
    </div>
  </div>

  <SimulateResult :results />
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import SimulateResult from './SimulateResult.vue'
import { hhmmToMinutes, getCurrentTime, minutesToHHMM } from '../../utils'
import type { Route, RouteResult } from '../../types'
import { simulateRoute } from '../../lib/simulate'

const props = defineProps<{
  selectedRoutes: Route[] | null
}>()

const departureTime = ref(getCurrentTime())
const results = ref<RouteResult[]>([])

function selectAll(event: Event) {
  ;(event.target as HTMLInputElement).select()
}

function run() {
  const start = hhmmToMinutes(departureTime.value)
  if (start === null) {
    alert('出発時刻をHH:MM形式で入力してください')
    return
  }
  const res: RouteResult[] = []
  if (props.selectedRoutes) {
    for (const r of props.selectedRoutes) {
      const sim = simulateRoute(r, start)
      if (sim) res.push(sim)
    }
  }
  res.sort((a, b) => a.arrivalTime - b.arrivalTime)
  results.value = res
}

function setNow() {
  departureTime.value = getCurrentTime()
}

function add(plus: number) {
  let current = hhmmToMinutes(departureTime.value)
  if (current === null) {
    alert('出発時刻をHH:MM形式で入力してください')
    return
  }
  current += plus
  departureTime.value = minutesToHHMM(current)
}

watch(
  () => props.selectedRoutes,
  () => {
    results.value = []
  },
)
</script>
