<template>
  <div class="bg-white p-4 rounded shadow">
    <h2 class="text-lg font-medium mb-2">シミュレーション</h2>

    <div class="mb-3">
      <label class="block text-sm">出発時刻 (HH:MM)</label>
      <input v-model="startInput" class="border rounded p-2 w-32" />
      <button @click="run" class="ml-2 px-3 py-1 bg-blue-600 text-white rounded">シミュレート</button>
    </div>

    <div v-if="results.length === 0" class="text-sm text-gray-500">シミュレーション結果がありません。</div>

    <div v-for="res in results" :key="res.routeId" class="border rounded p-3 mb-2">
      <div class="flex justify-between items-center">
        <div>
          <div class="font-semibold">{{ res.routeName }}</div>
          <div class="text-sm text-gray-600">到着: {{ format(res.arrivalTime) }}</div>
        </div>
        <div class="text-sm text-gray-500">{{ res.events.length }} events</div>
      </div>

      <div class="mt-2 text-sm">
        <div v-for="ev in res.events" :key="ev.legId" class="py-1">
          <div v-if="ev.legType === 'walk'">徒歩: {{ format(ev.departure) }} → {{ format(ev.arrival) }}</div>
          <div v-else>電車: {{ format(ev.departure) }} → {{ format(ev.arrival) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue'
import type { Route, RouteResult, Event, Leg } from '../types'
import { hhmmToMinutes, minutesToHHMM } from '../utils'

export default defineComponent({
  props: {
    routes: { type: Array as () => Route[], required: true }
  },
  setup(props) {
    const startInput = ref('08:00')
    const results = ref<RouteResult[]>([])

    watch(() => props.routes, () => {
      // clear results when routes change
      results.value = []
    })

    function format(mins:number){ return minutesToHHMM(mins) }

    function run() {
      const start = hhmmToMinutes(startInput.value)
      if (start === null) { alert('出発時刻をHH:MM形式で入力してください'); return }
      const res: RouteResult[] = []
      for (const r of props.routes) {
        const sim = simulateRoute(r, start)
        if (sim) res.push(sim)
      }
      res.sort((a,b)=>a.arrivalTime - b.arrivalTime)
      results.value = res
    }

    function simulateRoute(route: Route, startTime: number): RouteResult | null {
      let currentTime = startTime
      const events: Event[] = []

      for (const leg of route.legs) {
        if (leg.type === 'walk') {
          const departure = currentTime
          const arrival = currentTime + leg.durationMinutes
          events.push({ legId: leg.id, legType: 'walk', departure, arrival })
          currentTime = arrival
        } else {
          // find first timetable departure >= currentTime
          const t = leg.timetable.find(t => t >= (currentTime % (24*60)))
          if (t === undefined) {
            // approach: also allow next-day trains by taking first entry + 24h
            if (leg.timetable.length === 0) return null
            const next = leg.timetable[0] + 24*60
            const departure = next + Math.floor(currentTime/(24*60))*24*60
            const arrival = departure + leg.durationMinutes
            events.push({ legId: leg.id, legType: 'train', departure, arrival })
            currentTime = arrival
          } else {
            // t is in same-day minutes; but if currentTime already past midnight offset, align days
            const baseDayOffset = Math.floor(currentTime / (24*60)) * 24*60
            let departure = baseDayOffset + t
            if (departure < currentTime) departure += 24*60
            const arrival = departure + leg.durationMinutes
            events.push({ legId: leg.id, legType: 'train', departure, arrival })
            currentTime = arrival
          }
        }
      }

      return { routeId: route.id, routeName: route.name, arrivalTime: currentTime, events }
    }

    return { startInput, run, results, format }
  }
})
</script>
