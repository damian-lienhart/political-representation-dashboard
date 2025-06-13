<template>
  <div class="diagram-filter">
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
        <option v-for="date in filteredDates" :key="date" :value="date">{{ date }}</option>
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
import type { EmpfehlungenEntry } from '@/services/index.ts'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  allData: EmpfehlungenEntry[]
  language: 'de' | 'fr' | 'en' | 'it'
}>()

const { t } = useI18n()

const getTitle = (entry: EmpfehlungenEntry): string => {
  switch (props.language) {
    case 'fr': return entry.titel_kurz_f || entry.titel_kurz_d
    case 'en': return entry.titel_kurz_e || entry.titel_kurz_d
    case 'it': return entry.titel_kurz_e || entry.titel_kurz_d
    default: return entry.titel_kurz_d
  }
}

const formatDate = (iso: string): string => {
  const date = new Date(iso)
  return date.toLocaleDateString('de-CH', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

const selectedDecade = ref<number | null>(null)
const selectedYear = ref<number | null>(null)
const selectedDate = ref<string | null>(null)
const selectedTitle = ref<string | null>(null)

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
          .map(d => formatDate(d.datum))
  )].sort((a, b) => new Date(formattedDateMap.value.get(a)!).getTime() - new Date(formattedDateMap.value.get(b)!).getTime())
})

const formattedDateMap = computed(() => {
  const map = new Map<string, string>()
  props.allData.forEach(d => {
    map.set(formatDate(d.datum), d.datum)
  })
  return map
})

const filteredTitles = computed(() => {
  if (!selectedDate.value) return []
  const isoDate = formattedDateMap.value.get(selectedDate.value)
  if (!isoDate) return []
  return [...new Set(
      props.allData
          .filter(d => d.datum === isoDate)
          .map(getTitle)
  )].sort()
})

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

const emit = defineEmits<{
  (e: 'update:filter', payload: EmpfehlungenEntry[]): void
}>()

const filtered = computed(() => {
  let result = [...props.allData]

  if (selectedDecade.value !== null) {
    result = result.filter(d =>
        Math.floor(new Date(d.datum).getFullYear() / 10) * 10 === selectedDecade.value
    )
  }

  if (selectedYear.value !== null) {
    result = result.filter(d =>
        new Date(d.datum).getFullYear() === selectedYear.value
    )
  }

  if (selectedDate.value !== null) {
    const iso = formattedDateMap.value.get(selectedDate.value)
    if (iso) {
      result = result.filter(d => d.datum === iso)
    }
  }

  if (selectedTitle.value !== null) {
    result = result.filter(d => getTitle(d) === selectedTitle.value)
  }

  return result
})

watch(filtered, () => emit('update:filter', filtered.value), { immediate: true })
</script>

<style scoped>
.diagram-filter {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1rem;
}

.diagram-filter label {
  display: flex;
  flex-direction: column;
  font-size: 0.9rem;
}
</style>
