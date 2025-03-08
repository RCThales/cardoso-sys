
import { rest } from 'msw';

// Mock data
const mockProducts = [
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
];

const mockInventory = [
  { 
    id: 'inv-1',
    product_id: 'prod-1',
    size: 'P',
    total_quantity: 10,
    rented_quantity: 3
  },
  { 
    id: 'inv-2',
    product_id: 'prod-1',
    size: 'M',
    total_quantity: 8,
    rented_quantity: 2
  },
  { 
    id: 'inv-3',
    product_id: 'prod-2',
    size: null,
    total_quantity: 5,
    rented_quantity: 1
  }
];

// Mock authentication session
const mockSession = {
  user: { 
    id: 'user-1',
    email: 'test@example.com',
  },
  access_token: 'mock-token',
  expires_at: Date.now() + 3600
};

export const handlers = [
  // Mock Supabase Auth
  rest.post('https://jvpmuactwzwncyanqbyb.supabase.co/auth/v1/token', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ session: mockSession }));
  }),
  rest.get('https://jvpmuactwzwncyanqbyb.supabase.co/auth/v1/session', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ session: mockSession }));
  }),
  
  // Mock products endpoint
  rest.get('https://jvpmuactwzwncyanqbyb.supabase.co/rest/v1/products', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockProducts));
  }),
  
  // Mock inventory endpoint
  rest.get('https://jvpmuactwzwncyanqbyb.supabase.co/rest/v1/inventory', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockInventory));
  }),
  
  // Mock any other Supabase endpoints as needed
  rest.post('https://jvpmuactwzwncyanqbyb.supabase.co/rest/v1/*', (req, res, ctx) => {
    return res(ctx.status(201), ctx.json({ status: 'success' }));
  })
];
