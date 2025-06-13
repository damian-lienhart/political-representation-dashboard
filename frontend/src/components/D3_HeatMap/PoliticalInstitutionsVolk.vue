<template>
  <div class="diagram-layout">
    <div class="chart-side">
      <h2>{{ t('home.diagram3Title') }}</h2>

      <div class="controls">
        <label>
          {{ t('common.sortBy') }}
          <select v-model="sortOption">
            <option value="name">{{ t('common.sortName') }}</option>
            <option value="avg">{{ t('common.sortAvg') }}</option>
            <option value="trend">Trend</option>
          </select>
        </label>

        <label>
          {{ t('common.decade') }} (Min):
          <select v-model="minDecade">
            <option v-for="d in availableDecades" :key="d" :value="d">{{ d }}</option>
          </select>
        </label>

        <label>
          {{ t('common.decade') }} (Max):
          <select v-model="maxDecade">
            <option v-for="d in availableDecades" :key="d" :value="d">{{ d }}</option>
          </select>
        </label>
      </div>

      <HeatMap :data="filteredData" :sortOption="sortOption" />
    </div>

    <div class="chart-description-box">
      <h3>{{ t('diagram3.descriptionTitle') }}</h3>
      <p>{{ t('diagram3.descriptionText') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import HeatMap from './HeatMap.vue'
import { getHeatmapData } from '@/services/index.ts'
import type { HeatmapEntry } from '@/services/index.ts'

const { t } = useI18n()
const data = ref<HeatmapEntry[]>([])
const sortOption = ref<'name' | 'avg' | 'trend'>('name')
const availableDecades = ref<number[]>([])
const minDecade = ref<number | null>(null)
const maxDecade = ref<number | null>(null)

onMounted(async () => {
  try {
    const result = await getHeatmapData()
    data.value = result

    const decades = result.map(d => Math.floor(new Date(d.datum).getFullYear() / 10) * 10)
    const unique = [...new Set(decades)].sort()
    availableDecades.value = unique
    minDecade.value = unique[0]
    maxDecade.value = unique[unique.length - 1]
  } catch (err) {
    console.error('API error:', err)
  }
})

const filteredData = computed(() => {
  if (!minDecade.value || !maxDecade.value) return data.value
  return data.value.filter(d => {
    const decade = Math.floor(new Date(d.datum).getFullYear() / 10) * 10
    return decade >= minDecade.value! && decade <= maxDecade.value!
  })
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
.description-side {
  flex: 1;
  max-width: 300px;
  font-size: 14px;
  background: #f9f9f9;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 6px;
}
.controls {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1rem;
}
.controls label {
  display: flex;
  flex-direction: column;
  font-size: 0.9rem;
}
.chart-description-box {
  background-color: #f9f9f9;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  line-height: 1.5;
  flex: 1;
  min-width: 280px;
  flex-wrap: wrap;
  max-width: 320px;


  align-self: stretch;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

</style>
