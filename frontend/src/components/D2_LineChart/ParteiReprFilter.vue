<template>
  <div class="diagram-filter">
    <!-- Partei-Auswahl als Toggle -->
    <div class="party-toggle">
      <span v-for="party in allParties" :key="party"
            :class="['party-button', { selected: selectedParties.includes(party) }]"
            @click="toggleParty(party)">
        {{ getFullPartyName(party) }}
      </span>
    </div>

    <!-- Dropdowns -->
    <label>
      {{ t('common.yearFrom') }}
      <select v-model="selectedDecade">
        <option :value="null">All</option>
        <option v-for="decade in decades" :key="decade" :value="decade">{{ decade }}s</option>
      </select>
    </label>

    <label>
      Jahr
      <select v-model="selectedYear" :disabled="!selectedDecade">
        <option :value="null">All</option>
        <option v-for="year in filteredYears" :key="year" :value="year">{{ year }}</option>
      </select>
    </label>

    <label>
      Abstimmungstag
      <select v-model="selectedDate" :disabled="!selectedYear">
        <option :value="null">All</option>
        <option v-for="date in filteredDates" :key="date" :value="date">{{ date }}</option>
      </select>
    </label>

    <label>
      Vorlage
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
import type { ParteiReprEntry } from '@/services/index.ts'
import { ALLOWED_PARTEIEN } from '@/constants/parteien.ts'

const props = defineProps<{
  allData: ParteiReprEntry[]
}>()

const emit = defineEmits<{
  (e: 'update:filter', payload: ParteiReprEntry[]): void
}>()

const { t } = useI18n()

const selectedParties = ref<string[]>([])
const selectedDecade = ref<number | null>(null)
const selectedYear = ref<number | null>(null)
const selectedDate = ref<string | null>(null)
const selectedTitle = ref<string | null>(null)

const toggleParty = (party: string) => {
  const index = selectedParties.value.indexOf(party)
  if (index >= 0) {
    selectedParties.value.splice(index, 1)
  } else {
    selectedParties.value.push(party)
  }
}

const getFullPartyName = (code: string): string => {
  return t(`parties.${code}.full`)
}

const filteredByParties = computed(() => {
  return props.allData.filter(d => selectedParties.value.includes(d.partei_code))
})

const allYears = computed(() => {
  return [...new Set(filteredByParties.value.map(d => new Date(d.datum).getFullYear()))].sort((a, b) => a - b)
})

const decades = computed(() => [...new Set(allYears.value.map(y => Math.floor(y / 10) * 10))])

const filteredYears = computed(() => {
  if (!selectedDecade.value) return []
  return allYears.value.filter(y => Math.floor(y / 10) * 10 === selectedDecade.value)
})

const filteredDates = computed(() => {
  if (!selectedYear.value) return []
  return [...new Set(filteredByParties.value
      .filter(d => new Date(d.datum).getFullYear() === selectedYear.value)
      .map(d => d.datum))]
})

const filteredTitles = computed(() => {
  if (!selectedDate.value) return []
  return [...new Set(filteredByParties.value
      .filter(d => d.datum === selectedDate.value)
      .map(d => d.titel_kurz_d))]
})

const allParties = computed(() => {
  return [...new Set(props.allData.map(d => d.partei_code))]
      .filter(code => ALLOWED_PARTEIEN.includes(code))
      .sort()
})

const filtered = computed(() => {
  return filteredByParties.value.filter(d => {
    const year = new Date(d.datum).getFullYear()
    return (!selectedDecade.value || Math.floor(year / 10) * 10 === selectedDecade.value) &&
        (!selectedYear.value || year === selectedYear.value) &&
        (!selectedDate.value || d.datum === selectedDate.value) &&
        (!selectedTitle.value || d.titel_kurz_d === selectedTitle.value)
  })
})

watch(filtered, () => emit('update:filter', filtered.value), { immediate: true })
watch(selectedParties, () => {
  selectedDecade.value = null
  selectedYear.value = null
  selectedDate.value = null
  selectedTitle.value = null
})
</script>

<style scoped>
.diagram-filter {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1rem;
  align-items: flex-start;
  flex-direction: column;
}

label {
  display: flex;
  flex-direction: column;
  font-size: 0.9rem;
  gap: 0.3rem;
}

.party-toggle {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.party-button {
  border: 1px solid #ccc;
  border-radius: 6px;
  padding: 0.3rem 0.6rem;
  cursor: pointer;
  font-size: 0.85rem;
  background-color: #f2f2f2;
}

.party-button.selected {
  background-color: #007bff;
  color: white;
  border-color: #007bff;
}
</style>
