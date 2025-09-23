<template>
  <div class="flex items-center space-x-2">
    <!-- 座標入力フィールド -->
    <input
      type="text"
      class="border rounded px-2 py-1 flex-1"
      v-model="textValue"
      @input="onInputChange"
      placeholder="(lat, lng)"
    />

    <!-- 現在位置取得ボタン -->
    <button
      type="button"
      class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded cursor-pointer"
      @click="insertCurrentLocation"
    >
      現在地
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { LocationService } from '../../services/location-service'

interface Props {
  modelValueLat?: number | null
  modelValueLng?: number | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:modelValueLat', value: number | null): void
  (e: 'update:modelValueLng', value: number | null): void
}>()

// 入力欄に表示するテキスト
const textValue = ref<string>('')

// 親から値が来たら同期
watch(
  () => [props.modelValueLat, props.modelValueLng],
  ([lat, lng]) => {
    if (lat != null && lng != null) {
      textValue.value = `(${lat}, ${lng})`
    } else {
      textValue.value = ''
    }
  },
  { immediate: true },
)

// 入力をパースして親へ反映
function onInputChange() {
  const match = textValue.value.match(
    /^\s*\(?\s*([-0-9.]+)\s*,\s*([-0-9.]+)\s*\)?\s*$/,
  )
  if (match) {
    const lat = parseFloat(match[1])
    const lng = parseFloat(match[2])
    if (!isNaN(lat) && !isNaN(lng)) {
      emit('update:modelValueLat', lat)
      emit('update:modelValueLng', lng)
      return
    }
  }
  // パースできない場合は null
  emit('update:modelValueLat', null)
  emit('update:modelValueLng', null)
}

// ボタンクリックで現在地を取得
async function insertCurrentLocation() {
  const pos = await LocationService.getCurrentPosition()
  if (pos) {
    textValue.value = `(${pos.lat}, ${pos.lng})`
    emit('update:modelValueLat', pos.lat)
    emit('update:modelValueLng', pos.lng)
  } else {
    alert('位置情報を取得できませんでした。')
  }
}
</script>
