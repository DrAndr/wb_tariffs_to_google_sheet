import cron from "node-cron";
import { updateSheets } from "#services/google-sheet.service.js";
import { importTariffs } from "#services/import-tariffs.js";

export function startCronJob() {
    cron.schedule("0 * * * *", async () => {
        try {
            await importTariffs();
        } catch (e) {
            console.error(`FAILED [fetchBoxTariffs], [saveTariffs] : ${e}`);
        }
    });

    cron.schedule("* * * * *", async () => {
        try {
            await updateSheets();
        } catch (e) {
            console.error(`FAILED [updateSheets] : ${e}`);
        }
    });
}
