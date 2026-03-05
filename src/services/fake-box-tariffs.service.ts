import { faker } from "@faker-js/faker";

/**
 * Fake API response generator, can be used for development flow (new
 * implementation or debugging)
 */

interface FakeState {
    currentDate: Date;
}

const state: FakeState = {
    currentDate: new Date("2026-01-01T00:00:00Z"),
};

const warehouses = [
    { geoName: "Краснодар, ул. Красная, дом 15", warehouseName: "Парк" },
    { geoName: "Краснодар, ул. Московска, дом 23", warehouseName: "Кольцевая" },
    { geoName: "Краснодар, ул. Зипповская, дом 43", warehouseName: "Садовый" },
    {
        geoName: "Краснодар, ул. Домбайская, дом 10",
        warehouseName: "Подвальный",
    },
];

function evolveNumber(base: number, volatility = 0.05): number {
    const change = base * volatility * faker.number.float({ min: -1, max: 1 });
    return +(base + change).toFixed(2);
}

export async function fetchFakeBoxTariffs() {
    state.currentDate = new Date(state.currentDate.getTime() + 60 * 60 * 1000);

    const baseCoef = faker.number.int({ min: 80, max: 160 });

    const warehouseList = warehouses.map((w, index) => {
        const dynamicCoef = evolveNumber(baseCoef + index * 5, 0.1);

        return {
            ...w,
            boxDeliveryBase: faker.number
                .float({ min: 30, max: 60 })
                .toFixed(2)
                .toString(),
            boxDeliveryCoefExpr: dynamicCoef.toString(),
            boxDeliveryLiter: faker.number
                .float({ min: 5, max: 15 })
                .toFixed(2)
                .toString(),

            boxDeliveryMarketplaceBase: faker.number
                .float({ min: 25, max: 50 })
                .toFixed(2)
                .toString(),
            boxDeliveryMarketplaceCoefExpr: evolveNumber(dynamicCoef, 0.05)
                .toString()
                .toString(),
            boxDeliveryMarketplaceLiter: faker.number
                .float({ min: 5, max: 15 })
                .toFixed(2)
                .toString(),

            boxStorageBase: faker.number
                .float({ min: 0.1, max: 0.5 })
                .toFixed(2)
                .toString(),
            boxStorageCoefExpr: faker.number
                .int({ min: 100, max: 140 })
                .toString()
                .toString(),
            boxStorageLiter: faker.number
                .float({ min: 0.05, max: 0.2 })
                .toFixed(2)
                .toString(),
        };
    });

    return {
        dtNextBox: state.currentDate.toISOString().split("T")[0],
        dtTillMax: new Date(
            state.currentDate.getTime() + 30 * 24 * 60 * 60 * 1000,
        )
            .toISOString()
            .split("T")[0],
        warehouseList,
    };
}
