// components/ProtectedRoute.tsx
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { ReactNode, useEffect } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') {
      // While checking session, do nothing
      return;
    }
    if (!session) {
      // If no session, redirect to login
      router.push('/login');
    }
  }, [session, status, router]);

  if (!session) {
    // Optionally render a loading spinner or null while redirecting
    return null;
  }

  // If authenticated, render the protected content
  return <>{children}</>;
}
