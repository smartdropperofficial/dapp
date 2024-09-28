import { useState, useEffect, ReactNode } from 'react';
import Loading from '@/components/UI/Loading';
import ModalOverlay from '@/components/UI/ModalOverlay';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useAccount, useDisconnect } from 'wagmi';
import { SessionExt } from '@/types/SessionExt';

const SessionGuard = ({ children }: { children: ReactNode }) => {
    const { status: sessionStatus } = useSession();
    const { address, isConnected } = useAccount();
    const { disconnect } = useDisconnect();
    const router = useRouter();
    const { data: session }: { data: SessionExt | null } = useSession() as { data: SessionExt | null };

    const [loading, setLoading] = useState(true);

    // Definisci i percorsi pubblici, inclusi i pattern delle rotte dinamiche
    const publicPaths = [
        '/login',
        '/link-email',
        /^\/order\/[^/]+\/order-details$/, // Regex per la rotta dinamica
    ];

    useEffect(() => {
        const handleStart = (url: string) => {
            setLoading(true);
        };

        const handleComplete = (url: string) => {
            setLoading(false);
        };

        router.events.on('routeChangeStart', handleStart);
        router.events.on('routeChangeComplete', handleComplete);
        router.events.on('routeChangeError', handleComplete);

        return () => {
            router.events.off('routeChangeStart', handleStart);
            router.events.off('routeChangeComplete', handleComplete);
            router.events.off('routeChangeError', handleComplete);
        };
    }, [router]);

    useEffect(() => {
        if (sessionStatus === 'loading') {
            return;
        }

        // Funzione per verificare se l'URL corrente corrisponde a un percorso pubblico
        const isPublicPath = publicPaths.some(path => {
            if (typeof path === 'string') {
                return path === router.pathname;
            } else if (path instanceof RegExp) {
                return path.test(router.asPath);
            }
            return false;
        });

        if (isPublicPath) {
            setLoading(false);
            return;
        }

        if (!isConnected || !address) {
            router.replace('/login');
        } else if (session && session.verified === false) {
            router.replace('/link-email');
        } else {
            setLoading(false);
        }
    }, [sessionStatus, session, isConnected, address, router.pathname, router.asPath]);

    if (loading) {
        return (
            <ModalOverlay show={true}>
                <Loading dark={true} />
            </ModalOverlay>
        );
    }

    return <>{children}</>;
};

export default SessionGuard;
