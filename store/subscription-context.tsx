import React, { createContext, useEffect } from 'react';
import { useState } from 'react';
import { PromoterModel, SubscriptionManagementModel, SubscriptionPlans } from '@/hooks/Contracts/Subscription/types';
import useSubscriptionPlan from '@/hooks/Contracts/Subscription/customHooks/useSubscriptionPlan';
import useSubscriptionManagement from '@/hooks/Contracts/Subscription/customHooks/useSubscriptionManagement';
import { useSession } from 'next-auth/react';
import { SessionExt } from '@/types/SessionExt';
import { useAccount } from 'wagmi';
import usePromoterManagement from '@/hooks/Contracts/Subscription/customHooks/usePromoterManagement';
import useSubscriptionPlansOnDB from '@/hooks/Database/subscription/useSubscriptionPlans';
import { set } from 'date-fns';

export const SubscriptionContext = createContext({
    currentSubscription: null as SubscriptionManagementModel | null,
    allSubscriptions: null as SubscriptionManagementModel[] | null,
    selectedPackage: null as SubscriptionPlans | null,
    selectedPackageId: 3 as number,
    promoterReferral: null as string | null | undefined,
    isReferralCodeApplied: false as boolean,
    debouncedReferralCode: '' as string,
    canPay: false as boolean,
    subscriptionsModels: [] as SubscriptionPlans[],
    promoter: null as PromoterModel | null,
    canShop: true as boolean,
    setCurrentSubscriptionHandler: async (subscription: SubscriptionManagementModel | null) => {},
    setSubscriptionModels: (models: SubscriptionPlans[]) => {},
    setSelectedPackageHandler: (subscription: number | null) => {},
    setSubscriptionIdHandler: (id: number) => {},
    setPromoterReferralHandler: (referral: string | null | undefined) => {},
    setIsReferralCodeAppliedHandler: (isApplied: boolean) => {},
    setDebouncedReferralCodeHandler: (code: string) => {},
    setCanPayHandler: (canpay: boolean) => {},
    setAllSubscriptionsHandler: (subscriptions: SubscriptionManagementModel[]) => {},
    setPromoterHandler: (promoter: PromoterModel | null) => {},
    setCanShopHandler: (canshop: boolean) => {},
});

const SubscriptionContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { data: session }: { data: SessionExt | null } = useSession() as { data: SessionExt | null };
    const { address } = useAccount();

    const { getSubscriptionByIdOnBC: getSubscriptionById, getLastValidSubscriptionOnBC: getLastValidSubscription } = useSubscriptionManagement();
    const { getPromoterOnBC } = usePromoterManagement();

    const [promoter, setPromoter] = useState<PromoterModel | null>(null);
    const [currentSubscription, setCurrentSubscription] = useState<SubscriptionManagementModel | null>(null); // Set initial value to null
    const [allSubscriptions, setAllSubscriptions] = useState<SubscriptionManagementModel[]>([]); // Set initial value to an empty array
    const [selectedPackage, setSelectedPackage] = useState<SubscriptionPlans | null>(null);
    const [selectedPackageId, setSelectedPackageId] = useState<number>(3);
    const [promoterReferral, setPromoterReferral] = useState<string | null | undefined>('');

    const [isReferralCodeApplied, setIsReferralCodeApplied] = useState<boolean>(false);
    const [debouncedReferralCode, setDebouncedReferralCode] = useState('');
    const [canPay, setCanPay] = useState<boolean>(false);
    const [canShop, setCanShop] = useState<boolean>(true);
    const { account, getSubscriptionModels } = useSubscriptionPlan();
    const { getPlansOnDB } = useSubscriptionPlansOnDB();
    const [subscriptionsPlans, setSubscriptionsPlans] = useState<SubscriptionPlans[]>([]);
    const setAllSubscriptionsHandler = (subscriptions: SubscriptionManagementModel[]) => {
        setAllSubscriptions(subscriptions);
    };
    const setCurrentSubscriptionHandler = async (subscription: SubscriptionManagementModel | null) => {
        console.log('🚀 ~ setCurrentSubscriptionHandler ~ subscription:', subscription);
        setCurrentSubscription(subscription);
    };
    const setSelectedPackageHandler = (subscription: number | null) => {
        setSelectedPackage(subscriptionsPlans[subscription!]);
        if (subscription === null) {
            setSelectedPackageId(-1);
            return;
        }
    };
    const setSubscriptionIdHandler = (id: number) => {
        setSelectedPackageId(id);
    };
    const setPromoterReferralHandler = (referral: string | null | undefined) => {
        setPromoterReferral(referral);
    };
    const setIsReferralCodeAppliedHandler = (isApplied: boolean) => {
        setIsReferralCodeApplied(isApplied);
    };
    const setDebouncedReferralCodeHandler = (code: string) => {
        setDebouncedReferralCode(code);
    };
    const setCanPayHandler = (canpay: boolean) => {
        setCanPay(canpay);
    };
    const setSubscriptionPlans = (models: SubscriptionPlans[]) => {
        setSubscriptionsPlans(models);
    };
    const setPromoterHandler = (promoter: PromoterModel | null) => {
        setPromoter(promoter);
    };
    const setCanShopHandler = (canshop: boolean) => {
        setCanShop(canshop);
    };

    const store = {
        currentSubscription: currentSubscription,
        allSubscriptions: allSubscriptions,
        selectedPackage: selectedPackage,
        selectedPackageId: selectedPackageId,
        promoterReferral: promoterReferral,
        isReferralCodeApplied: isReferralCodeApplied,
        debouncedReferralCode: debouncedReferralCode,
        canPay: canPay,
        subscriptionsModels: subscriptionsPlans,
        promoter: promoter,
        canShop: canShop,
        setCurrentSubscriptionHandler: setCurrentSubscriptionHandler,
        setSelectedPackageHandler: setSelectedPackageHandler, // Add setSelectedPackage property
        setSubscriptionIdHandler: setSubscriptionIdHandler, // Add setSubscriptionId property
        setPromoterReferralHandler: setPromoterReferralHandler, // Add setPromoterReferral property
        setIsReferralCodeAppliedHandler: setIsReferralCodeAppliedHandler, // Add setIsReferralCodeApplied property
        setDebouncedReferralCodeHandler: setDebouncedReferralCodeHandler, // Add setDebouncedReferralCode property
        setCanPayHandler: setCanPayHandler, // Add setCanPay property
        setSubscriptionModels: setSubscriptionPlans, // Add setSubscriptionModels property
        setAllSubscriptionsHandler: setAllSubscriptionsHandler, // Add setAllSubscriptions property
        setPromoterHandler: setPromoterHandler, // Add setPromoter property
        setCanShopHandler: setCanShopHandler, // Add setCanShop property
    };
    useEffect(() => {
        if (currentSubscription !== null) {
            if (currentSubscription?.subscriptionModel?.shopLimit === 0) {
                // se il limite è 0
                setCanPay(true);
            } else if (
                currentSubscription && // se c'è un abbonamento attivo
                currentSubscription?.subscriptionModel?.shopLimit! > 0 && // se c'è un limite impostato per lo shop
                currentSubscription?.monthlyBudget! >= currentSubscription?.subscriptionModel?.shopLimit! // se il limite è stato raggiunto
            ) {
                console.log(
                    '🚀 ~ useEffect ~ currentSubscription?.totShopAmountPaid! >= currentSubscription?.subscriptionModel.shopLimit!:',
                    currentSubscription?.monthlyBudget! >= currentSubscription?.subscriptionModel?.shopLimit!
                );

                setCanPay(false);
            } else if (
                currentSubscription &&
                currentSubscription?.subscriptionModel?.shopLimit! > 0 &&
                currentSubscription?.monthlyBudget! < currentSubscription?.subscriptionModel?.shopLimit!
            ) {
                console.log(
                    '🚀 ~ useEffect ~ currentSubscription?.totShopAmountPaid! >= currentSubscription?.subscriptionModel.shopLimit!:',
                    currentSubscription &&
                        currentSubscription?.subscriptionModel?.shopLimit! > 0 &&
                        currentSubscription?.monthlyBudget! < currentSubscription?.subscriptionModel?.shopLimit!
                );

                setCanPay(true);
            }
        } else if (currentSubscription === null) {
            console.log(' se non cè un abbonamento attivo ');

            if (selectedPackageId > -1) {
                setCanPay(false);
            } else {
                setCanPay(true);
            }
        }
    }, [selectedPackageId, currentSubscription]);

    //    useEffect(() => {
    //        if(getSubscriptionById) {
    //         getSubscriptionById(Number(currentSubscription?.id)).then((res) => {
    //             setCurrentSubscription(res);
    //         });
    //     }

    //    }, [currentSubscription])

    useEffect(() => {
        if (session?.address && address && getLastValidSubscription !== null && getSubscriptionById !== null) {
            getLastValidSubscription(session?.address).then(data => {
                if (data !== null && data?.subscriber === session?.address && address) {
                    getSubscriptionById(data?.id!).then(sub => {
                        console.log('🚀 ~ getSubscriptionById ~ data:', data);
                        setCurrentSubscription(sub!);
                    });
                } else {
                    setCurrentSubscription(null);
                }
            });
        }
    }, [getLastValidSubscription, getSubscriptionById, session?.address, address]);

    // useEffect(() => {
    //     async function getData() {
    //         if (getPromoterOnBC && address) {
    //             try {
    //                 const data: PromoterModel | null = await getPromoterOnBC(address);
    //                 if (data) {
    //                     console.log('🚀 ~ data:', data);
    //                     if (data.referralCode && data.isActive) {
    //                         setPromoterHandler(data);
    //                     } else if (!data.isActive) {
    //                     }
    //                 } else {
    //                     setPromoterHandler(null);
    //                 }
    //             } catch (error) {
    //             } finally {
    //             }
    //         }
    //     }
    //     if ((session?.address && address, getPromoterOnBC)) {
    //         getData();
    //     }
    // }, [session?.address, address, getPromoterOnBC]);

    useEffect(() => {
        const fetchSubscriptions = async () => {
            if (getSubscriptionModels && subscriptionsPlans.length === 0) {
                try {
                    const result = await getSubscriptionModels();
                    setTimeout(() => {
                        setSubscriptionPlans(result!);
                    }, 3000);
                } catch (error) {
                    console.error(error);
                } finally {
                }
            }
        };
        if (subscriptionsPlans.length === 0) {
            fetchSubscriptions();
        }
    }, [getSubscriptionModels]);
    // useEffect(() => {
    //     const fetchSubscriptions = async () => {
    //         if (getPlansOnDB && subscriptionsPlans.length === 0) {
    //             try {
    //                 const result = await getPlansOnDB();
    //                 console.log('🚀 ~ fetchSubscriptions ~ result:', result);
    //                 setTimeout(() => {
    //                     setSubscriptionPlans(result!);
    //                 }, 3000);
    //             } catch (error) {
    //                 console.error(error);
    //             } finally {
    //             }
    //         }
    //     };
    //     if (subscriptionsPlans.length === 0) {
    //         fetchSubscriptions();
    //     }
    // }, [getPlansOnDB]);

    useEffect(() => {
        setSelectedPackage(subscriptionsPlans[selectedPackageId!]);
    }, [subscriptionsPlans, selectedPackageId]);

    return <SubscriptionContext.Provider value={store}>{children}</SubscriptionContext.Provider>;
};

export default SubscriptionContextProvider;
