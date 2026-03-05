import knex from "#postgres/knex.js";
import getTodayDate from "#utils/get-today-date.js";
import { TariffsDto } from "#services/dto/box-tariffs.dto.js";

const CHUNK_SIZE = 500; // safe for pg with pool.max = 10

type TariffRow = {
    date: string;
    warehouse_name: string;
    geo_name: string;
    box_delivery_coef_expr: number | null;
};

export async function saveTariffs(data: TariffsDto): Promise<void> {
    const today = getTodayDate();

    const rows: TariffRow[] = data.warehouseList.map((wh) => ({
        date: today,
        warehouse_name: wh.warehouseName,
        geo_name: wh.geoName,
        box_delivery_coef_expr: wh.boxDeliveryCoefExpr,
    }));

    if (!rows.length) return;

    for (let i = 0; i < rows.length; i += CHUNK_SIZE) {
        const chunk = rows.slice(i, i + CHUNK_SIZE);

        await knex("box_tariffs")
            .insert(chunk)
            .onConflict(["date", "warehouse_name"])
            .merge();
    }
}
