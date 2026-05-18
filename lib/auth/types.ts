export interface User {
  id: number;
  login: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

export interface LoginCredentials {
  login: string;
  password: string;
}

export interface PinCredentials {
  pin: string;
}
