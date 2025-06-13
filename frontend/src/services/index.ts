export type EmpfehlungenEntry = {
    datum: string
    bundesrat_empfehlung: string
    parlament_empfehlung: string
    ja_stimmen_prozent: number
    titel_kurz_d: string
    titel_kurz_f: string
    titel_kurz_e: string
    annahme: boolean
}
export type ParteiReprEntry = {
    "partei_code": string
    "vorlagen_id": number
    "titel_kurz_d": string
    "titel_kurz_f": string
    "titel_kurz_e": string
    "datum": string
    "annahme": boolean
    "empfehlung": string
}
export type HeatmapEntry = {
    "akteur": string
    "empfehlung": string
    "annahme": boolean
    "datum": string
}
export type KantonaleReprEntry = {
    "kanton_code": string
    "titel_kurz_d": string
    "titel_kurz_f": string
    "titel_kurz_e": string
    "datum": string
    "uebereinstimmungen": number
    "total": number
}





const REST_BASE_URL = 'http://localhost:3000/api/diagram';
export function getEmpfehlungen_vs_Volk(): Promise<EmpfehlungenEntry[]> {
    return ajax('/empfehlungen-vs-volk', {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
    })
}

export async function getParteiRepr(): Promise<ParteiReprEntry[]> {
   return ajax('/partei-repraesentation', {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
    })
   }

   export async function getHeatmapData(): Promise<HeatmapEntry[]> {
    return ajax('/heatmap-volk', {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
    })
   }

export async function getKantonaleReprData(akteur: string): Promise<KantonaleReprEntry[]> {
    return ajax(`/kanton-repraesentation?akteur=${akteur}`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
    })
}



function ajax(url: string, options: RequestInit) {
    return fetch(REST_BASE_URL + url, options)
        .then(response => {
            if (!response.ok) throw response;
            return response.headers.get('Content-Type')?.includes('application/json') ? response.json() : response;
        })
}
