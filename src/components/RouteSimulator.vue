<template>
  <!-- simulate form -->
  <div>
    <label class="block text-sm">出発時刻 (HH:MM)</label>
    <input @focus="selectAll" v-model="departureTime" class="border rounded p-2 w-32" />
    <button @click="run" class="ml-2 px-3 py-1 bg-blue-600 text-white rounded cursor-pointer">シミュレート</button>
  </div>

  <!-- no result -->
  <div v-if="results.length === 0" class="text-sm text-gray-500">シミュレーション結果がありません。</div>

  <!-- results -->
  <div v-for="res in results" :key="res.routeId" class="border-b py-3 space-y-2">

    <!-- header -->
    <div class="flex justify-between items-center">
      <div>
        <div class="font-semibold">{{ format(res.arrivalTime) }}到着 : {{ res.routeName }}</div>
        <div class="text-sm text-gray-600">{{ res.routeNote }}</div>
      </div>
      <div class="text-sm text-gray-500">{{ res.events.length }} events</div>
    </div>

    <!-- events -->
    <div class="text-sm">
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

  </div><!-- results -->
</template>

<script lang="ts">
import { defineComponent, ref, watch, computed } from 'vue'
import { hhmmToMinutes, minutesToHHMM, getSpecifiedTime, getCurrentTime} from '../utils'
import type { Route, RouteResult} from '../types'
import { simulateRoute } from '../lib/simulate'

export default defineComponent({
  props: {
    selectedRoutes: { type: Array as () => Route[] | null, required: true }
  },
  setup(props) {
    const departureTime = ref(getCurrentTime());
    const results = ref<RouteResult[]>([])

    function selectAll(event: any) {
      event.target.select()
    }

    function run() {
      const start = hhmmToMinutes(departureTime.value)
      if (start === null) { alert('出発時刻をHH:MM形式で入力してください'); return }
      const res: RouteResult[] = []
      if (props.selectedRoutes) {
        for (const r of props.selectedRoutes) {
          const sim = simulateRoute(r, start)
          if (sim) res.push(sim)
        }
      }
      res.sort((a,b)=>a.arrivalTime - b.arrivalTime)
      results.value = res
    }

    function format(mins:number){ return minutesToHHMM(mins) }

    watch(() => props.selectedRoutes, () => {
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
    }, 10 * 1000)

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

    return {
      departureTime,  run, results, format, timeClass, selectAll
    }
  }
})
</script>
