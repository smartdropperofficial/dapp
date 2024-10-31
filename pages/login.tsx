import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Card from '../components/UI/Card';
import { useAccount } from 'wagmi';
import { SessionExt } from '../types/SessionExt';
import { useSession } from 'next-auth/react';

function Login() {
    const { address } = useAccount();
    const { data: session } = useSession() as { data: SessionExt | null };
    const router = useRouter();
    function decodeFromUrl(encodedData: string) {
        return encodedData.replace(/-/g, '/').replace(/_/g, '+');
    }
    useEffect(() => {
        console.log('login - router- Redirect: ', router.query.redirect);

        if (session && address && router.query.redirect) {
            const redirect = encodeURI(router.query.redirect as string) || '/';
            console.log('🚀 ~ useEffect ~ Redirect to:', redirect);
            const URI = decodeURIComponent(router.query.redirect as string);
            router.push(URI);
        }
    }, [session, address, router.query.redirect]);

    useEffect(() => {
        if (session?.address && address && session?.address === address && router.query.redirect === undefined) {
            router.replace('/');
        }
    }, [address, session, session?.address, router.query.redirect]);

    return (
        <div className="container h-100 d-flex justify-content-center align-items-center">
            <div className="row w-100 justify-content-center">
                <div className="col-lg-6 px-0 px-lg-3">
                    <Card>
                        <h4 className="d-flex justify-content-center align-items-center p-4 p-lg-0">Connect your wallet</h4>
                        <br />
                        <span className=" disclaimer d-flex justify-content-center align-items-center p-4 p-lg-0 text-bg-danger">
                            **( Solve reCAPTCHA above to see the Login Button )
                        </span>
                    </Card>
                </div>
            </div>
        </div>
    );
}

export default Login;
