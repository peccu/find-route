<template>
  <!-- simulate form -->
  <div>
    <label class="block text-sm">出発時刻 (HH:MM)</label>
    <input
      @focus="selectAll"
      v-model="departureTime"
      class="border rounded p-2 w-32"
    />
    <button
      @click="run"
      class="ml-2 px-3 py-1 bg-blue-600 text-white rounded cursor-pointer"
    >
      シミュレート
    </button>
  </div>

  <SimulateResult :results />
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import SimulateResult from './SimulateResult.vue'
import { hhmmToMinutes, getCurrentTime } from '../../utils'
import type { Route, RouteResult } from '../../types'
import { simulateRoute } from '../../lib/simulate'

// props 定義
const props = defineProps<{
  selectedRoutes: Route[] | null
}>()

// state
const departureTime = ref(getCurrentTime())
const results = ref<RouteResult[]>([])

// methods
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

// watch
watch(
  () => props.selectedRoutes,
  () => {
    results.value = [] // clear results when routes change
  },
)
</script>
