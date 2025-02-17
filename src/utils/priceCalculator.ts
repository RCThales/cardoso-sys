type ProductConstants = {
  CONSTANTE_VALOR_ALUGUEL_A: number;
  CONSTANTE_VALOR_ALUGUEL_B: number;
  SPECIAL_RATES: Record<number, number>;
};

const PRODUCT_CONSTANTS: Record<string, ProductConstants> = {
  "muletas-axilares": {
    CONSTANTE_VALOR_ALUGUEL_A: 3.72,
    CONSTANTE_VALOR_ALUGUEL_B: 1.89,
    SPECIAL_RATES: {
      7: 30,
      10: 40,
      15: 50,
      30: 75,
      60: 120,
    },
  },
  "muletas-canadenses": {
    CONSTANTE_VALOR_ALUGUEL_A: 4.2,
    CONSTANTE_VALOR_ALUGUEL_B: 2.1,
    SPECIAL_RATES: {
      7: 35,
      10: 45,
      15: 55,
      30: 80,
      60: 130,
    },
  },
  "botas-ortopedicas": {
    CONSTANTE_VALOR_ALUGUEL_A: 5.15,
    CONSTANTE_VALOR_ALUGUEL_B: 2.45,
    SPECIAL_RATES: {
      7: 35,
      10: 50,
      15: 60,
      30: 90,
      60: 140,
    },
  },
  "sandalias-baruk": {
    CONSTANTE_VALOR_ALUGUEL_A: 3.95,
    CONSTANTE_VALOR_ALUGUEL_B: 1.75,
    SPECIAL_RATES: {
      7: 35,
      10: 35,
      15: 45,
      30: 70,
      60: 110,
    },
  },
  "cadeira-de-rodas": {
    CONSTANTE_VALOR_ALUGUEL_A: 6.8,
    CONSTANTE_VALOR_ALUGUEL_B: 3.2,
    SPECIAL_RATES: {
      7: 35,
      10: 55,
      15: 65,
      30: 100,
      60: 150,
    },
  },
  tipoias: {
    CONSTANTE_VALOR_ALUGUEL_A: 3.5,
    CONSTANTE_VALOR_ALUGUEL_B: 1.65,
    SPECIAL_RATES: {
      7: 35,
      10: 30,
      15: 40,
      30: 60,
      60: 100,
    },
  },
};

export function calculateDailyRate(rentalDays: number, productId: string) {
  const constants = PRODUCT_CONSTANTS[productId];
  const REGRESSION_DISCOUNT = 0.0608;

  return (
    constants.CONSTANTE_VALOR_ALUGUEL_A *
      Math.exp(-REGRESSION_DISCOUNT * rentalDays) +
    constants.CONSTANTE_VALOR_ALUGUEL_B
  );
}

export function roundToNearestHalf(value: number) {
  return Math.round(value * 2) / 2;
}

export function calculateTotalPrice(rentalDays: number, productId: string) {
  const constants = PRODUCT_CONSTANTS[productId];
  const days = Math.max(1, Math.min(365, rentalDays));

  /*
  if (constants.SPECIAL_RATES[days] !== undefined) {
    return constants.SPECIAL_RATES[days];
  }
    */

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

export const getProductConstants = (productId: string) =>
  PRODUCT_CONSTANTS[productId];
