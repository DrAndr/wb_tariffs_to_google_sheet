import knex, { migrate, seed } from "#postgres/knex.js";
import { startCronJob } from "#cron/cron.job.js";
import { importTariffs } from "#services/import-tariffs.js";
import { updateSheets } from "#services/google-sheet.service.js";
try {
    await migrate.latest();
    await seed.run();

    console.log("All migrations and seeds have been run");

    await importTariffs();

    await updateSheets();

    startCronJob();
} catch (error) {
    console.error(`App down with error: ${error}`);
}
