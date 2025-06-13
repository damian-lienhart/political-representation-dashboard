<template>
  <div ref="chartContainer" class="chart-container"></div>
  <div class="chart-legend">
    <div class="legend-item">
      <span class="legend-color" style="background:#10b981"></span>
      {{ t('common.ueber') }}
    </div>
    <div class="legend-item">
      <span class="legend-color" style="background:#ef4444"></span>
      {{ t('common.nichtUeber') }}
    </div>
  </div>
  <div ref="tooltip" class="chart-tooltip" style="display: none;"></div>
</template>

<script>
import * as d3 from 'd3'
import { useI18n } from 'vue-i18n'
import { calculateReprData } from '@/utils/calculateReprData'

let resizeObserver
export default {
  name: 'StackedBarChart',
  props: {
    data: {
      type: Array,
      required: true
    }
  },
  data() {
    const { t, locale } = useI18n()
    return {
      t,
      locale
    }
  },



  mounted() {
   this.drawChart()
    window.addEventListener('resize', this.drawChart)
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.drawChart)
  },
  watch: {
    data() {
      this.drawChart()
    },
    locale() {
      this.drawChart()
    }
  },
  methods: {
    drawChart() {
      const container = this.$refs.chartContainer
      const tooltip = d3.select(this.$refs.tooltip)
      container.innerHTML = ''

      const margin = {top: 40, right: 200, bottom: 30, left: 120}
      //const width = 800 - margin.left - margin.right
      const containerWidth = container.getBoundingClientRect().width
      const width = containerWidth - margin.left - margin.right
      const height = 300 - margin.top - margin.bottom
      const svg = d3.select(container)
          .append('svg')
          .attr('width', width + margin.left + margin.right)
          .attr('height', height + margin.top + margin.bottom)
          .append('g')
          .attr('transform', `translate(${margin.left},${margin.top})`)
          .attr('font-family', 'Inter, system-ui, sans-serif')
          .attr('font-size', 14)

      const t = this.t
      const rawData = this.data
      const data = calculateReprData(rawData, t)

      const institutions = [...new Set(data.map(d => d.institution))]
      const categories = [t('common.ueber'), t('common.nichtUeber')]
      const colors = d3.scaleOrdinal().domain(categories).range(['#10b981', '#ef4444'])

      const stackedData = institutions.map(inst => {
        const entry = {institution: inst}
        data.filter(d => d.institution === inst).forEach(d => {
          entry[d.match] = d.percent
        })
        return entry
      })

      const y = d3.scaleBand().domain(institutions).range([0, height]).padding(0.2)
      const x = d3.scaleLinear().domain([0, 100]).range([0, width])
      const stack = d3.stack().keys(categories)
      const series = stack(stackedData)


      svg.append('g')
          .selectAll('g')
          .data(series)
          .join('g')
          .attr('fill', d => colors(d.key))
          .selectAll('rect')
          .data(d => d)
          .join('rect')
          .attr('y', d => y(d.data.institution))
          .attr('x', d => x(d[0]))
          .attr('height', y.bandwidth())
          .attr('width', d => x(d[1]) - x(d[0]))
          .attr('rx', 6)
          .attr('ry', 6)
          .on('mouseover', (event, d) => {
            tooltip.style('display', 'block')
                .html(`<strong>${d.data.institution}</strong><br>${(d[1] - d[0]).toFixed(1)}%`)

          })
          .on('mousemove', (event) => {
            tooltip
                .style('left', event.pageX + 10 + 'px')
                .style('top', event.pageY - 28 + 'px')
          })
          .on('mouseout', () => {
            tooltip.style('display', 'none')
          })

      svg.append('g')
          .selectAll('g')
          .data(series)
          .join('g')
          .attr('fill', 'white')
          .attr('font-size', 12)
          .attr('text-anchor', 'middle')
          .selectAll('text')
          .data(d => d)
          .join('text')
          .attr('x', d => x(d[0]) + (x(d[1]) - x(d[0])) / 2)
          .attr('y', d => y(d.data.institution) + y.bandwidth() / 2 + 5)
          .text(d => {
            const value = d[1] - d[0]
            return value > 5 ? `${value.toFixed(1)}%` : ''
          })

      svg.append('g').call(d3.axisLeft(y))
      svg.append('g')
          .attr('transform', `translate(0, ${height})`)
          .call(d3.axisBottom(x).tickFormat(d => `${d}%`))

      svg.append('text')
          .attr('x', 0)
          .attr('y', -10)
          .attr('font-weight', 'bold')
          .text(t('common.PercAvg'))
    }
  }
}
</script>

<style scoped>
.chart-container {
  overflow-x: auto;
  max-width: 100%;
  background-color: #ffffff;
  padding: 1rem;
  border-radius: 10px;
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.04);
}

.chart-tooltip {
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 13px;
  background: rgba(255, 255, 255, 0.95);
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  color: #111827;
  position: absolute;
  pointer-events: none;
  z-index: 1000;
}
.chart-legend {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  font-size: 0.9rem;
  color: #1e293b;
}

.legend-color {
  width: 14px;
  height: 14px;
  border-radius: 4px;
  margin-right: 6px;
  display: inline-block;
}
</style>
