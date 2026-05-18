const API_BASE = '/api';

import { User, LoginCredentials, PinCredentials, AuthResponse } from './types';

export async function loginWithEmail(credentials: LoginCredentials): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
    credentials: 'include',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Login failed');
  }
  const data = await response.json();
  return {
    access_token: '',
    refresh_token: '',
    user: { id: data.id, login: data.login, name: data.login, email: data.email },
  };
}

export async function loginWithPin(credentials: PinCredentials): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE}/login-pin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
    credentials: 'include',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'PIN login failed');
  }
  const data = await response.json();
  return {
    access_token: '',
    refresh_token: '',
    user: { id: data.id, login: data.login, name: data.login, email: data.email },
  };
}

export async function getMe(): Promise<{ user: User }> {
  const response = await fetch(`${API_BASE}/me`, {
    method: 'GET',
    credentials: 'include',
  });
  if (!response.ok) throw new Error('Not authenticated');
  const data = await response.json();
  return {
    user: { id: data.id, login: data.login, name: data.login, email: data.email },
  };
}

export async function logout(): Promise<void> {
  await fetch(`${API_BASE}/logout`, {
    method: 'POST',
    credentials: 'include',
  });
}

export async function refreshToken(): Promise<void> {
  const response = await fetch(`${API_BASE}/refresh`, {
    method: 'POST',
    credentials: 'include',
  });
  if (!response.ok) throw new Error('Refresh failed');
}
