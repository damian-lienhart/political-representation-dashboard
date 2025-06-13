import { describe, it, expect } from 'vitest';
import { mapEmpfehlung, mapThema, toBool, toInt } from '../src/utils/mapping';

describe('mapEmpfehlung', () => {
    it('returns "Ja" for code "1"', () => {
        expect(mapEmpfehlung("1")).toBe("Ja");
    });
    it('returns "Ja" for code "2"', () => {
        expect(mapEmpfehlung("2")).toBe("Nein");
    });

    it('returns null for unknown code "9"', () => {
        expect(mapEmpfehlung("9")).toBeNull();
    });
});

describe('mapThema', () => {
    it('returns "Sozialpolitik" for "10"', () => {
        expect(mapThema("10")).toBe("Sozialpolitik");
    });

    it('returns null for "."', () => {
        expect(mapThema(".")).toBeNull();
    });

    it('returns fallback string for unknown code "99"', () => {
        expect(mapThema("99")).toBe("Unbekanntes Thema (99)");
    });
});

describe('toBool', () => {
    it('returns true for "1"', () => {
        expect(toBool("1")).toBe(true);
    });

    it('returns false for "0"', () => {
        expect(toBool("0")).toBe(false);
    });

    it('returns null for "x"', () => {
        expect(toBool("x")).toBeNull();
    });
});

describe('toInt', () => {
    it('parses valid number', () => {
        expect(toInt("42")).toBe(42);
    });

    it('returns 321 for "."', () => {
        expect(toInt(".")).toBe(321);
    });

    it('returns null for NaN input', () => {
        expect(toInt("NaN")).toBeNull();
    });
});
