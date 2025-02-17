
type ProductConstants = {
    CONSTANTE_VALOR_ALUGUEL_A: number;
    CONSTANTE_VALOR_ALUGUEL_B: number;
};

const PRODUCT_CONSTANTS: Record<string, ProductConstants> = {
    "muletas-axilares": {
        CONSTANTE_VALOR_ALUGUEL_A: 3.72,
        CONSTANTE_VALOR_ALUGUEL_B: 1.89,
    },
    "muletas-canadenses": {
        CONSTANTE_VALOR_ALUGUEL_A: 4.20,
        CONSTANTE_VALOR_ALUGUEL_B: 2.10,
    },
    "botas-ortopedicas": {
        CONSTANTE_VALOR_ALUGUEL_A: 5.15,
        CONSTANTE_VALOR_ALUGUEL_B: 2.45,
    },
    "sandalias-baruk": {
        CONSTANTE_VALOR_ALUGUEL_A: 3.95,
        CONSTANTE_VALOR_ALUGUEL_B: 1.75,
    },
    "cadeira-de-rodas": {
        CONSTANTE_VALOR_ALUGUEL_A: 6.80,
        CONSTANTE_VALOR_ALUGUEL_B: 3.20,
    },
    "tipoias": {
        CONSTANTE_VALOR_ALUGUEL_A: 3.50,
        CONSTANTE_VALOR_ALUGUEL_B: 1.65,
    },
};

export function calculateDailyRate(rentalDays: number, productId: string) {
    const constants = PRODUCT_CONSTANTS[productId];
    const REGRESSION_DISCOUNT = 0.0608;

    return constants.CONSTANTE_VALOR_ALUGUEL_A * Math.exp(-REGRESSION_DISCOUNT * rentalDays) + constants.CONSTANTE_VALOR_ALUGUEL_B;
}

export function roundToNearestHalf(value: number) {
    return Math.round(value * 2) / 2;
}

export function calculateTotalPrice(rentalDays: number, productId: string) {
    const SPECIAL_RATES = {
        10: 40,
        15: 50,
        30: 75,
        60: 120,
    };

    const days = Math.max(1, Math.min(365, rentalDays));

    if (days in SPECIAL_RATES) {
        return SPECIAL_RATES[days as keyof typeof SPECIAL_RATES];
    }

    const totalPrice = calculateDailyRate(days, productId) * days;
    return roundToNearestHalf(totalPrice);
}

export const PRODUCTS = [
    { id: "muletas-axilares", name: "Muletas Axilares" },
    { id: "muletas-canadenses", name: "Muletas Canadenses" },
    { id: "botas-ortopedicas", name: "Botas Ortopédicas" },
    { id: "sandalias-baruk", name: "Sandálias Baruk" },
    { id: "cadeira-de-rodas", name: "Cadeira de Rodas" },
    { id: "tipoias", name: "Tipóias" },
];

export const getProductConstants = (productId: string) => PRODUCT_CONSTANTS[productId];
