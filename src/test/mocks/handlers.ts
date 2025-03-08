
import { rest } from 'msw';

export const handlers = [
  // Mock Supabase authentication
  rest.post('*/auth/v1/token', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        access_token: 'mocked-access-token',
        token_type: 'bearer',
        expires_in: 3600,
        refresh_token: 'mocked-refresh-token',
        user: {
          id: 'mocked-user-id',
          email: 'test@example.com',
        },
      })
    );
  }),

  // Mock Supabase products table
  rest.get('*/rest/v1/products', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        {
          id: '1',
          name: 'Test Product 1',
          product_code: 'TP001',
          base_price: 10.50,
          sale_price: 20.00,
          sizes: null
        },
        {
          id: '2',
          name: 'Test Product 2',
          product_code: 'TP002',
          base_price: 15.00,
          sale_price: 30.00,
          sizes: [
            { size: 'P' },
            { size: 'M' },
            { size: 'G' }
          ]
        }
      ])
    );
  }),

  // Mock Supabase inventory table
  rest.get('*/rest/v1/inventory', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        {
          id: 1,
          product_id: '1',
          total_quantity: 10,
          rented_quantity: 2,
          size: null
        },
        {
          id: 2,
          product_id: '2',
          total_quantity: 5,
          rented_quantity: 1,
          size: 'P'
        },
        {
          id: 3,
          product_id: '2',
          total_quantity: 8,
          rented_quantity: 3,
          size: 'M'
        },
        {
          id: 4,
          product_id: '2',
          total_quantity: 12,
          rented_quantity: 4,
          size: 'G'
        }
      ])
    );
  }),

  // Mock Supabase inventory update
  rest.patch('*/rest/v1/inventory', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({ id: 1, total_quantity: 15 })
    );
  }),

  // Mock Supabase product delete
  rest.delete('*/rest/v1/products', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({ success: true })
    );
  }),
];
