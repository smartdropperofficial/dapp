import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { SessionExt } from '../types/SessionExt';
import LoginForm from './components/LoginForm';
import { Card } from 'react-bootstrap';

function Login() {
    const { data: session, status } = useSession() as { data: SessionExt | null; status: string };
    const router = useRouter();

    useEffect(() => {
        if (status === 'loading') return; // Avoid redirecting until the session is ready

        if (session && router.query.redirect) {
            const redirect = router.query.redirect || '/';
            console.log('🚀 ~ useEffect ~ Redirect to:', redirect);
            router.push(redirect as string);
        }
    }, [session, status, router]);
    useEffect(() => {
        if (session?.id) {
            router.push('/');
        }
    }, [session?.id]);

    return (
        <>
            {!session?.id ? (
                <div className="container h-100 d-flex justify-content-center align-items-center my-3">
                    <div className="row w-100 justify-content-center ">
                        <div className="col-lg-8 px-0 px-lg-3 ">
                            <div className="card border-0">
                                <h4 className="fw-bolder">Sign In / Sign up</h4>
                                <LoginForm />
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <>...loading session {session?.id} </>
            )}
        </>
    );
}

export default Login;
