<template>
  <div class="chart-wrapper">
    <div ref="chartContainer" class="chart-container"></div>
    <div ref="tooltip" class="chart-tooltip"></div>
    <button class="reset-button" @click="resetZoom">{{ t('common.resetZoom') }}</button>
  </div>
</template>

<script>
import * as d3 from 'd3'
import { useI18n } from 'vue-i18n'
import { nextTick } from 'vue'

export default {
  name: 'LineChart',
  props: {
    data: Array
  },
  setup() {
    const { t, locale } = useI18n()
    return { t, locale }
  },
  data() {
    return {
      x: null,
      originalX: null,
      svg: null,
      line: null,
      zoom: null
    }
  },
  mounted() {
    nextTick(() => {
      if (this.$refs.chartContainer) {
        this.drawChart()
      }
    })
  },
  watch: {
    data() {
      this.drawChart()
    }
  },
  methods: {
    getPartyColor(code) {
      const colors = {
        svp: '#228B22',   // Forest Green
        sps: '#D00000',   // Strong Red
        fdp: '#007FFF',   // Azure Blue
        cvp: '#FF8C00',   // Dark Orange
        mitte: '#F4A300', // Saffron (Mitte)
        glp: '#32CD32',   // Lime Green
        gps: '#006400',   // Dark Green
        evp: '#FFD700',   // Gold
        edu: '#191970',   // Midnight Blue
        pda: '#B22222',   // Firebrick
        sd: '#4682B4',    // Steel Blue
        lega: '#9400D3',  // Dark Violet
        mcg: '#20B2AA',   // Light Sea Green
        bdp: '#DAA520',   // Goldenrod
        lps: '#00CED1',   // Dark Turquoise
        kvp: '#DC143C',   // Crimson
        ucsp: '#B8860B',  // Dark Goldenrod
        ldu: '#708090',   // Slate Grey
        poch: '#A52A2A',  // Brown
        rep: '#8B008B'    // Dark Magenta
      }

      return colors[code.toLowerCase()] || '#999999' // fallback gray
    },

    transformData(rawData) {
      const grouped = d3.group(rawData, d => d.partei_code)
      const series = []

      for (const [party, entries] of grouped.entries()) {
        const groupedByYear = d3.rollup(
            entries,
            values => {
              const relevant = values.filter(d => d.empfehlung === 'Ja' || d.empfehlung === 'Nein')
              const matches = relevant.filter(d =>
                  (d.empfehlung === 'Ja' && d.annahme) || (d.empfehlung === 'Nein' && !d.annahme)
              )
              return relevant.length ? (matches.length / relevant.length) * 100 : null
            },
            d => new Date(d.datum).getFullYear()
        )

        const dataPoints = Array.from(groupedByYear.entries())
            .filter(([, percent]) => percent !== null)
            .map(([year, percent]) => ({
              year: new Date(year.toString(), 0, 1),
              percent
            }))

        if (dataPoints.length > 0) {
          series.push({ party, values: dataPoints })
        }
      }

      return series
    },

    drawChart() {
      const container = this.$refs.chartContainer
      const tooltip = d3.select(this.$refs.tooltip)
      if (!container) return

      container.innerHTML = ''

      const margin = { top: 40, right: 180, bottom: 40, left: 50 }
      const width = container.offsetWidth - margin.left - margin.right



      const height = 400 - margin.top - margin.bottom

      const svg = d3.select(container)
          .append('svg')
          .attr('width', width + margin.left + margin.right)
          .attr('height', height + margin.top + margin.bottom)

      this.svg = svg

      svg.append("defs")
          .append("clipPath")
          .attr("id", "clip")
          .append("rect")
          .attr("width", width)
          .attr("height", height)

      const chartArea = svg.append('g')
          .attr('transform', `translate(${margin.left},${margin.top})`)

      const transformed = this.transformData(this.data)
      const allYears = new Set(transformed.flatMap(d => d.values.map(v => v.year)))
      const years = Array.from(allYears).sort((a, b) => a - b)

      const x = d3.scaleTime()
          .domain(d3.extent(years))
          .range([0, width])

      const y = d3.scaleLinear()
          .domain([0, 105])
          .range([height, 0])

      this.x = x
      this.originalX = d3.scaleTime().domain(x.domain()).range(x.range())

      const xAxis = chartArea.append('g')
          .attr('transform', `translate(0,${height})`)
          .call(d3.axisBottom(x).tickFormat((date) => d3.timeFormat('%Y')(date)))

      chartArea.append('g')
          .call(d3.axisLeft(y).tickFormat(d => `${d}%`))

      // Add subtle horizontal grid lines
      chartArea.append('g')
          .attr('class', 'grid-lines')
          .call(
              d3.axisLeft(y)
                  .tickSize(-width)
                  .tickFormat('')
          )
          .selectAll('line')
          .attr('stroke', '#ccc')
          .attr('stroke-opacity', 0.3); // Less bright


      const line = d3.line()
          .x(d => x(d.year))
          .y(d => y(d.percent))
          .curve(d3.curveMonotoneX)

      this.line = line

      const linesGroup = chartArea.append('g')
          .attr('class', 'lines')
          .attr("clip-path", "url(#clip)")

      linesGroup.selectAll('.party-line')
          .data(transformed)
          .enter()
          .append('path')
          .attr('class', d => `party-line party-line-${d.party.replace(/\s+/g, '-')}`)
          .attr('fill', 'none')
          .attr('stroke', d => this.getPartyColor(d.party))
          .attr('stroke-width', 2)
          .attr('d', d => line(d.values))

      const t = this.t

      linesGroup.selectAll('.party-hover-line')
          .data(transformed)
          .enter()
          .append('path')
          .attr('class', 'party-hover-line')
          .attr('fill', 'none')
          .attr('stroke', 'transparent')
          .attr('stroke-width', 20)
          .attr('d', d => line(d.values))
          .on('mouseover', (event, d) => {
            d3.selectAll('.party-line').attr('stroke-opacity', 0.15)
            d3.select(`.party-line-${d.party.replace(/\s+/g, '-')}`)
                .attr('stroke-opacity', 1)
                .attr('stroke-width', 3)
            tooltip.style('display', 'block')
          })
          .on('mousemove', (event, d) => {
            const code = (d.party || '').toLowerCase().trim()
            const name = t(`parties.${code}.short`, code)

            const containerRect = this.$refs.chartContainer.getBoundingClientRect()
            const offsetX = event.clientX - containerRect.left
            const offsetY = event.clientY - containerRect.top

            tooltip
                .style('display', 'block')
                .style('left', `${offsetX + 10}px`)
                .style('top', `${offsetY - 40}px`)
                .html(`<strong>${name}</strong>`)
          })
          .on('mouseout', () => {
            d3.selectAll('.party-line')
                .attr('stroke-opacity', 1)
                .attr('stroke-width', 2)

            tooltip
                .style('display', 'none')
                .style('left', null)
                .style('top', null)
                .html('')
          })

      const zoom = d3.zoom()
          .scaleExtent([1, 10])
          .translateExtent([[0, 0], [width, height]])
          .extent([[0, 0], [width, height]])
          .on('zoom', (event) => {
            const zoomX = event.transform.rescaleX(this.originalX)
            this.x = zoomX
            xAxis.call(d3.axisBottom(zoomX).tickFormat((date) => d3.timeFormat('%Y')(date)))
            line.x(d => zoomX(d.year))
            linesGroup.selectAll('.party-line').attr('d', d => line(d.values))
            linesGroup.selectAll('.party-hover-line').attr('d', d => line(d.values))
          })

      this.zoom = zoom

      svg.call(zoom)
          .on('wheel.zoom', null)
          .on('wheel', (event) => {
            event.preventDefault()
            const direction = event.deltaY < 0 ? 1.3 : 0.7
            svg.transition().duration(100).call(zoom.scaleBy, direction)
          })
    },

    resetZoom() {
      this.svg.transition().duration(300).call(this.zoom.transform, d3.zoomIdentity)
    }
  }
}

export class getPartyColor {
}
</script>


<style scoped>
.chart-wrapper {
  position: relative;
}

.chart-container {
  overflow-x: auto;
  max-width: 100%;
  position: relative;
}

.chart-tooltip {
  display: none;
  position: absolute;
  background: white;
  padding: 6px 10px;
  border: 1px solid #ccc;
  border-radius: 6px;
  pointer-events: none;
  font-size: 13px;
  box-shadow: 0 0 6px rgba(0, 0, 0, 0.1);
  white-space: nowrap;
  z-index: 1000;
  transition: opacity 0.1s ease;
}

.reset-button {
  margin-top: 0.8rem;
  padding: 6px 12px;
  font-size: 14px;
  border: 1px solid #ccc;
  background-color: #f5f5f5;
  border-radius: 4px;
  cursor: pointer;
  position: relative;
  z-index: 10;
}

.reset-button:hover {
  background-color: #eaeaea;
}

.grid-lines line {
  shape-rendering: crispEdges;
  stroke: #ccc;
  stroke-opacity: 0.3;
}

</style>
