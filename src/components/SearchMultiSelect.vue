<template>
  <v-autocomplete
    v-model="internalValue"
    :items="items"
    :item-title="itemTitle"
    :item-value="itemValue"
    :label="label"
    :placeholder="placeholder"
    :chips="chips"
    :closable-chips="closableChips"
    :multiple="true"
    :search="search"
    :loading="loading"
    :disabled="disabled"
    :hint="hint"
    persistent-hint
    clearable
    variant="outlined"
    density="comfortable"
    class="search-multi-select"
    hide-details="auto"
    @update:search="onSearchUpdate"
  >
    <template #prepend-inner v-if="showSearchIcon">
      <v-icon size="18" color="primary">mdi-magnify</v-icon>
    </template>

    <template #chip="data" v-if="chips">
      <v-chip v-bind="data.props" :color="chipColor" class="text-truncate" size="small" label>
        <span class="chip-text">{{ data.item.title }}</span>
      </v-chip>
    </template>

    <template #no-data>
      <div class="pa-4 text-medium-emphasis text-caption">
        <v-icon size="16" class="mr-1" color="warning">mdi-alert</v-icon>
        No results found
      </div>
    </template>
  </v-autocomplete>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'

interface GenericItem {
  [key: string]: any
}

const props = defineProps<{
  modelValue: any[]
  items: GenericItem[]
  label?: string
  placeholder?: string
  hint?: string
  itemTitle?: string | ((item: GenericItem) => string)
  itemValue?: string | ((item: GenericItem) => any)
  loading?: boolean
  disabled?: boolean
  chips?: boolean
  closableChips?: boolean
  chipColor?: string
  showSearchIcon?: boolean
}>()

const emit = defineEmits(['update:modelValue', 'search'])

const internalValue = ref<any[]>(props.modelValue || [])
const search = ref('')

watch(
  () => props.modelValue,
  (val) => {
    if (val !== internalValue.value) internalValue.value = val as any[]
  },
)

watch(internalValue, (val) => emit('update:modelValue', val))

const chipColor = computed(() => props.chipColor || 'primary')

function onSearchUpdate(val: string) {
  search.value = val
  emit('search', val)
}
</script>

<style scoped>
.search-multi-select :deep(.v-field) {
  border-radius: 12px;
}
.chip-text {
  max-width: 120px;
  display: inline-block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
