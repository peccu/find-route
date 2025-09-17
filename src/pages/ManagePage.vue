<template>
  <div class="space-y-4">
    <RouteGroupManager v-model:routeGroups="routeGroups" />
    <div class="bg-white p-4 rounded shadow">
      <h2 class="font-medium mb-2">バックアップ / リストア</h2>
      <div class="flex gap-2">
        <button @click="downloadBackup" class="px-3 py-2 bg-blue-600 text-white rounded cursor-pointer">エクスポート</button>
        <label class="px-3 py-2 bg-gray-200 rounded cursor-pointer">
          インポート
          <input type="file" accept="application/json" @change="onFileUpload" class="hidden" />
        </label>
        <button @click="resetAll" class="px-3 py-2 bg-red-500 text-white rounded cursor-pointer">全削除</button>
      </div>
    </div>
    <p class="mt-6 text-sm text-gray-500">メモ: データはローカルストレージに保存されます。</p>
  </div>
</template>

<script lang="ts">
import { ref, watch } from 'vue';
import RouteGroupManager from '../components/RouteGroupManager.vue'
import { loadRouteGroups, saveRouteGroups, clearRoutes } from '../services/storage'
import type { RouteGroup, RouteFileV2 } from '../types'
import { getFormattedDateTime } from '../utils'

export default {
  components: { RouteGroupManager },
  setup() {
    const routeGroups = ref<RouteGroup[]>(loadRouteGroups());

    watch(routeGroups, (r) => {
      saveRouteGroups(r)
    }, { deep: true })

    function downloadBackup() {
      const fileData: RouteFileV2 = {
        version: 2,
        groups: routeGroups.value,
      }
      const blob = new Blob([JSON.stringify(fileData, null, 2)], {
        type: 'application/json',
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `find_route_backup_${getFormattedDateTime()}.json`
      a.click()
      URL.revokeObjectURL(url)
    }

    async function onFileUpload(e: Event) {
      const el = e.target as HTMLInputElement
      const f = el.files?.[0]
      if (!f) return
      try {
        const txt = await f.text()
        const parsed = JSON.parse(txt)
        if (Array.isArray(parsed)){
          routeGroups.value = [{
            id: 'routegroup-000',
            name: 'Default ',
            routes: parsed
          }];
          alert('リストア完了(v1)')
        } else if (parsed.version === 2 && Array.isArray(parsed.groups)) {
          routeGroups.value = parsed.groups
          alert('リストア完了(v2)')
        } else {
          throw new Error('unsupported version')
        }
      } catch {
        alert('不正なJSONです')
      } finally {
        el.value = ''
      }
    }

    function resetAll() {
      if (!confirm('全てのルートを削除します。よろしいですか？')) return
      routeGroups.value = []
      clearRoutes()
    }

    return { routeGroups, downloadBackup, onFileUpload, resetAll }
  }
}
</script>
