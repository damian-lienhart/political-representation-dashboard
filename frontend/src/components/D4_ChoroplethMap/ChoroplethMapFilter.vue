<template>
  <div class="choropleth-filter">
    <label>
      {{ t('common.decade') }}:
      <select v-model="selectedDecade">
        <option :value="null">All</option>
        <option v-for="decade in decades" :key="decade" :value="decade">{{ decade }}s</option>
      </select>
    </label>

    <label>
      {{ t('common.year') }}:
      <select v-model="selectedYear" :disabled="!selectedDecade">
        <option :value="null">All</option>
        <option v-for="year in filteredYears" :key="year" :value="year">{{ year }}</option>
      </select>
    </label>

    <label>
      {{ t('common.Abstimmungstag') }}:
      <select v-model="selectedDate" :disabled="!selectedYear">
        <option :value="null">All</option>
        <option v-for="date in filteredDates" :key="date" :value="date">{{ formatDate(date) }}</option>
      </select>
    </label>

    <label>
      {{ t('common.Vorlage') }}:
      <select v-model="selectedTitle" :disabled="!selectedDate">
        <option :value="null">All</option>
        <option v-for="title in filteredTitles" :key="title" :value="title">{{ title }}</option>
      </select>
    </label>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type { KantonaleReprEntry } from '@/services/index'

const props = defineProps<{
  allData: KantonaleReprEntry[]
  resetKey: string // triggers full reset on actor change
}>()

const emit = defineEmits<{
  (e: 'update:filter', value: KantonaleReprEntry[]): void
}>()

const { t, locale } = useI18n()

const getTitle = (d: KantonaleReprEntry): string => {
  switch (locale.value) {
    case 'fr': return d.titel_kurz_f || d.titel_kurz_d
    case 'it': return d.titel_kurz_e || d.titel_kurz_d
    case 'en': return d.titel_kurz_e || d.titel_kurz_d
    default: return d.titel_kurz_d
  }
}

const selectedDecade = ref<number | null>(null)
const selectedYear = ref<number | null>(null)
const selectedDate = ref<string | null>(null)
const selectedTitle = ref<string | null>(null)

const resetFilters = () => {
  selectedDecade.value = null
  selectedYear.value = null
  selectedDate.value = null
  selectedTitle.value = null
}

// Reset filters when actor changes (triggered via resetKey)
watch(() => props.resetKey, resetFilters)

const allYears = computed(() =>
    [...new Set(props.allData.map(d => new Date(d.datum).getFullYear()))].sort((a, b) => a - b)
)

const decades = computed(() =>
    [...new Set(allYears.value.map(y => Math.floor(y / 10) * 10))].sort()
)

const filteredYears = computed(() => {
  if (!selectedDecade.value) return []
  return allYears.value.filter(y => Math.floor(y / 10) * 10 === selectedDecade.value)
})

const filteredDates = computed(() => {
  if (!selectedYear.value) return []
  return [...new Set(
      props.allData
          .filter(d => new Date(d.datum).getFullYear() === selectedYear.value)
          .map(d => d.datum.slice(0, 10))
  )].sort()
})

const filteredTitles = computed(() => {
  if (!selectedDate.value) return []
  return [...new Set(
      props.allData
          .filter(d => d.datum.slice(0, 10) === selectedDate.value)
          .map(getTitle)
  )].sort()
})

// Reset lower levels
watch(selectedDecade, () => {
  selectedYear.value = null
  selectedDate.value = null
  selectedTitle.value = null
})
watch(selectedYear, () => {
  selectedDate.value = null
  selectedTitle.value = null
})
watch(selectedDate, () => {
  selectedTitle.value = null
})

// Apply filters
const filtered = computed(() => {
  if (selectedDecade.value === null) return props.allData

  let res = [...props.allData]
  res = res.filter(d => Math.floor(new Date(d.datum).getFullYear() / 10) * 10 === selectedDecade.value)

  if (selectedYear.value !== null) {
    res = res.filter(d => new Date(d.datum).getFullYear() === selectedYear.value)
  }
  if (selectedDate.value !== null) {
    res = res.filter(d => d.datum.slice(0, 10) === selectedDate.value)
  }
  if (selectedTitle.value !== null) {
    res = res.filter(d => getTitle(d) === selectedTitle.value)
  }

  return res
})

watch(filtered, () => emit('update:filter', filtered.value), { immediate: true })

const formatDate = (iso: string) => {
  const date = new Date(iso)
  return date.toLocaleDateString('de-CH', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}
</script>

<style scoped>
.choropleth-filter {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1rem;
}
.choropleth-filter label {
  display: flex;
  flex-direction: column;
  font-size: 0.9rem;
}
</style>
