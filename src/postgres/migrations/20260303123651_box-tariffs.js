/**
 * @param {import("knex").Knex} knex
 * @returns {Promise<void>}
 */
export async function up(knex) {
    await knex.schema.createTable("box_tariffs", (table) => {
        table.bigIncrements("id").primary();
        table.date("date").notNullable();

        table.text("warehouse_name").notNullable();
        table.text("geo_name").notNullable();
        table.decimal("box_delivery_coef_expr");

        table.timestamps(true, true);

        table.unique(["date", "warehouse_name"]);
    });
}

/**
 * @param {import("knex").Knex} knex
 * @returns {Promise<void>}
 */
export async function down(knex) {
    await knex.schema.dropTableIfExists("box_tariffs");
}
