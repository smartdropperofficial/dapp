import { useEffect, useState, useCallback, useContext } from 'react';
import { ethers, BigNumber } from 'ethers';
import { useProvider, useSigner, useAccount } from 'wagmi';
import { PromoterModelSB } from '../types'; // Assicurati che il percorso del tipo sia corretto
import { checkErrorMessage, convertToDecimal } from '@/utils/utils';
import Swal from 'sweetalert2';
import { v4 as uuidv4 } from 'uuid';
import { ConfigContext } from '@/store/config-context';
import { createDataOnSB, updateDataOnSB, getDataFromSB } from '../services/update';

const usePromoter = () => {
    const { config } = useContext(ConfigContext);
    const TABLE = "promoter"



    const getPromotersOnDB = useCallback(async (): Promise<PromoterModelSB[]> => {
        if (getDataFromSB) {
            try {
                const result = await getDataFromSB(TABLE);
                console.log("🚀 ~ getPromoters ~ result:", result)
                return result.map((promoter: PromoterModelSB) => ({
                    percentage: result.percentage,
                    isActive: result?.is_active,
                    promoterAddress: result.promoterAddress,
                    profit: result.profit,
                    referralCode: result.referralCode,
                }));
            } catch (error) {
                console.error('Error fetching promoters:', error);
                return [] as PromoterModelSB[];
            }
        } else {
            return [] as PromoterModelSB[];
        }
    }, []);
    const getAllPromotersSubsByAddressOnDB = useCallback(
        async (address: string): Promise<PromoterModelSB[]> => {
            if (getDataFromSB) {
                try {
                    const result = await getDataFromSB(TABLE, { promoter_address: address });
                    console.log('🚀 ~ getPromoter - result:', result);
                    return result.map((promoter: PromoterModelSB) => ({
                        percentage: result.percentage,
                        isActive: result?.is_active,
                        promoterAddress: result.promoterAddress,
                        profit: result.profit,
                        referralCode: result.referralCode,
                    }));
                } catch (error: any) {
                    console.error('Error fetching promoters:', error);
                    return [] as PromoterModelSB[];
                }
            } else {
                return [] as PromoterModelSB[];
            }
        },
        []
    );
    const getPromoterOnDB = useCallback(
        async (promoterAddress: string): Promise<PromoterModelSB | null> => {
            try {
                const result = await getDataFromSB(TABLE, { promoter_address: promoterAddress });
                console.log('🚀 ~ getPromoter - result:', result);
                return {
                    percentage: result?.percentage,
                    isActive: result?.is_active,
                    promoterAddress: result?.promoter_address,
                    profit: result?.profit || 0,
                    referralCode: result?.referral_code,
                } as PromoterModelSB;
            } catch (error: any) {
                console.log('🚀 ~ error:', error);
                return null;
            }

        },
        []
    );
    const getPromoterByReferralOnDB = useCallback(
        async (referralCode: string): Promise<PromoterModelSB | null> => {
            try {
                const result = await getDataFromSB(TABLE, { referral_code: referralCode });
                console.log('🚀 ~ getPromoter - result:', result);
                return {
                    percentage: result?.percentage,
                    isActive: result?.is_active,
                    promoterAddress: result?.promoter_address,
                    profit: result?.profit || 0,
                    referralCode: result?.referral_code,
                } as PromoterModelSB;
            } catch (error: any) {
                console.log('🚀 ~ error:', error);
                return null;
            }
        },
        []
    );
    const addPromoterOnDB = useCallback(
        async (promoterAddress: string, referral: string): Promise<PromoterModelSB | null> => {
            console.log("🚀 ~ promoterAddress:", promoterAddress)
            console.log("🚀 ~ referralCode:", referral)
            try {

                const result: PromoterModelSB = await createDataOnSB(TABLE, { promoter_address: promoterAddress, referral_code: referral });
                console.log("🚀 ~ result:", result)

                Swal.fire({
                    title: 'Promoter created successfully!',
                    icon: 'success',
                });

                return {
                    percentage: result.percentage,
                    isActive: result.isActive,
                    promoterAddress: result.promoterAddress,
                    profit: result.profit,
                    referralCode: result.referralCode,
                } as PromoterModelSB;

            } catch (error: any) {
                console.log('🚀 ~ error:', error);
                checkErrorMessage(error.message);
                return null;
            }

        },
        []
    );
    const setPromoterActiveOnDB = useCallback(
        async (promoterAddress: string, isActive: boolean) => {
            if (updateDataOnSB) {
                try {
                    const result = await updateDataOnSB(TABLE, { promoter_address: promoterAddress }, { is_active: isActive });
                    console.log('🚀 ~ getPromoter - result:', result);
                    return {
                        percentage: result?.percentage,
                        isActive: result?.is_active,
                        promoterAddress: result?.promoter_address,
                        profit: result?.profit || 0,
                        referralCode: result?.referral_code,
                    } as PromoterModelSB;
                } catch (error: any) {
                    console.log('🚀 ~ error:', error);
                    return null;
                }
            }
        },
        []
    );
    const setPromoterPercentageOnDB = useCallback(
        async (promoterAddress: string, percentage: number) => {
            if (updateDataOnSB) {
                try {
                    const result = await updateDataOnSB(TABLE, { percentage: percentage }, { promoter_address: promoterAddress },);
                    console.log('🚀 ~ getPromoter - result:', result);
                    return {
                        percentage: result?.percentage,
                        isActive: result?.is_active,
                        promoterAddress: result?.promoter_address,
                        profit: result?.profit || 0,
                        referralCode: result?.referral_code,
                    } as PromoterModelSB;
                } catch (error: any) {
                    console.log('🚀 ~ error:', error);
                    return null;
                }
            }
        },
        []
    );
    const setPromoterProfitOnDB = useCallback(
        async (promoterAddress: string, newProfit: number) => {
            if (updateDataOnSB) {
                try {
                    const result = await updateDataOnSB(TABLE, { promoter_address: promoterAddress }, { profift: newProfit });
                    console.log('🚀 ~ getPromoter - result:', result);
                    return {
                        percentage: result?.percentage,
                        isActive: result?.is_active,
                        promoterAddress: result?.promoter_address,
                        profit: result?.profit || 0,
                        referralCode: result?.referral_code,
                    } as PromoterModelSB;
                } catch (error: any) {
                    console.log('🚀 ~ error:', error);
                    return null;
                }
            }
        },
        []
    );


    return {

        getPromotersOnDB,
        getPromoterOnDB,
        getPromoterByReferralOnDB,
        getAllPromotersSubsByAddressOnDB,
        addPromoterOnDB,
        setPromoterActiveOnDB,
        setPromoterPercentageOnDB,
        setPromoterProfitOnDB,


    };
};

export default usePromoter;
