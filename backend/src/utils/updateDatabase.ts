import { Client } from 'pg'
import { fetchSwissvotesData } from './fetchSwissvotes'
import dotenv from 'dotenv'

dotenv.config()

export async function updateDatabase() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL
    })

    try {
        await client.connect()
        console.log('[DB UPDATE] Connected to DB')
        await fetchSwissvotesData(client)
    } catch (err) {
        console.error('[DB UPDATE] Error:', err)
    } finally {
        await client.end()
        console.log('[DB UPDATE] Disconnected from DB')
    }
}
