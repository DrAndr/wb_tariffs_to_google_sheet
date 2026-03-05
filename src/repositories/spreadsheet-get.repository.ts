import knex from "#postgres/knex.js";
import { ISpreadsheetRow } from "#interfaces/spreadsheet-row.interface.js";
import { DEFAULT_ROWS_LIMIT } from "#utils/constants.js";

export async function getSpreadsheets(
    limit: number = DEFAULT_ROWS_LIMIT,
    offset: number = 0,
): Promise<ISpreadsheetRow[]> {
    return knex("spreadsheets")
        .select("spreadsheet_id")
        .orderBy("spreadsheet_id")
        .limit(limit)
        .offset(offset);
}
