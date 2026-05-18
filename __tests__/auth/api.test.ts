import { loginWithEmail, loginWithPin, logout } from '../../lib/auth/api';

global.fetch = jest.fn();

describe('Auth API', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  it('loginWithEmail returns data on success', async () => {
    const mockResponse = {
      access_token: 'access123',
      refresh_token: 'refresh123',
      user: { id: 1, login: 'test@test.com', name: 'Test', email: 'test@test.com' },
    };
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const result = await loginWithEmail({ login: 'test@test.com', password: 'pass' });
    expect(result).toEqual(mockResponse);
    expect(fetch).toHaveBeenCalledWith('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ login: 'test@test.com', password: 'pass' }),
      credentials: 'include',
    });
  });

  it('loginWithEmail throws on failure', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: 'Invalid' }),
    });
    await expect(loginWithEmail({ login: 'bad', password: 'bad' })).rejects.toThrow('Invalid');
  });

  it('loginWithPin returns data on success', async () => {
    const mockResponse = {
      access_token: 'access456',
      refresh_token: 'refresh456',
      user: { id: 2, login: 'user', name: 'User', email: 'user@test.com' },
    };
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const result = await loginWithPin({ pin: '1234' });
    expect(result).toEqual(mockResponse);
  });

  it('logout calls logout endpoint', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({ ok: true });
    await logout();
    expect(fetch).toHaveBeenCalledWith('/api/logout', {
      method: 'POST',
      credentials: 'include',
    });
  });
});
