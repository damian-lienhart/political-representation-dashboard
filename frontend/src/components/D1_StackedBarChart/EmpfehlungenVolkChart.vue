<template>
  <div class="diagram-layout">
    <div class="chart-side">
      <h2>{{ t('home.diagram1Title') }}</h2>

      <DiagramFilter
          :allData="data"
          :language="locale as 'de' | 'fr' | 'en' | 'it'"
          @update:filter="filteredData = $event"
      />




      <div v-if="loading">Loading...</div>
      <div v-else>
        <StackedBarChart :data="filteredData" />
      </div>
    </div>

    <div class="chart-description-box">
      <h3>{{ t('diagram1.descriptionTitle') }}</h3>
      <p>{{ t('diagram1.descriptionText') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

import StackedBarChart from './StackedBarChart.vue'
import DiagramFilter from '@/services/DiagramFilter.vue'
import { getEmpfehlungen_vs_Volk } from '@/services/index.ts'
import type { EmpfehlungenEntry } from '@/services/index.ts'

const i18n = useI18n()
const locale = i18n.locale
const t = i18n.t

const data = ref<EmpfehlungenEntry[]>([])
const filteredData = ref<EmpfehlungenEntry[]>([])
const loading = ref(true)




onMounted(async () => {
  try {
    const response = await getEmpfehlungen_vs_Volk()
    data.value = response
    filteredData.value = response // default initial view
  } catch (error) {
    console.error('API error:', error)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.diagram-layout {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  align-items: flex-start;
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

  /* Wichtig: volle Höhe des flex-Containers einnehmen */
  align-self: stretch;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

</style>

