<template>
  <div class="space-y-4">
    <RouteGroupManager v-model:routeGroups="routeGroups" />
    <SaveLoad v-model:routeGroups="routeGroups" />
    <p class="mt-6 text-sm text-gray-500">
      メモ: データはローカルストレージに保存されます。
    </p>
  </div>
</template>

<script lang="ts">
import { ref, watch } from 'vue'
import RouteGroupManager from '../components/manager/RouteGroupManager.vue'
import SaveLoad from '../components/manager/SaveLoad.vue'
import { loadRouteGroups, saveRouteGroups } from '../services/storage'
import type { RouteGroup } from '../types'

export default {
  components: { RouteGroupManager, SaveLoad },
  setup() {
    const routeGroups = ref<RouteGroup[]>(loadRouteGroups())

    watch(
      routeGroups,
      (r) => {
        saveRouteGroups(r)
      },
      { deep: true },
    )

    return { routeGroups }
  },
}
</script>
