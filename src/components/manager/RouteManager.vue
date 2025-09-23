<template>
  <div class="bg-white mt-4">
    <h2 class="text-lg font-medium mb-2">ルート管理</h2>
    <div v-if="routes.length === 0" class="text-sm text-gray-500 mb-2">
      ルートがありません。追加してください。
    </div>

    <div class="space-y-2 mb-4">
      <div
        v-for="r in routes"
        :key="r.id"
        class="border p-2 rounded flex items-start justify-between"
      >
        <div>
          <div class="font-semibold">{{ r.name }}</div>
          <div class="text-sm text-gray-600">
            {{ r.legs.length }}区間 · {{ r.notes ?? '' }}
          </div>
        </div>
        <div class="flex gap-2">
          <button
            @click="editRoute(r)"
            class="px-2 py-1 bg-yellow-300 rounded cursor-pointer"
          >
            編集
          </button>
          <button
            @click="removeRoute(r.id)"
            class="px-2 py-1 bg-red-400 text-white rounded cursor-pointer"
          >
            削除
          </button>
        </div>
      </div>
    </div>

    <div>
      <div v-if="!creating">
        <button
          @click="creating = !creating"
          class="px-4 py-2 bg-green-500 text-white rounded cursor-pointer"
        >
          新規ルート追加
        </button>
      </div>
      <div v-else>
        <h3 class="font-medium mb-2">新規ルート追加</h3>
        <RouteEditor @save="addRoute" @cancel="creating = false" />
      </div>
    </div>

    <div v-if="editing" class="mt-4">
      <h3 class="font-medium mb-2">ルート編集</h3>
      <RouteEditor
        :initial="editing"
        @save="updateRoute"
        @cancel="editing = null"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import RouteEditor from './RouteEditor.vue'
import type { Route } from '../../types'
import { uid } from '../../utils'

const props = defineProps<{
  routes: Route[]
}>()

const emit = defineEmits<{
  (e: 'update:routes', value: Route[]): void
}>()

const creating = ref<boolean>(false)
const editing = ref<Route | null>(null)

function addRoute(r: Route) {
  // ensure id
  r.id = uid('route_')
  const list = [...props.routes, r]
  emit('update:routes', list)
  creating.value = false
}

function editRoute(r: Route) {
  editing.value = JSON.parse(JSON.stringify(r))
}

function updateRoute(r: Route) {
  const list = props.routes.map((rr) => (rr.id === r.id ? r : rr))
  emit('update:routes', list)
  editing.value = null
}

function removeRoute(id: string) {
  if (!confirm('削除しますか？')) return
  emit(
    'update:routes',
    props.routes.filter((r) => r.id !== id),
  )
}
</script>
