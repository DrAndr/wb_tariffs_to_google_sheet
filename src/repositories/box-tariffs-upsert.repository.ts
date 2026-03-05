import knex from "#postgres/knex.js";
import { TariffsDto } from "#services/dto/box-tariffs.dto.js";
import getTodayDate from "#utils/get-today-date.js";

export async function saveTariffs(data: TariffsDto) {
    const today = getTodayDate();

    const rows = data.warehouseList.map((wh) => ({
        // write to DB only useful fields
        date: today,
        warehouse_name: wh.warehouseName,
        geo_name: wh.geoName,
        box_delivery_coef_expr: wh.boxDeliveryCoefExpr,
    }));

    await knex("box_tariffs")
        .insert(rows)
        .onConflict(["date", "warehouse_name"])
        .merge();
}
