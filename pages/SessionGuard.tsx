import Loading from '@/components/UI/Loading';
import ModalOverlay from '@/components/UI/ModalOverlay';
import { SessionExt } from '@/types/SessionExt';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { ReactNode, useEffect } from 'react';
import { useAccount, useDisconnect } from 'wagmi';

const SessionGuard = ({ children }: { children: ReactNode }) => {
    const { data: session } = useSession() as { data: SessionExt | null };
    const { address } = useAccount();
    const { disconnect } = useDisconnect();

    const router = useRouter();

    // useEffect(() => {
    //     if (address && session && session?.verified) {
    //         router.push('/link-email');
    //     }
    // }, [status, session, address]);
    useEffect(() => {
        if ((address && session && session?.verified == undefined) || session?.verified === false) {
            router.push('/link-email');
        }
    }, [session, address]);

    useEffect(() => {
        if (!address) {
            disconnect();
            router.push('/login');
        }
    }, [address]);

    if (status === 'loading') {
        return (
            <ModalOverlay show={true}>
                <Loading dark={true} />
            </ModalOverlay>
        ); // Puoi mostrare un loader mentre la sessione si carica
    }

    return <>{children}</>;
};

export default SessionGuard;
