<template>
  <div class="bg-white p-4 rounded shadow space-y-3">
    <h2 class="text-lg font-medium mb-2">シミュレーション</h2>

    <div>
      <label class="block text-sm">経路グループを選択</label>
      <select id="routes-select" v-model="selectedRoutes" class="border rounded p-2 w-60 custom-select">
        <option v-for="group in routeGroups" :key="group.id" :value="group.routes">
          {{group.name}}</option>
      </select>
    </div>

    <RouteSimulator v-model:selectedRoutes="selectedRoutes" />

  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue'
import type { Route, RouteGroup } from '../types'
import RouteSimulator from '../components/RouteSimulator.vue'

export default defineComponent({
  components: { RouteSimulator },
  props: {
    routeGroups: { type: Array as () => RouteGroup[], required: true }
  },
  setup(props) {
    const selectedRoutes = ref<Route[]>(props.routeGroups && props.routeGroups[0] ? props.routeGroups[0].routes : [])

    watch(() => props.routeGroups, () => {
      // clear results when routes change
      selectedRoutes.value = []
    })

    return { selectedRoutes }
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
