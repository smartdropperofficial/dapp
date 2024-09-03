import { createServer } from 'http';
import { createOrderOnWeb3 } from '../../components/controllers/OrderController';
import fetch, { Response } from 'node-fetch';
import { jest } from '@jest/globals';
import * as actualFetch from 'node-fetch';  // Import directly
import { describe } from 'node:test';
// Mock di fetch
jest.mock('node-fetch', () => {
  const actualFetch = jest.requireActual('node-fetch') as typeof import('node-fetch');



  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => Promise.resolve({ ok: true, status: 200 })),
    Response: actualFetch.Response,
  };
});
const mockedFetch = jest.mocked(fetch);

const server = createServer((req, res) => {
  res.statusCode = 404;
  res.end();
});

describe('createOrderOnWeb3', () => {
  beforeEach(() => {
    mockedFetch.mockClear();
  });

  it('should encrypt data and return true for a successful response', async () => {
    mockedFetch.mockResolvedValueOnce(new Response(undefined, { status: 200 }));

    const result = await createOrderOnWeb3(1, 'yourOrderIdHere');
    expect(result).toBe(true);
  });

  it('should return false if there is an error fetching order', async () => {
    mockedFetch.mockResolvedValueOnce(new Response(undefined, { status: 500 }));

    const result = await createOrderOnWeb3(1, 'nonExistentOrderId');
    expect(result).toBe(false);
  });
});
