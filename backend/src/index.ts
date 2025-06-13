
import { app } from "./app";
import cron from "node-cron";
import { updateDatabase } from './utils/updateDatabase' // the wrapper that calls fetchSwissvotesData
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});


updateDatabase()

// Daily at 04:00 AM server time
cron.schedule('0 */4 * * *', async () => {
    console.log('[CRON] Running daily Swissvotes refresh...')
    await updateDatabase()
})
