<template>
  <div class="max-w-4xl mx-auto p-6">
    <h1 class="text-2xl font-bold mb-4">Route Planner SPA</h1>
    <nav class="mb-4 flex gap-4">
      <button @click="changePage('routes')" class="px-4 py-2 bg-blue-500 text-white rounded">経路検索</button>
      <button @click="changePage('manage')" class="px-4 py-2 bg-green-500 text-white rounded">ルート管理</button>
    </nav>
    <RoutesPage v-if="currentPage === 'routes'" :routes />
    <ManagePage v-else />
  </div>
</template>

<script lang="ts">
import { ref, watch } from 'vue'
import RoutesPage from './pages/RoutesPage.vue';
import ManagePage from './pages/ManagePage.vue';
import { loadRoutes, saveRoutes, clearRoutes } from './services/storage'

export default {
  components: {RoutesPage, ManagePage},
  setup() {
    const currentPage = ref<'routes' | 'manage'>('routes');
    const routes = ref<Route[]>(loadRoutes())

    function changePage(to) {
      currentPage.value = to;
      routes.value = loadRoutes();
    }

    return { currentPage, changePage, routes }
  }
}
</script>
