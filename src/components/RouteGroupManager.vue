<template>
  <div class="bg-white p-4 rounded shadow">

    <CustomSelector v-model="selectedGroup" :items="routeGroups" label-key="name" value-key="name" label="経路グループを選択"
      placeholder="選択してください" />
    <div class="flex items-center my-3 gap-2">
      <button @click="creatingGroup = true" class="px-2 py-1 bg-green-500 text-white rounded">
        グループ追加
      </button>
      <button v-if="selectedGroup" @click="removeGroup(selectedGroup.id)"
        class="px-2 py-1 bg-red-400 text-white rounded">
        グループ削除
      </button>
    </div>

    <h2 class="text-lg font-medium mb-2">ルートグループ管理</h2>

    <!-- create group form -->
    <div v-if="creatingGroup" class="space-y-2">

      <div class="space-y-1">
        <div>グループ名</div>
        <input v-model="newGroupName" placeholder="グループ名" class="border px-2 py-1 rounded" />
      </div>

      <div class="space-y-1">
        <div>
          位置設定
          <a v-if="newLat" target="_blank" class="underline text-blue-800"
            :href="`https://maps.google.com/?q=(${newLat}, ${newLng})`">Google Mapsで確認</a>
          <a v-else target="_blank" class="underline text-blue-800" href="https://maps.google.com/">Google
            Mapsで探す</a>
        </div>
        <LocationInput v-model:modelValueLat="newLat" v-model:modelValueLng="newLng" />
      </div>

      <div class="space-x-2">
        <button @click="addGroup" class="px-3 py-1 bg-blue-500 text-white rounded">
          保存
        </button>
        <button @click="creatingGroup = false" class="px-3 py-1 bg-gray-300 rounded">
          キャンセル
        </button>
      </div>

    </div>

    <!-- update group form -->
    <div v-else-if="selectedGroup" class="space-y-4">

      <div class="space-y-1">
        <div>グループ名</div>
        <input v-model="selectedGroup.name" placeholder="グループ名" class="border px-2 py-1 rounded" />(自動保存)
      </div>

      <div class="space-y-1">
        <div>位置設定</div>
        <LocationInput v-model:modelValueLat="lat" v-model:modelValueLng="lng" />
        <a v-if="lat" target="_blank" class="underline text-blue-800"
          :href="`https://maps.google.com/?q=(${lat}, ${lng})`">Google Mapsで確認</a>
        <a v-else target="_blank" class="underline text-blue-800" href="https://maps.google.com/">Google
          Mapsで探す</a>
      </div>

      <RouteManager v-if="selectedGroup" :routes="selectedGroup.routes" @update:routes="updateRoutes" />

    </div>

  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import RouteManager from './RouteManager.vue'
import LocationInput from "./LocationInput.vue"
import CustomSelector from '../components/CustomSelector.vue'
import type { RouteGroup, Route } from '../types'
import { uid } from '../utils'

const props = defineProps<{
  routeGroups: RouteGroup[]
}>()
const emit = defineEmits<{
  (e: 'update:routeGroups', value: RouteGroup[]): void
}>()

const selectedGroup = ref<RouteGroup | null>(null)
const creatingGroup = ref(false)
const newGroupName = ref('')
const newLat = ref<number | null>(null)
const newLng = ref<number | null>(null)
const lat = ref<number | null>(null)
const lng = ref<number | null>(null)

function addGroup() {
    const group: RouteGroup = { id: uid('routeGroup_'), name: newGroupName.value, routes: [] }
    const list = [...props.routeGroups, group]
    selectedGroup.value = group
    creatingGroup.value = false
    newGroupName.value = ''
    newLat.value = null
    newLng.value = null
    emit('update:routeGroups', list)
}

function updateRoutes(routes: Route[]) {
  if (!selectedGroup.value) return;
  const list = props.routeGroups.map(group =>
    (selectedGroup.value && group.id === selectedGroup.value.id)
      ? { ...group, routes }
      : group
  )
  emit('update:routeGroups', list)
}

function removeGroup(id: string) {
  if (!confirm('このグループを削除しますか？')) return
  const list = props.routeGroups.filter(group => group.id !== id)
  if (selectedGroup.value && selectedGroup.value.id === id) {
    selectedGroup.value = null
  }
  emit('update:routeGroups', list)
}
</script>
