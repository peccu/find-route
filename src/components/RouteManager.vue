<template>
  <div class="bg-white p-4 rounded shadow">
    <h2 class="text-lg font-medium mb-2">ルート管理</h2>
    <div v-if="routes.length === 0" class="text-sm text-gray-500 mb-2">ルートがありません。追加してください。</div>

    <div class="space-y-2 mb-4">
      <div v-for="r in routes" :key="r.id" class="border p-2 rounded flex items-start justify-between">
        <div>
          <div class="font-semibold">{{ r.name }}</div>
          <div class="text-sm text-gray-600">{{ r.legs.length }}区間 · {{ r.notes ?? '' }}</div>
        </div>
        <div class="flex gap-2">
          <button @click="editRoute(r)" class="px-2 py-1 bg-yellow-300 rounded cursor-pointer">編集</button>
          <button @click="removeRoute(r.id)" class="px-2 py-1 bg-red-400 text-white rounded cursor-pointer">削除</button>
        </div>
      </div>
    </div>

    <div class="border-t pt-3">
      <h3 class="font-medium mb-2">新規ルート追加</h3>
      <RouteEditor @save="addRoute" />
    </div>

    <div v-if="editing" class="mt-4 border-t pt-3">
      <h3 class="font-medium mb-2">ルート編集</h3>
      <RouteEditor :initial="editing" @save="updateRoute" @cancel="editing = null" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import RouteEditor from './RouteEditor.vue'
import type { Route } from '../types'
import { uid } from '../utils'

export default defineComponent({
  components: { RouteEditor },
  props: {
    routes: { type: Array as () => Route[], required: true },
  },
  emits: ['update:routes'],
  setup(props, { emit }) {
    const editing = ref<Route | null>(null)

    function addRoute(r: Route) {
      // ensure id
      r.id = uid('route_')
      const list = [...props.routes, r]
      emit('update:routes', list)
    }

    function editRoute(r: Route) {
      editing.value = JSON.parse(JSON.stringify(r))
    }

    function updateRoute(r: Route) {
      const list = props.routes.map(rr => rr.id === r.id ? r : rr)
      emit('update:routes', list)
      editing.value = null
    }

    function removeRoute(id: string) {
      if (!confirm('削除しますか？')) return
      emit('update:routes', props.routes.filter(r => r.id !== id))
    }

    return { editing, addRoute, editRoute, updateRoute, removeRoute }
  }
})
</script>
