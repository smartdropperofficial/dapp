import { SessionExt } from '@/types/SessionExt';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { ReactNode, useEffect } from 'react';
import { useAccount, useDisconnect } from 'wagmi';

const SessionGuard = ({ children }: { children: ReactNode }) => {
    const { data: session, status } = useSession() as { data: SessionExt | null };
    const { address } = useAccount();
    const { disconnect } = useDisconnect();

    const router = useRouter();

    useEffect(() => {
        if (status === 'authenticated' && session?.needsEmail && router.pathname !== '/verify-email') {
            router.push('/link-email');
        }
    }, [status, session, router]);

    useEffect(() => {
        if (!address) {
            disconnect();
            router.push('/login');
        }
    }, [address, router]);

    if (status === 'loading') {
        return <p>Loading...</p>; // Puoi mostrare un loader mentre la sessione si carica
    }

    return <>{children}</>;
};

export default SessionGuard;
