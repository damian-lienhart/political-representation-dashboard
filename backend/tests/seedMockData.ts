import { Pool } from "pg";

export async function insertMockSwissvote(pool: Pool) {
    // Insert into swissvotes
    await pool.query(`
    INSERT INTO swissvotes (
      vorlagen_id, datum, titel_kurz_d, titel_kurz_f, titel_kurz_e, titel_off_d,
      titel_off_f, stichwort, swissvoteslink, bundesrat_pos, parlament_pos,
      annahme, ja_stimmen_prozent, stimmbeteiligung
    ) VALUES (
      9999, '2025-01-01', 'Test DE', 'Test FR', 'Test EN', 'Off DE',
      'Off FR', 'Thema', 'https://example.com', 1, 1, true, 61.5, 48.2
    ) ON CONFLICT DO NOTHING;
  `);

    // Insert party recommendation
    await pool.query(`
    INSERT INTO partei_empfehlungen (vorlagen_id, partei_code, empfehlung)
    VALUES (9999, 'fdp', 'Ja') ON CONFLICT DO NOTHING;
  `);

    // Insert canton result
    await pool.query(`
    INSERT INTO kanton_ergebnisse (vorlagen_id, kanton_code, ja_prozent, annahme)
    VALUES (9999, 'ZH', 60.0, true) ON CONFLICT DO NOTHING;
  `);

    // Insert topic
    await pool.query(`
    INSERT INTO abstimmung_themen (vorlagen_id, oberkategorie, unterkategorie)
    VALUES (9999, 'Sozialpolitik', '10.1') ON CONFLICT DO NOTHING;
  `);
}
export async function clearMockData(pool: Pool) {
    await pool.query('DELETE FROM partei_empfehlungen WHERE vorlagen_id = 9999');
    await pool.query('DELETE FROM kanton_ergebnisse WHERE vorlagen_id = 9999');
    await pool.query('DELETE FROM abstimmung_themen WHERE vorlagen_id = 9999');
    await pool.query('DELETE FROM swissvotes WHERE vorlagen_id = 9999');
}

