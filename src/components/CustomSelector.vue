<template>
  <div class="inline-block">
    <label v-if="label" class="block text-sm">{{ label }}</label>

    <div class="relative inline-block w-60" ref="dropdownRef">

      <!-- Select button -->
      <button
        @click="toggleDropdown"
        class="border rounded p-2 w-full bg-white text-left flex items-center justify-between hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500">
        <span :class="selectedItem ? 'text-black' : 'text-gray-500'">
          {{ selectedItem ? selectedItem[labelKey] : placeholder }}
        </span>
        <svg class="w-4 h-4 transition-transform" :class="{ 'rotate-180': isOpen }" fill="none"
             stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <!-- Drop down list -->
      <div v-if="isOpen" class="absolute top-full left-0 right-0 mt-1 bg-white border rounded shadow-lg z-10">
        <button
          v-for="item in items" :key="String(item)" @click="selectItem(item)"
          class="w-full text-left px-3 py-2 hover:bg-gray-100 flex items-center justify-between">
          <span>{{ item[labelKey] }}</span>
          <svg v-if="modelValue && modelValue[valueKey] === item[valueKey]" class="w-4 h-4 text-blue-600"
               fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" generic="T">
import { ref, computed, onMounted, onBeforeUnmount } from "vue";

const props = defineProps<{
  items: T[];
  modelValue: T | null;
  labelKey: keyof T & string;
  valueKey: keyof T & string;
  label?: string;
  placeholder?: string;
  initialSelect?: (item: T) => boolean;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: T | null): void;
}>();

const isOpen = ref(false);
const dropdownRef = ref<HTMLElement | null>(null);

const selectedItem = computed(() =>
  props.items.find((item) =>
    props.modelValue && item[props.valueKey] === props.modelValue[props.valueKey]
  ) || null
);

const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
};

const selectItem = (item: typeof props.items[number]) => {
  emit("update:modelValue", item);
  isOpen.value = false;
};

const handleClickOutside = (e: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target as Node)) {
    isOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside);

  if (!props.modelValue && props.initialSelect) {
    const found = props.items.find((i) => props.initialSelect!(i));
    if (found) {
      emit("update:modelValue", found);
    }
  }
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>

<style scoped>
.rotate-180 {
  transform: rotate(0deg);
}
</style>
