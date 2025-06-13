<template>
  <div class="diagram-layout">
    <div class="chart-side">
      <h2>{{ t('home.diagram2Title') }}</h2>

      <!-- Compact Party Selector -->
      <div class="party-select">
        <label>{{ t('diagram2.legendToggle') }}</label>
        <div class="party-buttons">
          <button
              v-for="party in allParties"
              :key="party"
              @click="toggleParty(party)"
              :class="{ selected: selectedParties.includes(party) }"
          >
  <span
      class="color-dot"
      :style="{ backgroundColor: getPartyColor(party) }"
  ></span>
            {{ getFormattedPartyName(party) }}
          </button>

        </div>
      </div>

      <LineChart :data="filteredData" />
    </div>

    <div class="chart-description-box">
      <h3>{{ t('diagram2.descriptionTitle') }}</h3>
      <p>{{ t('diagram2.descriptionText') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import LineChart from './LineChart.vue'
import { getParteiRepr } from '@/services/index.ts'
import type { ParteiReprEntry } from '@/services/index.ts'
import { ALLOWED_PARTEIEN } from '@/constants/parteien.ts'


const { t } = useI18n()

const data = ref<ParteiReprEntry[]>([])
const selectedParties = ref<string[]>([])

const allParties = computed(() =>
    [...new Set(data.value.map(d => d.partei_code))]
        .filter(code => ALLOWED_PARTEIEN.includes(code))
        .sort()
)
const getPartyColor = (code: string): string => {
  const colors: Record<string, string> = {
    svp: '#228B22', sps: '#D00000', fdp: '#007FFF', cvp: '#FF8C00',
    mitte: '#F4A300', glp: '#32CD32', gps: '#006400', evp: '#FFD700',
    edu: '#191970', pda: '#B22222', sd: '#4682B4', lega: '#9400D3',
    mcg: '#20B2AA', bdp: '#DAA520', lps: '#00CED1', kvp: '#DC143C',
    ucsp: '#B8860B', ldu: '#708090', poch: '#A52A2A', rep: '#8B008B'
  }
  return colors[code.toLowerCase()] || '#999999'
}


const toggleParty = (code: string) => {
  if (selectedParties.value.includes(code)) {
    selectedParties.value = selectedParties.value.filter(p => p !== code)
  } else {
    selectedParties.value.push(code)
  }
}

const getFormattedPartyName = (code: string): string => {
  const short = t(`parties.${code}.short`)
  const full = t(`parties.${code}.full`)
  return `${short} (${full})`
}

const filteredData = computed(() => {
  return data.value.filter(d => selectedParties.value.includes(d.partei_code))
})


onMounted(async () => {
  try {
    const result = await getParteiRepr()
    data.value = result.filter(d => ALLOWED_PARTEIEN.includes(d.partei_code))
    if (allParties.value.length > 0) {
      selectedParties.value = [allParties.value[0]]
    }
  } catch (e) {
    console.error('API error', e)
  }
})


</script>

<style scoped>
.diagram-layout {
  display: flex;
  flex-wrap: nowrap;
  gap: 1rem;
  align-items: flex-start;
}

.chart-side {
  flex-grow: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}



.description-side {
  flex: 1;
  max-width: 300px;
  font-size: 14px;
  background: #f9f9f9;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 6px;
}

.party-select {
  margin-bottom: 1.2rem;
}
.party-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
  gap: 0.4rem;
  margin-top: 0.5rem;
  max-width: 100%;
}
.party-buttons button {
  padding: 0.35rem 0.6rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  background-color: white;
  text-align: left;
}
.party-buttons button.selected {
  background-color: #2563eb;
  color: white;
  border-color: #2563eb;
}
.color-dot {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 8px;
  vertical-align: middle;
}
.chart-description-box {
  flex-shrink: 0;
  width: 240px;
  max-width: 240px;
  align-self: stretch;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  background: #f9f9f9;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
}




</style>
