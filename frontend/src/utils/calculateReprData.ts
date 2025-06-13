export interface VoteEntry {
    datum: string
    annahme: boolean
    parlament_empfehlung?: string
    bundesrat_empfehlung?: string
}

export function calculateReprData(rawData: VoteEntry[], t: (key: string) => string) {
    const cutoff = new Date('2009-01-15')
    const onlyAfterCutoff = rawData.every(d => new Date(d.datum) >= cutoff)
    const yes = 'Ja', no = 'Nein'

    if (onlyAfterCutoff) {
        let match = 0, total = 0
        for (const d of rawData) {
            const volk = d.annahme ? yes : no
            if ([yes, no].includes(d.parlament_empfehlung!)) {
                total++
                if (d.parlament_empfehlung === volk) match++
            }
        }
        return [
            { institution: t('common.Parlament'), match: t('common.ueber'), percent: total ? (match / total) * 100 : 0 },
            { institution: t('common.Parlament'), match: t('common.nichtUeber'), percent: total ? ((total - match) / total) * 100 : 0 }
        ]
    } else {
        let brMatch = 0, brTotal = 0
        let parMatch = 0, parTotal = 0
        for (const d of rawData) {
            const volk = d.annahme ? yes : no
            if ([yes, no].includes(d.bundesrat_empfehlung!)) {
                brTotal++
                if (d.bundesrat_empfehlung === volk) brMatch++
            }
            if ([yes, no].includes(d.parlament_empfehlung!)) {
                parTotal++
                if (d.parlament_empfehlung === volk) parMatch++
            }
        }
        return [
            { institution: t('common.Bundesrat'), match: t('common.ueber'), percent: brTotal ? (brMatch / brTotal) * 100 : 0 },
            { institution: t('common.Bundesrat'), match: t('common.nichtUeber'), percent: brTotal ? ((brTotal - brMatch) / brTotal) * 100 : 0 },
            { institution: t('common.Parlament'), match: t('common.ueber'), percent: parTotal ? (parMatch / parTotal) * 100 : 0 },
            { institution: t('common.Parlament'), match: t('common.nichtUeber'), percent: parTotal ? ((parTotal - parMatch) / parTotal) * 100 : 0 }
        ]
    }
}
