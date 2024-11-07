/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { useAccount, useContractReads, useWaitForTransaction } from 'wagmi';
import SmartShopperABI from '../../../utils/abi/SmartShopperABI.json';
import { decryptData, encryptData, FormatedAbi } from '../../../utils/utils';
import { OrderSteps } from '../../../types/OrderSteps';
import { OrderSB } from '../../../types/OrderSB';
import { OrderStatus } from '../../../types/Order';
import { createOrderOnWeb3, getOrder, updateOrder } from '../../../components/controllers/OrderController';
import Swal from 'sweetalert2';
import { getAmountToPay } from '../../../components/controllers/PaymentController';
import { OrderSC } from '../../../types/OrderSC';
import { useSession } from 'next-auth/react';
import { SessionExt } from '../../../types/SessionExt';
// import useSubscription from '../../../hooks/useSubscription';
// import useSubscriptionTypes from '../../../hooks/useSubscriptionTypes';
import Card from '../../../components/UI/Card';
import ItemCard from '../../../components/UI/ItemCard';
import Image from 'next/image';
import Link from 'next/link';
import PaySubscription from '../../../components/UI/PaySubscription';
import ModalOverlay from '../../../components/UI/ModalOverlay';
import Loading from '../../../components/UI/Loading';
import { Alert, AlertTitle } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import { SubscriptionManagementModel, SubscriptionPeriod, SubscriptionType } from '../../../hooks/Contracts/Subscription/types';
import useSubscriptionManagement from '../../../hooks/Contracts/Subscription/customHooks/useSubscriptionManagement';
import useOrderManagement from '@/hooks/Contracts/Order/customHooks/useOrder';
import { SubscriptionContext } from '@/store/subscription-context';
import LoadPackagesCheckout from '@/components/subscriptions/subscriptionModels/LoadPackagesCheckout';
import { ConfigContext } from '@/store/config-context';
import { OrderContext } from '@/store/order-context';
import CoinbaseButton from '@/components/UI/CoinbaseButton';
import Skeleton from 'react-loading-skeleton';
const Checkout = () => {
    const { getExchangeTax } = useOrderManagement();
    const subsContext = useContext(SubscriptionContext);
    const orderContext = useContext(OrderContext);
    const configContext = useContext(ConfigContext);

    const router = useRouter();
    const { encryptedOrderId } = router.query;
    const orderId = decryptData(encryptedOrderId as string);
    // const { isActive, currentSubscription } = useSubscription();
    const { data: session }: { data: SessionExt | null } = useSession() as { data: SessionExt | null };

    const { address } = useAccount();
    const [waitForSub, setWaitForSub] = useState<boolean>(true);
    const [order, setOrder] = useState<OrderSB | null>(null);
    const [fees, setFees] = useState<number>(0);
    const [sspCommissions, setSSPCommissions] = useState<number>();
    const [amountToPay, setAmountToPay] = useState<any>();
    const [paymentTx, setPaymentTx] = useState<`0x${string}`>();
    const [orderStep, setOrderStep] = useState<OrderSteps | null>(null);
    // const [canPay, setCanPay] = useState<boolean>(false);
    const [shippingFees, setShippingFees] = useState<number>();
    const [zincFee, setZincFee] = useState<number>(1);
    const [exchangeFees, setExchangeFees] = useState<number>();
    const [slippage, setSlippage] = useState<number>(0.8);
    const [loadingReferral, setLoadingReferral] = useState(false);
    const [loadingPrices, setLoadingPrices] = useState(true);
    const [isBestChoice, setIsBestChoice] = useState<boolean>(false);
    const showCheckout = useRef<{ isSameWallet: boolean; hasFetchedSC: boolean }>({
        isSameWallet: false,
        hasFetchedSC: false,
    });
    const FreeSubId = -1;
    const isCreatingOrder = useRef(false);
    const handleChangeReferralCode = (event: React.ChangeEvent<HTMLInputElement>) => {
        subsContext.setPromoterReferralHandler(event?.target?.value.trim());
    };
    useEffect(() => {
        console.log('🚀 ~ useEffect ~ subsContext.promoter?.referralCode:', subsContext.promoterReferral);

        if (subsContext.promoterReferral && subsContext.promoter?.referralCode) {
            let handler;

            if (subsContext.promoterReferral === subsContext.promoter?.referralCode) {
                Swal.fire({ title: 'You cannot use your own referral code', icon: 'error' });
                subsContext.setPromoterReferralHandler('');
                return;
            } else {
                handler = setTimeout(() => {
                    if (subsContext.promoterReferral) {
                        subsContext.setDebouncedReferralCodeHandler(subsContext.promoterReferral!);
                    } else {
                        subsContext.setDebouncedReferralCodeHandler('');
                    }
                }, 1000);
            }
            return () => {
                clearTimeout(handler);
            };
        }
    }, [subsContext.promoterReferral, subsContext.promoter]);

    const fetchOrderStatus = async () => {
        const currentOrder = await getOrder(orderId);

        if (currentOrder?.status !== OrderStatus.WAITING_PAYMENT) {
            router.push('/my-orders');
        } else {
            setOrder(currentOrder);
        }
    };
    // 1 - Fetch the order Status
    useEffect(() => {
        if (orderId) {
            fetchOrderStatus();
        }
    }, [orderId]);
    useEffect(() => {
        if (getExchangeTax) {
            getExchangeTax().then(data => {
                setSlippage(data);
            });
        }
    }, [getExchangeTax]);

    useEffect(() => {
        if (subsContext.currentSubscription) {
            console.log('🚀 ~ useEffect ~ subsContext.currentSubscription:', subsContext.currentSubscription);
            setSSPCommissions(subsContext.currentSubscription?.subscriptionModel?.fees);
            setWaitForSub(false);
        } else {
            console.log('🚀 ~ useEffect ~ setSSPCommissions:', 7);

            setSSPCommissions(7);
            setWaitForSub(false);
        }
    }, [subsContext.currentSubscription]);

    useEffect(() => {
        if (!loadingPrices) {
            console.log('( loadingPrices ) settato a false:', loadingPrices);
        }
    }, [loadingPrices]);

    useEffect(() => {
        setIsBestChoice(
            subsContext.selectedPackage?.subscriptionType === SubscriptionType.BUSINESS &&
                subsContext.selectedPackage?.subscriptionPeriod === SubscriptionPeriod.ANNUAL
        );
    }, [subsContext.selectedPackage]);

    const fetchOrderPrice = async () => {
        try {
            const amazonAmountToPay = await getAmountToPay(configContext, order?.tax_request_id!);
            console.log('🚀 ~ fetchOrderPrice ~ amazonAmountToPay:', amazonAmountToPay);
            if (amazonAmountToPay === null) {
                Swal.fire({
                    title: 'Error: Amazon is not responding. Check your connection or try again in an hour.',
                    icon: 'error',
                });
            }

            if (Object.keys(amazonAmountToPay).length !== 0) {
                console.log('🚀 ~ fetchOrderPrice ~ amazonAmountToPay:', amazonAmountToPay);

                setAmountToPay(amazonAmountToPay);
            } else {
                Swal.fire({
                    title: 'Error: Amazon is not responding. Check your connection or try again in an hour.',
                    icon: 'error',
                });
                router.push('/my-orders');
            }
        } catch {
            Swal.fire({
                title: 'Error: Amazon is not responding. Check your connection or try again in an hour.',
                icon: 'error',
            });
            router.push('/my-orders');
        }
    };
    useEffect(() => {
        if (order && order?.wallet_address && session?.address && address) {
            if (order?.wallet_address === session?.address && session?.address === address) {
                showCheckout.current.isSameWallet = true;
                fetchOrderPrice();
            } else {
                Swal.fire({
                    title: 'Signer is different from the order wallet, please connect the right wallet!',
                    icon: 'error',
                });
                router.push('/my-orders');
            }
        } else {
        }
    }, [order, address, session]);

    useEffect(() => {
        let FeeAmountToPay;
        if (amountToPay?.total) {
            FeeAmountToPay = amountToPay?.total;
        }

        if (subsContext.selectedPackage === null || (subsContext.selectedPackage === undefined && subsContext?.currentSubscription! === null)) {
            setSSPCommissions(7);
            //  setFees((FeeAmountToPay * 7) / 100);
        } else if (subsContext.selectedPackage! && subsContext?.currentSubscription! === null) {
            setSSPCommissions(subsContext?.selectedPackage?.fees);
            // setFees((FeeAmountToPay * subsContext?.selectedPackage?.fees!) / 100);
        } else if (subsContext?.currentSubscription!) {
            setSSPCommissions(subsContext?.currentSubscription?.subscriptionModel?.fees!);
            //setFees((FeeAmountToPay * subsContext?.currentSubscription?.subscriptionModel?.fees!) / 100);
        }
    }, [subsContext.selectedPackage, amountToPay?.total]);

    useEffect(() => {
        let FeeAmountToPay;
        if (amountToPay?.subtotal) {
            FeeAmountToPay = amountToPay?.subtotal;
          
        } else {
        }

        if (
            (FeeAmountToPay && subsContext.selectedPackage === null) ||
            (subsContext.selectedPackage === undefined && subsContext?.currentSubscription! === null)
        ) {
            console.log('🚀 ~ useEffect ~ sspCommissions: 7%', sspCommissions);
            console.log('🚀 ~ useEffect ~ FeeAmountToPay:', FeeAmountToPay);

            setFees((FeeAmountToPay * 7) / 100);
        } else if (FeeAmountToPay && subsContext.selectedPackage! && subsContext?.currentSubscription! === null) {
            console.log('🚀 ~ useEffect ~ sspCommissions:', sspCommissions + '%');
            console.log('🚀 ~ useEffect ~ FeeAmountToPay:', FeeAmountToPay);

            setFees((FeeAmountToPay * subsContext?.selectedPackage?.fees!) / 100);
        } else if (subsContext?.currentSubscription!) {
            console.log('🚀 ~ useEffect ~ sspCommissions:', sspCommissions + '%');
            console.log('🚀 ~ useEffect ~ FeeAmountToPay:', FeeAmountToPay);
            setFees((FeeAmountToPay * subsContext?.currentSubscription?.subscriptionModel?.fees!) / 100);
        }
    }, [sspCommissions, amountToPay?.total]);

    useEffect(() => {
        const calculateZincFee = (total: number): number => {
            console.log('🚀 ~ calculateZincFee ~ total:', total);
            console.log('🚀 ~ calculateZincFee ~ sspCommissions:', sspCommissions);
            console.log('🚀 ~ calculateZincFee ~ sspCommissions:', sspCommissions);

            const result = (total / 100) * sspCommissions!;
            return Number(result.toFixed(2));
        };
        if (fees && amountToPay?.total && sspCommissions) {
            console.log(' fees % : ', calculateZincFee(amountToPay?.total));
        }
    }, [fees, amountToPay?.total, sspCommissions]);

    const { isLoading: loadingPaymentTx } = useWaitForTransaction({
        chainId: 137,
        confirmations: 5,
        hash: paymentTx,
        onSuccess() {
            isCreatingOrder.current = true;
            processOrder();
        },
    });

    useContractReads({
        contracts: [
            {
                address: configContext.config?.order_contract as `0x${string}`,
                abi: FormatedAbi(configContext.abiConfig?.orderAbi!),
                functionName: 'getOrder',
                args: [orderId],
            },
        ],
        onSuccess(data: [OrderSC]) {
            if (data[0]) {
                if (data[0]?.orderId! === '') {
                    showCheckout.current.hasFetchedSC = true;
                } else {
                    showCheckout.current.hasFetchedSC = true;
                    router.push('/my-orders');
                }
            } else {
                showCheckout.current.hasFetchedSC = true;
            }
        },
        onError(error) {},
    });

    useEffect(() => {
        if (amountToPay) {
            if (amountToPay?.shipping) {
                setShippingFees(amountToPay?.shipping);
            } else {
                setShippingFees(0.0);
            }
        }
    }, [amountToPay]);
    useEffect(() => {
        if (order) {
            console.log('order:', order);
        }
    }, [order]);
    useEffect(() => {
        const calculateChangeFees = (total: number, fees: number): number => {
            const result = (total / 100) * fees;
            return Number(result.toFixed(2));
        };

        if (amountToPay?.total && slippage && calculateChangeFees) {
            setExchangeFees(calculateChangeFees(amountToPay?.total, slippage));
        }
    }, [amountToPay, slippage]);

    const openPaymentDepayWidgetHandler = async () => {
        const DePayWidgets = (await import('@depay/widgets')).default;
        if (!address) {
            Swal.fire({
                title: 'Please connect your wallet to proceed',
                icon: 'error',
            });
            return;
        } else {
            const acceptobj = {
                blockchain: 'polygon',
                amount:
                Number(
                    (
                        Number(fees!.toFixed(2)) +
                        // Number(amountToPay?.subtotal?.toFixed(2)) +
                        Number(amountToPay?.tax?.toFixed(2)) +
                        zincFee +
                        shippingFees! +
                        exchangeFees!
                    ).toFixed(2)
                ),

                    token: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f' as `0x${string}`,
                receiver: '0x4790a1d817999dD302F4E58fe4663e7ee8934F90' as `0x${string}`,
                // token: configContext.config?.coin_contract as `0x${string}`,
                // receiver: configContext.config?.order_owner as `0x${string}`,
                // fee: {
                //     amount: fees!.toFixed(2),
                //     receiver: process.env.NEXT_PUBLIC_SMART_CONTRACT_COIN as `0x${string}`,
                // },
            };
            console.log(acceptobj);

            await DePayWidgets.Payment({
                accept: [acceptobj],
                currency: 'USD',

                style: {
                    colors: {
                        primary: '#ff9900',
                        text: '#000',
                        buttonText: '#fff',
                        icons: '#ff9900',
                    },
                    fontFamily: '"Montserrat", sans-serif!important',
                    css: `
                          @import url("https://fonts.googleapis.com/css2?family=Cardo:wght@400;700&display=swap");

                          .ReactDialogBackground {
                             background: rgba(0,0,0,0.8);
                          }
                        `,
                },
                before: async () => {
                    const currentOrder = await getOrder(orderId);
                    const amountExpeted =
                        Number(amountToPay?.subtotal?.toFixed(2)) + Number(amountToPay?.tax?.toFixed(2)) + zincFee + shippingFees! + exchangeFees!;
                    if (currentOrder?.status !== OrderStatus.WAITING_PAYMENT || acceptobj.amount !== Number(amountExpeted)) {
                        console.error(
                            `Depay - Payment - before : Amount expected:(${amountExpeted}) but the amount into the Widget has a different amount. acceptobj is (${acceptobj.amount}) `
                        );
                        Swal.fire({
                            title: 'Error during the payment.',
                            icon: 'error',
                            text: 'Amount expected is different from the amount into the widget.',
                        });
                        return false;
                    }
                },
                succeeded: (transaction: any) => {
                    setPaymentTx(transaction.id);
                },
                failed: (transaction: any) => {
                    Swal.fire({
                        title: 'Error during the payment, please try again or contact the support.',
                        icon: 'error',
                    });
                    console.error('Payment failed:', transaction);
                },
                error: (error: any) => {
                    Swal.fire({
                        title: 'Error during the payment, please try again or contact the support.',
                        icon: 'error',
                    });
                    console.error('Payment error:', error);
                },
            });
            // DePayWidgets.Payment({
            //      integration: "f3bf2aa3-5731-484e-9bb3-5ede215f3fe0",
            //      payload: {
            //           orderid: orderId,
            //      },
            // });
        }
    };
    const processOrder = async () => {
        const updateDb: OrderSB = {
            status: OrderStatus.PAYMENT_RECEIVED,
            total_amount_paid: Number(amountToPay.total.toFixed(2)),
            payment_tx: paymentTx,
            commission: Number(fees!.toFixed(2)),
        };

        const hasUpdated = await updateOrder(orderId, updateDb);
        console.log('🚀 ~ checkout -  processOrder -  hasUpdated:', hasUpdated);

        if (hasUpdated) {
            const tmpEnc = encryptData(orderId);
            console.log('🚀 ~ checkout -  processOrder - createOrderOnWeb3: - STARTED');
            if (await createOrderOnWeb3(Number(subsContext.currentSubscription), orderId, session?.address!)) {
                console.log('🚀 ~ processOrder ~ createOrderOnWeb3: - SUCCESS');
            }

            router.push(`/pay/${tmpEnc}/thankYou`);
        } else {
            console.log(`🚀 ~ processOrder ~ hasUpdated: - Error during the request.  Order ${orderId} NOT UPDATED on DB.`);
            setOrderStep(OrderSteps.OPERATION_COMPLETED);
            Swal.fire({
                title: 'Error during processing order. Please try again or contact the support.',
                icon: 'error',
            });
        }
    };

    useEffect(() => {
        if (loadingPaymentTx) {
            setOrderStep(OrderSteps.WAITING_CONFIRMATION);
        }
    }, [loadingPaymentTx]);

    useEffect(() => {
        console.log(
            '🚀 ~ useEffect ~ fees && amountToPay && sspCommissions && exchangeFees && zincFee && shippingFees:',
            fees,
            amountToPay,
            sspCommissions,
            exchangeFees,
            zincFee,
            shippingFees
        );
        if (
            (fees !== null || fees !== undefined) &&
            amountToPay &&
            (sspCommissions !== null || sspCommissions !== undefined) &&
            exchangeFees &&
            zincFee &&
            shippingFees
        ) {
            orderContext.checkoutHandler({
                items: Number(amountToPay.subtotal),
                zincFees: Number(zincFee),
                shippingFees: shippingFees,
                exchangeFees: exchangeFees,
                fees: fees,
                tax: Number(amountToPay.tax),
            });
            console.log('checkoutHandler -  End');

            setLoadingPrices(false);
        }
    }, [fees, amountToPay, exchangeFees, zincFee, shippingFees]);
    // useEffect(() => {
    //     configCtx.setIsLoadingHandler(false);

    //     return () => {
    //         configCtx.setIsLoadingHandler(true);
    //     };
    // }, [configCtx]);
    const RenderPricesSkeleton = () => {
        return <Skeleton height={20} count={6} />;
    };
    return (
        <div>
            {waitForSub ? (
                <Loading loadingText="Waiting for subscription..." dark={true} />
            ) : showCheckout.current.isSameWallet ? (
                <div className="d-flex col-12 row m-auto">
                    <section className=" h-100 d-flex align-items-start justify-content-center flex-column flex-xl-row  ">
                        {order && (
                            <section className="col-12 col-xl-7 p-0 py-xl-3 mx-xl-1 my-3 ">
                                <Card>
                                    <section id="pay" className="mt-4">
                                        <h3 className="mb-5 text-center">
                                            <strong>Order #{orderId}</strong>
                                        </h3>
                                        <section id="shipping-info">
                                            <h5>
                                                <strong>1. Shipping Info</strong>
                                            </h5>
                                            <div className="row mt-4 mb-5">
                                                <div className="col-md-6">
                                                    <p>
                                                        <strong>Email:</strong> {order.shipping_info?.email}
                                                    </p>
                                                    <p>
                                                        <strong>First Name:</strong> {order.shipping_info?.first_name}
                                                    </p>
                                                    <p>
                                                        <strong>Last Name:</strong> {order.shipping_info?.last_name}
                                                    </p>
                                                    <p>
                                                        <strong>Address Line:</strong> {order.shipping_info?.address_line1}
                                                    </p>
                                                </div>
                                                <div className="col-md-6">
                                                    <p>
                                                        <strong>Zip Code:</strong> {order.shipping_info?.zip_code}
                                                    </p>
                                                    <p>
                                                        <strong>City:</strong> {order.shipping_info?.city}
                                                    </p>
                                                    <p>
                                                        <strong>State:</strong> {order.shipping_info?.state}
                                                    </p>
                                                    <p>
                                                        <strong>Phone Number:</strong> {order.shipping_info?.phone_number}
                                                    </p>
                                                </div>
                                            </div>
                                        </section>
                                        <section id="subscription-package">
                                            {subsContext.currentSubscription?.id! > -1 ? (
                                                <>
                                                    <div style={{ borderStyle: 'dashed' }} className="px-5  border-2 rounded-3">
                                                        <div className="d-flex justify-content-between align-items-start flex-column  ">
                                                            <h3 className="mt-5 text-center text-lg-start " style={{ color: '#808080' }}>
                                                                <p className="m-0 ">Your current Plan is:</p>
                                                                <h1>
                                                                    <b style={{ color: '#000' }}>{subsContext?.currentSubscription?.subscriptionModel?.name}</b>{' '}
                                                                </h1>
                                                            </h3>
                                                        </div>
                                                        <div className="d-flex justify-content-start   align-items-center border-1  ">
                                                            <h2 className="mt-2" style={{ color: '#808080' }}>
                                                                {/* Your current Plan is:{' '}
                                                                <b style={{ color: '#808080' }}>{ctx.currentSubscription?.subscriptionModel.name}</b>{' '} */}
                                                            </h2>
                                                            <div className="mt-3  text-center text-lg-start">
                                                                <b className="h5 "> Monthly Shop Limit - </b>
                                                                {subsContext?.currentSubscription?.subscriptionModel?.subscriptionType ===
                                                                SubscriptionType.BUSINESS ? (
                                                                    <b className="fs-5 text-success  p-2 rounded-2" style={{ backgroundColor: 'efefef' }}>
                                                                        {' '}
                                                                        UNLIMITED
                                                                    </b>
                                                                ) : (
                                                                    <ul className="d-flex  list-unstyled  justify-content-start flex-column text-center  ">
                                                                        <li className="m-0  text-center text-lg-start">
                                                                            <span>
                                                                                <b>Limit:</b>
                                                                            </span>
                                                                            <span className="text-success mx-2">
                                                                                ${subsContext?.currentSubscription?.subscriptionModel?.shopLimit!.toFixed(2)}
                                                                            </span>
                                                                        </li>
                                                                        <li className="m-0 text-center text-lg-start">
                                                                            <span>
                                                                                <b>Spent:</b>
                                                                            </span>
                                                                            <span className="text-danger mx-2">
                                                                                ${subsContext.currentSubscription?.totShopAmountPaid!.toFixed(2)}
                                                                            </span>
                                                                        </li>
                                                                        <li className="m-0 text-center text-lg-start">
                                                                            <span className="">
                                                                                <b>Fees:</b>
                                                                            </span>
                                                                            <span className=" mx-2">
                                                                                {subsContext?.currentSubscription?.subscriptionModel?.fees!}%
                                                                            </span>
                                                                        </li>
                                                                    </ul>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <h6 className="mt-2 text-lg-end  text-center w-100" style={{ color: '#808080' }}>
                                                            <b>Expire:</b> <p className="disclaimer">{subsContext.currentSubscription?.end}</p>
                                                        </h6>
                                                    </div>

                                                    <h5 className="mb-4 pt-3 ">
                                                        <strong>*Do you want to upgrade your plan? </strong> Go to{' '}
                                                        <Link href="/subscribe">
                                                            <u>subscription page</u>{' '}
                                                        </Link>
                                                    </h5>
                                                </>
                                            ) : (
                                                <>
                                                    <h5 className="mb-4">
                                                        <strong>2. Choose Subscription Package </strong>
                                                    </h5>

                                                    {/* <LoadPackages
                                                        activePackage={ctx.currentSubscription?.subscriptionModel?.id!}
                                                        selectedPackage={ctx.selectedPackage!}
                                                        setSubscriptionId={(subId: number) => ctx.setSubscriptionIdHandler(subId)}
                                                        subscriptionId={ctx.selectedPackageId}
                                                        selectPackage={(subType: number) => ctx.setSelectedPackageHandler(subType!)}
                                                    ></LoadPackages> */}
                                                    <LoadPackagesCheckout
                                                        activePackage={subsContext.currentSubscription?.subscriptionModel?.id!}
                                                        selectedPackage={subsContext.selectedPackage!}
                                                        setSubscriptionId={(subId: number) => subsContext.setSubscriptionIdHandler(subId)}
                                                        subscriptionId={subsContext.selectedPackageId}
                                                        selectPackage={(subType: number) => subsContext.setSelectedPackageHandler(subType!)}
                                                    ></LoadPackagesCheckout>
                                                </>
                                            )}
                                        </section>

                                        <div className="">
                                            <h5 className="mb-4 pt-3 mt-5 " id="items-list">
                                                <strong>3. Order Summary</strong>
                                            </h5>
                                            <div className="row mt-4 mb-5 overflow-y-scroll">
                                                {order.products?.map((el, index) => {
                                                    return (
                                                        <div className="mb-3" key={index}>
                                                            <ItemCard>
                                                                <div className="row align-items-center justify-content-sm-start justify-content-center">
                                                                    <div className="col-3 col-sm-2  ">
                                                                        <Image
                                                                            src={el.image}
                                                                            alt={el.title}
                                                                            style={{
                                                                                borderRadius: '5%',
                                                                                boxShadow: '0px 20px 39px -9px rgba(0,0,0,0.1)',
                                                                            }}
                                                                            className="img-thumbnail img-fluid shadow"
                                                                            height={100}
                                                                            width={100}
                                                                        />
                                                                    </div>
                                                                    <div className="col-lg-6">
                                                                        <div className="item-info my-3">
                                                                            <p>{el.title}</p>
                                                                            <Link href={el.url} target="_blank">
                                                                                Open on Amazon
                                                                            </Link>
                                                                        </div>
                                                                    </div>
                                                                    <div className="col-6 col-lg-2 position-relative d-flex justify-content-lg-center">
                                                                        Q.ty: {el.quantity}
                                                                    </div>
                                                                    <div className="col-6 col-lg-2">
                                                                        <p className="text-end">
                                                                            {el.symbol} {(el.price * el.quantity).toFixed(2)}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </ItemCard>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                        <ModalOverlay show={orderStep !== null}>
                                            <div className="d-flex flex-column justify-content-center my-3 rounded  ">
                                                <img src={'/Loading-Blockchain.gif'} alt="" height={200} className="rounded-4" />
                                            </div>
                                        </ModalOverlay>
                                    </section>
                                </Card>
                            </section>
                        )}
                        <section id="payment-details" className="col-12 col-xl-4 h-100  py-xl-3 my-3 mx-xl-1 sticky -lg-top">
                            <Card>
                                {amountToPay && !loadingPrices ? (
                                    <>
                                        {/* <div>
                                            <div className="subtotal d-flex justify-content-between mt-3">
                                                <strong>
                                                    {' '}
                                                    <p>SUBTOTAL:</p>
                                                </strong>
                                                <div>
                                                    <strong>
                                                        <p>$ {amountToPay.subtotal?.toFixed(2)}</p>
                                                    </strong>
                                                </div>
                                            </div>
                                            <hr />
                                        </div> */}
                                        {!subsContext.currentSubscription! && subsContext.selectedPackage?.id! > FreeSubId && (
                                            <div>
                                                <div className="subtotal d-flex justify-content-between mt-3">
                                                    <div>
                                                        <strong>SUBSCRIPTION:</strong>
                                                    </div>
                                                    <div>
                                                        <strong>
                                                            ${' '}
                                                            {subsContext.promoterReferral!
                                                                ? Number(subsContext.selectedPackage?.promoPrice).toFixed(2)
                                                                : Number(subsContext.selectedPackage?.price).toFixed(2)}
                                                        </strong>
                                                    </div>
                                                </div>
                                                <hr />
                                            </div>
                                        )}
                                        <div className="subtotal d-flex justify-content-between flex-column ">
                                            <div className="d-flex justify-content-between align-items-end">
                                                <div className="">
                                                    <strong>SHIPPING:</strong>
                                                </div>
                                                <div className="">
                                                    <strong>$ {shippingFees?.toFixed(2)}</strong>
                                                </div>
                                            </div>{' '}
                                            <div>
                                                <p className="disclaimer text-start" style={{ backgroundColor: '' }}>
                                                    <InfoIcon style={{ fontSize: '14px' }} className="mx-2"></InfoIcon>
                                                    These is the Retaile &apos; s shippping fees. - Amazon, Walmart, Ebay, etc...
                                                </p>
                                            </div>
                                        </div>

                                        <div className="subtotal d-flex flex-column justify-content-between mt-3">
                                            <div className="subtotal d-flex justify-content-between mt-0 p-0">
                                                <div className="m-0">
                                                    <strong className="mb-0">STATE TAX AMOUNT:</strong>
                                                </div>
                                                <div className="m-0">
                                                    <strong>$ {(Number(amountToPay?.tax) + zincFee).toFixed(2)}</strong>
                                                </div>
                                            </div>
                                            <div>
                                                <p className="disclaimer text-start" style={{ backgroundColor: '' }}>
                                                    <InfoIcon style={{ fontSize: '14px' }} className="mx-2"></InfoIcon>
                                                    Read more about US State Sales Tax{' '}
                                                    <a
                                                        className=""
                                                        href="https://www.amazon.com/gp/help/customer/display.html?nodeId=202036190"
                                                        target="_black"
                                                    >
                                                        Link
                                                    </a>
                                                </p>
                                            </div>
                                        </div>
                                        <div className="subtotal d-flex justify-content-between mt-5">
                                            <div className="d-flex flex-column flex-xl-row justify-content-between align-content-center col-12">
                                                <div>
                                                    <strong>(Crypto to Fiat exchange fee): </strong>
                                                </div>{' '}
                                                <div className="d-flex justify-content-xl-center  justify-content-end jus align-content-center">
                                                    <span className="text-center m-0">
                                                        <b> $ {exchangeFees?.toFixed(2)}</b>
                                                    </span>
                                                </div>
                                                {/* )} */}
                                            </div>
                                        </div>
                                        <hr />

                                        <div className="subtotal d-flex justify-content-between mt-5">
                                            <div className="d-flex flex-column flex-xl-row justify-content-between align-content-center col-12">
                                                <div>
                                                    <strong>Smart Dropper fee: </strong>
                                                </div>{' '}
                                                <div className="d-flex justify-content-xl-center  justify-content-end jus align-content-center">
                                                    <span className="text-center m-0">
                                                        ( {sspCommissions}% ) - <b> $ {fees!.toFixed(2)}</b>
                                                    </span>
                                                </div>
                                                {/* )} */}
                                            </div>
                                        </div>

                                        <div className={`row mt-5 justify-content-evenly d-flex flex-column align-items-center `}>
                                            {!subsContext.currentSubscription && subsContext.selectedPackage?.id! > FreeSubId && (
                                                <div className="text-center col-12 col-xl-10  ">
                                                    <div className="circle mx-auto my-0 col-12 col-xl-10  mb-3">1</div>
                                                    {isBestChoice ? (
                                                        <div className="d-flex flex-column justify-content-center align-items-center">
                                                            <div
                                                                className="d-flex col-12 mb-1 justify-content-center flex-column rounded-2 p-2"
                                                                style={{ color: '#fff', backgroundColor: '#ff9900' }}
                                                            >
                                                                <div className="d-flex w-100 justify-content-center align-items-center flex-column p-3">
                                                                    <span className="col-12 text-center">
                                                                        <div
                                                                            className=" h5 border-1 p-2 text-center d-flex justify-content-between align-items-center flex-column "
                                                                            style={{ borderStyle: 'dashed' }}
                                                                        >
                                                                            Pay <h4 className="px-2"></h4>{' '}
                                                                            <h1
                                                                                style={{
                                                                                    backgroundColor: '#fff',
                                                                                    color: '#494949',
                                                                                    width: '100%',
                                                                                }}
                                                                                className="fw-bolder"
                                                                            >
                                                                                ${subsContext.selectedPackage?.promoPrice.toFixed(2)}
                                                                            </h1>
                                                                            instead of
                                                                            <h4>
                                                                                {' '}
                                                                                <b>${subsContext.selectedPackage?.price.toFixed(2)}</b>
                                                                            </h4>{' '}
                                                                            for a year subscription
                                                                        </div>
                                                                    </span>
                                                                </div>
                                                                <div className="d-flex col-12 flex-column">
                                                                    <div className="col-12 p-1">
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
                                                                            value={subsContext.promoterReferral!}
                                                                            onChange={handleChangeReferralCode}
                                                                            style={
                                                                                subsContext.promoterReferral === '' ||
                                                                                subsContext.promoterReferral === undefined ||
                                                                                subsContext.promoterReferral === null
                                                                                    ? {
                                                                                          borderColor: '',
                                                                                          borderWidth: '',
                                                                                          backgroundColor: '',
                                                                                      }
                                                                                    : {
                                                                                          borderColor:
                                                                                              !subsContext.isReferralCodeApplied && !loadingReferral
                                                                                                  ? 'red'
                                                                                                  : 'green',
                                                                                          borderWidth: '4px',
                                                                                          backgroundColor:
                                                                                              !subsContext.isReferralCodeApplied && !loadingReferral
                                                                                                  ? '#f8d7da'
                                                                                                  : '#d4edda',
                                                                                      }
                                                                            }
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <span style={{ color: subsContext.isReferralCodeApplied ? 'green' : 'red' }}>
                                                                {subsContext.isReferralCodeApplied ? '* Referral code applied' : ''}
                                                            </span>
                                                            {subsContext.selectedPackage?.id! > 0 ? (
                                                                <div
                                                                    style={{
                                                                        width: '2px',
                                                                        height: '100px',
                                                                        backgroundColor: 'orange',
                                                                        padding: '0',
                                                                    }}
                                                                    className=" my-3"
                                                                ></div>
                                                            ) : (
                                                                ''
                                                            )}
                                                            <div className="w-100">
                                                                {subsContext.selectedPackage?.id! > FreeSubId && (
                                                                    <span
                                                                        className={`circle mx-auto my-0 `}
                                                                        style={{
                                                                            color: '#ffa500',
                                                                            borderColor: '#ffa500',
                                                                        }}
                                                                    >
                                                                        {isBestChoice ? 2 : 1}
                                                                    </span>
                                                                )}

                                                                <PaySubscription
                                                                    Package={subsContext.selectedPackage!}
                                                                    promoterReferralCode={subsContext.debouncedReferralCode}
                                                                    setIsReferralCodeApplied={(subType: boolean) =>
                                                                        subsContext.setIsReferralCodeAppliedHandler(subType)
                                                                    }
                                                                    setLoadingReferral={(isloading: boolean) => setLoadingReferral(isloading)}
                                                                    loadingReferral={loadingReferral}
                                                                />
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <PaySubscription Package={subsContext.selectedPackage!} />
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {!subsContext.currentSubscription && subsContext.selectedPackage?.id! > FreeSubId ? (
                                                <div
                                                    style={{
                                                        width: '2px',
                                                        height: '100px',
                                                        backgroundColor: 'orange',
                                                        padding: '0',
                                                    }}
                                                    className=" my-3                          "
                                                ></div>
                                            ) : (
                                                ''
                                            )}

                                            <div className={`col-12 col-xl-10 text-center `}>
                                                {!subsContext.currentSubscription && subsContext.selectedPackage?.id! > FreeSubId && (
                                                    <span
                                                        className={`circle mx-auto my-0 `}
                                                        style={
                                                            !subsContext.canPay || subsContext.selectedPackage?.id! > FreeSubId
                                                                ? {
                                                                      color: '#ececec',
                                                                      borderColor: '#ececec',
                                                                  }
                                                                : { color: '#ffa500' }
                                                        }
                                                    >
                                                        {isBestChoice ? 3 : 2}
                                                    </span>
                                                )}

                                                {/* pay order     */}
                                                <div>
                                                    <div
                                                        className="m-2 "
                                                        style={
                                                            subsContext.canPay === false
                                                                ? {
                                                                      color: '#ececec',
                                                                      borderColor: '#ececec',
                                                                  }
                                                                : { color: '#000' }
                                                        }
                                                    >
                                                        <h4>
                                                            <b>Pay to confirm order</b>
                                                        </h4>
                                                    </div>
                                                    <button
                                                        disabled={subsContext.canPay === false}
                                                        className={`btn form-control  mt-2 col-12 col-xl-10 ${
                                                            subsContext.canPay === false ? 'btn-disabled' : 'btn-success'
                                                        }`}
                                                        onClick={openPaymentDepayWidgetHandler}
                                                    >
                                                        $
                                                        {Number(
                                                            (
                                                                Number(fees!.toFixed(2)) +
                                                                // Number(amountToPay?.subtotal?.toFixed(2)) +
                                                                Number(amountToPay?.tax?.toFixed(2)) +
                                                                zincFee +
                                                                shippingFees! +
                                                                exchangeFees!
                                                            ).toFixed(2)
                                                        )}
                                                    </button>

                                                    {subsContext.currentSubscription! && subsContext.canPay === false ? (
                                                        <span className="text-danger mt-2">You have exceeded your monthly limit</span>
                                                    ) : (
                                                        ''
                                                    )}
                                                </div>

                                                <div className="">
                                                    <Alert severity="warning" className="col-12 d-flex flex-column justify-content-center rounded-3 mt-5">
                                                        <AlertTitle>
                                                            Remember, <u>you cannot use multiple coins in a single payment. </u> <br />
                                                            At least one coin on your wallet must have sufficient credit to cover the whole order amount.
                                                            Otherwise you will get the error: <strong className=""> No payment option found!</strong>
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
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    RenderPricesSkeleton()
                                )}
                            </Card>
                        </section>
                    </section>
                </div>
            ) : (
                // <Loading loadingText="Loading details" dark={true} />
                <ModalOverlay show={true}>
                    <Loading loadingText="Checking tax..." />
                </ModalOverlay>
            )}
        </div>
    );
};

export default Checkout;
