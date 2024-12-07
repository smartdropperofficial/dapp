/* eslint-disable react-hooks/exhaustive-deps */
import { useContext, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { useAccount, useDisconnect } from 'wagmi';
import { getSubscriptionPeriod, isDateExpired } from '@/utils/utils';

import { getSession, GetSessionParams, useSession } from 'next-auth/react';
import { SessionExt } from '@/types/SessionExt';
import Spinner from 'react-bootstrap/Spinner';

import Card from '@/components/UI/Card';
import Link from 'next/link';
import PaySubscription from '@/components/UI/PaySubscription';
import { Alert, AlertTitle } from '@mui/material';
import { SubscriptionPeriod, SubscriptionType } from '@/hooks/Contracts/Subscription/types';
// import useSubscriptionManagement from '@/hooks/Contracts/Subscription/customHooks/useSubscriptionManagement';
import useSubscriptionManagement from '@/hooks/Database/subscription/useSubscription';
import useOrderManagement from '@/hooks/Contracts/Order/customHooks/useOrder';
import { SubscriptionContext } from '@/store/subscription-context';
import LoadSubscripionsPackages from '@/components/subscriptions/subscriptionModels/LoadSubscripionsPackages';
import Skeleton from 'react-loading-skeleton';
import { withAuth } from '@/withAuth';
import { GetServerSideProps } from 'next';

const Subscribe = () => {
    const { getExchangeTax } = useOrderManagement();
    // const { getLastValidSubscription: getLastValidSubscription, getSubscriptionsByAddress } = useSubscriptionManagement();
    const { getLastValidSubscription, getSubscriptionsByAddress } = useSubscriptionManagement();
    const ctx = useContext(SubscriptionContext);
    const [isLoadingContract, setIsLoadingContract] = useState(true);
    const [shouldHydrate, setShouldHydrate] = useState(false);
    const [loadingReferral, setLoadingReferral] = useState(false);

    const router = useRouter();
    // const { isActive, currentSubscription } = useSubscription();
    const { data: session }: { data: SessionExt | null } = useSession() as { data: SessionExt | null };
    const { address } = useAccount();
    const { disconnect } = useDisconnect();
    const [waitForSub, setWaitForSub] = useState<boolean>(true);

    const [isBestChoice, setIsBestChoice] = useState<boolean>(false);

    const FreeSubId = -1;
    const handleChangeReferralCode = (event: React.ChangeEvent<HTMLInputElement>) => {
        ctx.setPromoterReferralHandler(null);
        ctx.setPromoterReferralHandler(event?.target?.value.trim());
    };
    useEffect(() => {
        const handler = setTimeout(() => {
            if (ctx.promoterReferral) {
                ctx.setDebouncedReferralCodeHandler(ctx.promoterReferral!);
            } else {
                ctx.setDebouncedReferralCodeHandler('');
            }
        }, 1000);

        return () => {
            clearTimeout(handler);
        };
    }, [ctx.promoterReferral]);
    useEffect(() => {
        if (session?.address && address && getSubscriptionsByAddress)
            getSubscriptionsByAddress(session?.address).then(data => {
                if (data.length > 0) {
                    console.log('🚀 ~ getAllSubsByAddress ~ data:', data);
                    ctx.setAllSubscriptionsHandler(data);
                }
                setIsLoadingContract(false);
            });
    }, [getSubscriptionsByAddress, session?.address, address]);

    useEffect(() => {
        console.log('🚀 ~ useEffect ~  ctx.selectedPackage?.subscriptionType:', ctx.selectedPackage?.subscriptionType);
        setIsBestChoice(
            ctx.selectedPackage?.subscriptionType === SubscriptionType.BUSINESS && ctx.selectedPackage?.subscriptionPeriod === SubscriptionPeriod.ANNUAL
        );
    }, [ctx.selectedPackage]);
    useEffect(() => {
        if (!isLoadingContract && session?.address && ((ctx.allSubscriptions && ctx.allSubscriptions.length > 0) || address)) {
            setShouldHydrate(true);
        }
    }, [isLoadingContract, session, ctx.allSubscriptions, address]);

    useEffect(() => {
        console.log('🚀 ~ file: subscribe.tsx ~ line 116 ~ useEffect ~ ctx.currentSubscription', ctx.currentSubscription);
        console.log('🚀 ~ useEffect ~ isBestChoice:', isBestChoice);
    }, [isBestChoice]);

    return (
        <>
            {shouldHydrate && (
                <div className="d-flex col-12 row m-auto ">
                    <section className=" h-100 w-100 d-flex align-items-start justify-content-center flex-column flex-xl-row  ">
                        {!address ? (
                            <Card> Connect a wallet</Card>
                        ) : (
                            <>
                                <section className="col-12 col-xl-7 p-0 py-xl-3 mx-xl-1 my-3 ">
                                    <Card>
                                        <section id="pay" className="mt-4">
                                            <section id="subscription-package d-flex justify-content-center align-items-center ">
                                                <>
                                                    <LoadSubscripionsPackages />
                                                    <div className="overlay"></div>
                                                </>
                                            </section>
                                        </section>
                                    </Card>
                                    <section
                                        className="mt-5 d-flex table-responsive p-3 "
                                        style={{ maxWidth: '100%', backgroundColor: 'white', overflowY: 'auto', maxHeight: '500px' }}
                                    >
                                        <table className="table table-striped table-bordered w-100" style={{ maxWidth: '100%' }}>
                                            <thead>
                                                <tr>
                                                    <th scope="col">Id</th>
                                                    <th scope="col">Plan</th>
                                                    <th scope="col">Period</th>
                                                    {/* <th scope="col">Price</th> */}
                                                    <th scope="col">Tx</th>
                                                    <th scope="col">Started</th>
                                                    <th scope="col">End</th>
                                                    <th scope="col">Exprired</th>
                                                    <th scope="col">Spence</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {isLoadingContract ? (
                                                    <tr>
                                                        <td colSpan={7}>
                                                            <Skeleton height={20} count={6} />
                                                        </td>
                                                    </tr>
                                                ) : !isLoadingContract && ctx.allSubscriptions?.length! < 1 ? (
                                                    <tr>
                                                        <td colSpan={8} className="text-center">
                                                            No subscriptions found
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    ctx.allSubscriptions?.map((sub, index) => {
                                                        return (
                                                            <tr key={index}>
                                                                <td>{sub?.id}</td>

                                                                <td>{sub.subscriptionModel?.name}</td>
                                                                <td>{getSubscriptionPeriod(sub?.subscriptionModel?.subscriptionPeriod!)}</td>
                                                                {/* <td>${sub.subscriptionModel?.price.toFixed(2)}</td> */}
                                                                <td>
                                                                    <Link href={`https://polygonscan.com/tx/${sub.paymentTx}`} target="_blank">
                                                                        {sub.paymentTx?.substring(0, 10)}...
                                                                    </Link>
                                                                </td>
                                                                <td>{sub.start}</td>
                                                                <td>{sub.end}</td>
                                                                <td>{isDateExpired(sub.end) ? 'yes' : 'no'}</td>
                                                                <td>{sub?.totShopAmountPaid}</td>
                                                            </tr>
                                                        );
                                                    })
                                                )}
                                            </tbody>
                                        </table>
                                    </section>
                                </section>
                                <section id="payment-details" className="col-12 col-xl-4 h-100  py-xl-3 my-3 mx-xl-1 sticky-lg-top ">
                                    <Card>
                                        <>
                                            {' '}
                                            {ctx.subscriptionsModels.length < 1 ? (
                                                <Skeleton height={20} count={6} />
                                            ) : (
                                                <div className={`row  justify-content-evenly d-flex flex-column align-items-center rounded-2`}>
                                                    <div className="text-center col-8 col-xl-10  ">
                                                        {(isBestChoice && ctx.currentSubscription!) ||
                                                            // && ctx.currentSubscription!.subscriptionModel.id! !== 3
                                                            (isBestChoice && ctx.currentSubscription! === null) ? (
                                                            <div className="circle mx-auto my-0 col-12 col-xl-10  mb-3"> {isBestChoice ? 1 : ''}</div>
                                                        ) : (
                                                            ''
                                                        )}

                                                        {(isBestChoice && ctx.currentSubscription!) ||
                                                            //  && ctx.currentSubscription!.subscriptionModel.id! !== 3
                                                            (isBestChoice && ctx.currentSubscription! === null) ? (
                                                            <>
                                                                <div className="d-flex flex-column justify-content-center align-items-center">
                                                                    <div
                                                                        className="d-flex col-12 mb-1 justify-content-center flex-column rounded-4 p-2"
                                                                        style={{ color: '#fff', backgroundColor: '#ff9900' }}
                                                                    >
                                                                        <div className="d-flex w-100 justify-content-center align-items-center flex-column p-3">
                                                                            <span className="col-12 text-center ">
                                                                                <div
                                                                                    className=" h5 border-1 p-2 text-center d-flex justify-content-between align-items-center flex-column "
                                                                                    style={{ borderStyle: 'dashed' }}
                                                                                >
                                                                                    Pay <div className="px-2 h4"></div>{' '}
                                                                                    <div
                                                                                        className="h1 rounded-3"
                                                                                        style={{
                                                                                            backgroundColor: '#fff',
                                                                                            color: '#494949',
                                                                                            width: '100%',
                                                                                        }}
                                                                                    >
                                                                                        <b>${ctx.selectedPackage?.promoPrice?.toFixed(2)}</b>
                                                                                    </div>
                                                                                    instead
                                                                                    <h4>
                                                                                        {' '}
                                                                                        <b>${ctx.selectedPackage?.price.toFixed(2)}</b>
                                                                                    </h4>{' '}
                                                                                    for a year subscription
                                                                                </div>
                                                                            </span>
                                                                        </div>
                                                                        <div className="d-flex col-12 flex-column">
                                                                            <div className="col-12 p-1">
                                                                                {ctx.promoterReferral !== '' && loadingReferral ? (
                                                                                    <Spinner animation="border" role="status">
                                                                                        <span className="visually-hidden">Loading...</span>
                                                                                    </Spinner>
                                                                                ) : (
                                                                                    <input
                                                                                        type="text"
                                                                                        id="promo-code"
                                                                                        placeholder="Insert code here"
                                                                                        onFocus={e => {
                                                                                            e.target.placeholder = '';
                                                                                        }}
                                                                                        onBlur={e => {
                                                                                            e.target.placeholder = 'Insert code here';
                                                                                        }}
                                                                                        className="col-12 rounded-2 input form-control text-center"
                                                                                        value={ctx.promoterReferral!}
                                                                                        onChange={handleChangeReferralCode}
                                                                                        style={
                                                                                            ctx.promoterReferral === '' ||
                                                                                                ctx.promoterReferral === undefined ||
                                                                                                ctx.promoterReferral === null
                                                                                                ? {
                                                                                                    borderColor: '',
                                                                                                    borderWidth: '',
                                                                                                    backgroundColor: '',
                                                                                                }
                                                                                                : loadingReferral
                                                                                                    ? {
                                                                                                        borderColor: ctx.isReferralCodeApplied ? 'green' : 'red',
                                                                                                        borderWidth: '4px',
                                                                                                        backgroundColor: ctx.isReferralCodeApplied ? '' : 'red',
                                                                                                    }
                                                                                                    : {
                                                                                                        borderColor:
                                                                                                            !ctx.isReferralCodeApplied && !loadingReferral
                                                                                                                ? 'red'
                                                                                                                : 'green',
                                                                                                        borderWidth: '4px',
                                                                                                        backgroundColor:
                                                                                                            !ctx.isReferralCodeApplied && !loadingReferral
                                                                                                                ? ''
                                                                                                                : '#f8d7da',
                                                                                                    }
                                                                                        }
                                                                                    />
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <span style={{ color: ctx.isReferralCodeApplied && !loadingReferral ? 'green' : 'red' }}>
                                                                        {(ctx.promoterReferral === '' ||
                                                                            ctx.promoterReferral === undefined ||
                                                                            ctx.promoterReferral === null) &&
                                                                            !loadingReferral
                                                                            ? ''
                                                                            : (ctx.promoterReferral !== '' ||
                                                                                ctx.promoterReferral !== undefined ||
                                                                                ctx.promoterReferral !== null) &&
                                                                                loadingReferral
                                                                                ? ''
                                                                                : !loadingReferral && !ctx.isReferralCodeApplied
                                                                                    ? 'Referral code not valid!'
                                                                                    : 'Referral code valid!'}
                                                                    </span>
                                                                    {ctx.selectedPackage?.id! > 0 ? (
                                                                        <div
                                                                            style={{
                                                                                width: '2px',
                                                                                height: '100px',
                                                                                backgroundColor: '#5cb85c',
                                                                                padding: '0',
                                                                            }}
                                                                            className=" my-3"
                                                                        ></div>
                                                                    ) : (
                                                                        ''
                                                                    )}
                                                                    <div className="w-100 d-flex justify-content-center align-content-center flex-column">
                                                                        {ctx.selectedPackage?.id! > FreeSubId && (
                                                                            <span
                                                                                className={`circle mx-auto my-0 `}
                                                                                style={{
                                                                                    color: '#5cb85c',
                                                                                    borderColor: '#5cb85c',
                                                                                }}
                                                                            >
                                                                                2
                                                                            </span>
                                                                        )}

                                                                        { }
                                                                        <PaySubscription
                                                                            Package={ctx.selectedPackage!}
                                                                            promoterReferralCode={ctx.debouncedReferralCode}
                                                                            setIsReferralCodeApplied={(subType: boolean) =>
                                                                                ctx.setIsReferralCodeAppliedHandler(subType)
                                                                            }
                                                                            btnStyle={{ backgroundColor: '#00a60c', color: '#fff' }}
                                                                            setLoadingReferral={(isloading: boolean) => setLoadingReferral(isloading)}
                                                                            loadingReferral={loadingReferral}
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <div className={loadingReferral ? 'overlay-payment' : ''}></div>
                                                            </>
                                                        ) : (
                                                            <div>
                                                                <PaySubscription
                                                                    Package={ctx.selectedPackage!}
                                                                    btnStyle={{ backgroundColor: '#00a60c', color: '#fff' }}
                                                                />
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className={`col-12 col-xl-10 text-center `}>
                                                        {/* pay order     */}

                                                        <div className="">
                                                            {ctx.subscriptionsModels.length < 1 ? (
                                                                <Skeleton height={20} count={6} />
                                                            ) : (
                                                                <Alert className="alert-warning">
                                                                    <AlertTitle>
                                                                        Remember, <u>you cannot use multiple coins in a single payment. </u> <br />
                                                                        At least one coin on your wallet must have sufficient credit to cover the whole order
                                                                        amount. Otherwise you will get the error:{' '}
                                                                        <strong className=""> No payment option found!</strong>
                                                                    </AlertTitle>
                                                                    <br />
                                                                    <p className="disclaimer">*You can pay with any Crypto on POLYGON chain like: </p>
                                                                    <div className="disclaimer">*Wrapped BTC</div>
                                                                    <div className="disclaimer">*Wrapped ETH</div>
                                                                    <div className="disclaimer">*MATIC</div>
                                                                    <div className="disclaimer">*USDC</div>
                                                                    <div className="disclaimer">*USDT</div>
                                                                    <div className="disclaimer">*DAI</div>
                                                                </Alert>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    </Card>
                                </section>
                            </>
                        )}
                    </section>
                </div>
            )}
        </>
    );
};

export default Subscribe;
export const getServerSideProps = withAuth(async (context: any, session: any) => {
    return {
        props: {
            session,
        },
    };
});
