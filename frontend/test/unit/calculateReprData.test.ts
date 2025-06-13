import { describe, it, expect } from 'vitest'
import { calculateReprData } from '../../src/utils/calculateReprData'

describe('calculateReprData', () => {
    const t = (k: string) => k

    it('parliament only (after cutoff)', () => {
        const data = [
            { datum: '2022-01-01', annahme: true, parlament_empfehlung: 'Ja' },
            { datum: '2023-01-01', annahme: false, parlament_empfehlung: 'Nein' }
        ]
        const result = calculateReprData(data, t)
        expect(result[0].percent).toBe(100)
        expect(result[1].percent).toBe(0)
    })

    it('parliament and br (before cutoff)', () => {
        const data = [
            { datum: '2005-01-01', annahme: false, parlament_empfehlung: 'Ja', bundesrat_empfehlung: 'Nein' }
        ]
        const result = calculateReprData(data, t)
        expect(result).toEqual([
            { institution: 'common.Bundesrat', match: 'common.ueber', percent: 100 },
            { institution: 'common.Bundesrat', match: 'common.nichtUeber', percent: 0 },
            { institution: 'common.Parlament', match: 'common.ueber', percent: 0 },
            { institution: 'common.Parlament', match: 'common.nichtUeber', percent: 100 }
        ])
    })
    it('correctly calculates 75% agreement for Bundesrat', () => {
        const t = (key: string) => key
        const data = [
            { datum: '2008-01-01', annahme: true, bundesrat_empfehlung: 'Ja', parlament_empfehlung: 'Ja' },
            { datum: '2008-06-01', annahme: false, bundesrat_empfehlung: 'Nein', parlament_empfehlung: 'Nein' },
            { datum: '2008-09-01', annahme: true, bundesrat_empfehlung: 'Nein', parlament_empfehlung: 'Nein' },
            { datum: '2008-12-01', annahme: true, bundesrat_empfehlung: 'Ja', parlament_empfehlung: 'Ja' },
        ]
        const result = calculateReprData(data, t)
        const brYes = result.find(r => r.institution === 'common.Bundesrat' && r.match === 'common.ueber')
        expect(brYes?.percent).toBeCloseTo(75)
    })
    it('uses only Parliament when all entries are after cutoff', () => {
        const data = [
            { datum: '2010-05-01', annahme: true, parlament_empfehlung: 'Ja', bundesrat_empfehlung: 'Nein' },
            { datum: '2015-09-10', annahme: false, parlament_empfehlung: 'Nein', bundesrat_empfehlung: 'Ja' }
        ]

        const result = calculateReprData(data, t)

        const institutions = result.map(r => r.institution)
        expect(institutions).toEqual(['common.Parlament', 'common.Parlament'])

        const parYes = result.find(r => r.match === 'common.ueber')
        expect(parYes?.percent).toBe(100)
    })
    it('uses Parliament and Bundesrat when any entry is before cutoff', () => {
        const data = [
            { datum: '2008-01-01', annahme: true, parlament_empfehlung: 'Ja', bundesrat_empfehlung: 'Ja' },
            { datum: '2015-09-10', annahme: false, parlament_empfehlung: 'Nein', bundesrat_empfehlung: 'Nein' }
        ]

        const result = calculateReprData(data, t)

        const institutions = result.map(r => r.institution)
        expect(institutions).toContain('common.Bundesrat')
        expect(institutions).toContain('common.Parlament')
    })


})
