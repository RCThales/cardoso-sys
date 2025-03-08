
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { InventoryTable } from '@/components/inventory/InventoryTable';

// Mock the useInventory hook
vi.mock('@/components/inventory/useInventory', () => ({
  useInventory: vi.fn(() => ({
    inventory: [
      { id: 1, product_id: '1', total_quantity: 10, rented_quantity: 2, size: null },
      { id: 2, product_id: '2', total_quantity: 5, rented_quantity: 1, size: 'M' },
      { id: 3, product_id: '2', total_quantity: 8, rented_quantity: 3, size: 'G' },
    ],
    products: [
      { id: '1', name: 'Product 1', product_code: 'P001', sizes: null },
      { id: '2', name: 'Product 2', product_code: 'P002', sizes: [{ size: 'M' }, { size: 'G' }] },
    ],
    isLoading: false,
    searchTerm: '',
    setSearchTerm: vi.fn(),
    sortOrder: 'desc',
    setSortOrder: vi.fn(),
    showRented: false,
    setShowRented: vi.fn(),
    showAvailable: false,
    setShowAvailable: vi.fn(),
    selectedItem: null,
    setSelectedItem: vi.fn(),
    handleUpdateQuantity: vi.fn(),
    isUpdating: false,
    sortSizes: (items) => items,
  })),
}));

// Mock child components
vi.mock('@/components/inventory/InventorySearch', () => ({
  InventorySearch: () => <div data-testid="inventory-search">Search Component</div>,
}));

vi.mock('@/components/inventory/InventoryFilters', () => ({
  InventoryFilters: () => <div data-testid="inventory-filters">Filters Component</div>,
}));

vi.mock('@/components/inventory/SingleSizeInventoryRow', () => ({
  SingleSizeInventoryRow: ({ product }) => (
    <tr data-testid="single-size-row">
      <td>{product.name}</td>
    </tr>
  ),
}));

vi.mock('@/components/inventory/MultiSizeInventoryRow', () => ({
  MultiSizeInventoryRow: ({ product }) => (
    <tr data-testid="multi-size-row">
      <td>{product.name}</td>
    </tr>
  ),
}));

vi.mock('@/components/inventory/InventoryAdjustModal', () => ({
  InventoryAdjustModal: () => <div data-testid="inventory-adjust-modal">Modal</div>,
}));

describe('InventoryTable Component', () => {
  test('renders loading state when data is loading', () => {
    vi.mocked(useInventory).mockReturnValueOnce({
      ...vi.mocked(useInventory)(),
      isLoading: true,
      products: null,
    });
    
    render(<InventoryTable />);
    expect(screen.getByText('Carregando...')).toBeInTheDocument();
  });

  test('renders inventory table with data', () => {
    render(<InventoryTable />);
    
    // Check for search and filters components
    expect(screen.getByTestId('inventory-search')).toBeInTheDocument();
    expect(screen.getByTestId('inventory-filters')).toBeInTheDocument();
    
    // Check for table headers
    expect(screen.getByText('Código')).toBeInTheDocument();
    expect(screen.getByText('Produto')).toBeInTheDocument();
    expect(screen.getByText('Quantidade Total')).toBeInTheDocument();
    expect(screen.getByText('Quantidade Alugada')).toBeInTheDocument();
    expect(screen.getByText('Quantidade Disponível')).toBeInTheDocument();
    expect(screen.getByText('Ações')).toBeInTheDocument();
    
    // Check for product rows
    expect(screen.getByText('Product 1')).toBeInTheDocument();
    expect(screen.getByText('Product 2')).toBeInTheDocument();
  });
});
