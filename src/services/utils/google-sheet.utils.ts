import { google, sheets_v4 } from "googleapis";
import env from "#config/env/env.js";
import Schema$Sheet = sheets_v4.Schema$Sheet;
import Sheets = sheets_v4.Sheets;
import {
    DEFAULT_ROWS_LIMIT,
    GOOGLE_SPREADSHEETS_URL,
    STOCK_COEFS_SPREADSHEET_TITLE,
} from "#utils/constants.js";
import { IBoxTariffRow } from "#interfaces/box-tariffs-row.interface.js";
import { getTariffs } from "#repositories/box-tariffs-get.repository.js";
import knex from "#postgres/knex.js";
import { ISpreadsheetRow } from "#interfaces/spreadsheet-row.interface.js";

/** Return google sheets client */
export async function getSheetsClient(): Promise<Sheets> {
    const auth = new google.auth.GoogleAuth({
        keyFile: env.GOOGLE_SERVICE_ACCOUNT_JSON,
        scopes: [GOOGLE_SPREADSHEETS_URL],
    });
    return google.sheets({ version: "v4", auth });
}

/**
 * Get or create sheet list by title
 *
 * @param sheets
 * @param spreadsheetId
 * @param title
 */
export async function getOrCreateSheet(
    sheets: Sheets,
    spreadsheetId: string,
    title: string,
): Promise<Schema$Sheet> {
    const meta = await sheets.spreadsheets.get({ spreadsheetId });
    let sheet = meta.data.sheets?.find((s) => s.properties?.title === title);

    if (!sheet) {
        const createRes = await sheets.spreadsheets.batchUpdate({
            spreadsheetId,
            requestBody: {
                requests: [
                    {
                        addSheet: { properties: { title } },
                    },
                ],
            },
        });

        const newSheetId =
            createRes.data.replies?.[0].addSheet?.properties?.sheetId;
        if (!newSheetId) throw new Error("Failed to create sheet");

        sheet = { properties: { sheetId: newSheetId, title } };
    }

    return sheet;
}

/**
 * AsyncGenerator return mapped spreadsheetsId`s chunk one by one
 *
 * @param limit
 */
export async function* streamSpreadsheetIds(
    limit: number = DEFAULT_ROWS_LIMIT,
) {
    let offset = 0;
    while (true) {
        // get spreadsheet chunk
        const spreadsheets: ISpreadsheetRow[] = await knex("spreadsheets")
            .select("spreadsheet_id")
            .orderBy("spreadsheet_id")
            .limit(limit)
            .offset(offset);

        // have no one row
        if (!spreadsheets.length) break;

        // return mapped chunk
        yield spreadsheets.map((row) => row.spreadsheet_id);

        // last page
        if (spreadsheets.length < limit) break;

        offset += limit;
    }
}

/**
 * AsyncGenerator return mapped rows chunk
 *
 * @param today
 * @param limit
 */
export async function* streamTariffRows(
    today: string,
    limit: number = DEFAULT_ROWS_LIMIT,
): AsyncGenerator<(string | number)[][], void, unknown> {
    let offset = 0;
    while (true) {
        const boxTariffs: IBoxTariffRow[] = await getTariffs(
            today,
            limit,
            offset,
        );

        // break if have no rows
        if (!boxTariffs.length) break;

        // return box tariffs chunk
        yield boxTariffs.map((row: IBoxTariffRow): (string | number)[] => [
            row.warehouse_name,
            row.geo_name,
            row.box_delivery_coef_expr ?? "-",
            row.updated_at.toISOString(),
        ]);
        if (boxTariffs.length < limit) break;
        offset += limit;
    }
}

/**
 * Update spreadsheet with new data
 *
 * @param sheets
 * @param spreadsheetId
 * @param startRow
 * @param rows
 */
export async function writeRows(
    sheets: Sheets,
    spreadsheetId: string,
    startRow: number,
    rows: (string | number)[][],
): Promise<void> {
    if (!rows.length) return;

    sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `'${STOCK_COEFS_SPREADSHEET_TITLE}'!A${startRow}`,
        valueInputOption: "RAW",
        requestBody: { values: rows },
    });
}

/**
 * Delete old rows before update
 *
 * @param sheets
 * @param spreadsheetId
 * @param startRow
 * @param endRow
 */
export async function clearTail(
    sheets: Sheets,
    spreadsheetId: string,
    startRow: number,
    endRow: number,
) {
    if (startRow > endRow) return;
    await sheets.spreadsheets.values.clear({
        spreadsheetId,
        range: `'${STOCK_COEFS_SPREADSHEET_TITLE}'!A${startRow}:M${endRow}`,
    });
}

/**
 * Get the current row count in the sheet
 *
 * @param sheets
 * @param spreadsheetId
 */
export async function getCurrentRowCount(
    sheets: Sheets,
    spreadsheetId: string,
) {
    try {
        const res = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: `'${STOCK_COEFS_SPREADSHEET_TITLE}'!A:A`,
        });
        return res.data.values?.length ?? 0;
    } catch {
        return 0;
    }
}
