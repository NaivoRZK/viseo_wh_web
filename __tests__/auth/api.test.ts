import { loginWithEmail, loginWithPin, logout } from '../../lib/auth/api';

global.fetch = jest.fn();

describe('Auth API', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  it('loginWithEmail returns data on success', async () => {
    const apiResponse = { id: 1, login: 'test@test.com', email: 'test@test.com' };
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(apiResponse),
    });

    const result = await loginWithEmail({ login: 'test@test.com', password: 'pass' });
    expect(result).toEqual({
      access_token: '',
      refresh_token: '',
      user: { id: 1, login: 'test@test.com', name: 'test@test.com', email: 'test@test.com' },
    });
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
    const apiResponse = { id: 2, login: 'user', email: 'user@test.com' };
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(apiResponse),
    });

    const result = await loginWithPin({ pin: '1234' });
    expect(result).toEqual({
      access_token: '',
      refresh_token: '',
      user: { id: 2, login: 'user', name: 'user', email: 'user@test.com' },
    });
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
