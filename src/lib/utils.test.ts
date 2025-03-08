
import { describe, test, expect } from 'vitest';
import { getAvailableQuantity, calculateTotalPrice } from './utils';

describe('utility functions', () => {
  describe('getAvailableQuantity', () => {
    const inventory = [
      { product_id: 'prod1', size: 'S', total_quantity: 10, rented_quantity: 3 },
      { product_id: 'prod1', size: 'M', total_quantity: 8, rented_quantity: 2 },
      { product_id: 'prod2', size: null, total_quantity: 5, rented_quantity: 1 }
    ];

    test('returns correct quantity for product with size', () => {
      expect(getAvailableQuantity(inventory, 'prod1', 'S')).toBe(7);
      expect(getAvailableQuantity(inventory, 'prod1', 'M')).toBe(6);
    });

    test('returns correct quantity for product without size', () => {
      expect(getAvailableQuantity(inventory, 'prod2')).toBe(4);
    });

    test('returns 0 for product not in inventory', () => {
      expect(getAvailableQuantity(inventory, 'prod3')).toBe(0);
      expect(getAvailableQuantity(inventory, 'prod1', 'L')).toBe(0);
    });
  });

  describe('calculateTotalPrice', () => {
    test('calculates total price without discount', () => {
      expect(calculateTotalPrice(100, 5, 0)).toBe(500);
    });

    test('calculates total price with discount', () => {
      expect(calculateTotalPrice(100, 5, 0.1)).toBe(450);
    });

    test('returns 0 for invalid inputs', () => {
      expect(calculateTotalPrice(100, 0)).toBe(0);
      expect(calculateTotalPrice(100, -1)).toBe(0);
    });
  });
});
