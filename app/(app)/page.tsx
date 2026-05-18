'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/context';
import { PageHeader } from '@/components/layout/PageHeader';

export default function Home() {
  const { user, hydrated, logout, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (hydrated && !user) {
      router.push('/login');
    }
  }, [hydrated, user, router]);

  if (!hydrated || !user) return null;

  return (
    <div>
      <PageHeader title="Page d'accueil" />
    </div>
  );
}
