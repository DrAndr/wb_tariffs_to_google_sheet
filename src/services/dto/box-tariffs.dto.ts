import { z } from "zod";
import numberFromString from "#utils/number-from-string.js";

export const warehouseSchema = z.object({
    warehouseName: z.string(),
    geoName: z.string(),
    boxDeliveryCoefExpr: numberFromString,
});

export const tariffsSchema = z.object({
    dtNextBox: z
        .string()
        .nullable()
        .transform((v) => (v?.trim() ? v : null)),
    dtTillMax: z
        .string()
        .nullable()
        .transform((v) => (v?.trim() ? v : null)),
    warehouseList: z.array(warehouseSchema),
});

export type TariffsDto = z.infer<typeof tariffsSchema>;
