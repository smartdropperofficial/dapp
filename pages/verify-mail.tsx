import { useState, useEffect, ReactNode } from 'react';
import Loading from '@/components/UI/Loading';
import ModalOverlay from '@/components/UI/ModalOverlay';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useAccount, useDisconnect } from 'wagmi';
import { SessionExt } from '@/types/SessionExt';

const SessionGuard = ({ children }: { children: ReactNode }) => {
    const { status: sessionStatus } = useSession();
    const { data: session }: { data: SessionExt | null; status: string } = useSession() as { data: SessionExt | null; status: string };

    const { address, isConnected } = useAccount();
    const { disconnect } = useDisconnect();
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const publicPaths = ['/login', '/link-email'];

    useEffect(() => {
        // Se la sessione è in caricamento, attendi
        if (sessionStatus === 'loading') {
            return;
        }

        // Se siamo su una pagina pubblica, non fare nulla
        if (publicPaths.includes(router.pathname)) {
            setLoading(false);
            return;
        }

        // Caso 1: Utente non connesso tramite wallet
        if (!isConnected || !address) {
            router.replace('/login');
            setLoading(false);
            return;
        }

        // Caso 2: Utente connesso ma email non verificata
        if (session && session.verified === false) {
            router.replace('/link-email');
            setLoading(false);
            return;
        }

        // Caso 3: Wallet non corrisponde a session.address
        if (session && address && session.address !== address) {
            disconnect();
            router.replace('/login');
            setLoading(false);
            return;
        }

        // Caso 4: Tutto ok, consenti l'accesso
        setLoading(false);
    }, [sessionStatus, session, isConnected, address, router.pathname]);

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
