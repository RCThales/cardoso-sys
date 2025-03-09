
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { server } from '../../test/mocks/server';
import Inventory from '@/pages/Inventory';
import { supabase } from '@/integrations/supabase/client';
import { vi } from 'vitest';

// Mock the components to isolate the test
vi.mock('@/components/inventory/InventoryTable', () => ({
  InventoryTable: () => <div data-testid="inventory-table">Mocked Inventory Table</div>,
}));

vi.mock('@/components/Navbar', () => ({
  Navbar: () => <div data-testid="navbar">Mocked Navbar</div>,
}));

describe('Inventory Page', () => {
  test('renders the inventory page with correct components', async () => {
    render(<Inventory />);
    
    // Check that main components are rendered
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    expect(screen.getByTestId('inventory-table')).toBeInTheDocument();
    
    // Check for the header text
    expect(screen.getByText('Controle de Estoque')).toBeInTheDocument();
    expect(screen.getByText('Gerencie o estoque de produtos para aluguel')).toBeInTheDocument();
  });
});
