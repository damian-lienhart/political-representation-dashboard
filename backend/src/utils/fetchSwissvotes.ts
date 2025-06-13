import {Client, Pool} from "pg";
import {Readable} from "stream";

import csv from "csv-parser";
import axios from "axios";
import dotenv from "dotenv";
import {mapEmpfehlung, mapThema, toBool, toInt} from "./mapping";
/**
 * Swissvotes Data Importer
 *
 * Downloads the Swissvotes dataset CSV and imports vote metadata,
 * party recommendations, canton-level results, and policy topics
 * into the PostgreSQL database.
 *
 * Source: https://swissvotes.ch/page/dataset/swissvotes_dataset.csv
 *
 * Tables:
 * - swissvotes
 * - partei_empfehlungen
 * - kanton_ergebnisse
 * - abstimmung_themen
 */

dotenv.config();

const SWISSVOTES_CSV_URL = "https://swissvotes.ch/page/dataset/swissvotes_dataset.csv";

const parteien = [
    "fdp", "sps", "svp", "mitte", "evp", "gps", "glp",
    "pda", "sd", "edu", "fps", "lega", "kvp", "mcg",
    "ucsp", "cvp", "bdp", "lps", "ldu", "poch", "rep"
];

const kantone = [
    "zh", "be", "lu", "ur", "sz", "ow", "nw", "gl", "zg", "fr",
    "so", "bs", "bl", "sh", "ar", "ai", "sg", "gr", "ag", "tg",
    "ti", "vd", "vs", "ne", "ge", "ju"
];

/**
 * Converts a Swiss-format date (DD.MM.YYYY) to ISO format (YYYY-MM-DD).
 * @param dateStr - Date string in Swiss format
 */
function formatDate(dateStr: string): string {
    const [day, month, year] = dateStr.split(".");
    return `${year}-${month}-${day}`;
}

/**
 * Downloads the Swissvotes dataset as a stream, ensures required
 * tables exist, and parses + imports all data into the database.
 *
 * @param {Client | Pool} client - PostgreSQL client or connection pool
 */
export async function fetchSwissvotesData(client: Client | Pool) {
    try {
        const response = await axios.get(SWISSVOTES_CSV_URL, {responseType: "stream"});

        // Tabellenstruktur sicherstellen
        await client.query(`
            CREATE TABLE IF NOT EXISTS swissvotes
            (
                vorlagen_id
                INT
                PRIMARY
                KEY,
                datum
                DATE,
                titel_kurz_d
                TEXT,
                titel_kurz_f
                TEXT,
                titel_kurz_e
                TEXT,
                titel_kurz_i
                TEXT,
                titel_off_d
                TEXT,
                titel_off_f
                TEXT,
                stichwort
                TEXT,
                swissvoteslink
                TEXT,
                bundesrat_pos
                INT,
                parlament_pos
                INT,
                annahme
                BOOLEAN,
                ja_stimmen_prozent
                FLOAT,
                stimmbeteiligung
                FLOAT,
                UNIQUE
            (
                vorlagen_id
            )
                );
        `);

        await client.query(`
            CREATE TABLE IF NOT EXISTS partei_empfehlungen
            (
                id
                SERIAL
                PRIMARY
                KEY,
                vorlagen_id
                INT
                REFERENCES
                swissvotes
            (
                vorlagen_id
            ),
                partei_code TEXT,
                empfehlung TEXT,
                UNIQUE
            (
                vorlagen_id,
                partei_code
            )
                );
        `);

        await client.query(`
            CREATE TABLE IF NOT EXISTS kanton_ergebnisse
            (
                id
                SERIAL
                PRIMARY
                KEY,
                vorlagen_id
                INT
                REFERENCES
                swissvotes
            (
                vorlagen_id
            ),
                kanton_code TEXT,
                ja_prozent FLOAT,
                annahme BOOLEAN,
                UNIQUE
            (
                vorlagen_id,
                kanton_code
            )
                );
        `);

        await client.query(`
            CREATE TABLE IF NOT EXISTS abstimmung_themen
            (
                id
                SERIAL
                PRIMARY
                KEY,
                vorlagen_id
                INT
                REFERENCES
                swissvotes
            (
                vorlagen_id
            ),
                oberkategorie TEXT,
                unterkategorie TEXT,
                UNIQUE
            (
                vorlagen_id,
                unterkategorie,
                oberkategorie
            )
                );
        `);

        await parseAndStoreData(client, response.data as Readable);

    } catch (error) {
        console.error("Error downloading or processing Swissvotes dataset:", error);
    }
}

/**
 * Parses each row from the Swissvotes CSV stream and inserts the
 * relevant records into the database tables (swissvotes, party
 * recommendations, canton results, topics).
 *
 * @param {Client | Pool} client - PostgreSQL client/connection pool
 * @param {Readable} stream - Readable stream of CSV data
 * @returns {Promise<void>}
 */
async function parseAndStoreData(client: Client | Pool, stream: Readable): Promise<void> {
    return new Promise((resolve, reject) => {
        const parser = csv({
            separator: ";",
            mapHeaders: ({header}) => header.replace(/^\uFEFF/, "").trim()
        });

        const pendingPromises: Promise<any>[] = []

        stream
            .pipe(parser)
            .on("data", (row) => {
                const promise = (async () => {
                    try {
                        if (!row.anr || isNaN(parseInt(row.anr))) return;

                        const vorlagenId = parseInt(row.anr);

                        const values = [
                            vorlagenId,
                            formatDate(row.datum),
                            row.titel_kurz_d,
                            row.titel_kurz_f,
                            row.titel_kurz_e,
                            row.titel_off_d,
                            row.titel_off_f,
                            row.stichwort,
                            row.swissvoteslink,
                            toInt(row["br-pos"]),
                            toInt(row["bv-pos"]),
                            toBool(row.annahme),
                            parseFloat(row["volkja-proz"]) || 0,
                            parseFloat(row.bet) || 0
                        ];

                        await client.query(`
                            INSERT INTO swissvotes (vorlagen_id, datum, titel_kurz_d, titel_kurz_f, titel_kurz_e,
                                                    titel_off_d,
                                                    titel_off_f, stichwort, swissvoteslink, bundesrat_pos,
                                                    parlament_pos,
                                                    annahme, ja_stimmen_prozent, stimmbeteiligung)
                            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13,
                                    $14) ON CONFLICT (vorlagen_id) DO NOTHING;
                        `, values);

                        for (const partei of parteien) {
                            const raw = row[`p-${partei}`];
                            const empfehlung = mapEmpfehlung(raw);
                            if (!empfehlung) continue;

                            await client.query(`
                                INSERT INTO partei_empfehlungen (vorlagen_id, partei_code, empfehlung)
                                VALUES ($1, $2, $3) ON CONFLICT (vorlagen_id, partei_code) DO NOTHING;
                            `, [vorlagenId, partei, empfehlung]);
                        }

                        for (const kt of kantone) {
                            const jaProz = parseFloat(row[`${kt}-japroz`]);
                            const angenommen = toBool(row[`${kt}-annahme`]);
                            if (isNaN(jaProz) || angenommen === null) continue;

                            await client.query(`
                                INSERT INTO kanton_ergebnisse (vorlagen_id, kanton_code, ja_prozent, annahme)
                                VALUES ($1, $2, $3, $4) ON CONFLICT (vorlagen_id, kanton_code) DO NOTHING;
                            `, [vorlagenId, kt.toUpperCase(), jaProz, angenommen]);
                        }

                        const themenCodes: string[] = [];
                        for (let i = 1; i <= 3; i++) {
                            const e1 = row[`d${i}e1`]?.trim();
                            const e2 = row[`d${i}e2`]?.trim();
                            const e3 = row[`d${i}e3`]?.trim();

                            if (!e1 || e1 === ".") continue;

                            let code = e1;
                            if (e2 && e2 !== "." && e2.startsWith(e1 + ".")) {
                                code = e2;
                                if (e3 && e3 !== "." && e3.startsWith(e2 + ".")) {
                                    code = e3;
                                }
                            }

                            themenCodes.push(code);
                        }

                        for (const unterkategorie of themenCodes) {
                            const hauptcode = unterkategorie.split(".")[0];
                            const oberkategorie = mapThema(hauptcode);
                            if (!oberkategorie) continue;

                            await client.query(`
                                INSERT INTO abstimmung_themen (vorlagen_id, oberkategorie, unterkategorie)
                                VALUES ($1, $2, $3) ON CONFLICT (vorlagen_id, unterkategorie, oberkategorie) DO NOTHING;
                            `, [vorlagenId, oberkategorie.trim(), unterkategorie]);
                        }
                    } catch (err) {
                        console.error("Fehler beim Verarbeiten von Zeile:", err)
                    }
                })()

                pendingPromises.push(promise)
            })
            .on("end", async () => {
                await Promise.all(pendingPromises)
                console.log("Datenimport abgeschlossen.")
                resolve()
            })
            .on("error", (err) => {
                reject(err)
            });
    });
}

