import React, { createContext, useEffect } from 'react';
import { useState } from 'react';
import { PromoterModel, SubscriptionManagementModel, SubscriptionModel } from '@/hooks/Contracts/Subscription/types';
import useSubscriptionPlan from '@/hooks/Contracts/Subscription/customHooks/useSubscriptionPlan';
import useSubscriptionManagement from '@/hooks/Contracts/Subscription/customHooks/useSubscriptionManagement';
import { useSession } from 'next-auth/react';
import { SessionExt } from '@/types/SessionExt';
import { useAccount } from 'wagmi';
import usePromoterManagement from '@/hooks/Contracts/Subscription/customHooks/usePromoterManagement';

export const SubscriptionContext = createContext({
    currentSubscription: null as SubscriptionManagementModel | null,
    allSubscriptions: null as SubscriptionManagementModel[] | null,
    selectedPackage: null as SubscriptionModel | null,
    selectedPackageId: 3 as number,
    promoterReferral: null as string | null | undefined,
    isReferralCodeApplied: false as boolean,
    debouncedReferralCode: '' as string,
    canPay: false as boolean,
    subscriptionsModels: [] as SubscriptionModel[],
    promoter: null as PromoterModel | null,
    setCurrentSubscriptionHandler: async (subscription: SubscriptionManagementModel | null) => {},
    setSubscriptionModels: (models: SubscriptionModel[]) => {},
    setSelectedPackageHandler: (subscription: number | null) => {},
    setSubscriptionIdHandler: (id: number) => {},
    setPromoterReferralHandler: (referral: string | null | undefined) => {},
    setIsReferralCodeAppliedHandler: (isApplied: boolean) => {},
    setDebouncedReferralCodeHandler: (code: string) => {},
    setCanPayHandler: (canpay: boolean) => {},
    setAllSubscriptionsHandler: (subscriptions: SubscriptionManagementModel[]) => {},
    setPromoterHandler: (promoter: PromoterModel | null) => {},
});

const SubscriptionContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { data: session }: { data: SessionExt | null } = useSession() as { data: SessionExt | null };
    const { address } = useAccount();

    const { getSubscriptionByIdOnBC: getSubscriptionById, getLastValidSubscriptionOnBC: getLastValidSubscription } = useSubscriptionManagement();
    const { getPromoterOnBC } = usePromoterManagement();

    const [promoter, setPromoter] = useState<PromoterModel | null>(null);
    const [currentSubscription, setCurrentSubscription] = useState<SubscriptionManagementModel | null>(null); // Set initial value to null
    const [allSubscriptions, setAllSubscriptions] = useState<SubscriptionManagementModel[]>([]); // Set initial value to an empty array
    const [selectedPackage, setSelectedPackage] = useState<SubscriptionModel | null>(null);
    const [selectedPackageId, setSelectedPackageId] = useState<number>(3);
    const [promoterReferral, setPromoterReferral] = useState<string | null | undefined>('');
    const [isReferralCodeApplied, setIsReferralCodeApplied] = useState<boolean>(false);
    const [debouncedReferralCode, setDebouncedReferralCode] = useState('');
    const [canPay, setCanPay] = useState<boolean>(false);
    const { account, getSubscriptionModels } = useSubscriptionPlan();
    const [subscriptionsModels, setSubscriptionsModels] = useState<SubscriptionModel[]>([]);
    const setAllSubscriptionsHandler = (subscriptions: SubscriptionManagementModel[]) => {
        setAllSubscriptions(subscriptions);
    };
    const setCurrentSubscriptionHandler = async (subscription: SubscriptionManagementModel | null) => {
        setCurrentSubscription(subscription);
    };
    const setSelectedPackageHandler = (subscription: number | null) => {
        setSelectedPackage(subscriptionsModels[subscription!]);
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
    const setSubscriptionModels = (models: SubscriptionModel[]) => {
        setSubscriptionsModels(models);
    };
    const setPromoterHandler = (promoter: PromoterModel | null) => {
        setPromoter(promoter);
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
        subscriptionsModels: subscriptionsModels,
        promoter: promoter,
        setCurrentSubscriptionHandler: setCurrentSubscriptionHandler,
        setSelectedPackageHandler: setSelectedPackageHandler, // Add setSelectedPackage property
        setSubscriptionIdHandler: setSubscriptionIdHandler, // Add setSubscriptionId property
        setPromoterReferralHandler: setPromoterReferralHandler, // Add setPromoterReferral property
        setIsReferralCodeAppliedHandler: setIsReferralCodeAppliedHandler, // Add setIsReferralCodeApplied property
        setDebouncedReferralCodeHandler: setDebouncedReferralCodeHandler, // Add setDebouncedReferralCode property
        setCanPayHandler: setCanPayHandler, // Add setCanPay property
        setSubscriptionModels: setSubscriptionModels, // Add setSubscriptionModels property
        setAllSubscriptionsHandler: setAllSubscriptionsHandler, // Add setAllSubscriptions property
        setPromoterHandler: setPromoterHandler, // Add setPromoter property
    };
    useEffect(() => {
        if (currentSubscription !== null) {
            if (currentSubscription?.subscriptionModel?.shopLimit === 0) {
                // se il limite è 0
                setCanPay(true);
            } else if (
                currentSubscription && // se c'è un abbonamento attivo
                currentSubscription?.subscriptionModel?.shopLimit! > 0 && // se c'è un limite impostato per lo shop
                currentSubscription?.totShopAmountPaid! >= currentSubscription?.subscriptionModel?.shopLimit! // se il limite è stato raggiunto
            ) {
                console.log(
                    '🚀 ~ useEffect ~ currentSubscription?.totShopAmountPaid! >= currentSubscription?.subscriptionModel.shopLimit!:',
                    currentSubscription?.totShopAmountPaid! >= currentSubscription?.subscriptionModel?.shopLimit!
                );

                setCanPay(false);
            } else if (
                currentSubscription &&
                currentSubscription?.subscriptionModel?.shopLimit! > 0 &&
                currentSubscription?.totShopAmountPaid! < currentSubscription?.subscriptionModel?.shopLimit!
            ) {
                console.log(
                    '🚀 ~ useEffect ~ currentSubscription?.totShopAmountPaid! >= currentSubscription?.subscriptionModel.shopLimit!:',
                    currentSubscription &&
                        currentSubscription?.subscriptionModel?.shopLimit! > 0 &&
                        currentSubscription?.totShopAmountPaid! < currentSubscription?.subscriptionModel?.shopLimit!
                );

                setCanPay(true);
            }
        } else if (currentSubscription === null) {
            // se non c'è un abbonamento attivo
            console.log(' se non cè un abbonamento attivo ');
            if (selectedPackageId > -1) {
                // se c'è un pacchetto selezionato
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
                        setCurrentSubscription(sub!);
                    });
                } else {
                    setCurrentSubscription(null);
                }
            });
        }
    }, [getLastValidSubscription, getSubscriptionById, session?.address, address]);

    useEffect(() => {
        async function getData() {
            if (getPromoterOnBC && address) {
                try {
                    const data: PromoterModel | null = await getPromoterOnBC(address);
                    if (data) {
                        console.log('🚀 ~ data:', data);
                        if (data.referralCode && data.isActive) {
                            setPromoterHandler(data);
                        } else if (!data.isActive) {
                        }
                    } else {
                        setPromoterHandler(null);
                    }
                } catch (error) {
                } finally {
                }
            }
        }
        if ((session?.address && address, getPromoterOnBC)) {
            getData();
        }
    }, [session?.address, address, getPromoterOnBC]);

    useEffect(() => {
        const fetchSubscriptions = async () => {
            if (getSubscriptionModels && subscriptionsModels.length === 0) {
                try {
                    const result = await getSubscriptionModels();
                    setTimeout(() => {
                        setSubscriptionModels(result!);
                    }, 3000);
                } catch (error) {
                    console.error(error);
                } finally {
                }
            }
        };
        if (subscriptionsModels.length === 0) {
            fetchSubscriptions();
        }
    }, [getSubscriptionModels]);

    useEffect(() => {
        setSelectedPackage(subscriptionsModels[selectedPackageId!]);
    }, [subscriptionsModels, selectedPackageId]);

    return <SubscriptionContext.Provider value={store}>{children}</SubscriptionContext.Provider>;
};

export default SubscriptionContextProvider;
