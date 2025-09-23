<template>
  <div class="w-full lg:max-w-4xl mx-auto p-0 lg:p-6">
    <h1 class="text-2xl font-bold mb-4">Find Route</h1>

    <div class="mb-4 inline-flex rounded-full bg-gray-200 p-1">
      <button
        @click="changePage('routes')"
        :class="[
          'px-6 py-2 rounded-full transition',
          currentPage === 'routes'
            ? 'bg-blue-500 text-white shadow'
            : 'text-gray-600 hover:bg-gray-300',
        ]"
      >
        経路検索
      </button>
      <button
        @click="changePage('manage')"
        :class="[
          'px-6 py-2 rounded-full transition',
          currentPage === 'manage'
            ? 'bg-blue-500 text-white shadow'
            : 'text-gray-600 hover:bg-gray-300',
        ]"
      >
        ルート管理
      </button>
    </div>

    <SimulatePage v-if="currentPage === 'routes'" :routeGroups />
    <ManagePage v-else />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import SimulatePage from './pages/SimulatePage.vue'
import ManagePage from './pages/ManagePage.vue'
import { loadRouteGroups } from './services/storage'
import type { RouteGroup } from './types'
import {
  checkAndUpdateVersion,
  setStoredVersion,
} from './services/version-checker'

type Pages = 'routes' | 'manage'

// 更新を検知した場合に、ユーザーに通知するカスタムイベント
const updateEvent = new CustomEvent('app-update-available')

const currentPage = ref<Pages>('routes')
const routeGroups = ref<RouteGroup[]>(loadRouteGroups())

function changePage(to: Pages) {
  currentPage.value = to
  routeGroups.value = loadRouteGroups()
}

let intervalId: number | null = null

const startUpdateChecker = () => {
  intervalId = setInterval(async () => {
    const [hasUpdate, latestVersion] = await checkAndUpdateVersion()
    if (hasUpdate) {
      // 更新があった場合、カスタムイベントを発火
      window.dispatchEvent(updateEvent)
      // ユーザーに通知してリロードを促す
      const confirmed = confirm(
        '新しいバージョンが利用可能です。ページをリロードしますか？',
      )
      if (confirmed) {
        setStoredVersion(latestVersion)
        window.location.reload()
      }
    }
  }, 60000) // 1分ごとにチェック (調整可能)
}

onMounted(() => {
  startUpdateChecker()
})

onUnmounted(() => {
  if (intervalId !== null) {
    clearInterval(intervalId)
  }
})
</script>
