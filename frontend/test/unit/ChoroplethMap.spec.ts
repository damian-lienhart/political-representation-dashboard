import { mount } from '@vue/test-utils'
import ChoroplethMap from '../../src/components/D4_ChoroplethMap/ChoroplethMap.vue'
import { mockGeoData } from './mockGeo'
import { mockMapData } from './mockMapData'
import flushPromises from 'flush-promises'
import { describe, it, expect, vi } from 'vitest'
import { nextTick } from 'vue'
vi.mock('vue-i18n', () => ({
    useI18n: () => ({
        t: (key: string, fallback: string) => fallback || key,
        locale: 'de'
    })
}))

describe('ChoroplethMap.vue', () => {
    it('renders SVG with canton paths', async () => {
        const wrapper = mount(ChoroplethMap, {
            props: {
                geoData: null,
                mapData: []
            },
            attachTo: document.body
        })

        await wrapper.setProps({
            geoData: mockGeoData,
            mapData: mockMapData
        })

        await flushPromises()

        const paths = wrapper.findAll('path')
        expect(paths.length).toBe(mockGeoData.features.length)
    })

    it('colors cantons based on match/total ratio', async () => {
        const wrapper = mount(ChoroplethMap, {
            props: {
                geoData: mockGeoData,
                mapData: mockMapData
            },
            attachTo: document.body
        })

        await flushPromises()

        const pathElements = wrapper.findAll('path')
        const fillColors = pathElements.map(p => p.attributes('fill'))

        // ZH = 75%, BE = 40%
        expect(fillColors[0]).not.toBe('#ccc')
        expect(fillColors[1]).not.toBe('#ccc')
    })



    describe('ChoroplethMap.vue', () => {
        it('shows tooltip with correct canton and percentage on hover', async () => {
            const wrapper = mount(ChoroplethMap, {
                props: {
                    geoData: mockGeoData,
                    mapData: mockMapData
                },
                attachTo: document.body
            })

            await flushPromises()

            wrapper.vm.hoveredCanton = {
                name: 'Zürich',
                percent: '75%'
            }
            wrapper.vm.tooltipX = 100
            wrapper.vm.tooltipY = 150
            await wrapper.vm.$nextTick()

            const tooltip = wrapper.find('.hover-tooltip')
            expect(tooltip.exists()).toBe(true)
            expect(tooltip.text()).toContain('Zürich')
            expect(tooltip.text()).toContain('75%')
        })
    })


    it('hides tooltip on mouseleave', async () => {
        const wrapper = mount(ChoroplethMap, {
            props: {
                geoData: mockGeoData,
                mapData: mockMapData
            },
            attachTo: document.body
        })

        await flushPromises()

        const pathElements = document.querySelectorAll('svg path')
        const path = pathElements[0]

        path?.dispatchEvent(new MouseEvent('mousemove', {
            bubbles: true,
            clientX: 100,
            clientY: 150
        }))
        await flushPromises()

        path?.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }))
        await flushPromises()

        const tooltip = wrapper.find('.hover-tooltip')
        expect(tooltip.exists()).toBe(false)
    })

})
