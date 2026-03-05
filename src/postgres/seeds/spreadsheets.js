import env from "#config/env/env.js";

/**
 * @param {import("knex").Knex} knex
 * @returns {Promise<void>}
 */
export async function seed(knex) {
    const sheetIds = env.GOOGLE_SHEET_IDS.split(",").map((id) => ({ spreadsheet_id: id.trim() }));
    await knex("spreadsheets").insert(sheetIds).onConflict(["spreadsheet_id"]).ignore();
}
