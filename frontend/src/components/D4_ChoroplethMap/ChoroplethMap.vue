<template>
  <div style="position: relative;">
    <svg ref="svgRef" :width="width" :height="height"></svg>
    <div
        v-if="hoveredCanton"
        class="hover-tooltip"
        :style="{ top: `${tooltipY}px`, left: `${tooltipX}px` }"
    >
      <strong>{{ hoveredCanton.name }}</strong><br />
      {{ hoveredCanton.percent }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import * as d3 from 'd3'
import { useI18n } from 'vue-i18n'

const codeToName: Record<string, string> = {
  ZH: "Zürich", BE: "Bern", LU: "Luzern", UR: "Uri", SZ: "Schwyz",
  OW: "Obwalden", NW: "Nidwalden", GL: "Glarus", ZG: "Zug", FR: "Fribourg",
  SO: "Solothurn", BS: "Basel-Stadt", BL: "Basel-Landschaft", SH: "Schaffhausen",
  AR: "Appenzell Ausserrhoden", AI: "Appenzell Innerrhoden", SG: "St. Gallen",
  GR: "Graubünden", AG: "Aargau", TG: "Thurgau", TI: "Ticino", VD: "Vaud",
  VS: "Valais", NE: "Neuchâtel", GE: "Genève", JU: "Jura"
}

const nameToCode: Record<string, string> = Object.fromEntries(
    Object.entries(codeToName).map(([code, name]) => [name, code])
)

const props = defineProps<{
  geoData: any
  mapData: { kanton_code: string; uebereinstimmungen: number | string; total: number | string }[]
}>()

const { t, locale } = useI18n()
const svgRef = ref<SVGSVGElement | null>(null)
const width = 800


const height = 600

const tooltipX = ref(0)
const tooltipY = ref(0)
const hoveredCanton = ref<{ name: string; percent: string } | null>(null)

const aggregatedMapData = computed(() => {
  const grouped: Record<string, { match: number; total: number }> = {}

  for (const entry of props.mapData) {
    const code = entry.kanton_code.toUpperCase()
    if (!grouped[code]) {
      grouped[code] = { match: 0, total: 0 }
    }

    grouped[code].match += Number(entry.uebereinstimmungen)
    grouped[code].total += Number(entry.total)
  }

  return Object.entries(grouped).map(([kanton_code, { match, total }]) => ({
    kanton_code,
    uebereinstimmungen: match,
    total
  }))
})

const drawMap = () => {
  const svg = d3.select(svgRef.value)
  svg.selectAll('*').remove()

  const projection = d3.geoMercator().fitSize([width, height], props.geoData)
  const path = d3.geoPath().projection(projection)

  const dataMap = new Map(
      aggregatedMapData.value.map(d => [
        d.kanton_code,
        d.total > 0 ? d.uebereinstimmungen / d.total : null
      ])
  )

  const color = d3.scaleSequential(d3.interpolateRdYlGn).domain([0, 1])

  svg.selectAll('path')
      .data(props.geoData.features)
      .enter()
      .append('path')
      .attr('d', (d: any) => path(d)!)
      .attr('fill', (d: any) => {
        const name = d.properties.NAME
        const abbrev = nameToCode[name] || ''
        const val = dataMap.get(abbrev)
        return typeof val === 'number' ? color(val) : '#ccc'
      })
      .attr('stroke', '#333')
      .attr('stroke-width', 1)
      .on('mousemove', function (event: MouseEvent, d: any) {
        const bounds = svgRef.value?.getBoundingClientRect()
        const name = d.properties.NAME
        const abbrev = nameToCode[name]
        const val = dataMap.get(abbrev)
        const percent = typeof val === 'number' ? `${Math.round(val * 100)}%` : '—'
        const translated = abbrev ? t(`cantons.${abbrev}`, name) : name

        hoveredCanton.value = {
          name: translated,
          percent
        }

        tooltipX.value = event.clientX - (bounds?.left ?? 0) + 10
        tooltipY.value = event.clientY - (bounds?.top ?? 0) - 30
      })
      .on('mouseleave', () => {
        hoveredCanton.value = null
      })
}

watch(() => [props.geoData, props.mapData, locale.value], () => {
  if (props.geoData && props.mapData) {
    drawMap()
  }
})
defineExpose({
  hoveredCanton,
  tooltipX,
  tooltipY
})
</script>

<style scoped>
.hover-tooltip {
  position: absolute;
  background: white;
  padding: 6px 10px;
  border: 1px solid #ccc;
  border-radius: 6px;
  pointer-events: none;
  font-size: 13px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  white-space: nowrap;
  z-index: 1000;
}
</style>
