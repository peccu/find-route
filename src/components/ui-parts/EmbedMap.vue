<template>
  <div
    v-if="lat && lng"
    class="relative w-64 h-48 rounded-lg overflow-hidden bg-gray-300"
    :class="!mapLoaded ? 'animate-pulse' : ''"
  >
    <a target="_blank" :href="`https://maps.google.com/?q=(${lat}, ${lng})`">
      <img
        :src="mapUrl(lat, lng)"
        class="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
        @load="mapLoaded = true"
        :class="mapLoaded ? 'opacity-100' : 'opacity-0'"
      />
    </a>
  </div>
</template>

<script setup lang="ts" generic="T">
import { ref, watch } from 'vue'
import { mapUrl } from '../../lib/map.ts'

interface Props {
  lat?: number | null
  lng?: number | null
}

const props = defineProps<Props>()

const mapLoaded = ref(false)
watch(
  () => props.lat,
  () => (mapLoaded.value = false),
)
</script>
