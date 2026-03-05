export interface IBoxTariffRow {
    date: string;
    warehouse_name: string;
    geo_name: string;

    box_delivery_coef_expr: number;
    updated_at: Date;
    box_delivery_base: number;
    box_delivery_liter: number;
    box_delivery_arketplace_base: number;
    box_delivery_marketplace_coef_expr: number;
    box_delivery_marketplace_liter: number;
    box_delivery_marketplace_base: number;
    box_storage_base: number;
    box_storage_coef_expr: number;
    box_storage_liter: number;

    dt_next_box: string;
    dt_till_max: string;
}
