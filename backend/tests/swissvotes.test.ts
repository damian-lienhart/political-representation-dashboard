import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { pool } from '../src/db/connection';
import { insertMockSwissvote, clearMockData } from './seedMockData';
import { createTables } from './dbtestSetup';

describe('Swissvotes database tests', () => {
    beforeAll(async () => {
        await createTables(pool);
        await insertMockSwissvote(pool);
    });

    afterAll(async () => {
        await clearMockData(pool);
        await pool.end(); // close db connection
    });
    it('can connect to the database', async () => {
        let success = false;
        try {
            await pool.query('SELECT 1');
            success = true;
        } catch (err) {
            console.error('[DB ERROR]', err);
        }
        expect(success).toBe(true);
    });

    it('should contain the test swissvote row', async () => {
        const res = await pool.query('SELECT * FROM swissvotes WHERE vorlagen_id = 9999');
        expect(res.rowCount).toBe(1);
        expect(res.rows[0].titel_kurz_d).toBe('Test DE');
    });

    it('should contain the corresponding party recommendation', async () => {
        const res = await pool.query(`
      SELECT * FROM partei_empfehlungen WHERE vorlagen_id = 9999 AND partei_code = 'fdp'
    `);
        expect(res.rowCount).toBe(1);
        expect(res.rows[0].empfehlung).toBe('Ja');
    });

    it('should contain the correct canton result for ZH', async () => {
        const res = await pool.query(`
      SELECT * FROM kanton_ergebnisse WHERE vorlagen_id = 9999 AND kanton_code = 'ZH'
    `);
        expect(res.rowCount).toBe(1);
        expect(res.rows[0].ja_prozent).toBeCloseTo(60.0);
        expect(res.rows[0].annahme).toBe(true);
    });

    it('should contain the expected theme categorization', async () => {
        const res = await pool.query(`
      SELECT * FROM abstimmung_themen WHERE vorlagen_id = 9999
    `);
        expect(res.rowCount).toBeGreaterThan(0);
        expect(res.rows[0].oberkategorie).toBe('Sozialpolitik');
        expect(res.rows[0].unterkategorie).toBe('10.1');
    });
    it('should return 0 results for a non-existent vote ID', async () => {
        const res = await pool.query('SELECT * FROM swissvotes WHERE vorlagen_id = 123456');
        expect(res.rowCount).toBe(0);
    });
    it('should not allow duplicate swissvotes insertion', async () => {
        let failed = false;
        try {
            await pool.query(`
          INSERT INTO swissvotes (
            vorlagen_id, datum, titel_kurz_d, titel_kurz_f, titel_kurz_e, titel_off_d,
            titel_off_f, stichwort, swissvoteslink, bundesrat_pos, parlament_pos,
            annahme, ja_stimmen_prozent, stimmbeteiligung
          ) VALUES (
            9999, '2025-01-01', 'Duplicate', 'FR', 'EN', 'Off', 'FR', 'Test',
            'https://example.com', 1, 1, true, 50.0, 50.0
          );
        `);
        } catch (err) {
            failed = true;
        }
        expect(failed).toBe(true);
    });
});
