import { useEffect, useState, useCallback, useContext } from 'react';
import Swal from 'sweetalert2';
import { convertToDecimal, convertToScaled } from '@/utils/utils';
import { checkErrorMessage } from '@/errors/checkErrorMessage';
import { ConfigContext } from '@/store/config-context';
import { createDataOnSB, getDataFromSB, updateDataOnSB } from '../services/update';
import { SubscriptionPlansSB } from '../types';
import { SubscriptionManagementSB } from '../types';
import { id } from 'ethers/lib/utils.js';

const useSubscriptionModel = () => {
    const { config } = useContext(ConfigContext);
    const TABLE = 'subscription_plans';

    const getSubscriptionByPeriod = useCallback(async (subscriptionPeriod: number): Promise<SubscriptionManagementSB[]> => {
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
    const getSubscriptionByType = useCallback(async (subscriptionType: number): Promise<SubscriptionManagementSB[]> => {
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
            return [] as SubscriptionManagementSB[];
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
    const getSubscriptionModels = useCallback(async (): Promise<SubscriptionPlansSB[]> => {
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

                return [] as SubscriptionPlansSB[];
            }
        } else {
            return [] as SubscriptionPlansSB[];
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
    };
};
