import { useSendCode } from '@/hooks/useSendCode';
import { SessionExt } from '@/types/SessionExt';
import { supabase } from '@/utils/supabaseClient';
import { useSession } from 'next-auth/react';
import React, { useContext, useEffect, useState } from 'react';
import { Card, Button } from 'react-bootstrap';
import Swal from 'sweetalert2';
import { SendEmailVerificationCode } from '@/components/controllers/EmailController';
import { ConfigContext } from '@/store/config-context';
import { useAccount } from 'wagmi';
import router from 'next/router';

function MailManagement() {
    const configCtx = useContext(ConfigContext);
    const { address } = useAccount();

    const { data: session }: { data: SessionExt | null } = useSession() as { data: SessionExt | null };
    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState(false);
    const [emailOk, setEmailOk] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');
    const [insertedCode, setInsertedCode] = useState(''); 
    const [time, setTime] = useState(600);
    const [timeLeft, setTimeLeft] = useState(time);

    const { countdownSeconds } = useSendCode(timeLeft, verificationCode, setVerificationCode); 
    const [loading, setLoading] = useState(false);
    const [confirmedCode, setConfirmedCode] = useState(false);
    useEffect(() => {
        // Se il tempo è finito, ferma il countdown
        if (timeLeft === 0) return;
    
        // Imposta un intervallo per decrementare il tempo ogni secondo
        const intervalId = setInterval(() => {
          setTimeLeft((prevTime) => prevTime - 1);
        }, 1000);
    
        // Pulisce l'intervallo quando il componente viene smontato o il tempo cambia
        return () => clearInterval(intervalId);
      }, [timeLeft]);
    
      // Funzione per formattare il tempo in formato MM:SS
      const formatTime = (seconds:number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
      };
    const handleEmailVerification = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (email && emailRegex.test(email)) {
            setEmailError(false);
            return true;
        } else {
            setEmailError(true);
            return false;
        }
    };
    const refreshAuthToken = async () => {
        if (!session) {
            console.error('No session found');
            return;
        }

        const response = await fetch('/api/auth/session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ session }), // Assuming session.token contains the refresh token
        });

        try {
            const data = await response.json();
            if (response.ok) {
                console.log('Token refreshed:', data);
                // Handle the new token here (e.g., set it in cookies or update state)
            } else {
                console.error('Failed to refresh token:', data);
            }
        } catch (error) {
            console.log('🚀 ~ refreshAuthToken ~ error:', error);
        }
    };

    const GoToHomeHandler = async () => {
        const data = await refreshAuthToken();
        window.location.href = '/';
    };
    useEffect(() => {
        if (email) {
            handleEmailVerification(email);
        }
    }, [email]);

    const saveEmaill = async (email: string): Promise<boolean> => {
        if (session?.address && email) {
            const { data, error } = await supabase.from('users').update({ email: email }).eq('wallet_address', session?.address).select();
            return true;
        } else {
            Swal.fire({ icon: 'error', title: 'Please, connect a Wallet!' });
            return false;
        }
    };
    const confirmEmailHandler = async () => {
        if (handleEmailVerification(email)) {
            if (await saveEmaill(email)) {
                generateRandomCode();
                setEmailOk(true);
            }
        }
    };
    const confirmCodeHandler = async () => {
        setLoading(true);

        if (session?.address && verificationCode === insertedCode) {
            const { data, error } = await supabase.from('users').update({ is_verified: true }).eq('wallet_address', session?.address).select();

            if (error) {
                Swal.fire({ title: 'Error', text: error.message });
            } else {
                setConfirmedCode(verificationCode === insertedCode);
                setVerificationCode('');
                // localStorage.removeItem('verificationCode');
            }
        } else {
            Swal.fire({ title: 'No Wallet found on Session', text: 'Contact Support!' });
        }
    };
    const changeMailHandler = () => {
        setEmailOk(false);
        setEmail('');
        setVerificationCode('');
        setInsertedCode('');
    };
    const generateRandomCode = () => { 
        setTimeLeft(time); 
        setVerificationCode(Math.floor(100000 + Math.random() * 900000).toString());
    };
    const sendEmailVerification = async (data: any) => {
        try {
            const response = await SendEmailVerificationCode(data);

            if (response) {
                return true;
            } else {
                return false;
            }
        } catch (error: any) {
            return false;
        }
    };
    useEffect(() => {
        if (verificationCode !== '' && verificationCode !== null && verificationCode !== undefined && emailOk) {
            // Swal.fire({ icon: 'success', title: verificationCode });
            sendEmailVerification({ email: email, code: verificationCode });
        }
    }, [verificationCode, emailOk]);


    // useEffect(() => {
    //     if (!address) {
    //         router.push('/login');
    //     }
    // }, [address]);
    useEffect(() => {
        if (confirmedCode) {
           location.reload();           
        }
    }, [confirmedCode]);

    // useEffect(() => {
    //     if (session?.verified) {
    //         router.push('/');
    //     } else {
    //         router.push('/verify-email');
    //     }
    // }, [session?.verified])

    const RenderEmailVerificationForm = () => {
        return (
            <div className="container my-5 d-flex justify-content-center">
                <Card className="text-center" style={{ maxWidth: '500px' }}>
                    <Card.Body className="d-flex flex-column justify-content-center">
                        <Card.Title as="h2" className="mb-3">
                            <div className="d-flex flex-column">
                                <span> Verify Email</span>
                                <h6> (or Change Email)</h6>
                            </div>
                        </Card.Title>
                        <div>
                            <>Here you can verify or change your email address.</> <br />{' '}
                            <p className="disclaimer mt-3">
                                Email is the only personal data we gather from our customers. We will use this email for all our communications with you. If you
                                can&apos;t find our application received email, please check your spam inbox
                            </p>
                        </div>
                        <input
                            type="email"
                            className="form-control my-2"
                            placeholder="Enter email address"
                            value={email}
                            onChange={e => setEmail(e.target.value.trim())}
                        />
                        <Button className="btn btn-primary my-3" onClick={confirmEmailHandler} disabled={emailError}>
                            Confirm
                        </Button>
                        {emailError && email && <span className="text-danger">Email format error</span>}
                    </Card.Body>
                </Card>
            </div>
        );
    };
    const RenderCodeVerificationForm = () => {
        return (
            <div>
                <div className="container my-5 d-flex justify-content-center">
                    {/* {confirmedCode ? (
                        <RenderMailVerified></RenderMailVerified>
                    ) : ( */}
                    <Card className="text-center" style={{ maxWidth: '500px' }}>
                        <Card.Body className="d-flex flex-column justify-content-center">
                            <Card.Title as="h2" className="mb-3">
                                Verify Code
                            </Card.Title>
                            <div>
                                We have sent a code to your email. Please enter the code below to verify your email address <b>{email}</b>
                            </div>
                            <input
                                type="text"
                                className="form-control my-2"
                                placeholder="Enter code sent to your email"
                                value={insertedCode}
                                onChange={e => setInsertedCode(e.target.value.trim())}
                            />
                            <Button className="btn btn-primary my-3" onClick={confirmCodeHandler} disabled={!verificationCode}>
                                Confirm
                            </Button>
                            <Button className="btn  my-3" onClick={generateRandomCode} disabled={countdownSeconds > 0} style={{ backgroundColor: '#dfdfdf', color: '#000' }}>
                                Resend code {countdownSeconds === 0 ? '' : `in ${formatTime(timeLeft)} minutes`}
                            </Button>
                            <Button className="btn  my-3" onClick={changeMailHandler} style={{ backgroundColor: '#dfdfdf', color: '#000' }}>
                                Change email
                            </Button>
                        </Card.Body>
                    </Card>
                    {/* )} */}
                </div>
            </div>
        );
    };
    const RenderMailVerified = () => {
        return (
            <div className="container my-5 d-flex justify-content-center">
                <Card className="text-center" style={{ maxWidth: '500px' }}>
                    <Card.Body className="d-flex flex-column justify-content-center text-center align-items-center">
                        <Card.Title as="h2" className="mb-3">
                            Email Verified
                        </Card.Title>
                        <div>Your email has been verified. You can now proceed to the next step.</div>
                        <img src="/assets/check.png" width={50} height={50} alt="Order completed" className="my-4" />
                        <div className="d-flex flex-lg-row flex-column justify-content-center align-items-center ">
                            Go to Home page
                            <div onClick={GoToHomeHandler} style={{ cursor: 'pointer' }}>
                                <img src="/icons/arrow-right-circle-fill.svg" width={30} height={30} alt="Order completed" className="primary mx-3" />
                            </div>
                        </div>
                    </Card.Body>
                </Card>
            </div>
        );
    };

    return <div className="container my-5 d-flex justify-content-center">{emailOk ? RenderCodeVerificationForm() : RenderEmailVerificationForm()}</div>;
}

export default MailManagement;
