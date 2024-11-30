// Layout.tsx

import { ConnectButton } from '@rainbow-me/rainbowkit';
import Image from 'next/image';
import Link from 'next/link';
import React, { useState, useContext, useEffect, useRef } from 'react'; // Aggiunto useRef qui
import { OrderContext } from '../../store/order-context';
import { useRouter } from 'next/router';
import { SessionExt } from '../../types/SessionExt';
import { getSession, signOut, useSession } from 'next-auth/react';
import { useAccount, useDisconnect } from 'wagmi'; // Assicurati di avere useAccount

import ModalOverlay from './ModalOverlay';
import Loading from './Loading';
import ReCAPTCHA from 'react-google-recaptcha';
import Swal from 'sweetalert2';

const Layout: React.FC<{ children: React.ReactNode }> = props => {
    const orderCtx = useContext(OrderContext);
    const { data: session }: { data: SessionExt | null; status: string } = useSession() as { data: SessionExt | null; status: string };
    const year = new Date().getFullYear();
    const [isMounted, setIsMounted] = useState(false);
    const router = useRouter();
    const [showMenuResp, setShowMenuResp] = useState<boolean>(false);
    const [windowWidth, setWindowWidth] = useState(0);
    const [showReCaptchaBtn, setShowReCaptchaBtn] = useState<boolean>(false);
    const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);

    // ** Stato per la verifica reCAPTCHA **
    const [isHuman, setIsHuman] = useState(false);
    const recaptchaRef = useRef<ReCAPTCHA>(null);

    // ** Ottieni lo stato di connessione del wallet **
    const { address, isConnected } = useAccount();

    useEffect(() => {
        setIsMounted(true);
    }, []);
    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);
    useEffect(() => {
        if (windowWidth < 1388) {
            setShowMenuResp(false);
        }
    }, [windowWidth]);

    // ** Gestisce la verifica reCAPTCHA **
    // const handleCaptchaVerification = (token: string | null) => {
    //     if (token) {
    //         setIsHuman(true);
    //     } else {
    //         setIsHuman(false);
    //     }
    // };
    useEffect(() => {
        console.log(showReCaptchaBtn)
    }, [showReCaptchaBtn])


    return (
        <>
            <div className="d-flex flex-column justify-content-between align-items-between">
                <div className={`menu-resp ${showMenuResp && 'active'}`}>
                    <div className="btn-close-menu sticky-top px-2 " onClick={() => setShowMenuResp(false)}></div>
                    <div className="container">
                        <div className="row justify-content-center">
                            <div className="col-8">
                                <nav>
                                    <ul className="m-0 ps-0 d-flex-column align-items-center">
                                        <li className="d-xl-none">
                                            <Link href="/" legacyBehavior>
                                                <a
                                                    className={`d-flex align-items-center ${isMounted && router.asPath !== '/' && 'text-black'}`}
                                                    onClick={() => {
                                                        setShowMenuResp(false);
                                                        orderCtx.stepsHandler('1');
                                                    }}
                                                >
                                                    <i className="fa-solid fa-cart-shopping me-3"></i>Order now
                                                </a>
                                            </Link>
                                        </li>
                                        <li className="d-xl-none">
                                            <Link href="/subscribe" legacyBehavior>
                                                <a
                                                    className={`d-flex align-items-center ${isMounted && router.asPath !== '/subscribe' && 'text-black'}`}
                                                    onClick={() => {
                                                        setShowMenuResp(false);
                                                    }}
                                                >
                                                    <i className="fa-sharp fa-solid fa-dollar-sign me-3"></i> Subscribe
                                                </a>
                                            </Link>
                                        </li>
                                        <li className="d-xl-none">
                                            <Link href="/my-orders" legacyBehavior>
                                                <a
                                                    className={`d-flex align-items-center ${isMounted && router.asPath !== '/my-orders' && 'text-black'}`}
                                                    onClick={() => {
                                                        setShowMenuResp(false);
                                                    }}
                                                >
                                                    <i className="fa-sharp fa-solid fa-truck-fast me-3"></i> My Orders
                                                </a>
                                            </Link>
                                        </li>
                                        <li className="d-xl-none">
                                            {session && session.isPromoter === true && (
                                                <Link href="/referral" legacyBehavior>
                                                    <a
                                                        className={`d-flex align-items-center  ${session && session.isPromoter === true ? 'text-black' : ''
                                                            }`}
                                                        onClick={() => {
                                                            setShowMenuResp(false);
                                                        }}
                                                        style={{ borderStyle: 'dotted' }}
                                                    >
                                                        Referral
                                                    </a>
                                                </Link>
                                            )}
                                        </li>
                                        <li className="d-xl-none">
                                            <Link href="/settings" legacyBehavior>
                                                <a
                                                    className={`d-flex align-items-center ${isMounted && router.asPath !== '/subscribe' && 'text-black'}`}
                                                    onClick={() => {
                                                        setShowMenuResp(false);
                                                    }}
                                                >
                                                    Settings
                                                </a>
                                            </Link>
                                        </li>

                                        <li className=" d-xl-none d-flex justify-content-center align-items-center">
                                            <a href="https://t.me/SmartDropperOfficial" target="_blank">
                                                <div className="d-flex justify-content-center align-items-center text-black">
                                                    <Image src="/icons/discord.png" alt="discord" width={50} height={50} />
                                                    <b>
                                                        <span className="mx-2" style={{ fontSize: '15px' }}>
                                                            Support
                                                        </span>
                                                    </b>
                                                </div>
                                            </a>
                                        </li>

                                        <li className="d-none d-xl-inline-block fw-bold">
                                            {session && session.isPromoter === true && (
                                                <Link href="/referral" legacyBehavior>
                                                    <a className={`${isMounted}`} style={{ borderStyle: 'dotted' }}>
                                                        Referral
                                                    </a>
                                                </Link>
                                            )}
                                        </li>
                                    </ul>
                                </nav>
                            </div>
                        </div>
                    </div>
                </div>
                <header className="nav">
                    <div className="col-12">
                        <div className="d-flex align-items-center">
                            <div className="col-12 col-xl-12 d-flex justify-content-center justify-content-xl-center">
                                <nav className="nav-menu">
                                    <ul className="d-flex w-100 justify-content-between justify-content-xl-center">
                                        <li className="d-none d-xl-flex justify-content-between align-items-center mx-0">
                                            <Link href="/" legacyBehavior>
                                                <div className="logo-header position-relative w-100">
                                                    <Image src="/icons/SD_icon_orange.svg" width={50} height={50} alt="SmartShopper Logo" />
                                                </div>
                                            </Link>
                                        </li>
                                        <li className="d-none d-xl-inline-block ">
                                            <Link href="/" legacyBehavior>
                                                <a
                                                    className={`${isMounted && router.asPath !== '/' && 'text-black  text-center  '}`}
                                                    onClick={() => {
                                                        orderCtx.stepsHandler('1');
                                                    }}
                                                >
                                                    {' '}
                                                    Order now
                                                </a>
                                            </Link>
                                        </li>
                                        <li className="d-none d-xl-inline-block">
                                            <Link href="/subscribe" legacyBehavior>
                                                <a className={`${isMounted && router.asPath !== '/subscribe' && 'text-black'}`} onClick={() => { }}>
                                                    Subscribe
                                                </a>
                                            </Link>
                                        </li>
                                        <li className="d-none d-xl-inline-block">
                                            <Link href="/my-orders" legacyBehavior>
                                                <a className={`${isMounted && router.asPath !== '/my-orders' && 'text-black  text-center'}`} onClick={() => { }}>
                                                    My Orders
                                                </a>
                                            </Link>
                                        </li>

                                        <li className="d-inline-block d-xl-none mx-3">
                                            <Link href="/" legacyBehavior>
                                                <a className="d-block position-relative w-100 h-100">
                                                    <Image src="/assets/logo-mobile.svg" width={50} height={50} alt="SmartShopper Logo Mobile" />
                                                </a>
                                            </Link>
                                        </li>

                                        {/* <li>
                                            {!isConnected && !showReCaptchaBtn && !isHuman && (<button className='btn btn-primary rounded-3 p-2' onClick={() => setShowReCaptchaBtn(true)}>Connect Wallet</button>)}
                                            {!isConnected && !isHuman && showReCaptchaBtn && (

                                                <ReCAPTCHA
                                                    ref={recaptchaRef}
                                                    sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
                                                    onChange={handleCaptchaVerification}
                                                />
                                            )

                                            }
                                            {(isHuman || isConnected) &&
                                                <ConnectButton showBalance={{ smallScreen: false, largeScreen: false }} />}
                                        </li> */}
                                        <li>
                                            {!isConnected && !isCaptchaVerified && (
                                                <div >
                                                    <ReCAPTCHA
                                                        sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
                                                        onChange={(value) => {
                                                            if (value) {
                                                                setIsCaptchaVerified(true);
                                                                Swal.fire({
                                                                    title: 'Captcha verified!',
                                                                    icon: 'success',
                                                                });
                                                            } else {
                                                                setIsCaptchaVerified(false);
                                                                Swal.fire({
                                                                    title: 'Captcha verified error!',
                                                                    icon: 'error',
                                                                });
                                                            }
                                                        }}
                                                    />
                                                </div>
                                            )}
                                            {!isConnected && isCaptchaVerified && (
                                                <ConnectButton showBalance={{ smallScreen: false, largeScreen: false }} />
                                            )}
                                            {isConnected && (
                                                <ConnectButton showBalance={{ smallScreen: false, largeScreen: false }} />
                                            )}
                                        </li>


                                        <li className="d-none d-xl-inline-block">
                                            <Link href="/settings" legacyBehavior>
                                                <a className={`${isMounted && router.asPath !== '/Settings' && 'text-black  text-center'}`} onClick={() => { }}>
                                                    Settings
                                                </a>
                                            </Link>
                                        </li>
                                        <li className="d-none d-xl-inline-block fw-bold"> {session && session.isPromoter === true && (
                                            <Link href="/referral" legacyBehavior>
                                                <a className={`${isMounted} p-1`} style={{ borderStyle: 'dotted' }}>
                                                    Referral
                                                </a>
                                            </Link>
                                        )}
                                        </li>
                                        <li className="ms-3 d-xl-none">
                                            <button className="btn p-0 open-menu d-xl-none" onClick={() => setShowMenuResp(true)}>
                                                <Image src="/assets/menu.png" alt="SmartShopper Menu Icon" width={40} height={40} />
                                            </button>
                                        </li>
                                    </ul>
                                </nav>
                                <div className="telegram ms-5 d-none d-xl-flex d-flex justify-content-center align-items-center">
                                    <a href="https://t.me/SmartDropperOfficial" target="_blank">
                                        <div className="d-flex justify-content-center align-items-center text-black">
                                            <Image src="/icons/telegram.png" alt="discord" width={50} height={50} />
                                            <b>
                                                <span className="mx-2" style={{ fontSize: '15px' }}>
                                                    Support
                                                </span>
                                            </b>
                                        </div>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>
                <main className="mb-5">{props.children}</main>
                <footer>
                    <div className="container">
                        <div className="row justify-content-between">
                            <div className="col-lg-3 d-flex align-items-center justify-content-center">
                                <Link href="/" legacyBehavior>
                                    <a className="logo-footer d-block  d-flex position-relative w-100 justify-content-center">
                                        <Image src="/logo/SD_log_black.svg" width={306} height={50} alt="SmartShopper Logo Black" priority={false} />
                                    </a>
                                </Link>
                            </div>
                            <div className="col-lg-6 d-flex align-items-center justify-content-center my-4 my-md-0 flex-column">
                                <p className="mb-0">© Smart Dropper LLP </p>
                                <p className="disclaimer"> {year} - All rights Reserved</p>
                                <p className="mb-0 ">124 City Road, EC1V 2NX </p>
                                <p className="mb-0">London, UK </p>
                            </div>
                            <div className="col-lg-3 d-flex align-items-center justify-content-center justify-content-lg-end text-black">
                                <ul className="smartshopper-social list-unstyled text-black d-flex mb-0"></ul>
                            </div>
                        </div>
                    </div>
                </footer>
                <ModalOverlay show={orderCtx.isLoading}>
                    <Loading dark={true} />
                </ModalOverlay>
            </div>
        </>
    );
};

export default Layout;
