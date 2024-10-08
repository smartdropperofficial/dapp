import { useEffect, useState, useCallback, useContext } from 'react';
import { ethers } from 'ethers';
import { useSigner, useAccount } from 'wagmi';
import subscriptionModelABI from '../abi/subscriptionModelABI.json'; // Sostituisci con il percorso corretto del file ABI
import { SubscriptionManagementModel, SubscriptionPlans } from '../types'; // Assicurati che il percorso del tipo sia corretto
import { convertToDecimal, convertToScaled, fetchAbiFromDatabase } from '@/utils/utils';
import { checkErrorMessage } from '@/errors/checkErrorMessage';
import { ConfigContext } from '@/store/config-context';
import { formatUnits } from 'ethers/lib/utils.js';

const useSubscriptionPlan = () => {
    const { config, setAbiConfigHandler } = useContext(ConfigContext);
    const { data: signer } = useSigner();
    const { address: account } = useAccount();
    const [contract, setContract] = useState<ethers.Contract | null>(null);
    useEffect(() => {
        if (!signer || !config?.subscription_contract) return;
        try {
            const subscriptionContract = new ethers.Contract(config?.subscription_contract as `0x${string}`, subscriptionModelABI, signer);
            setContract(subscriptionContract);
        } catch (error) {
            console.error('Error creating contract:', error);
        }
    }, [signer, config]);

    useEffect(() => {
        const loadContract = async () => {
            if (!signer || !config?.subscription_contract) return;
            try {
                const abiJson = await fetchAbiFromDatabase('subscription_plan');
                if (abiJson) {
                    const subscriptionContract = new ethers.Contract(config.subscription_contract as `0x${string}`, abiJson, signer);
                    setContract(subscriptionContract);
                    setAbiConfigHandler({ orderAbi: abiJson });
                }
            } catch (error) {
                console.error('Error loading contract:', error);
            }
        };

        loadContract();
    }, [signer, config]);

    const getSubscriptionByPeriodOnBC = useCallback(
        async (subscriptionPeriod: number): Promise<SubscriptionManagementModel[]> => {
            if (!contract) throw new Error('Contract is not initialized');
            try {
                const result = await contract.getSubscriptionByPeriod(subscriptionPeriod);
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
        },
        [contract]
    );

    const getSubscriptionByIdOnBC = useCallback(
        async (Id: number): Promise<SubscriptionManagementModel> => {
            if (!contract) return {};
            try {
                const result = await contract.getSubscriptionById(Id);
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
                return {};
            }
        },
        [contract]
    );

    const addSubscriptionContractOnBC = useCallback(
        async (
            subscriptionType: number,
            subscriptionPeriod: number,
            name: string,
            price: number,
            period: number,
            enabled: boolean,
            fees: number,
            shopLimit: number
        ) => {
            if (!contract) throw new Error('Contract is not initialized');
            try {
                const tx = await contract.addSubscriptionContract(
                    subscriptionType,
                    subscriptionPeriod,
                    convertToScaled(price),
                    name,
                    period,
                    enabled,
                    convertToScaled(fees),
                    shopLimit
                );
                await tx.wait();
            } catch (error: any) {
                checkErrorMessage(error.message);
            }
        },
        [contract]
    );

    const changeSubscriptionTypeFeesOnBC = useCallback(
        async (subscriptionId: number, newFees: number) => {
            if (!contract) throw new Error('Contract is not initialized');
            try {
                const tx = await contract.changeSubscriptionTypeFees(subscriptionId, convertToScaled(newFees));
                await tx.wait();
            } catch (error: any) {
                checkErrorMessage(error.message);
            }
        },
        [contract]
    );

    const changeSubscriptionPriceOnBC = useCallback(
        async (subscriptionId: number, newPrice: number) => {
            if (!contract) throw new Error('Contract is not initialized');
            try {
                const tx = await contract.changeSubscriptionPrice(subscriptionId, convertToScaled(newPrice));
                const rs = await tx.wait();
            } catch (error: any) {
                checkErrorMessage(error.message);
            }
        },
        [contract]
    );

    const changeSubscriptionTypeShopLimitOnBC = useCallback(
        async (subscriptionId: number, newLimit: number) => {
            if (!contract) throw new Error('Contract is not initialized');
            try {
                const tx = await contract.changeSubscriptionTypeShopLimit(subscriptionId, newLimit);
                await tx.wait();
            } catch (error: any) {
                checkErrorMessage(error.message);
            }
        },
        [contract]
    );

    const getSubscriptionPlans = useCallback(async (): Promise<SubscriptionPlans[]> => {
        if (contract) {
            try {
                const result = await contract.getSubscriptionModels();
                return result.map((sub: any) => ({
                    id: sub.id.toNumber(),
                    subscriptionType: Number(sub.subscriptionType),
                    subscriptionPeriod: Number(sub.subscriptionPeriod),
                    name: sub.name,
                    // price: convertToDecimal(sub?.price),
                    // promoPrice: convertToDecimal(sub?.promoPrice),
                    price: Number(formatUnits(sub?.price, 6)),
                    promoPrice: Number(formatUnits(sub?.promoPrice, 6)),
                    period: sub.period,
                    enabled: sub.enabled,
                    fees: convertToDecimal(sub?.fees),
                    shopLimit: Number(formatUnits(sub.shopLimit, 4)),
                }));
            } catch (error: any) {
                console.log('🚀 ~ getSubscriptionModels ~ error:', error);
                checkErrorMessage(error.message);

                return [] as SubscriptionPlans[];
            }
        } else {
            return [] as SubscriptionPlans[];
        }
    }, [contract]);

    return {
        account,
        getSubscriptionByPeriod: getSubscriptionByPeriodOnBC,
        getSubscriptionByIdOnBC,
        addSubscriptionContract: addSubscriptionContractOnBC,
        changeSubscriptionTypeFees: changeSubscriptionTypeFeesOnBC,
        changeSubscriptionPrice: changeSubscriptionPriceOnBC,
        changeSubscriptionTypeShopLimit: changeSubscriptionTypeShopLimitOnBC,
        getSubscriptionModels: getSubscriptionPlans,
    };
};

export default useSubscriptionPlan;
