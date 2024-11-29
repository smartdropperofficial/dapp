import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import useWindowSize from 'react-use/lib/useWindowSize';
import Confetti from 'react-confetti';
import { FiCopy } from 'react-icons/fi';
import Card from '../components/UI/Card';
import { supabase } from '../utils/supabaseClient';
import { getSession, GetSessionParams, signOut, useSession } from 'next-auth/react';
import Skeleton from 'react-loading-skeleton';
import usePromoterContract from '../hooks/Contracts/Subscription/customHooks/usePromoterManagement';
import useSubscriptionManagement from '../hooks/Contracts/Subscription/customHooks/useSubscriptionManagement';
import { PromoterModel, SubscriptionManagementModel } from '../hooks/Contracts/Subscription/types';
import { Button, Container, Form } from 'react-bootstrap';
import Swal from 'sweetalert2';
import { useRouter } from 'next/router';
import { useAccount, useDisconnect } from 'wagmi';
import { SessionExt } from '@/types/SessionExt';
import { ConfigContext } from '@/store/config-context';

import { GetServerSideProps } from 'next';
import { withAuth } from '@/withAuth';
import usePromoter from '@/hooks/Database/subscription/usePromoter';
import { formatUnits } from 'ethers/lib/utils.js';
import { ethers } from 'ethers';
import { SubscriptionContext } from '@/store/subscription-context';
import { ReferralCodeGenerator } from '@/utils/utils';
import Image from 'next/image';

const Referral = () => {
    const subContext = useContext(SubscriptionContext);
    const { disconnect } = useDisconnect();

    const { data: session }: { data: SessionExt | null } = useSession() as { data: SessionExt | null };
    // const youtubeChannelRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/(@[a-zA-Z0-9_\-]{1,}|(channel\/|c\/|user\/)?[a-zA-Z0-9_\-]{1,})$/;
    const youtubeChannelRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/(@[a-zA-Z0-9_\-]{1,}|(channel\/|c\/|user\/)?[a-zA-Z0-9_\-]{1,})/;
    const router = useRouter();
    const { addPromoterOnBC, getPromoterOnBC, registerAsPromoterOnBC } = usePromoterContract();
    const { addPromoterOnDB } = usePromoter();

    const { getAllPromotersSubscriptionsOnBC, withdrawPromoterProfitOnBC } = useSubscriptionManagement();
    const { width, height } = useWindowSize();
    const { address } = useAccount();
    const confettiShownRef = useRef(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const [copied, setCopied] = useState(false);
    const [referralcode, setReferralCode] = useState<string | null>(null);
    const [profit, setProfit] = useState<number>(0);
    const [promoterSubscriptions, setPromoterSubscriptions] = useState<SubscriptionManagementModel[]>([]);
    const [promoter, setPromoter] = useState<PromoterModel | null>(null);
    const [isLoadingContract, setIsLoadingContract] = useState(true);
    const [youtubeChannel, setYoutubeChannel] = useState<string>('');
    const [mytext, setMytext] = useState<string>('');
    const [isLoaded, setIsLoaded] = useState<boolean>(false);
    const [isSubscribing, setIsSubscribing] = useState<boolean>(false);
    const [showDashboard, setShowDashboard] = useState<boolean>();
    const [showRegistration, setShowRegistration] = useState<boolean>(false);
    const retryRef = useRef(0); // Ref to track retry attempts
    const inputRef = useRef<HTMLInputElement>(null); // Ref for the input field
    useEffect(() => {
        if (!address) {
            disconnect();
            router.push('/login');
        } else if (address && session?.address && session?.address === address) {
        }
    }, [address, session?.address]);
    useEffect(() => {
        const fetchSubscriptions = async (address: string) => {
            if (!getAllPromotersSubscriptionsOnBC) return;
            try {
                const result = await getAllPromotersSubscriptionsOnBC(address);
                const subs = filterWithdrawnSusbcriptions(result);
                console.log('🚀 ~ fetchSubscriptions ~ subs:', subs);
                setPromoterSubscriptions(subs);
                setIsLoadingContract(false);
            } catch (error) {
                console.error(error);
            }
        };
        if (session?.address && subContext.promoter) {
            fetchSubscriptions(session?.address);
        }
    }, [getAllPromotersSubscriptionsOnBC, session, subContext.promoter]);

    const fetchPromoter = useCallback(
        async (address: string) => {
            if (getPromoterOnBC && address) {
                try {
                    const data: PromoterModel | null = await getPromoterOnBC(address);
                    if (data) {
                        console.log('🚀 ~ data:', data);
                        if (data.referralCode && data.isActive) {
                            setReferralCode(data?.referralCode);
                            setPromoter(data);
                            subContext.setPromoterHandler(data);
                            console.log('subContext Promoter:', subContext.promoter);
                            setIsLoaded(true);
                        } else if (!data.isActive) {
                            // router.push('/Deactivated');
                        }
                    } else {
                        console.log('Promoter not found');
                        if (retryRef.current < 3) {
                            retryRef.current += 1;
                            setTimeout(() => fetchPromoter(address), 2000); // Retry after 2 seconds
                        } else {
                            setIsLoaded(true);
                        }
                    }
                } catch (error) {
                    Swal.fire({ title: 'Error', text: 'Error fetching promoter', icon: 'error' });
                    setIsLoaded(true);
                } finally {
                }
            }
        },
        [getPromoterOnBC, router]
    );
    useEffect(() => {
        if (session?.address) {
            fetchPromoter(session.address);
        }
    }, [session?.address, fetchPromoter]);

    useEffect(() => {
        if (isLoaded) {
            if (subContext.promoter) {
                console.log('promoter:', subContext.promoter);
                setShowDashboard(true);
                setShowRegistration(false);
            } else if (subContext.promoter === null) {
                console.log('No promoter found');
                setShowRegistration(true);
                setShowDashboard(false);
            }
        }
    }, [isLoaded, subContext.promoter, referralcode]);

    const calcPromoterProfit = useCallback(() => {
        promoterSubscriptions.map(item => console.log(item.promoterProfit));
        const tot = promoterSubscriptions.reduce((acc, item) => acc + Number(item.promoterProfit), 0);
        setProfit(tot);
    }, [promoterSubscriptions]);

    const copyToClipboard = () => {
        alert(promoter?.referralCode);
        if (promoter?.referralCode) {
            navigator.clipboard.writeText(promoter.referralCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };
    const filterWithdrawnSusbcriptions = (subscriptions: SubscriptionManagementModel[]): SubscriptionManagementModel[] => {
        return subscriptions?.filter(item => !item.promoterWithdrawn);
    };
    useEffect(() => {
        if (promoter) {
            const confettiShown = localStorage.getItem('confettiShown');
            if (!confettiShown) {
                setShowConfetti(true);
                const timer = setTimeout(() => setShowConfetti(false), 2000);
                localStorage.setItem('confettiShown', 'true'); // Ensure the effect runs only once
                return () => clearTimeout(timer);
            }
        }
    }, [subContext.promoter]);
    // useEffect(() => {
    //     if (!confettiShownRef.current) {
    //         setShowConfetti(true);
    //         confettiShownRef.current = true; // Impedisce che il Confetti riparta
    //         const timer = setTimeout(() => setShowConfetti(false), 2000); // Ferma il Confetti dopo 5 secondi

    //         return () => clearTimeout(timer); // Pulisce il timer
    //     }
    // }, []);

    useEffect(() => {
        calcPromoterProfit();
    }, [calcPromoterProfit, promoterSubscriptions]);

    const subscribeAsPromoterHandler = async () => {
        const referral = ReferralCodeGenerator();
        if ((!session?.address && !address) || !session?.email) {
            Swal.fire({ title: 'Error', text: 'Please, connect a wallet to register!', icon: 'error' });
            return;
        }
        try {
            setIsSubscribing(true);
            const promoterResult: PromoterModel | null = await registerAsPromoterOnBC(referral);
            if (!promoterResult) {
                Swal.fire({ title: 'Error', text: 'Error adding promoter on blockchain', icon: 'error' });
                console.log('🚀 ~ subscribeAsPromoterHandler ~ _promoter:', promoterResult);
                return;
            } else {
                try {
                    addPromoterOnDB(promoterResult.promoterAddress, promoterResult.referralCode); // Add promoter to DB
                    subContext.setPromoterHandler(promoterResult);

                    Swal.fire({
                        title: 'Promoter created successfully!',
                        icon: 'success',
                    });
                } catch (error) {
                    Swal.fire({ title: 'subscribeAsPromoterHandler', text: 'Error adding promoter on Supabase', icon: 'error' });
                    return;
                }
            }
        } catch (error) {
            Swal.fire({ title: 'Error', text: 'Error adding promoter', icon: 'error' });
            console.error(error);
        } finally {
            setIsSubscribing(false);
        }
    };
    const withdrawHandler = async () => {
        if (!session?.address) {
            Swal.fire({ title: 'Error', text: 'Please, connect a wallet to withdraw!', icon: 'error' });
            return;
        }
        try {
            const result = await withdrawPromoterProfitOnBC();
            if (result) {
                Swal.fire({ title: 'Success', text: 'Withdrawal successful!', icon: 'success' });
                setProfit(0);
            } else {
                Swal.fire({ title: 'Error', text: 'Error withdrawing funds. Contact your Smart Dropper referent.', icon: 'error' });
            }
        } catch (error) {
            Swal.fire({ title: 'Error', text: 'Error withdrawing funds', icon: 'error' });
            console.error(error);
        }
    };
    const getSubscriptionType = (type: number): string => {
        return type === 0 ? 'Retailer' : 'Business';
    };
    const getSubscriptionPeriod = (type: number): string => {
        return type === 0 ? 'Monthly' : 'Annual';
    };
    const sendChannel = async () => {
        if (!youtubeChannel || !session?.address) {
            Swal.fire({ title: 'Error', text: 'Please, insert your youtube channel!', icon: 'error' });
            return;
        }
        if (!youtubeChannelRegex.test(youtubeChannel)) {
            Swal.fire({ title: 'Error', text: 'Please, insert a valid YouTube channel URL!', icon: 'error' });
            return;
        }

        try {
            const { data, error } = await supabase.from('users').update({ youtube_channel: youtubeChannel }).eq('wallet_address', session?.address).select();

            if (error) {
                Swal.fire({ title: 'Error', text: 'Error sending channel', icon: 'error' });
            } else {
                Swal.fire({ title: 'Success', text: 'Channel sent!', icon: 'success' });
            }
            setYoutubeChannel('');
        } catch (error) {
            Swal.fire({ title: 'Error', text: 'Error sending channel', icon: 'error' });
            console.error(error);
        }
    };
    const setYoutubeChannelHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
        setYoutubeChannel(e.target.value);
    };
    useEffect(() => {
        console.log('youtubeChannel', youtubeChannel);
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, [youtubeChannel]);

    useEffect(() => {
        if (!address) {
            router.push('/login');
        }
    }, [address, session?.address]);

    function RenderDashboard() {
        return (
            <div className="row w-100 justify-content-center d-flex col-12 col-md-10 m-auto flex-column-reverse flex-lg-row">
                <div className="col-lg-8 p-0">
                    <div className="row">
                        <section className="h-100 d-flex align-items-start justify-content-center  flex-column-reverse  flex-lg-row">
                            <div className="col-12 justify-content-center text-center">
                                <Card>
                                    <section>
                                        {showConfetti && <Confetti width={width / 2} height={height / 2} />}
                                        <div>
                                            <h3>Congratulations!</h3>
                                        </div>
                                        <div>
                                            <p>Now you can successfully refer a friend.</p>
                                        </div>
                                        <div>
                                            Share your referral link to get{' '}
                                            <h5>
                                                <b>{subContext.promoter?.percentage || 0}%</b>
                                            </h5>
                                            off on each <b>$300 Annual Subscription</b>. <br /> <br />
                                            <span data-bs-toggle="tooltip" data-bs-placement="bottom" title="Tooltip on bottom">
                                                * This is valid only for <u>Dropshipping Plan </u>{' '}
                                            </span>
                                            <div className="d-flex flex-column justify-content-center align-items-center">
                                                <br />
                                                <div
                                                    style={{ border: 'dotted' }}
                                                    className="d-flex col-6 m-auto p-3 justify-content-between flex-column flex-lg-row"
                                                >
                                                    <span
                                                        style={{ border: 'none', fontWeight: 'bold', flex: '1' }}
                                                        className="d-flex align-items-center col-12 justify-content-center"
                                                    >
                                                        {subContext.promoter?.referralCode ? subContext.promoter?.referralCode : <Skeleton width={200} />}
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={copyToClipboard}
                                                    style={{ border: 'none', width: 'fit-content' }}
                                                    className="p-2 align-self-center mt-2"
                                                >
                                                    {copied ? 'Copied!' : <FiCopy />}
                                                </button>
                                            </div>
                                        </div>
                                    </section>
                                </Card>
                                {/* <section className="d-flex flex-column mt-4 ">
                                    <Card>
                                        <div className="d-flex flex-column align-items-center ">
                                            <br />
                                            <h4>
                                                {' '}
                                                <b>Are you an INFLUENCER?</b> Work with us!!!{' '}
                                            </h4>
                                            <Image
                                                src="/assets/youtuber.png"
                                                width={250}
                                                height={200}
                                                style={{ objectFit: 'contain' }}
                                                alt="SmartDropper Logo Black"
                                            />
                                            <br />
                                            <h5>
                                                Get up to <b>20%</b>
                                                <span> on each subscription.</span>
                                            </h5>{' '}
                                            <div className="col-12 col-lg-12 d-flex flex-column align-items-center justify-content-center ">
                                                <div className="col-10  d-flex flex-column  align-items-center justify-content-center  ">
                                                    <div className="col-12"></div>
                                                    <span></span>
                                                    <div className="col-10">
                                                        <Form.Control
                                                            ref={inputRef}
                                                            type="text"
                                                            value={youtubeChannel}
                                                            onChange={setYoutubeChannelHandler}
                                                            required
                                                            placeholder="Here you can add or update your Youtube channel!"
                                                            className="mx-lg-2 my-4"
                                                        />
                                                        <button className="btn btn-primary col-lg-6 col-12 " onClick={sendChannel}>
                                                            Send
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="mb-3"></div>
                                        </div>
                                    </Card>
                                </section> */}
                                <section className="mt-5 d-flex table-responsive p-3 " style={{ maxWidth: '100%', backgroundColor: 'white' }}>
                                    <table className="table table-striped table-bordered w-100" style={{ maxWidth: '100%' }}>
                                        <thead>
                                            <tr>
                                                {/* <th scope="col">#</th> */}
                                                <th scope="col">Type</th>
                                                <th scope="col">Period</th>
                                                <th scope="col">Price</th>
                                                <th scope="col">Tx</th>
                                                <th scope="col">Expire</th>
                                                <th scope="col">Profit</th>
                                                <th scope="col">Withdrawn</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {isLoadingContract ? (
                                                <tr>
                                                    <td colSpan={7}>
                                                        <Skeleton height={20} count={6} />
                                                    </td>
                                                </tr>
                                            ) : (
                                                promoterSubscriptions &&
                                                promoterSubscriptions
                                                    .filter(
                                                        sub => sub.subscriptionModel?.subscriptionPeriod === 1 && sub.subscriptionModel?.subscriptionType === 1
                                                    )
                                                    ?.map((sub: SubscriptionManagementModel, index) => (
                                                        <tr key={index}>
                                                            {/* <th scope="row">{index + 1}</th> */}
                                                            <td>{getSubscriptionType(sub?.subscriptionModel?.subscriptionType!)}</td>
                                                            <td>{getSubscriptionPeriod(sub?.subscriptionModel?.subscriptionPeriod!)}</td>
                                                            <td>${sub?.subscriptionModel?.promoPrice}</td>
                                                            <td>
                                                                <a
                                                                    href={`https://polygonscan.com/tx/${sub?.paymentTx}`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                >
                                                                    {sub?.paymentTx?.toString().substring(0, 15) + '....'}
                                                                </a>
                                                            </td>
                                                            <td>{sub?.end}</td>
                                                            <td>${Number(sub?.promoterProfit).toFixed(2)}</td>
                                                            <td className="text-center">{sub?.promoterWithdrawn ? 'YES' : 'NO'}</td>
                                                        </tr>
                                                    ))
                                            )}
                                        </tbody>
                                    </table>
                                </section>
                            </div>
                        </section>
                    </div>
                </div>
                <div className="col-lg-4  mb-lg-0 mb-5">
                    <section className="col-12 h-100 mx-lg-1 sticky-lg-top" style={{ position: 'sticky', top: '0' }}>
                        {promoter === null ? (
                            <></>
                        ) : (
                            <>
                                <Card>
                                    <div className="d-flex justify-content-center flex-column text-center align-items-center ">
                                        <span className="text-center mb-3">
                                            <h5>
                                                {' '}
                                                <b>Withdraw profit</b>
                                            </h5>
                                        </span>
                                        <button
                                            className="btn btn-success col-10 col-lg-12 "
                                            style={{ cursor: 'pointer' }}
                                            disabled={Number(profit) === 0}
                                            onClick={withdrawHandler}
                                        >
                                            <img src="/icons/usdt.svg" alt="usdt" width={30} height={30} />
                                            <div className="d-flex align-items-center justify-content-center w-100">
                                                <span>USDT {Number(profit).toFixed(2)}</span>
                                            </div>
                                        </button>
                                    </div>
                                </Card>
                            </>
                        )}
                    </section>
                </div>
            </div>
        );
    }
    const RenderRegistration = () => {
        return (
            <div className="row w-100 justify-content-center d-flex col-12 m-auto">
                <div className="col-lg-8 p-0">
                    <div className="row">
                        <section className="h-100 d-flex align-items-start justify-content-center flex-column flex-lg-row">
                            <div className="col-12 justify-content-center text-center">
                                <Card>
                                    <Container className="w-75 border-1 rounded-2 border-primary d-flex flex-column">
                                        <h2 className="text-start mb-3">Hello!</h2>
                                        <h3 className="text-start mb-3">Welcome to Referral Program.</h3>
                                        <h5 className="text-start">
                                            Activate your dedicated promoter section independently to manage and promote your activities.
                                        </h5>
                                        <br />
                                        <Button
                                            variant="primary"
                                            type="submit"
                                            className="col-12 my-5 w-75 text-start"
                                            size="sm"
                                            onClick={subscribeAsPromoterHandler}
                                            disabled={isSubscribing}
                                        >
                                            {isSubscribing ? 'Loading...' : 'Activate'}
                                        </Button>
                                    </Container>
                                </Card>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        );
    };
    const RenderSkeleton = () => {
        return (
            <div className="d-flex col-12 flex-column">
                <div className="d-flex col-12 flex-column flex-lg-row">
                    <div className="col-lg-8 col-12 mt-5 mx-lg-3">
                        <Card>
                            <Skeleton height={20} count={5} />
                        </Card>
                    </div>
                    <div className="col-lg-4 col-12 mt-lg-5 mt-3">
                        <Card>
                            <Skeleton height={20} count={5} />
                        </Card>
                    </div>
                </div>
                <div className="d-flex col-12">
                    <div className="col-lg-8 col-12 mt-3 mx-lg-3">
                        <Card>
                            <Skeleton height={10} count={5} />
                        </Card>
                    </div>
                </div>
            </div>
        );
    };
    return (
        <div className="container h-100 d-flex justify-content-center align-items-center">
            {!isLoaded && <RenderSkeleton />}
            {isLoaded && showRegistration ? <RenderRegistration /> : <></>}
            {isLoaded && showDashboard ? <RenderDashboard /> : <></>}
        </div>
    );
};
// export const getServerSideProps: GetServerSideProps = withAuth(async (context) => {

//     return {
//         props: {
//             // Props aggiuntive per il tuo componente
//         },
//     };
// });
export default Referral;
export async function getServerSideProps(context: GetSessionParams | undefined) {

    const session: SessionExt | null = (await getSession(context)) as SessionExt | null;

    console.log("🚀 ~ getServerSideProps ~ session:", session)

    if (session && session.email !== '' && session.verified === true && session.isPromoter === false) {
        return {
            redirect: {
                destination: '/',
                permanent: false,
            },
        };
    }

    return {
        props: {
            session,
        },
    };
}
