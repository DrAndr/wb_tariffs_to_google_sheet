import knex from "#postgres/knex.js";
import { IBoxTariffRow } from "#interfaces/box-tariffs-row.interface.js";

export async function getTariffs(
    date: string,
    limit: number,
    offset: number,
): Promise<IBoxTariffRow[]> {
    return knex<IBoxTariffRow>("box_tariffs")
        .where({ date })
        .limit(limit)
        .offset(offset)
        .orderBy([
            { column: "box_delivery_coef_expr", order: "asc" },
            { column: "warehouse_name", order: "asc" },
        ]);
}
