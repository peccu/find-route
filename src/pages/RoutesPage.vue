<template>
  <div class="bg-white p-4 rounded shadow">
    <h2 class="text-lg font-medium mb-2">シミュレーション</h2>

    <div class="mb-3">
      <label class="block text-sm">経路グループを選択</label>
      <select id="routes-select" v-model="selectedRoutes" class="border rounded p-2 w-40 custom-select">
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
          <div v-if="ev.legType === 'walk'">徒歩 ({{ev.durationMinutes}}分) : {{ format(ev.departure) }} → {{ format(ev.arrival) }}</div>
          <div v-else>
            <div>
              電車 ({{ev.durationMinutes}}分) : {{ format(ev.departure) }} → {{ format(ev.arrival) }}
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
import { defineComponent, ref, watch } from 'vue'
import type { Route, RouteGroup, RouteResult, Event } from '../types'
import { hhmmToMinutes, minutesToHHMM, getCurrentTime } from '../utils'

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

    function simulateRoute(route: Route, startTime: number): RouteResult | null {
      let currentTime = startTime
      const events: Event[] = []

      for (const leg of route.legs) {
        if (leg.type === 'walk') {
          const departure = currentTime
          const arrival = currentTime + leg.durationMinutes
          events.push({ legId: leg.id, legType: 'walk', departure, durationMinutes: leg.durationMinutes, arrival })
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
            events.push({
              legId: leg.id,
              legType: 'train',
              legLine: leg.line,
              legFrom: leg.from,
              legTo: leg.to,
              departure,
              durationMinutes: leg.durationMinutes,
              arrival
            })
            currentTime = arrival
          } else {
            // t is in same-day minutes; but if currentTime already past midnight offset, align days
            const baseDayOffset = Math.floor(currentTime / (24*60)) * 24*60
            let departure = baseDayOffset + t
            if (departure < currentTime) departure += 24*60
            const arrival = departure + leg.durationMinutes
            events.push({
              legId: leg.id,
              legType: 'train',
              legLine: leg.line,
              legFrom: leg.from,
              legTo: leg.to,
              departure,
              durationMinutes: leg.durationMinutes,
              arrival
            })
            currentTime = arrival
          }
        }
      }

      return { routeId: route.id, routeName: route.name, routeNote: route.notes, arrivalTime: currentTime, events }
    }

    return { departureTime, run, results, format, selectedRoutes }
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
