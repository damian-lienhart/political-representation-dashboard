import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config({ path: `.env.${process.env.NODE_ENV || 'development'}` });

export const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});
