<template>
  <div ref="chartContainer" class="chart-container"></div>
  <div ref="tooltip" class="chart-tooltip" style="display: none;"></div>
</template>

<script>
import * as d3 from 'd3'
import { ALLOWED_PARTEIEN } from '@/constants/parteien'
import { useI18n } from 'vue-i18n'

export default {
  name: 'HeatMap',
  props: {
    data: Array,
    sortOption: String
  },
  setup() {
    const {t, locale} = useI18n()
    return {t, locale}
  },
  data() {
    return {
      currentLocale: this.$i18n.locale
    }
  },
  watch: {
    data() {
      this.drawChart()
    },
    sortOption() {
      this.drawChart()
    },
    '$i18n.locale'() {
      this.drawChart()
    }
  },
  mounted() {
    this.drawChart()
  },
  methods: {
    groupData(data) {
      const byActorDecade = {}

      data.forEach(d => {
        const year = new Date(d.datum).getFullYear()
        const decade = Math.floor(year / 10) * 10
        const actor = d.akteur
        const vote = d.annahme
        const rec = d.empfehlung

        const isValidActor = ['bundesrat', 'parlament'].includes(actor) || ALLOWED_PARTEIEN.includes(actor)
        if (!isValidActor || !['Ja', 'Nein'].includes(rec)) return

        const match = (rec === 'Ja' && vote === true) || (rec === 'Nein' && vote === false)

        const key = `${actor}__${decade}`
        if (!byActorDecade[key]) {
          byActorDecade[key] = {actor, decade, match: 0, total: 0}
        }

        byActorDecade[key].total++
        if (match) byActorDecade[key].match++
      })

      return Object.values(byActorDecade).map(d => ({
        actor: d.actor,
        decade: d.decade,
        percent: Math.round((d.match / d.total) * 100)
      }))
    },

    drawChart() {
      const container = this.$refs.chartContainer
      const tooltip = d3.select(this.$refs.tooltip)
      container.innerHTML = ''

      const {t} = this
      const grouped = this.groupData(this.data)

      const actors = [...new Set(grouped.map(d => d.actor))]
      const decades = [...new Set(grouped.map(d => d.decade))].sort()

      const actorStats = actors.map(actor => {
        const actorData = grouped.filter(d => d.actor === actor).sort((a, b) => a.decade - b.decade)
        const avg = actorData.reduce((a, b) => a + b.percent, 0) / actorData.length
        const trend = actorData.length > 1 ? actorData[actorData.length - 1].percent - actorData[0].percent : 0
        return { actor, avg, trend }
      })

      const sortedActors = this.sortOption === 'avg'
          ? actorStats.sort((a, b) => b.avg - a.avg).map(d => d.actor)
          : this.sortOption === 'trend'
              ? actorStats.sort((a, b) => b.trend - a.trend).map(d => d.actor)
              : actorStats.map(d => d.actor).sort()


      const margin = {top: 50, right: 20, bottom: 30, left: 120}
      const width = 800 - margin.left - margin.right


      const height = sortedActors.length * 30

      const svg = d3.select(container)
          .append('svg')
          .attr('width', width + margin.left + margin.right)
          .attr('height', height + margin.top + margin.bottom)
          .append('g')
          .attr('transform', `translate(${margin.left},${margin.top})`)

      const x = d3.scaleBand()
          .domain(decades)
          .range([0, width])
          .padding(0.05)

      const y = d3.scaleBand()
          .domain(sortedActors)
          .range([0, height])
          .padding(0.05)

      const color = d3.scaleSequential()
          .interpolator(d3.interpolateRdYlGn)
          .domain([0, 100])

      const translateActor = (code) => {
        if (['bundesrat', 'parlament'].includes(code)) {
          return t(`common.${code.charAt(0).toUpperCase() + code.slice(1)}`)
        }
        return t(`parties.${code}.short`, {default: code})
      }

      svg.append('g')
          .attr('transform', `translate(0,0)`)
          .call(d3.axisTop(x).tickSize(0))
          .selectAll('text')
          .style('text-anchor', 'middle')

      svg.append('g')
          .call(d3.axisLeft(y)
              .tickFormat(d => translateActor(d)))
          .selectAll('text')
          .style('font-weight', '500')

      svg.append('g')
          .selectAll('rect')
          .data(grouped)
          .join('rect')
          .attr('x', d => x(d.decade))
          .attr('y', d => y(d.actor))
          .attr('width', x.bandwidth())
          .attr('height', y.bandwidth())
          .attr('fill', d => color(d.percent))
          .on('mouseover', function (event, d) {
            d3.selectAll('rect').attr('opacity', 0.3)
            d3.selectAll(`rect[y="${y(d.actor)}"]`).attr('opacity', 1)

            tooltip
                .style('display', 'block')
                .html(`<strong>${translateActor(d.actor)}</strong><br>${d.decade}s: ${d.percent}%`)
          })
          .on('mousemove', (event) => {
            tooltip
                .style('left', event.pageX + 10 + 'px')
                .style('top', event.pageY - 28 + 'px')
          })
          .on('mouseout', () => {
            d3.selectAll('rect').attr('opacity', 1)
            tooltip.style('display', 'none')
          })


    }
  }
}
</script>

<style scoped>
.chart-container {
  max-width: 100%;
  overflow-x: auto;
}

.chart-tooltip {
  position: absolute;
  background: white;
  padding: 6px 10px;
  border: 1px solid #ccc;
  border-radius: 6px;
  pointer-events: none;
  font-size: 13px;
  box-shadow: 0 0 6px rgba(0, 0, 0, 0.1);
  white-space: nowrap;
  z-index: 10;
}
</style>
