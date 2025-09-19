<template>
  <div class="bg-white p-4 rounded shadow">
    <h2 class="text-lg font-medium mb-2">ルートグループ管理</h2>

    <div class="flex items-center mb-3 gap-2">
      <select v-model="selectedGroupId" class="border rounded p-2 w-60 custom-select">
        <option v-for="g in routeGroups" :key="g.id" :value="g.id">
          {{ g.name }}
        </option>
      </select>
      <button @click="creatingGroup = true" class="px-2 py-1 bg-green-500 text-white rounded">
        グループ追加
      </button>
      <button
        v-if="currentGroup"
        @click="removeGroup(currentGroup.id)"
        class="px-2 py-1 bg-red-400 text-white rounded"
      >
        グループ削除
      </button>
    </div>

    <div v-if="creatingGroup" class="mt-4">
      <input
        v-model="newGroupName"
        placeholder="グループ名"
        class="border px-2 py-1 rounded"
      />

      <button @click="addGroup" class="ml-2 px-3 py-1 bg-blue-500 text-white rounded">
        保存
      </button>
      <button @click="creatingGroup = false" class="ml-1 px-3 py-1 bg-gray-300 rounded">
        キャンセル
      </button>
    </div>

    <div v-else>
      <input
        v-model="currentGroup!.name"
        placeholder="グループ名"
        class="border px-2 py-1 rounded"
      />(自動保存)

  <div class="p-4 space-y-4">
    <LocationInput
      v-model:modelValueLat="lat"
      v-model:modelValueLng="lng"
    />
    <p class="text-gray-700">
      緯度: {{ lat }} / 経度: {{ lng }}
    </p>
<a target="_blank" :href="`https://maps.google.com/?q=(${lat}, ${lng})`">Google Mapsで確認</a>
  </div>

      <RouteManager
        v-if="currentGroup"
        :routes="currentGroup.routes"
        @update:routes="updateRoutes"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import RouteManager from './RouteManager.vue'
import LocationInput from "./LocationInput.vue"
import type { RouteGroup, Route } from '../types'
import { uid } from '../utils'

const props = defineProps<{
  routeGroups: RouteGroup[]
}>()
const emit = defineEmits<{
  (e: 'update:routeGroups', value: RouteGroup[]): void
}>()

const selectedGroupId = ref<string | null>(props.routeGroups[0]?.id ?? null)
const creatingGroup = ref(false)
const newGroupName = ref('')
const lat = ref<number | null>(null)
const lng = ref<number | null>(null)

const currentGroup = computed(() =>
  props.routeGroups.find(g => g.id === selectedGroupId.value) ?? null
)

function addGroup() {
  const g: RouteGroup = { id: uid('routeGroup_'), name: newGroupName.value, routes: [] }
  const list = [...props.routeGroups, g]
  emit('update:routeGroups', list)
  selectedGroupId.value = g.id
  creatingGroup.value = false
  newGroupName.value = ''
}

function updateRoutes(routes: Route[]) {
  if (!currentGroup.value) return
  const list = props.routeGroups.map(g =>
    g.id === currentGroup.value!.id ? { ...g, routes } : g
  )
  emit('update:routeGroups', list)
}

function removeGroup(id: string) {
  if (!confirm('このグループを削除しますか？')) return
  const list = props.routeGroups.filter(g => g.id !== id)
  emit('update:routeGroups', list)

  // 削除したグループが選択中だった場合は選択をリセット
  if (selectedGroupId.value === id) {
    selectedGroupId.value = list[0]?.id ?? null
  }
}
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
