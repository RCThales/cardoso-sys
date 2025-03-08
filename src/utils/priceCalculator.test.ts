
import { describe, test, expect } from 'vitest';
import {
  calculateDailyRate,
  calculateTotalPrice,
  getProductBasePrice,
  roundToNearestHalf
} from './priceCalculator';

describe('priceCalculator utilities', () => {
  describe('calculateDailyRate', () => {
    test('returns base price for first day', () => {
      expect(calculateDailyRate(1, 10)).toBe(10);
    });

    test('applies exponential discount for subsequent days', () => {
      // For day 2, there should be a 9% discount from the base rate
      expect(calculateDailyRate(2, 10)).toBeCloseTo(9.1, 1);
      
      // For day 5, the discount should be higher
      const day5Rate = calculateDailyRate(5, 10);
      expect(day5Rate).toBeLessThan(10);
      expect(day5Rate).toBeGreaterThan(2.6); // Minimum rate (26% of base price)
    });

    test('never goes below minimum daily rate', () => {
      // For a very high day count, should return the minimum rate
      const minRate = 10 * 0.26; // 26% of base price
      expect(calculateDailyRate(100, 10)).toBe(minRate);
    });
  });

  describe('roundToNearestHalf', () => {
    test('rounds to the nearest 0.5', () => {
      expect(roundToNearestHalf(1.2)).toBe(1);
      expect(roundToNearestHalf(1.3)).toBe(1.5);
      expect(roundToNearestHalf(1.7)).toBe(1.5);
      expect(roundToNearestHalf(1.8)).toBe(2);
    });
  });

  describe('calculateTotalPrice', () => {
    test('calculates price for a single day', () => {
      expect(calculateTotalPrice(1, 10)).toBe(10);
    });

    test('calculates cumulative price for multiple days', () => {
      // For 3 days with a base price of 10
      // Day 1: 10
      // Day 2: ~9.1
      // Day 3: ~8.28
      // Total: ~27.38, which might get rounded
      const threeDay = calculateTotalPrice(3, 10);
      expect(threeDay).toBeGreaterThan(25);
      expect(threeDay).toBeLessThan(30);
    });

    test('rounds to the nearest 5 for special day counts', () => {
      // 5 is a special day, so it should round to the nearest 5
      const fiveDay = calculateTotalPrice(5, 10);
      expect(fiveDay % 5).toBe(0);
      
      // 7 is also a special day
      const sevenDay = calculateTotalPrice(7, 10);
      expect(sevenDay % 5).toBe(0);
    });

    test('rounds to the nearest 0.5 for non-special day counts', () => {
      // 4 is not a special day, so it should round to the nearest 0.5
      const fourDay = calculateTotalPrice(4, 10);
      expect(fourDay * 2 % 1).toBe(0); // Check if it's a multiple of 0.5
    });
  });

  describe('getProductBasePrice', () => {
    test('returns base price for a product', () => {
      const products = [
        { id: '1', name: 'Product 1', base_price: 10, sale_price: 100, product_code: 'P1' },
        { id: '2', name: 'Product 2', base_price: 20, sale_price: 200, product_code: 'P2' }
      ];
      
      expect(getProductBasePrice(products, '1')).toBe(10);
      expect(getProductBasePrice(products, '2')).toBe(20);
    });

    test('returns undefined for non-existent product', () => {
      const products = [
        { id: '1', name: 'Product 1', base_price: 10, sale_price: 100, product_code: 'P1' }
      ];
      
      expect(getProductBasePrice(products, '999')).toBeUndefined();
    });
  });
});
