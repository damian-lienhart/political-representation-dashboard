import { mount } from '@vue/test-utils'
import LineChart from '../../src/components/D2_LineChart/LineChart.vue'
import { describe, it, expect, vi } from 'vitest'
import flushPromises from 'flush-promises'

// ✅ Mock i18n
vi.mock('vue-i18n', () => ({
    useI18n: () => ({
        t: (key: string) => key,
        locale: 'de'
    })
}))

describe('LineChart.vue', () => {
    const mockData = [
        { datum: '2010-01-01', annahme: true, empfehlung: 'Ja', partei_code: 'sps' },
        { datum: '2012-01-01', annahme: false, empfehlung: 'Nein', partei_code: 'sps' },
        { datum: '2014-01-01', annahme: true, empfehlung: 'Ja', partei_code: 'sps' },
        { datum: '2016-01-01', annahme: true, empfehlung: 'Nein', partei_code: 'sps' }, // mismatch
        { datum: '2018-01-01', annahme: true, empfehlung: 'Ja', partei_code: 'sps' },
        { datum: '2020-01-01', annahme: false, empfehlung: 'Nein', partei_code: 'sps' }
    ]

    const createContainer = () => {
        const el = document.createElement('div')
        el.style.width = '800px'
        el.style.height = '400px'
        document.body.appendChild(el)
        return el
    }

    it('renders an SVG element', async () => {
        const wrapper = mount(LineChart, {
            props: { data: mockData },
            attachTo: createContainer()
        })
        await flushPromises()

        expect(wrapper.find('svg').exists()).toBe(true)
    })

    it('draws line paths for party data', async () => {
        const wrapper = mount(LineChart, {
            props: { data: mockData },
            attachTo: createContainer()
        })
        await flushPromises()

        const paths = wrapper.findAll('path.party-line')
        console.log('[TEST] rendered party lines:', paths.length)
        expect(paths.length).toBeGreaterThan(0)
    })

    it('renders visible year axis labels', async () => {
        const wrapper = mount(LineChart, {
            props: { data: mockData },
            attachTo: createContainer()
        })
        await flushPromises()

        const textNodes = wrapper.findAll('text').map(el => el.text().trim())
        console.log('[TEST] axis labels:', textNodes)

        const yearLabels = textNodes.filter(t => /^\d{4}$/.test(t))
        expect(yearLabels.length).toBeGreaterThan(0)
    })
})
