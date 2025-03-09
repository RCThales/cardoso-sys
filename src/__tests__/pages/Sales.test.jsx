
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import Sales from '../../pages/Sales';
import { render } from '../../test/utils/test-utils';
import { supabase } from '@/integrations/supabase/client';

// Mock the supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: {
          session: {
            user: { id: 'user-1' },
            access_token: 'test-token',
          },
        },
      }),
      onAuthStateChange: vi.fn(() => ({ 
        data: { subscription: { unsubscribe: vi.fn() } }
      })),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    }),
  },
}));

// Mock the useNavigate hook
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

describe('Sales Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders Sales page with loader initially', () => {
    render(<Sales />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  test('redirects to auth page if no session', async () => {
    // Mock no session
    vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
      data: { session: null },
      error: null,
    });

    const navigateMock = vi.fn();
    vi.mock('react-router-dom', async () => {
      const actual = await vi.importActual('react-router-dom');
      return {
        ...actual,
        useNavigate: () => navigateMock,
      };
    });

    render(<Sales />);
    
    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith('/auth');
    });
  });

  test('renders SalesCalculator component after loading', async () => {
    render(<Sales />);
    
    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
      expect(screen.getByText(/calculadora de vendas/i)).toBeInTheDocument();
    });
  });
});
