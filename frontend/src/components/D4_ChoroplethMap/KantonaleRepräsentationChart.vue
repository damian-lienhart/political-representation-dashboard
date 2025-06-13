<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import ChoroplethMap from './ChoroplethMap.vue'
import ChoroplethFilter from './ChoroplethMapFilter.vue'
import { getKantonaleReprData } from '@/services/index.ts'
import type { KantonaleReprEntry } from '@/services/index.ts'
import kantonsGeoJSON from '@/assets/kanton.geojson?raw'
import { ALLOWED_PARTEIEN } from '@/constants/parteien.ts'

const { t, locale } = useI18n()

const geoData = ref<any | null>(null)
const allData = ref<KantonaleReprEntry[]>([])
const filteredData = ref<KantonaleReprEntry[]>([])
const selectedActor = ref<string>('bundesrat')
const parteien = ALLOWED_PARTEIEN

// Reset key to trigger ChoroplethFilter reset
const resetKey = ref('init')

const fetchHeatmapData = async () => {
  try {
    const actor = selectedActor.value.toLowerCase()
    console.log("Fetching canton data for:", actor)
    const result = await getKantonaleReprData(actor)
    allData.value = result
    resetKey.value = actor + '_' + Date.now() // Force filter reset
  } catch (e) {
    console.error('API-Fehler beim Laden der Kantonsdaten:', e)
  }
}

watch(selectedActor, fetchHeatmapData)
watch(locale, fetchHeatmapData)

onMounted(async () => {
  geoData.value = JSON.parse(kantonsGeoJSON)
  await fetchHeatmapData()
})
</script>

<template>
  <div class="diagram-layout">
    <div class="chart-side">
      <h2>{{ t('home.diagram4Title') }}</h2>

      <div class="filter-row">
        <label for="akteur">{{ t('common.filterActor') }}</label>
        <select id="akteur" v-model="selectedActor">
          <option value="bundesrat">{{ t('common.Bundesrat') }}</option>
          <option value="parlament">{{ t('common.Parlament') }}</option>
          <option v-for="party in parteien" :key="party" :value="party">
            {{ t(`parties.${party}.short`, party) }} ({{ t(`parties.${party}.full`, party) }})
          </option>
        </select>
      </div>

      <ChoroplethFilter
          :allData="allData"
          :resetKey="resetKey"
          @update:filter="filteredData = $event"
      />

      <ChoroplethMap :geoData="geoData" :mapData="filteredData" />
    </div>

    <div class="chart-description-box">
      <h3>{{ t('diagram4.descriptionTitle') }}</h3>
      <p>{{ t('diagram4.descriptionText') }}</p>
    </div>
  </div>
</template>

<style scoped>
.diagram-layout {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
}
.chart-side {
  flex: 2;
}
.chart-description-box {
  background-color: #f9f9f9;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  line-height: 1.5;
  flex: 1;
  flex-wrap: wrap;
  min-width: 280px;
  max-width: 320px;


  align-self: stretch;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

.filter-row {
  margin-bottom: 1rem;
  font-size: 14px;
}
</style>
