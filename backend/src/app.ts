import express from "express";
import dotenv from 'dotenv';

dotenv.config({path: `.env.${process.env.NODE_ENV || 'development'}`});

import {Pool} from "pg";
import {fetchSwissvotesData} from "./utils/fetchSwissvotes";
import cors from 'cors';
import type {Request, Response, NextFunction} from 'express';


const app = express();


app.use(express.json());

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || "postgresql://postgres:password@localhost:5432/political_dashboard"
});

pool.connect().then(async () => {
    console.log("PostgreSQL connected successfully.");
    await fetchSwissvotesData(pool);
    console.log("fetchSwissvotesData(client) wurde aufgerufen");
}).catch((err) => {
    console.error("PostgreSQL connection error:", err);
});
app.use(cors())


/**
 *
 *  Fetches the latest 1000 Swissvotes entries including aggregated party recommendations.
 *
 */

app.get("/api/swissvotes", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT s.vorlagen_id,
                   s.datum,
                   s.titel_kurz_d,
                   s.stichwort,
                   s.annahme,
                   s.ja_stimmen_prozent,
                   s.stimmbeteiligung,
                   json_agg(json_build_object('partei', e.partei_code, 'empfehlung', e.empfehlung)) AS empfehlungen
            FROM swissvotes s
                     LEFT JOIN partei_empfehlungen e ON s.vorlagen_id = e.vorlagen_id
            GROUP BY s.vorlagen_id
            ORDER BY s.datum DESC LIMIT 1000;
        `);
        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching swissvotes from DB:", error);
        res.status(500).json({error: "Failed to fetch Swissvotes data from database"});
    }
});

/**
 * Provides vote data for Diagram 1: Recommendations vs Public Vote.
 * Includes Bundesrat and Parliament recommendations vs actual public vote result.
 */

app.get("/api/diagram/empfehlungen-vs-volk", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT s.datum,
                   s.titel_kurz_d,
                   s.titel_kurz_f,
                   s.titel_kurz_e,
                   s.vorlagen_id,
                   CASE s.bundesrat_pos
                       WHEN 1 THEN 'Ja'
                       WHEN 2 THEN 'Nein'
                       WHEN 3 THEN 'Keine Parole'
                       WHEN 5 THEN 'Freigabe'
                       ELSE 'Unklar'
                       END AS bundesrat_empfehlung,
                   CASE s.parlament_pos
                       WHEN 1 THEN 'Ja'
                       WHEN 2 THEN 'Nein'
                       WHEN 3 THEN 'Keine Parole'
                       WHEN 5 THEN 'Freigabe'
                       ELSE 'Unklar'
                       END AS parlament_empfehlung,
                   s.ja_stimmen_prozent,
                   s.annahme
            FROM swissvotes s
            WHERE s.ja_stimmen_prozent IS NOT NULL
        `);
        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching swissvotes from DB:", error);
        res.status(500).json({error: "Failed to fetch Swissvotes data from database"});
    }
});

/**
 * Provides vote-level data for Diagram 2: Party representation over time.
 *   Allows optional filtering by party and year
 */
app.get("/api/diagram/partei-repraesentation", async (req, res) => {
    try {
        const {partei, jahr} = req.query;

        const conditions: string[] = [];
        const values: any[] = [];

        if (partei) {
            conditions.push(`e.partei_code = $${values.length + 1}`);
            values.push(partei);
        }

        if (jahr) {
            conditions.push(`EXTRACT(YEAR FROM s.datum) = $${values.length + 1}`);
            values.push(Number(jahr));
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

        const result = await pool.query(`
            SELECT e.partei_code,
                   s.titel_kurz_d,
                   s.titel_kurz_f,
                   s.titel_kurz_e,
                   s.vorlagen_id,
                   s.datum,
                   s.annahme,
                   e.empfehlung
            FROM partei_empfehlungen e
                     JOIN swissvotes s ON s.vorlagen_id = e.vorlagen_id
                ${whereClause}
            ORDER BY s.datum ASC
        `, values);

        res.json(result.rows);
    } catch (error) {
        console.error("Fehler beim Abrufen der Partei-Repräsentationsdaten:", error);
        res.status(500).json({message: "Interner Serverfehler"});
    }
});
/**
 *  Data for Diagram 3: Heatmap showing alignment of Bundesrat, Parliament, and parties with public results.
 *  Calculates for each actor whether their recommendation matches the vote outcome
 */
app.get("/api/diagram/heatmap-volk", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 'bundesrat' AS akteur,
                   CASE s.bundesrat_pos
                       WHEN 1 THEN 'Ja'
                       WHEN 2 THEN 'Nein'
                       WHEN 3 THEN 'Keine Parole'
                       WHEN 5 THEN 'Freigabe'
                       ELSE 'Unklar'
                       END     AS empfehlung,
                   s.annahme,
                   s.datum
            FROM swissvotes s
            WHERE s.annahme IS NOT NULL

            UNION ALL

            SELECT 'parlament' AS akteur,
                   CASE s.parlament_pos
                       WHEN 1 THEN 'Ja'
                       WHEN 2 THEN 'Nein'
                       WHEN 3 THEN 'Keine Parole'
                       WHEN 5 THEN 'Freigabe'
                       ELSE 'Unklar'
                       END     AS empfehlung,
                   s.annahme,
                   s.datum
            FROM swissvotes s
            WHERE s.annahme IS NOT NULL

            UNION ALL

            SELECT e.partei_code AS akteur,
                   e.empfehlung,
                   s.annahme,
                   s.datum
            FROM partei_empfehlungen e
                     JOIN swissvotes s ON s.vorlagen_id = e.vorlagen_id
            WHERE s.annahme IS NOT NULL
              AND e.empfehlung IS NOT NULL
        `);

        res.json(result.rows);
    } catch (error) {
        console.error("Fehler beim Abrufen der Heatmap-Daten:", error);
        res.status(500).json({message: "Interner Serverfehler"});
    }
});
/**
 * Data for Diagram 4: Regional representation (choropleth map).
 *   Shows how often an actor (Bundesrat, Parliament, or a party) aligns with each canton.
 */
app.get("/api/diagram/kanton-repraesentation", async (req, res) => {
    const {akteur} = req.query;

    if (!akteur || typeof akteur !== "string") {
        res.status(400).json({message: "Fehlender oder ungültiger Query-Parameter: akteur"});
        return;
    }

    try {
        let result;

        if (akteur === "bundesrat") {
            result = await pool.query(`
                SELECT s.titel_kurz_d,
                       s.titel_kurz_f,
                       s.titel_kurz_e,
                       s.vorlagen_id,
                       s.datum,
                       k.kanton_code,
                       COUNT(*) FILTER (
                        WHERE 
                            ((s.bundesrat_pos = 1 AND k.annahme = true)
                            OR (s.bundesrat_pos = 2 AND k.annahme = false))
                    ) AS uebereinstimmungen, COUNT(*) AS total
                FROM kanton_ergebnisse k
                         JOIN swissvotes s ON k.vorlagen_id = s.vorlagen_id
                WHERE s.bundesrat_pos IN (1, 2)
                GROUP BY k.kanton_code, s.titel_kurz_d, s.titel_kurz_f, s.titel_kurz_e, s.vorlagen_id, s.datum
            `);
        } else if (akteur === "parlament") {
            result = await pool.query(`
                SELECT s.titel_kurz_d,
                       s.titel_kurz_f,
                       s.titel_kurz_e,
                       s.vorlagen_id,
                       s.datum,
                       k.kanton_code,
                       COUNT(*) FILTER (
                        WHERE 
                            ((s.parlament_pos = 1 AND k.annahme = true)
                            OR (s.parlament_pos = 2 AND k.annahme = false))
                    ) AS uebereinstimmungen, COUNT(*) AS total
                FROM kanton_ergebnisse k
                         JOIN swissvotes s ON k.vorlagen_id = s.vorlagen_id
                WHERE s.parlament_pos IN (1, 2)
                GROUP BY k.kanton_code, s.titel_kurz_d, s.titel_kurz_f, s.titel_kurz_e, s.vorlagen_id, s.datum
            `);
        } else {
            // Treat as party
            result = await pool.query(`
                SELECT s.titel_kurz_d,
                       s.titel_kurz_f,
                       s.titel_kurz_e,
                       s.vorlagen_id,
                       s.datum,
                       k.kanton_code,
                       COUNT(*) FILTER (
                        WHERE 
                            ((e.empfehlung = 'Ja' AND k.annahme = true)
                            OR (e.empfehlung = 'Nein' AND k.annahme = false))
                    ) AS uebereinstimmungen, COUNT(*) AS total
                FROM kanton_ergebnisse k
                         JOIN swissvotes s ON k.vorlagen_id = s.vorlagen_id
                         JOIN partei_empfehlungen e ON e.vorlagen_id = s.vorlagen_id
                WHERE e.partei_code = $1
                  AND e.empfehlung IN ('Ja', 'Nein')
                GROUP BY k.kanton_code, s.titel_kurz_d, s.titel_kurz_f, s.titel_kurz_e, s.vorlagen_id, s.datum
            `, [akteur]);
        }

        res.json(result.rows);
    } catch (error) {
        console.error("Fehler bei kantonaler Repräsentationsanalyse:", error);
        res.status(500).json({message: "Interner Serverfehler"});
    }
});
/**
 * Trends in representation over time (by year) , for future diagrams
 */
app.get("/api/diagram/trends-repraesentation", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT EXTRACT(YEAR FROM s.datum) AS jahr,
                   'bundesrat'                AS akteur,
                   COUNT(*)                      FILTER (
                    WHERE ( (s.bundesrat_pos = 1 AND s.annahme = true)
                         OR (s.bundesrat_pos = 2 AND s.annahme = false) )
                ) AS uebereinstimmungen, COUNT(*) AS total
            FROM swissvotes s
            WHERE s.bundesrat_pos IN (1, 2)
            GROUP BY jahr

            UNION ALL

            SELECT EXTRACT(YEAR FROM s.datum) AS jahr,
                   e.partei_code              AS akteur,
                   COUNT(*)                      FILTER (
                    WHERE ( (e.empfehlung = 'Ja' AND s.annahme = true)
                         OR (e.empfehlung = 'Nein' AND s.annahme = false) )
                ) AS uebereinstimmungen, COUNT(*) AS total
            FROM partei_empfehlungen e
                     JOIN swissvotes s ON s.vorlagen_id = e.vorlagen_id
            WHERE e.empfehlung IN ('Ja', 'Nein')
            GROUP BY jahr, e.partei_code
            ORDER BY jahr, akteur;
        `);

        res.json(result.rows);
    } catch (error) {
        console.error("Fehler bei Trends-Repräsentationsanalyse:", error);
        res.status(500).json({message: "Interner Serverfehler"});
    }
});
/**
 * Thematic analysis of votes and actor recommendations.
 * Groups votes by topic (oberkategorie) and returns all recommendations and outcomes.
 * For future visualizations
 */
app.get("/api/diagram/themenanalyse", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT s.vorlagen_id,
                   t.oberkategorie                                                                  AS thema,
                   s.annahme,
                   CASE s.bundesrat_pos
                       WHEN 1 THEN 'Ja'
                       WHEN 2 THEN 'Nein'
                       WHEN 3 THEN 'Keine Parole'
                       WHEN 5 THEN 'Freigabe'
                       ELSE 'Unklar'
                       END                                                                          AS bundesrat_pos,
                   CASE s.parlament_pos
                       WHEN 1 THEN 'Ja'
                       WHEN 2 THEN 'Nein'
                       WHEN 3 THEN 'Keine Parole'
                       WHEN 5 THEN 'Freigabe'
                       ELSE 'Unklar'
                       END                                                                          AS parlament_pos,
                   json_agg(json_build_object('partei', e.partei_code, 'empfehlung',
                                              e.empfehlung))                                        AS partei_empfehlungen
            FROM swissvotes s
                     JOIN abstimmung_themen t ON s.vorlagen_id = t.vorlagen_id
                     LEFT JOIN partei_empfehlungen e ON s.vorlagen_id = e.vorlagen_id
            GROUP BY s.vorlagen_id, t.oberkategorie, s.annahme, s.bundesrat_pos, s.parlament_pos
            ORDER BY t.oberkategorie, s.datum;
        `);

        res.json(result.rows);
    } catch (error) {
        console.error("Fehler bei Themenanalyse:", error);
        res.status(500).json({message: "Interner Serverfehler"});
    }
});
app.use(((req: Request, res: Response, next: NextFunction) => {
    if (req.method !== 'GET' && req.path.startsWith('/api/')) {
        return res.status(405).json({message: 'Method Not Allowed'});
    }
    next();
}) as express.RequestHandler);

app.use((req, res, next) => {
    res.status(404).json({message: "Route not found"});
});

export {app};

