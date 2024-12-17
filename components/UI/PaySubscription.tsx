import { useCallback, useContext, useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { useContractReads, useWaitForTransaction } from 'wagmi';
import { createSubscription } from '../controllers/SubscriptionController';
import { SessionExt } from '../../types/SessionExt';
import { useSession } from 'next-auth/react';
import { PromoterModel, SubscriptionManagementModel, SubscriptionPlans } from '@/hooks/Contracts/Subscription/types';
import useSubscriptionManagement from '@/hooks/Contracts/Subscription/customHooks/useSubscriptionManagement';
import usePromoterManagement from '@/hooks/Contracts/Subscription/customHooks/usePromoterManagement';
import { checkErrorMessage, convertToDecimal } from '@/utils/utils';
import { SubscriptionContext } from '@/store/subscription-context';
import { ConfigContext } from '@/store/config-context';
import DatePicker from 'react-datepicker';
import { Form } from 'react-bootstrap';

const PaySubscription: React.FC<{
    Package: SubscriptionPlans;
    promoterReferralCode?: string | null | undefined;
    setIsReferralCodeApplied?: (value: boolean) => void;
    setLoadingReferral?: (value: boolean) => void;
    loadingReferral?: boolean;
    btnStyle?: React.CSSProperties;
}> = ({ Package, promoterReferralCode = '', setIsReferralCodeApplied, btnStyle, setLoadingReferral, loadingReferral }) => {
    const configContext = useContext(ConfigContext);
    const { getPromoterByReferralOnBC } = usePromoterManagement();
    const { data: session }: { data: SessionExt | null } = useSession() as { data: SessionExt | null };
    const [paymentTx, setPaymentTx] = useState<`0x${string}`>();
    const [promoter, setPromoter] = useState<PromoterModel | null>(null);
    // const [loadingReferral, setLoadingReferral] = useState(true);
    const [price, setPrice] = useState<number>();
    const [isPromoActive, setIsPromoActive] = useState<boolean>(false);
    const { isLoading: waitTx } = useWaitForTransaction({
        hash: paymentTx,
        onSuccess() {
            // clearActivePackage();
        },
        onError() {
            Swal.fire({
                title: 'Error during the subscription. Please try again or contact the support',
                icon: 'error',
            });
        },
    });
    const [startDate, setStartDate] = useState<Date>(new Date());

    const [formatedDate, setFormatedDate] = useState<number>(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [canCreateSubscription, setCanCreateSubscription] = useState<boolean>(false);
    useEffect(() => {
        if (promoterReferralCode && getPromoterByReferralOnBC && setLoadingReferral && !loadingReferral) {
            try {
                setLoadingReferral(true);
                setTimeout(() => {
                    getPromoterByReferralOnBC(promoterReferralCode).then(data => {
                        if (data) {
                            const convertedPromoter: PromoterModel = {
                                promoterAddress: data.promoterAddress,
                                isActive: data.isActive,
                                percentage: data.percentage,
                                profit: data.profit,
                                referralCode: data.referralCode,
                            };
                            // console.log('convertedPromoter:', convertedPromoter);
                            setPromoter(convertedPromoter);
                            setIsPromoActive(true);
                            setLoadingReferral(false);
                        } else {
                            setPromoter(null);
                            setLoadingReferral(false);
                        }
                    });
                }, 3000);
            } catch (error) {
                console.log('🚀 ~ useEffect ~ error:', error);
                setLoadingReferral(false);
            } finally {
                // setLoadingReferral(false);
            }
        } else {
        }
    }, [promoterReferralCode]);

    useEffect(() => {
        console.log('loadingReferral:', loadingReferral);
    }, [loadingReferral]);

    const getPrice = (): number => {
        if (promoter && promoter?.referralCode === promoterReferralCode) {
            setIsPromoActive(true);
            setIsReferralCodeApplied && setIsReferralCodeApplied(true);
            return Package?.promoPrice;
        } else {
            setIsPromoActive(false);
            setIsReferralCodeApplied && setIsReferralCodeApplied(false);
            return Package?.price;
        }
    };
    const handleCreateSubscription = useCallback(
        async (subscriptionTypeId: number, subscriber: string, paymentTx: string, promoterAddress: string | null | undefined) => {
            setIsSubmitting(true);
            setError(null);
            let endDate;
            try {
                if (Package?.period === 0) {
                    endDate = formatedDate + 30 * 24 * 60 * 60; // 365 giorni * 24 ore * 60 minuti * 60 secondi
                } else if (Package?.period === 1) {
                    endDate = formatedDate + 365 * 24 * 60 * 60; // 365 giorni * 24 ore * 60 minuti * 60 secondi
                }

                const res = await createSubscription(subscriptionTypeId, subscriber, paymentTx, promoterAddress || undefined, formatedDate, endDate);
                if (res.tx) {
                } else if (res.error) {
                    const errorMessage = checkErrorMessage(res.error.reason);
                    console.log('🚀 ~ handleSubmit ~ errorMessage:', errorMessage);
                    setError(errorMessage! ?? res.error.reason);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setIsSubmitting(false);
            }
        },
        [createSubscription, checkErrorMessage, setIsSubmitting, setError, formatedDate]
    );

    useEffect(() => {
        if (canCreateSubscription) {
            handleCreateSubscription(Package.id, session?.address!, paymentTx!, promoter?.promoterAddress);
        }
    }, [canCreateSubscription, Package, paymentTx, promoter, session?.address, handleCreateSubscription]);

    const handleChangeDate = (date: any) => {
        setStartDate(date);
        console.log(date);
    };
    useEffect(() => {
        setPrice(getPrice());
    }, [promoterReferralCode, promoter, Package?.price]);

    useEffect(() => {
        if (price) {
        }
    }, [price]);

    useEffect(() => {
        if ((paymentTx && session?.address && Package, promoter?.promoterAddress, formatedDate)) {
            try {
                setCanCreateSubscription(true);
            } catch (err) {
                console.error(err);
            } finally {
                setIsSubmitting(false);
            }
        }
    }, [Package, paymentTx, promoter?.promoterAddress, session?.address]);

    const calcPercentage = (price: number = 0, percentage: number = 0) => {
        console.log(price, percentage);
        return (price * percentage) / 100;
    };
    const openPaymentWidget = async () => {
        // const DePayWidgets = (await import('@depay/widgets')).default;
        const acceptobj = {
            blockchain: 'polygon',
            amount: price! - Number(calcPercentage(price, promoter?.percentage!)),
            token: configContext.config?.coin_contract! as `0x${string}`,
            receiver: configContext.config?.subscription_owner! as `0x${string}`,
            fee: {
                amount: Number(calcPercentage(price, promoter?.percentage!)),
                receiver: configContext.config?.subscription_management_contract! as `0x${string}`,
            },
        };
        console.log(acceptobj);
        await DePayWidgets.Payment({
            accept: [acceptobj],
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
            succeeded: (transaction: any) => {
                setPaymentTx(transaction.id);
            },
        });
    };
    const RenderButton = () => {
        return (
            <div className="d-flex justify-content-center text-end  align-items-center col-12 flex-column mb-5">
                <h5 className="m-2 fw-bold " style={{ color: '#000' }}>
                    Pay Subscription
                </h5>
                <button
                    disabled={waitTx || loadingReferral === null}
                    className="btn btn-add form-control  mt-2 col-8"
                    onClick={openPaymentWidget}
                    style={btnStyle}
                >
                    {isPromoActive ? (
                        <>
                            <del className="mx-3">${Number(Package?.price).toFixed(2)}</del>
                            <span className="mx-3"> $ {Number(Package?.promoPrice).toFixed(2)}</span>
                        </>
                    ) : (
                        <b> $ {Number(Package?.price).toFixed(2)}</b>
                    )}
                </button>
            </div>
        );
    };
    return (
        <div className="d-flex flex-column">
            <div className="mb-5 d-flex flex-column">
                <RenderButton />
                {error && <p className="text-danger">{error}</p>}
            </div>
            <div className="mb-5 d-flex flex-column">
                <Form.Label>
                    {' '}
                    <b> When should your subscription start ? (optional)</b>
                </Form.Label>

                <DatePicker selected={startDate} onChange={handleChangeDate} className=" form-control  " minDate={new Date()} />
                <p className="disclaimer pe-auto">*Leave it as it is, if you want to start immediately</p>
            </div>
        </div>
    );
};
//     return Package && subContext.currentSubscription && Package.id > subContext.currentSubscription?.subscriptionModel.id! ? (
//         <RenderButton />
//     ) : Package && !subContext.currentSubscription ? (
//         <RenderButton />
//     ) : null;
// };

export default PaySubscription;
