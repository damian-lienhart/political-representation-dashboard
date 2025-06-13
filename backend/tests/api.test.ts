import dotenv from 'dotenv';
dotenv.config({ path: '.env.test' });


import { describe, it, expect, beforeAll, afterAll} from 'vitest';
import request from 'supertest';

import { Pool } from 'pg';
import { insertMockSwissvote, clearMockData } from './seedMockData';
import { createTables } from './dbtestSetup';
import { app } from '../src/app';


const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});


async function waitForDatabase(pool: Pool, maxRetries = 10) {
    for (let i = 0; i < maxRetries; i++) {
        try {

            await pool.query('SELECT 1');

            return;
        } catch (err) {

            await new Promise((res) => setTimeout(res, 1000));
        }
    }
    throw new Error('DB not ready after retries');

}

describe('API endpoint tests', () => {
    beforeAll(async () => {
        console.log('[TEST] STEP 1 - waiting for DB...');
        await waitForDatabase(pool);

        console.log('[TEST] STEP 2 - creating tables...');
        await createTables(pool);

        console.log('[TEST] STEP 3 - inserting mock...');
        await insertMockSwissvote(pool);


    });


    afterAll(async () => {
        await clearMockData(pool);
        await pool.end();
    });

    it('GET /api/swissvotes should return 200 and a list', async () => {
        const res = await request(app).get('/api/swissvotes');
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        if (res.body.length > 0) {
            expect(res.body[0]).toHaveProperty('vorlagen_id');
            expect(res.body[0]).toHaveProperty('empfehlungen');
        }
    });

    it('GET /api/diagram/empfehlungen-vs-volk should return valid chart data', async () => {
        const res = await request(app).get('/api/diagram/empfehlungen-vs-volk');
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        if (res.body.length > 0) {
            expect(res.body[0]).toHaveProperty('bundesrat_empfehlung');
            expect(res.body[0]).toHaveProperty('parlament_empfehlung');
            expect(res.body[0]).toHaveProperty('ja_stimmen_prozent');
        }
    });
    describe('Unsupported Methods and Endpoints', () => {
    it('GET /api/unknown should return 404', async () => {
        const res = await request(app).get('/api/unknown');
        expect(res.status).toBe(404);
        expect(res.body).toHaveProperty('message', 'Route not found');
    });
    it('POST /api/swissvotes should return 405 for unsupported method', async () => {
        const res = await request(app).post('/api/diagram/empfehlungen-vs-volk');
        expect(res.status).toBe(405);
    });
    });
});
