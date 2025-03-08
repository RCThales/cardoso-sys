
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { server } from '../../test/mocks/server';
import { rest } from 'msw';
import Products from '@/pages/Products';
import { useToast } from '@/hooks/use-toast';

// Mock the React Query
vi.mock('@tanstack/react-query', async () => {
  const actual = await vi.importActual('@tanstack/react-query');
  return {
    ...actual,
    useQuery: vi.fn(() => ({
      data: [
        {
          id: '1',
          name: 'Test Product',
          product_code: 'TP001',
          base_price: 10,
          sale_price: 20,
          sizes: null
        }
      ],
      refetch: vi.fn(),
      isLoading: false,
    })),
  };
});

// Mock the required components
vi.mock('@/components/Navbar', () => ({
  Navbar: () => <div data-testid="navbar">Mocked Navbar</div>,
}));

vi.mock('@/components/products/ProductCard', () => ({
  ProductCard: ({ product, onEdit, onDelete }) => (
    <div data-testid="product-card">
      {product.name}
      <button onClick={() => onEdit(product)} data-testid="edit-button">Edit</button>
      <button onClick={() => onDelete(product)} data-testid="delete-button">Delete</button>
    </div>
  ),
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: vi.fn().mockReturnValue({
    toast: vi.fn(),
  }),
}));

vi.mock('@/hooks/useProductForm', () => ({
  useProductForm: vi.fn().mockReturnValue({
    isOpen: false,
    toggleProductDialog: vi.fn(),
    selectedProduct: null,
    setSelectedProduct: vi.fn(),
    name: '',
    setName: vi.fn(),
    basePrice: '',
    setBasePrice: vi.fn(),
    salePrice: '',
    setSalePrice: vi.fn(),
    sizes: [],
    setSizes: vi.fn(),
    quantity: '',
    setQuantity: vi.fn(),
    quantities: {},
    setQuantities: vi.fn(),
    handleSubmit: vi.fn(),
    handleEdit: vi.fn(),
  }),
}));

vi.mock('@/services/productService', () => ({
  productService: {
    deleteProduct: vi.fn().mockResolvedValue({}),
  },
}));

describe('Products Page', () => {
  test('renders the products page with products', async () => {
    render(<Products />);
    
    // Check for main components
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    
    // Check for product card
    expect(screen.getByText('Test Product')).toBeInTheDocument();
  });

  test('opens delete dialog when delete button is clicked', async () => {
    render(<Products />);
    
    // Find and click delete button
    const deleteButton = screen.getByTestId('delete-button');
    fireEvent.click(deleteButton);
    
    // Check that dialog opens
    await waitFor(() => {
      expect(screen.getByText('Test Product')).toBeInTheDocument();
    });
  });
});
