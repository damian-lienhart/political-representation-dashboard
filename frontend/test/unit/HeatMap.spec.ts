import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import HeatMap from '../../src/components/D3_HeatMap/HeatMap.vue'
import { describe, it, expect, vi } from 'vitest'

// ✅ Mock vue-i18n
vi.mock('vue-i18n', () => ({
    useI18n: () => ({
        t: (key: string) => key,
        locale: 'de'
    })
}))

const mockData = [
    { datum: '2010-01-01', akteur: 'sp', empfehlung: 'Ja', annahme: true },
    { datum: '2010-06-01', akteur: 'sp', empfehlung: 'Nein', annahme: false },
    { datum: '2010-09-01', akteur: 'svp', empfehlung: 'Ja', annahme: true },
    { datum: '2011-03-01', akteur: 'svp', empfehlung: 'Nein', annahme: false }
]

describe('HeatMap.vue', () => {
    it('renders rects based on valid input', async () => {
        const wrapper = mount(HeatMap, {
            props: {
                data: mockData,
                sortOption: 'avg'
            },
            global: {
                mocks: {
                    $i18n: { locale: 'de' },
                    $t: (k: string) => k
                }
            }
        })

        await nextTick()

        const rects = wrapper.findAll('rect')
        console.log('Rendered rects:', rects.length)

        expect(rects.length).toBe(1)
    })

    it('renders decade labels (e.g. "2010s")', async () => {
        const wrapper = mount(HeatMap, {
            props: {
                data: mockData,
                sortOption: 'avg'
            },
            global: {
                mocks: {
                    $i18n: { locale: 'de' },
                    $t: (k: string) => k
                }
            }
        })

        await nextTick()

        const texts = wrapper.findAll('text').map(t => t.text())
        console.log('SVG texts:', texts)
        expect(texts.some(t => t.includes('2010'))).toBe(true)
    })
})
