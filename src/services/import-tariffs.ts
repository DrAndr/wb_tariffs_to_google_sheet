import { fetchBoxTariffs } from "#services/box-tariffs.service.js";
import { tariffsSchema } from "#services/dto/box-tariffs.dto.js";
import { saveTariffs } from "#repositories/box-tariffs-upsert.repository.js";

export async function importTariffs() {
    const raw = await fetchBoxTariffs();
    const data = tariffsSchema.parse(raw);
    await saveTariffs(data);
}
