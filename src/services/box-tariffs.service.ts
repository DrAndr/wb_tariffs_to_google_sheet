import axios from "axios";
import env from "#config/env/env.js";
import { IBoxTariffs } from "#interfaces/box-tariffs.interface.js";
import { TARIFFS_BOX_BASE_URL } from "#utils/constants.js";
import { retry } from "#utils/retray.js";
import getTodayDate from "#utils/get-today-date.js";

export async function fetchBoxTariffs(): Promise<IBoxTariffs> {
    return retry(
        async () => {
            const response = await axios.get(TARIFFS_BOX_BASE_URL, {
                headers: {
                    Authorization: `Bearer ${env.WB_API_TOKEN}`,
                },
                params: {
                    date: getTodayDate(),
                },
                timeout: 10_000,
            });

            if (!response.data?.response?.data) {
                throw new Error("Invalid WB API response");
            }

            return response.data.response.data;
        },
        {
            retries: 5,
            delayMs: 1000,
        },
    );
}
