
import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import { useInventory } from '@/components/inventory/useInventory';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock the required dependencies
vi.mock('@tanstack/react-query', async () => {
  const actual = await vi.importActual('@tanstack/react-query');
  return {
    ...actual,
    useQuery: vi.fn().mockImplementation((queryKey) => {
      if (queryKey.queryKey[0] === 'inventory') {
        return {
          data: [
            { id: 1, product_id: '1', total_quantity: 10, rented_quantity: 2, size: null },
            { id: 2, product_id: '2', total_quantity: 5, rented_quantity: 1, size: 'M' },
          ],
          isLoading: false,
          refetch: vi.fn(),
        };
      }
      if (queryKey.queryKey[0] === 'products') {
        return {
          data: [
            { id: '1', name: 'Product 1', product_code: 'P001', sizes: null },
            { id: '2', name: 'Product 2', product_code: 'P002', sizes: [{ size: 'M' }] },
          ],
          isLoading: false,
        };
      }
      return { data: null, isLoading: true };
    }),
  };
});

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnValue({ data: null, error: null }),
  },
}));

vi.mock('@/components/ui/use-toast', () => ({
  useToast: vi.fn().mockReturnValue({
    toast: vi.fn(),
  }),
}));

// Helper to wrap the hook in QueryClientProvider
const wrapper = ({ children }) => {
  const queryClient = new QueryClient();
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

describe('useInventory Hook', () => {
  test('initializes with correct default values', () => {
    const { result } = renderHook(() => useInventory(), { wrapper });
    
    expect(result.current.searchTerm).toBe('');
    expect(result.current.sortOrder).toBe('desc');
    expect(result.current.showRented).toBe(false);
    expect(result.current.showAvailable).toBe(false);
    expect(result.current.selectedItem).toBe(null);
    expect(result.current.isUpdating).toBe(false);
  });

  test('updates searchTerm when setSearchTerm is called', () => {
    const { result } = renderHook(() => useInventory(), { wrapper });
    
    act(() => {
      result.current.setSearchTerm('test');
    });
    
    expect(result.current.searchTerm).toBe('test');
  });

  test('updates sortOrder when setSortOrder is called', () => {
    const { result } = renderHook(() => useInventory(), { wrapper });
    
    act(() => {
      result.current.setSortOrder('asc');
    });
    
    expect(result.current.sortOrder).toBe('asc');
  });

  test('sorts sizes correctly', () => {
    const { result } = renderHook(() => useInventory(), { wrapper });
    
    const testItems = [
      { size: 'G' },
      { size: 'M' },
      { size: 'P' },
    ];
    
    const sortedItems = result.current.sortSizes(testItems);
    
    expect(sortedItems[0].size).toBe('P');
    expect(sortedItems[1].size).toBe('M');
    expect(sortedItems[2].size).toBe('G');
  });
});
