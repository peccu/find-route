<template>
  <!-- no result -->
  <div v-if="results.length === 0" class="text-sm text-gray-500">
    シミュレーション結果がありません。
  </div>

  <!-- results -->
  <div
    v-for="res in results"
    :key="res.routeId"
    class="border-b py-3 space-y-2"
  >
    <!-- header -->
    <div class="flex justify-between items-center">
      <div>
        <div class="font-semibold">
          {{ format(res.arrivalTime) }}到着 : {{ res.routeName }}
        </div>
        <div class="text-sm text-gray-600">{{ res.routeNote }}</div>
      </div>
      <div class="text-sm text-gray-500">{{ res.events.length }} events</div>
    </div>

    <!-- events -->
    <div class="text-sm">
      <div v-for="ev in res.events" :key="ev.legId" class="py-1">
        <div v-if="ev.legType === 'walk'">
          徒歩 ({{ ev.durationMinutes }}分) :
          <span :class="timeClass(ev.legId, ev.departure)">{{
            format(ev.departure)
          }}</span>
          →
          <span :class="timeClass(ev.legId, ev.arrival)">{{
            format(ev.arrival)
          }}</span>
        </div>
        <div v-else>
          <div>
            電車 ({{ ev.durationMinutes }}分) :
            <span :class="timeClass(ev.legId, ev.departure)">{{
              format(ev.departure)
            }}</span>
            →
            <span :class="timeClass(ev.legId, ev.arrival)">{{
              format(ev.arrival)
            }}</span>
          </div>
          <div>{{ ev.legLine }} ({{ ev.legFrom }} → {{ ev.legTo }})</div>
        </div>
      </div>
    </div>
  </div>
  <!-- results -->
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { RouteResult } from '../../types'
import { minutesToHHMM, getSpecifiedTime } from '../../utils'

const now = ref(new Date())

// 10秒ごとに現在時刻更新
setInterval(() => {
  now.value = new Date()
}, 10 * 1000)

const props = defineProps<{
  results: RouteResult[]
}>()

function format(mins: number) {
  return minutesToHHMM(mins)
}

function isPast(time: number) {
  return minutesToHHMM(time) < getSpecifiedTime(now.value)
}
function isFuture(time: number) {
  return minutesToHHMM(time) >= getSpecifiedTime(now.value)
}

// computed
const nextEvent = computed(() => {
  const all = props.results.map((r) => {
    const future = r.events.filter((ev) => isFuture(ev.departure))
    return future.length
      ? future.sort((a, b) => a.departure - b.departure)[0]
      : null
  })
  return all.filter((r) => !!r).flatMap((r) => r!.legId)
})

function timeClass(legId: string, time: number) {
  return {
    'bg-yellow-200 font-bold px-1 rounded':
      nextEvent.value && nextEvent.value.includes(legId),
    underline: isPast(time),
    'font-bold': isFuture(time),
  }
}
</script>
