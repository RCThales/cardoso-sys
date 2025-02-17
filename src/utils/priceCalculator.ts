
export function calculateDailyRate(rentalDays: number) {
    const RATE_CONSTANT_A = 3.72;
    const RATE_CONSTANT_B = 1.89;
    const REGRESSION_DISCOUNT = 0.0608;

    return RATE_CONSTANT_A * Math.exp(-REGRESSION_DISCOUNT * rentalDays) + RATE_CONSTANT_B;
}

export function roundToNearestHalf(value: number) {
    return Math.round(value * 2) / 2;
}

export function calculateTotalPrice(rentalDays: number) {
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

    const totalPrice = calculateDailyRate(days) * days;
    return roundToNearestHalf(totalPrice);
}
