import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Card from '../components/UI/Card';
import { useAccount } from 'wagmi';
import { SessionExt } from '../types/SessionExt';
import { useSession } from 'next-auth/react';

function Login() {
  const { address, isConnected } = useAccount();
  const { data: session } = useSession() as { data: SessionExt | null }; 
  const router = useRouter();    

  useEffect(() => {
    console.log("login - router- Redirect: ", router.query.redirect);
    
    if (session && address) {
      const redirect = router.query.redirect || '/';
      console.log("🚀 ~ useEffect ~ Redirect to:", redirect);
      router.push(redirect as string);
    }
  }, [session, address, router.query.redirect]);

  return (
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
  );
}

export default Login;
