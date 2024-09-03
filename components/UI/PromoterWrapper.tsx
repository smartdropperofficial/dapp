import { useEffect, ComponentType, ReactNode } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { SessionExt } from '../../types/SessionExt';
import { useAccount } from 'wagmi';

interface Props {
    children?: ReactNode;
    [key: string]: any;
}

const PromoterGuard = ({ children }: { children?: ReactNode }) => {
    const { address } = useAccount();

    const { data: session } = useSession() as { data: SessionExt | null };
    const router = useRouter();

    if (children && session?.isPromoter && address) {
        return <>{children}</>;
    } else {
        // router.push("/");
    }
    return null;
};

const PromoterWrapper = ({ children }: Props) => {
    return <PromoterGuard>{children}</PromoterGuard>;
};

export default PromoterWrapper;
