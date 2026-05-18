'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth/context';
import { useDeviceDetect } from '../../lib/auth/useDeviceDetect';
import { LoginForm } from './LoginForm';
import { PinForm } from './PinForm';
export function AuthContainer() {
  const { loginWithEmail, loginWithPin, error, loading } = useAuth();
  const { isMobile } = useDeviceDetect();
  const router = useRouter();

  const handleEmailLogin = async (data: { login: string; password: string }) => {
    await loginWithEmail(data.login, data.password);
    router.push('/');
  };

  const handlePinLogin = async (data: { pin: string }) => {
    await loginWithPin(data.pin);
    router.push('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Gestion Entrepot
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {isMobile ? 'Sign in with PIN' : 'Sign in with email'}
          </p>
        </div>
        {isMobile ? (
          <PinForm onSubmit={handlePinLogin} error={error} loading={loading} />
        ) : (
          <LoginForm onSubmit={handleEmailLogin} error={error} loading={loading} />
        )}
      </div>
    </div>
  );
}
