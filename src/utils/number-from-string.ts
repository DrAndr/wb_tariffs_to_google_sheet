import { z } from "zod";

// TODO update
const numberFromString = z.preprocess((val) => {
    if (val === "-" || val === null || val === undefined) {
        return null;
    }

    if (typeof val === "string") {
        const normalized = val.replace(",", ".").trim();
        const parsed = Number(normalized);
        return isNaN(parsed) ? null : parsed;
    }

    return val;
}, z.number().nullable());
export default numberFromString;
