
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { ProductForm } from '@/components/products/ProductForm';

// Mock the useProductForm hook
vi.mock('@/components/products/useProductForm', () => ({
  useProductForm: vi.fn(() => ({
    newSize: '',
    setNewSize: vi.fn(),
    handleAddSize: vi.fn(),
    handleRemoveSize: vi.fn(),
    handleDragEnd: vi.fn(),
  })),
}));

describe('ProductForm Component', () => {
  const defaultProps = {
    onSubmit: vi.fn(),
    name: 'Test Product',
    setName: vi.fn(),
    basePrice: '10.00',
    setBasePrice: vi.fn(),
    salePrice: '20.00',
    setSalePrice: vi.fn(),
    selectedProduct: null,
    sizes: [],
    setSizes: vi.fn(),
    setInitialQuantity: vi.fn(),
    quantity: '5',
    setQuantity: vi.fn(),
    quantities: {},
    setQuantities: vi.fn(),
  };

  test('renders the form with correct inputs', () => {
    render(<ProductForm {...defaultProps} />);
    
    // Check for input fields
    expect(screen.getByLabelText('Nome do Produto')).toHaveValue('Test Product');
    expect(screen.getByLabelText('Valor Base')).toHaveValue(10);
    expect(screen.getByLabelText('Valor de Venda')).toHaveValue(20);
    
    // Check for the submit button
    expect(screen.getByRole('button', { name: 'Adicionar Produto' })).toBeInTheDocument();
  });

  test('shows quantity input when no sizes are provided', () => {
    render(<ProductForm {...defaultProps} />);
    
    expect(screen.getByLabelText('Quantidade em Estoque Atual')).toBeInTheDocument();
    expect(screen.getByLabelText('Quantidade em Estoque Atual')).toHaveValue(5);
  });

  test('does not show quantity input when sizes are provided', () => {
    render(<ProductForm {...defaultProps} sizes={['P', 'M', 'G']} />);
    
    expect(screen.queryByLabelText('Quantidade em Estoque Atual')).not.toBeInTheDocument();
  });

  test('calls onSubmit when form is submitted', async () => {
    render(<ProductForm {...defaultProps} />);
    
    fireEvent.submit(screen.getByRole('form'));
    
    expect(defaultProps.onSubmit).toHaveBeenCalled();
  });

  test('shows update button when editing existing product', () => {
    const selectedProduct = { id: '1', name: 'Existing Product' };
    render(<ProductForm {...defaultProps, selectedProduct} />);
    
    expect(screen.getByRole('button', { name: 'Atualizar Produto' })).toBeInTheDocument();
  });
});
