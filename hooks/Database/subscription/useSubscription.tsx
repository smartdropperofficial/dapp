import { useEffect, useState, useCallback, useContext } from 'react';
import Swal from 'sweetalert2';
import { convertToDecimal, convertToScaled, encryptData } from '@/utils/utils';
import { checkErrorMessage } from '@/errors/checkErrorMessage';
import { ConfigContext } from '@/store/config-context';
import { createDataOnSB, getDataFromSB, updateDataOnSB } from '../services/update';
import { SubscriptionPlan } from '../types';
import { SubscriptionManagementModel } from '../types';
import { id } from 'ethers/lib/utils.js';

const useSubscriptionManagement = () => {
    const { config } = useContext(ConfigContext);
    const TABLE = 'subscription';

    const getSubscriptionByPeriod = useCallback(async (subscriptionPeriod: number): Promise<SubscriptionManagementModel[]> => {
        if (!getDataFromSB) throw new Error('getData is not initialized');
        try {
            const result = await getDataFromSB(TABLE, { subscriptionPeriod: subscriptionPeriod });
            return result.map((sub: any) => ({
                subscriptionType: sub.subscriptionType,
                subscriptionPeriod: sub.subscriptionPeriod,
                name: sub.name,
                price: convertToDecimal(sub.price),
                period: sub.period.toNumber(),
                enabled: sub.enabled,
                fees: convertToDecimal(sub.fees),
                shopLimit: sub.shopLimit.toNumber(),
            }));
        } catch (error: any) {
            checkErrorMessage(error.message);

            throw error;
        }
    }, []);
    const getSubscriptionByType = useCallback(async (subscriptionType: number): Promise<SubscriptionManagementModel[]> => {
        if (!getDataFromSB) throw new Error('getData is not initialized');

        try {
            const result = await getDataFromSB(TABLE, { subscriptionPeriod: subscriptionType });
            return result.map((sub: any) => ({
                id: sub.id,
                subscriptionType: sub.subscriptionType,
                subscriptionPeriod: sub.subscriptionPeriod,
                name: sub.name,
                price: convertToDecimal(sub.price),
                period: sub.period.toNumber(),
                enabled: sub.enabled,
                fees: convertToDecimal(sub.fees),
                shopLimit: sub.shopLimit.toNumber(),
            }));
        } catch (error: any) {
            checkErrorMessage(error.message);
            return [] as SubscriptionManagementModel[];
        }
    }, []);
    const addSubscriptionModelOnSB = useCallback(
        async (
            id: number,
            subscriptionType: number,
            subscriptionPeriod: number,
            name: string,
            price: number,
            period: number,
            enabled: boolean,
            fees: number,
            shopLimit: number
        ) => {
            if (!createDataOnSB) throw new Error('Contract is not initialized');
            try {
                const tx = await createDataOnSB(TABLE, {
                    subscriptionType: subscriptionType,
                    subscriptionPeriod: subscriptionPeriod,
                    price: price,
                    name: name,
                    period: period,
                    enabled: enabled,
                    fees: fees,
                    shopLimit: shopLimit,
                });
                Swal.fire({ title: 'Subscription added', icon: 'success' });
            } catch (error: any) {
                checkErrorMessage(error.message);
            }
        },
        []
    );
    const changeSubscriptionTypeFees = useCallback(async (subscriptionId: number, newFees: number) => {
        if (!updateDataOnSB) throw new Error('updateDataOnDb is not initialized');
        try {
            const tx = await updateDataOnSB(TABLE, { id: subscriptionId }, { fees: newFees });
            Swal.fire({ title: 'Subscription fees updated', icon: 'success' });
        } catch (error: any) {
            checkErrorMessage(error.message);
        }
    }, []);
    const changeSubscriptionPrice = useCallback(async (subscriptionId: number, newPrice: number) => {
        if (!updateDataOnSB) throw new Error('Contract is not initialized');
        try {
            const tx = await updateDataOnSB(TABLE, { id: subscriptionId }, { price: convertToScaled(newPrice) });
            Swal.fire({ title: 'Subscription price updated', icon: 'success' });
        } catch (error: any) {
            checkErrorMessage(error.message);
        }
    }, []);
    const changeSubscriptionTypeShopLimit = useCallback(async (subscriptionId: number, newLimit: number) => {
        if (!updateDataOnSB) throw new Error('Contract is not initialized');
        try {
            const tx = await updateDataOnSB(TABLE, { id: subscriptionId }, { shopLimit: newLimit });
            Swal.fire({ title: 'Shop limit updated', icon: 'success' });
        } catch (error: any) {
            checkErrorMessage(error.message);
        }
    }, []);
    const getSubscriptionModels = useCallback(async (): Promise<SubscriptionPlan[]> => {
        if (getDataFromSB) {
            try {
                const result = await getDataFromSB(TABLE);
                return result.map((sub: any) => ({
                    id: sub.id,
                    subscriptionType: sub.subscriptionType,
                    subscriptionPeriod: sub.subscriptionPeriod,
                    name: sub.name,
                    price: sub?.price,
                    promoPrice: sub?.promoPrice,
                    period: sub.period,
                    enabled: sub.enabled,
                    fees: sub?.fees,
                    shopLimit: sub.shopLimit,
                }));
            } catch (error: any) {
                checkErrorMessage(error.message);

                return [] as SubscriptionPlan[];
            }
        } else {
            return [] as SubscriptionPlan[];
        }
    }, []);
    const getSubscriptionsByAddress = useCallback(async (subscriber: string): Promise<SubscriptionManagementModel[]> => {
        if (!subscriber) {
            return [];
        }

        try {
            const wallet = encryptData(subscriber as string);

            const response = await fetch(`/api/getAllSubsByWallet?wallet=${encodeURIComponent(wallet)}`);
            if (!response.ok) {
                const errorText = await response.text();
                return [] as SubscriptionManagementModel[];
            }

            const result = await response.json();

            const res = result.map((sub: any) => ({
                subscriptionType: sub.plan?.subscription_type,
                subscriptionPeriod: sub.plan?.subscription_period || null,
                name: sub.plan?.name,
                price: convertToDecimal(sub.plan?.price),
                period: sub.plan?.period,
                enabled: sub.plan?.enabled,
                fees: convertToDecimal(sub.plan?.fees),
                shopLimit: sub.plan?.shop_limit,
                start: sub.start_date,
                end: sub.end_date,
                paymentTx: sub.payment_tx,
                subscriptionTx: sub.subscription_tx,
                budgetLeft: sub.budget_left,
                monthlyBudget: sub.monthly_budget,
                isPromoActive: sub.plan?.is_promo_active,
                promoPrice: sub.plan?.promo_price,
                promoFees: sub.plan?.promo_fees,
                createdAt: sub.subscription_created_at,
                promoterAddress: sub.promoter_address,
                promoterWithdrawn: sub.promoter_withdrawn,
                promoterWithdrawnTx: sub.promoter_withdrawn_tx,
                subscriptionModel: {
                    ...sub.plan
                }
            }));
            console.log("🚀 ~ res ~ res:", res)
            return res;

        } catch (error: any) {
            // checkErrorMessage(error.message);
            throw error;
        }
    }, [checkErrorMessage, convertToDecimal]);

    const getLastValidSubscription = useCallback(async (subscriber: string): Promise<SubscriptionManagementModel | null> => {
        if (!getDataFromSB) throw new Error('getData is not initialized');
        try {
            const result = await getDataFromSB(TABLE, { wallet: subscriber });
            return result.map((sub: any) => ({
                id: sub.id,
                subscriptionType: sub.subscriptionType,
                subscriptionPeriod: sub.subscriptionPeriod,
                name: sub.name,
                price: convertToDecimal(sub.price),
                period: sub.period,
                enabled: sub.enabled,
                fees: convertToDecimal(sub.fees),
                shopLimit: sub.shopLimit,
            }));
        } catch (error: any) {
            checkErrorMessage(error.message);

            throw error;
        }
    }, []);


    return {
        getSubscriptionByPeriod,
        getSubscriptionByType,
        addSubscriptionContract: addSubscriptionModelOnSB,
        changeSubscriptionTypeFees,
        changeSubscriptionPrice,
        changeSubscriptionTypeShopLimit,
        getSubscriptionModels,
        getSubscriptionsByAddress,
        getLastValidSubscription
    };
};
export default useSubscriptionManagement;
