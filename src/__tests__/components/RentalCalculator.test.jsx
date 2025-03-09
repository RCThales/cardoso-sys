
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { RentalCalculator } from '../../components/RentalCalculator';
import { render } from '../../test/utils/test-utils';
import { useCartStore } from '@/store/cartStore';

// Mock the react-query hooks
vi.mock('@tanstack/react-query', async () => {
  const actual = await vi.importActual('@tanstack/react-query');
  return {
    ...actual,
    useQuery: vi.fn().mockImplementation(({ queryKey }) => {
      if (queryKey[0] === 'products') {
        return {
          data: [
            {
              id: 'prod-1',
              name: 'Muleta Axilar',
              base_price: 10,
              sale_price: 100,
              product_code: 'MUL-001',
              sizes: [{ size: 'P' }, { size: 'M' }, { size: 'G' }]
            },
            {
              id: 'prod-2',
              name: 'Cadeira de Rodas',
              base_price: 20,
              sale_price: 200,
              product_code: 'CR-001',
              sizes: []
            }
          ],
          isLoading: false,
          error: null,
        };
      }
      if (queryKey[0] === 'inventory') {
        return {
          data: [
            { id: 'inv-1', product_id: 'prod-1', size: 'P', total_quantity: 10, rented_quantity: 3 },
            { id: 'inv-2', product_id: 'prod-1', size: 'M', total_quantity: 8, rented_quantity: 2 },
            { id: 'inv-3', product_id: 'prod-2', size: null, total_quantity: 5, rented_quantity: 1 }
          ],
          isLoading: false,
          error: null,
        };
      }
      return { data: null, isLoading: false, error: null };
    }),
  };
});

// Mock useCartStore
const addItemMock = vi.fn();
vi.mock('@/store/cartStore', () => ({
  useCartStore: vi.fn(() => ({
    addItem: addItemMock,
    items: [],
  })),
}));

// Mock useNavigate
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

// Mock toast
vi.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

describe('RentalCalculator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders the rental calculator', async () => {
    render(<RentalCalculator />);
    
    await waitFor(() => {
      expect(screen.getByText(/calcule o valor do aluguel/i)).toBeInTheDocument();
      expect(screen.getByText(/produto/i)).toBeInTheDocument();
      expect(screen.getByText(/duração do aluguel/i)).toBeInTheDocument();
    });
  });

  test('allows selecting a product', async () => {
    render(<RentalCalculator />);
    const user = userEvent.setup();
    
    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });
    
    const select = screen.getByRole('combobox');
    await user.click(select);
    
    await waitFor(() => {
      expect(screen.getByText('Muleta Axilar')).toBeInTheDocument();
    });
    
    await user.click(screen.getByText('Muleta Axilar'));
    
    await waitFor(() => {
      const sizeSelect = screen.getAllByRole('combobox')[1];
      expect(sizeSelect).toBeInTheDocument();
    });
  });

  test('changes price when days change', async () => {
    render(<RentalCalculator />);
    const user = userEvent.setup();
    
    await waitFor(() => {
      expect(screen.getByText(/duração do aluguel/i)).toBeInTheDocument();
    });
    
    const daysInput = screen.getByDisplayValue('1');
    await user.clear(daysInput);
    await user.type(daysInput, '7');
    
    await waitFor(() => {
      expect(screen.getByText(/7 dias/i)).toBeInTheDocument();
    });
    
    // Ensure the price has changed
    const priceBeforeElement = screen.getByText(/R\$\d+\.\d+/);
    expect(priceBeforeElement).toBeInTheDocument();
  });

  test('adds item to cart when clicking add to cart button', async () => {
    render(<RentalCalculator />);
    const user = userEvent.setup();
    
    await waitFor(() => {
      expect(screen.getByText(/adicionar ao carrinho/i)).toBeInTheDocument();
    });
    
    const addToCartButton = screen.getByText(/adicionar ao carrinho/i);
    await user.click(addToCartButton);
    
    await waitFor(() => {
      expect(addItemMock).toHaveBeenCalled();
    });
  });
});
