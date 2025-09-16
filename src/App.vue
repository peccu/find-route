<template>
  <div class="max-w-4xl mx-auto p-6">
    <h1 class="text-2xl font-bold mb-4">Route Planner SPA</h1>
    <nav class="mb-4 flex gap-4">
      <button @click="changePage('routes')" class="px-4 py-2 bg-blue-500 text-white rounded cursor-pointer">経路検索</button>
      <button @click="changePage('manage')" class="px-4 py-2 bg-green-500 text-white rounded cursor-pointer">ルート管理</button>
    </nav>
    <RoutesPage v-if="currentPage === 'routes'" :routes />
    <ManagePage v-else />
  </div>
</template>

<script lang="ts">
import { ref } from 'vue'
import RoutesPage from './pages/RoutesPage.vue';
import ManagePage from './pages/ManagePage.vue';
import { loadRouteGroups } from './services/storage'
import type { Route, RouteGroup } from './types'
import { onMounted, onUnmounted } from 'vue';
import { checkAndUpdateVersion, setStoredVersion } from './services/version-checker';


type Pages = 'routes' | 'manage';

// 更新を検知した場合に、ユーザーに通知するカスタムイベント
const updateEvent = new CustomEvent('app-update-available');

export default {
  components: {RoutesPage, ManagePage},
  setup() {
    const currentPage = ref<Pages>('routes');
    const routeGroup = ref<RouteGroup>(loadRouteGroups());
    const routes = ref<Route[]>(routeGroup.value[0].routes);

    function changePage(to: Pages) {
      currentPage.value = to;
      routes.value = loadRoutes();
    }

    let intervalId: number | null = null;

    const startUpdateChecker = () => {
      intervalId = setInterval(async () => {
        const [hasUpdate, latestVersion] = await checkAndUpdateVersion();
        if (hasUpdate) {
          // 更新があった場合、カスタムイベントを発火
          window.dispatchEvent(updateEvent);
          // ユーザーに通知してリロードを促す
          const confirmed = confirm('新しいバージョンが利用可能です。ページをリロードしますか？');
          if (confirmed) {
            setStoredVersion(latestVersion);
            window.location.reload();
          }
        }
      }, 60000); // 1分ごとにチェック (調整可能)
    };

    onMounted(() => {
      startUpdateChecker();
    });

    onUnmounted(() => {
      if (intervalId !== null) {
        clearInterval(intervalId);
      }
    });

    return { currentPage, changePage, routes }
  }
}
</script>
