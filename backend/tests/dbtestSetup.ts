import {Pool, Client} from "pg";

export async function createTables(client: Pool | Client) {
    await client.query(`
    CREATE TABLE IF NOT EXISTS swissvotes (
      vorlagen_id INT PRIMARY KEY,
      datum DATE,
      titel_kurz_d TEXT,
      titel_kurz_f TEXT,
      titel_kurz_e TEXT,
      titel_off_d TEXT,
      titel_off_f TEXT,
      stichwort TEXT,
      swissvoteslink TEXT,
      bundesrat_pos INT,
      parlament_pos INT,
      annahme BOOLEAN,
      ja_stimmen_prozent FLOAT,
      stimmbeteiligung FLOAT,
      UNIQUE (vorlagen_id)
    );
  `);

    await client.query(`
    CREATE TABLE IF NOT EXISTS partei_empfehlungen (
      id SERIAL PRIMARY KEY,
      vorlagen_id INT REFERENCES swissvotes(vorlagen_id),
      partei_code TEXT,
      empfehlung TEXT,
      UNIQUE (vorlagen_id, partei_code)
    );
  `);

    await client.query(`
    CREATE TABLE IF NOT EXISTS kanton_ergebnisse (
      id SERIAL PRIMARY KEY,
      vorlagen_id INT REFERENCES swissvotes(vorlagen_id),
      kanton_code TEXT,
      ja_prozent FLOAT,
      annahme BOOLEAN,
      UNIQUE (vorlagen_id, kanton_code)
    );
  `);

    await client.query(`
    CREATE TABLE IF NOT EXISTS abstimmung_themen (
      id SERIAL PRIMARY KEY,
      vorlagen_id INT REFERENCES swissvotes(vorlagen_id),
      oberkategorie TEXT,
      unterkategorie TEXT,
      UNIQUE (vorlagen_id, unterkategorie, oberkategorie)
    );
  `);
}
