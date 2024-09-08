import { useEffect, useState, useCallback, useContext } from 'react';
import { ethers } from 'ethers';
import { useSigner, useAccount } from 'wagmi';
import subscriptionModelABI from '../abi/subscriptionModelABI.json'; // Sostituisci con il percorso corretto del file ABI
import { SubscriptionManagementModel, SubscriptionModel } from '../types'; // Assicurati che il percorso del tipo sia corretto
import { convertToDecimal, convertToScaled, fetchAbiFromDatabase } from '@/utils/utils';
import { checkErrorMessage } from '@/errors/checkErrorMessage';
import { ConfigContext } from '@/store/config-context';
import { formatUnits } from 'ethers/lib/utils.js';

const useSubscriptionPlan = () => {
    const { config } = useContext(ConfigContext);
    const { data: signer } = useSigner();
    const { address: account } = useAccount();
    const [contract, setContract] = useState<ethers.Contract | null>(null);
    useEffect(() => {
        if (!signer || !config?.subscription_contract) return;
        try {
            const subscriptionContract = new ethers.Contract(
                config?.subscription_contract as `0x${string}`,
                subscriptionModelABI,
                signer
            );
            setContract(subscriptionContract);
        } catch (error) {
            console.error('Error creating contract:', error);
        }
    }, [signer, config]);


    useEffect(() => {
        const loadContract = async () => {
            if (!signer || !config?.subscription_contract) return;
            try {
                const abi: ethers.ContractInterface = await fetchAbiFromDatabase('subscription_plan');
                if (abi) { 
                    console.log("Contract Address:", config.subscription_contract);
                    console.log("Contract ABI:", abi);
                    const subscriptionContract = new ethers.Contract(
                        config.subscription_contract as `0x${string}`,
                        abi,
                        signer
                    );
                    setContract(subscriptionContract);
                }
            } catch (error) {
                console.error('Error loading contract:', error);
            }
        };

        loadContract();
    }, [signer, config]);

    const getSubscriptionByPeriod = useCallback(
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

    const getSubscriptionByType = useCallback(
        async (subscriptionType: number): Promise<SubscriptionManagementModel[]> => {
            if (!contract) return [];
            try {
                const result = await contract.getSubscriptionByType(subscriptionType);
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
        },
        [contract]
    );

    const addSubscriptionContract = useCallback(
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

    const changeSubscriptionTypeFees = useCallback(
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

    const changeSubscriptionPrice = useCallback(
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

    const changeSubscriptionTypeShopLimit = useCallback(
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

    const getSubscriptionModels = useCallback(async (): Promise<SubscriptionModel[]> => {
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
                console.log("🚀 ~ getSubscriptionModels ~ error:", error)
                checkErrorMessage(error.message);

                return [] as SubscriptionModel[];
            }
        } else {
            return [] as SubscriptionModel[];
        }
    }, [contract]);

    return {
        account,
        getSubscriptionByPeriod,
        getSubscriptionByType,
        addSubscriptionContract,
        changeSubscriptionTypeFees,
        changeSubscriptionPrice,
        changeSubscriptionTypeShopLimit,
        getSubscriptionModels,
    };
};

export default useSubscriptionPlan;
