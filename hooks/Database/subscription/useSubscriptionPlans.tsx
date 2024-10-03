import { useEffect, useState, useCallback, useContext } from 'react';
import { ethers, BigNumber } from 'ethers';
import { useProvider, useSigner, useAccount } from 'wagmi';
import { PromoterModelSB, SubscriptionPlansSB } from '../types'; // Assicurati che il percorso del tipo sia corretto
import { checkErrorMessage, convertToDecimal } from '@/utils/utils';
import Swal from 'sweetalert2';
import { v4 as uuidv4 } from 'uuid';
import { createDataOnSB, updateDataOnSB, getDataFromSB } from '../services/update';
import { SubscriptionPlans } from '@/hooks/Contracts/Subscription/types';

const useSubscriptionPlansOnDB = () => {
    const TABLE = 'subscription_plans';

    const getPlansOnDB = useCallback(async (): Promise<SubscriptionPlans[]> => {
        if (getDataFromSB) {
            try {
                const result = await getDataFromSB(TABLE);
                const data = result.map((sub: any) => ({
                    id: sub.plan_id,
                    subscriptionType: Number(sub?.subscription_type),
                    subscriptionPeriod: Number(sub.subscription_period),
                    name: sub.name,
                    price: sub.price,
                    promoPrice: Number(sub.promo_price),
                    period: sub.period,
                    enabled: sub.enabled,
                    fees: sub.fees,
                    promoFees: sub.promo_fees,
                    isPromoActive: sub.is_promo_active,
                    shopLimit: sub.shop_limit * 100,
                }));

                return data;
            } catch (error) {
                return [] as SubscriptionPlans[];
            }
        } else {
            return [] as SubscriptionPlans[];
        }
    }, []);

    return {
        getPlansOnDB,
    };
};

export default useSubscriptionPlansOnDB;
