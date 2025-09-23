<template>
  <div class="bg-white p-4 rounded shadow space-y-3">
    <h2 class="text-lg font-medium mb-2">シミュレーション</h2>

    <CustomSelector
      v-model="selectedGroup"
      :items="routeGroups"
      label-key="name"
      value-key="name"
      label="経路グループを選択"
      placeholder="選択してください"
    />
    :initial-select="initialRouteGroup"

    <RouteSimulator v-model:selectedRoutes="selectedRoutes" />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue'
import type { Route, RouteGroup } from '../types'
import RouteSimulator from '../components/RouteSimulator.vue'
import CustomSelector from '../components/CustomSelector.vue'
import { LocationService } from '../services/location-service'
import { findNearest } from '../lib/near-location'

export default defineComponent({
  components: { RouteSimulator, CustomSelector },
  props: {
    routeGroups: { type: Array as () => RouteGroup[], required: true },
  },
  setup(props) {
    const selectedRoutes = ref<Route[] | null>([])
    const selectedGroup = ref<RouteGroup | null>(null)

    watch(
      () => props.routeGroups,
      () => {
        // clear results when routes change
        selectedRoutes.value = []
      },
    )

    watch(selectedGroup, () => {
      selectedRoutes.value = selectedGroup.value?.routes ?? null
    })

    const initialRouteGroup = async (items: RouteGroup[]) => {
      const first = items && items[0]
      const locationItems = items.filter((item) => item.lat && item.lng)
      if (locationItems.length === 0) {
        return first
      }
      const pos = await LocationService.getCurrentPosition()
      if (!pos) {
        alert('位置情報を取得できませんでした。')
        return first
      }
      return findNearest(locationItems, pos)
    }

    return { selectedRoutes, selectedGroup, initialRouteGroup }
  },
})
</script>
