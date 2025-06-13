/**
 * Converts a numeric party recommendation code to a human-readable string.
 * @param code - the code from the CSV
 */
export function mapEmpfehlung(code: string): string | null {
    switch (code) {
        case "1": return "Ja";
        case "2": return "Nein";
        case "3": return "Keine Parole";
        case "5": return "Freigabe";
        case ".": return "Unklar";
        default: return null;
    }
}

/**
 * Maps a Swissvotes topic code to a thematic category string
 * @param code - The numeric root of the topic code
 */
export function mapThema(code: string): string | null {
    if (code === "." || !code) return null;

    switch (parseInt(code)) {
        case 1: return "Staatsordnung";
        case 2: return "Aussenpolitik";
        case 3: return "Sicherheitspolitik";
        case 4: return "Wirtschaft";
        case 5: return "Landwirtschaft";
        case 6: return "Oeffentliche Finanzen";
        case 7: return "Energie";
        case 8: return "Verkehr und Infrastruktur";
        case 9: return "Umwelt und Lebensraum";
        case 10: return "Sozialpolitik";
        case 11: return "Bildung und Forschung";
        case 12: return "Kultur, Religion, Medien";
        default: return `Unbekanntes Thema (${code})`;
    }
}


export function toBool(val: string): boolean | null {
    if (val === "1") return true;
    if (val === "0") return false;
    return null;
}

export function toInt(val: string): number | null {
    if (val === ".") return 321;
    const parsed = parseInt(val);
    return isNaN(parsed) ? null : parsed;
}