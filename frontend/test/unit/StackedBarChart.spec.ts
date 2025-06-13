import { mount } from '@vue/test-utils'
import StackedBarChart from '../../src/components/D1_StackedBarChart/StackedBarChart.vue'
import { describe, it, expect, vi } from 'vitest'

vi.mock('vue-i18n', () => ({
    useI18n: () => ({
        t: (key: string) => key,
        locale: 'de'
    })
}))

describe('StackedBarChart', () => {
    const sampleData = [
        { datum: '2023-01-01', annahme: true, parlament_empfehlung: 'Ja', bundesrat_empfehlung: 'Nein' }
    ]

    it('mounts and renders an SVG', async () => {
        const wrapper = mount(StackedBarChart, {
            props: { data: sampleData }
        })

        await wrapper.vm.$nextTick()
        expect(wrapper.find('svg').exists()).toBe(true)
        expect(wrapper.findAll('rect').length).toBeGreaterThan(0)
    })
})
