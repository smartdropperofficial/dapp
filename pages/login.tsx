import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Card from '../components/UI/Card';
import { useAccount } from 'wagmi';
import { SessionExt } from '../types/SessionExt';
import { useSession } from 'next-auth/react';
import Cookies from 'js-cookie';
import React from 'react';

function Login() {
    const { address, isConnected } = useAccount();
    const { data: session } = useSession() as { data: SessionExt | null };
    const router = useRouter();

    const logout = async () => {
        // Remove stored tokens
        Cookies.remove('next-auth.session-token');
        Cookies.remove('next-auth.callback-url');
        Cookies.remove('next-auth.csrf-token');
    };

    useEffect(() => {
        if (!address) {
            logout();
        }
    }, [address]);

    useEffect(() => {
        if (address && isConnected && session?.address === address) {
            console.log('🚀 ~ useEffect ~ session:', session);
            console.log('🚀 ~ useEffect ~ isConnected:', isConnected);
            console.log('address:', address);
            router.push('/');
        }
    }, [address, isConnected, router, session]);

    return (
        <div>
            <div className="container h-100 d-flex justify-content-center align-items-center">
                <div className="row w-100 justify-content-center">
                    <div className="col-lg-6 px-0 px-lg-3">
                        <Card>
                            <span className="d-flex justify-content-center align-items-center p-4 p-lg-0">
                                Connect your wallet
                            </span>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;
