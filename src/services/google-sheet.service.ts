import getTodayDate from "#utils/get-today-date.js";
import { STOCK_COEFS_SPREADSHEET_TITLE } from "#utils/constants.js";
import {
    clearTail,
    getCurrentRowCount,
    getOrCreateSheet,
    getSheetsClient,
    streamSpreadsheetIds,
    streamTariffRows,
    writeRows,
} from "#services/utils/google-sheet.utils.js";
import { sheets_v4 } from "googleapis";
import Sheets = sheets_v4.Sheets;

/**
 * Update sheets one by one, in parts, if there are a lot of tables or data
 *
 * @param sheets Sheets
 * @param spreadsheetId String
 * @param tariffGenerator AsyncGenerator
 */
async function updateOneSheet(
    sheets: Sheets,
    spreadsheetId: string,
    tariffGenerator: () => AsyncGenerator<(string | number)[][], void, unknown>,
): Promise<void> {
    try {
        const headerRowIndex = 1;
        const contentRowIndex = 2;

        const sheet = await getOrCreateSheet(
            sheets,
            spreadsheetId,
            STOCK_COEFS_SPREADSHEET_TITLE,
        );
        const sheetId = sheet.properties?.sheetId ?? null;

        const prevRowCount = await getCurrentRowCount(sheets, spreadsheetId);

        const headerRow = [
            [
                "Название склада",
                "Адрес склада",
                "Коефициент на доставку",
                "Обновлен",
            ],
        ];
        // write data after header
        await writeRows(sheets, spreadsheetId, headerRowIndex, headerRow);

        let nextRow = contentRowIndex; // data starts at row 2, after header
        // tariffGenerator - rows generator, return chunks by 1 to max limit rows
        for await (const chunk of tariffGenerator()) {
            await writeRows(sheets, spreadsheetId, nextRow, chunk);
            nextRow += chunk.length;
        }

        const newRowCount = nextRow - 1; // last written row index

        // Clear old rows after new data
        if (prevRowCount > newRowCount) {
            await clearTail(
                sheets,
                spreadsheetId,
                newRowCount + 1,
                prevRowCount,
            );
        }

        console.log(
            `[updateSheets] Updated : ${spreadsheetId} (${newRowCount - 1} rows)`, // -1 for exclude header row
        );
    } catch (err) {
        console.error(`[updateSheets] ERROR: ${spreadsheetId}:`, err);
    }
}

export async function updateSheets() {
    const sheets = await getSheetsClient();
    const today = getTodayDate();

    // create the generator pointer
    const makeTariffGen = (): AsyncGenerator<
        (string | number)[][],
        void,
        unknown
    > => streamTariffRows(today, 100);

    let total = 0;
    let failed = 0;

    // looping spreadsheets chunks idPage === 1 to max limit of spreadsheet rows
    for await (const idPage of streamSpreadsheetIds()) {
        // looping spreadsheets for update with data
        for (const spreadsheetId of idPage) {
            // makeTariffGen - pass rows generator in to updateOneSheet
            await updateOneSheet(sheets, spreadsheetId, makeTariffGen);
            total++;
        }
    }

    console.log(`[updateSheets] Updated : ${total - failed} of ${total}`);
}
