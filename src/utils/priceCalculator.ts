type ProductConstants = {
  CONSTANTE_VALOR_ALUGUEL_A: number;
  CONSTANTE_VALOR_ALUGUEL_B: number;
  REGRESSION_DISCOUNT: number; // Cada produto tem seu próprio desconto
  SPECIAL_RATES: Record<number, number>;
};

const PRODUCT_CONSTANTS: Record<string, ProductConstants> = {
  "muletas-axilares": {
    CONSTANTE_VALOR_ALUGUEL_A: 3.72,
    CONSTANTE_VALOR_ALUGUEL_B: 1.89,
    REGRESSION_DISCOUNT: 0.0608, // Valor específico
    SPECIAL_RATES: {
      7: 30,
      10: 40,
      15: 50,
      30: 75,
    },
  },
  "muletas-canadenses": {
    CONSTANTE_VALOR_ALUGUEL_A: 3.72,
    CONSTANTE_VALOR_ALUGUEL_B: 1.89,
    REGRESSION_DISCOUNT: 0.0608, // Valor específico
    SPECIAL_RATES: {
      7: 30,
      10: 40,
      15: 50,
      30: 75,
    },
  },

  andador: {
    CONSTANTE_VALOR_ALUGUEL_A: 7.2,
    CONSTANTE_VALOR_ALUGUEL_B: 2.5,
    REGRESSION_DISCOUNT: 0.09, // Valor específico
    SPECIAL_RATES: {
      5: 35,
      7: 45,
      10: 55,
      15: 65,
      20: 75,
      30: 90,
    },
  },

  "botas-ortopedicas": {
    CONSTANTE_VALOR_ALUGUEL_A: 5.92,
    CONSTANTE_VALOR_ALUGUEL_B: 1.85,
    REGRESSION_DISCOUNT: 0.065, // Valor específico
    SPECIAL_RATES: {
      5: 30,
      7: 40,
      10: 50,
      15: 60,
      20: 70,
      30: 80,
    },
  },
  "sandalias-baruk": {
    CONSTANTE_VALOR_ALUGUEL_A: 3.72,
    CONSTANTE_VALOR_ALUGUEL_B: 1.89,
    REGRESSION_DISCOUNT: 0.0608, // Valor específico
    SPECIAL_RATES: {
      7: 30,
      10: 40,
      15: 50,
      30: 75,
    },
  },
  "cadeira-de-rodas": {
    CONSTANTE_VALOR_ALUGUEL_A: 6.8,
    CONSTANTE_VALOR_ALUGUEL_B: 3.2,
    REGRESSION_DISCOUNT: 0.045, // Valor específico
    SPECIAL_RATES: {
      7: 35,
      10: 55,
      15: 65,
      30: 100,
    },
  },
  "cadeira-de-banho": {
    CONSTANTE_VALOR_ALUGUEL_A: 11.43,
    CONSTANTE_VALOR_ALUGUEL_B: 3.7,
    REGRESSION_DISCOUNT: 0.119, // Valor específico
    SPECIAL_RATES: {
      7: 60,
      15: 85,
      30: 120,
      60: 222,
    },
  },
};

export function calculateDailyRate(rentalDays: number, productId: string) {
  const constants = PRODUCT_CONSTANTS[productId];

  console.log(Math.exp(-constants.REGRESSION_DISCOUNT * rentalDays));
  return (
    constants.CONSTANTE_VALOR_ALUGUEL_A *
      Math.exp(-constants.REGRESSION_DISCOUNT * rentalDays) +
    constants.CONSTANTE_VALOR_ALUGUEL_B
  );
}

export function roundToNearestHalf(value: number) {
  return Math.round(value * 2) / 2;
}

export function calculateTotalPrice(rentalDays: number, productId: string) {
  const constants = PRODUCT_CONSTANTS[productId];
  const days = Math.max(1, Math.min(365, rentalDays));

  if (constants.SPECIAL_RATES[days] !== undefined) {
    return constants.SPECIAL_RATES[days];
  }

  const totalPrice = calculateDailyRate(days, productId) * days;
  return roundToNearestHalf(totalPrice);
}

export const PRODUCTS = [
  { id: "muletas-axilares", name: "Muletas Axilares" },
  { id: "muletas-canadenses", name: "Muletas Canadenses" },
  { id: "andador", name: "Andador" },
  { id: "botas-ortopedicas", name: "Botas Ortopédicas" },
  { id: "sandalias-baruk", name: "Sandálias Baruk" },
  { id: "cadeira-de-rodas", name: "Cadeira de Rodas" },
  { id: "cadeira-de-banho", name: "Cadeira de Banho" },
];

export const getProductConstants = (productId: string) =>
  PRODUCT_CONSTANTS[productId];
