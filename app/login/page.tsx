'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth/context';
import { AuthContainer } from '../../components/auth/AuthContainer';

export default function LoginPage() {
  const { user, hydrated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (hydrated && user) {
      router.push('/');
    }
  }, [hydrated, user, router]);

  if (hydrated && user) return null;

  return <AuthContainer />;
}
