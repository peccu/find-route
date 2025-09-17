<template>
  <div class="bg-white p-4 rounded shadow">
    <h2 class="text-lg font-medium mb-2">シミュレーション</h2>

    <div class="mb-3">
      <label class="block text-sm">経路グループを選択</label>
      <select id="routes-select" v-model="selectedRoutes" class="border rounded p-2 w-60 custom-select">
        <option v-for="group in routeGroups" :key="group.id" :value="group.routes">
          {{group.name}}</option>
      </select>
    </div>

    <div class="mb-3">
      <label class="block text-sm">出発時刻 (HH:MM)</label>
      <input v-model="departureTime" class="border rounded p-2 w-32" />
      <button @click="run" class="ml-2 px-3 py-1 bg-blue-600 text-white rounded cursor-pointer">シミュレート</button>
    </div>

    <div v-if="results.length === 0" class="text-sm text-gray-500">シミュレーション結果がありません。</div>

    <div v-for="res in results" :key="res.routeId" class="border rounded p-3 mb-2">
      <div class="flex justify-between items-center">
        <div>
          <div class="font-semibold">{{ format(res.arrivalTime) }}到着 : {{ res.routeName }}</div>
          <div class="text-sm text-gray-600">{{ res.routeNote }}</div>
        </div>
        <div class="text-sm text-gray-500">{{ res.events.length }} events</div>
      </div>

      <div class="mt-2 text-sm">
        <div v-for="ev in res.events" :key="ev.legId" class="py-1">
          <div v-if="ev.legType === 'walk'">徒歩 ({{ev.durationMinutes}}分) :
            <span :class="timeClass(ev.legId, ev.departure)">{{ format(ev.departure) }}</span>
            →
            <span :class="timeClass(ev.legId, ev.arrival)">{{ format(ev.arrival) }}</span></div>
          <div v-else>
            <div>
              電車 ({{ev.durationMinutes}}分) :
              <span :class="timeClass(ev.legId, ev.departure)">{{ format(ev.departure) }}</span>
              →
              <span :class="timeClass(ev.legId, ev.arrival)">{{ format(ev.arrival) }}</span>
            </div>
            <div>
              {{ ev.legLine }} ({{ ev.legFrom }} → {{ ev.legTo }})
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch, computed } from 'vue'
import type { Route, RouteGroup, RouteResult } from '../types'
import { hhmmToMinutes, minutesToHHMM, getSpecifiedTime, getCurrentTime } from '../utils'
import { simulateRoute } from '../lib/simulate'

export default defineComponent({
  props: {
    routeGroups: { type: Array as () => RouteGroup[], required: true }
  },
  setup(props) {
    const departureTime = ref(getCurrentTime());
    const results = ref<RouteResult[]>([])
    const selectedRoutes = ref<Route[]>(props.routeGroups[0].routes)

    watch(() => props.routeGroups, () => {
      // clear results when routes change
      results.value = []
    })

    const nextEvent = computed(() => {
      const all = results.value.map(r => {
        // TODO pick departure or arrival
        const future = r.events.filter(ev => isFuture(ev.departure))
        return future.length ? future.sort((a, b) => a.departure - b.departure)[0] : null
      })
      return all.filter(r => !!r).flatMap(r => r.legId);
    })

    const now = ref(new Date())
    setInterval(() => {
      now.value = new Date()
    }, 60 * 1000)

    function isPast(time: number) {
      return minutesToHHMM(time) < getSpecifiedTime(now.value)
    }
    function isFuture(time: number) {
      return minutesToHHMM(time) >= getSpecifiedTime(now.value)
    }

    function timeClass(legId: string, time: number) {
      return {
        'bg-yellow-200 font-bold px-1 rounded': (nextEvent.value && nextEvent.value.includes(legId)),
        'underline': isPast(time),
        'font-bold': isFuture(time),
      }
    }

    function format(mins:number){ return minutesToHHMM(mins) }

    function run() {
      const start = hhmmToMinutes(departureTime.value)
      if (start === null) { alert('出発時刻をHH:MM形式で入力してください'); return }
      const res: RouteResult[] = []
      for (const r of selectedRoutes.value) {
        const sim = simulateRoute(r, start)
        if (sim) res.push(sim)
      }
      res.sort((a,b)=>a.arrivalTime - b.arrivalTime)
      results.value = res
    }

    return { departureTime,  run, results, format, selectedRoutes, timeClass }
  }
})
</script>

<style scoped>
.custom-select {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  background-image: url('data:image/svg+xml;charset=US-ASCII,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 4 5"><path fill="%23666" d="m2 0-2 2h4zm0 5 2-2h-4z"/></svg>');
  background-repeat: no-repeat;
  background-position: right 8px center;
  background-size: 12px;
  padding-right: 32px;
}
</style>
