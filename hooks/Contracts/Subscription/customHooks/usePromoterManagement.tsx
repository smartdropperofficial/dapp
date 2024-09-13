import { useEffect, useState, useCallback, useContext } from 'react';
import { ethers, BigNumber } from 'ethers';
import { useProvider, useSigner, useAccount } from 'wagmi';
import PromoterManagementABI from '../abi/PromoterManagementABI.json'; // Sostituisci con il percorso corretto del file ABI
import { PromoterModel } from '../types'; // Assicurati che il percorso del tipo sia corretto
import { checkErrorMessage, checkTxError, convertToDecimal, fetchAbiFromDatabase } from '../../../../utils/utils';
import Swal from 'sweetalert2';
import { supabase } from '../../../../utils/supabaseClient';
import { ConfigContext } from '@/store/config-context';
import { formatUnits } from 'ethers/lib/utils.js';

const usePromoterManagement = () => {
    const { config } = useContext(ConfigContext);

    // const contractAddress = process.env.NEXT_PUBLIC_PROMOTER_MANAGER_ADDRESS as `0x${string}`;
    const contractAddress = config?.promoter_contract as `0x${string}`;

    const provider = useProvider();
    const { data: signer } = useSigner();
    const { address: account } = useAccount();
    const [contract, setContract] = useState<ethers.Contract | null>(null);

    useEffect(() => {
        const loadContract = async () => {
            if (signer && config?.promoter_contract) {
                try {
                    const abi = await fetchAbiFromDatabase('promoter');
                    if (abi) {
                        const contract = new ethers.Contract(
                            config.promoter_contract as `0x${string}`,
                            abi,
                            signer
                        );
                        setContract(contract);
                    }
                } catch (error) {
                }
            }
        };

        loadContract();
    }, [signer, config?.subscription_management_contract]);

    const getFormatedPromoterObject = (promoter: any): any => {
        console.log("🚀 ~ getFormatedPromoterObject ~ promoter:", promoter);

        // Controlli per assicurarsi che percentage e profit siano definiti
        if (!promoter || !promoter.percentage || !promoter.profit) {
            throw new Error("Invalid promoter object: missing percentage or profit");
        }

        const result = {
            percentage: Number(convertToDecimal(ethers.BigNumber.from(promoter.percentage))),
            isActive: promoter.isActive,
            promoterAddress: promoter.promoterAddress,
            profit: formatUnits(ethers.BigNumber.from(promoter.profit), 6),
            referralCode: promoter.referralCode,
        }

        console.log("🚀 ~ getFormatedPromoterObject ~ result:", result);
        return result;
    }
    const getPromotersOnBC = useCallback(async (): Promise<PromoterModel[]> => {
        if (contract) {
            try {
                const result = await contract.getPromoters();
                const res = result.map((promoter: any) => getFormatedPromoterObject(promoter));
                console.log("🚀 ~ getPromotersOnBC ~ res:", result)
                return res;

            } catch (error) {
                console.error('Error fetching promoters:', error);
                return [] as PromoterModel[];
            }
        } else {
            return [] as PromoterModel[];
        }
    }, [contract]);
    const getAllPromotersSubsByAddressOnBC = useCallback(
        async (address: string): Promise<PromoterModel[]> => {
            if (contract) {
                try {
                    const result = await contract.getAllPromotersSubsByAddress(address);
                    return getFormatedPromoterObject(result);
                    // return result.map((promoter: PromoterModel) => ({
                    //     percentage: promoter.percentage,
                    //     isActive: promoter.isActive,
                    //     promoterAddress: promoter.promoterAddress,
                    //     profit: BigNumber.from(promoter.profit),
                    //     referralCode: promoter.referralCode,
                    // }));
                } catch (error: any) {
                    // checkErrorMessage(error.message);
                    console.error('Error fetching promoters:', error);
                    return [] as PromoterModel[];
                }
            } else {
                return [] as PromoterModel[];
            }
        },
        [contract]
    );
    const getPromoterOnBC = useCallback(
        async (promoterAddress: string): Promise<PromoterModel | null> => {
            if (contract) {
                try {
                    const result = await contract.getPromoter(promoterAddress);
                    console.log('🚀 ~ result -result?.profit:', Number(result?.profit));
                    return getFormatedPromoterObject(result);

                } catch (error: any) {
                    // console.log('🚀 ~ error:', error);
                    return null;
                }
            } else {
                console.log('🚀 ~ contract not found');

                return null;
            }
        },
        [contract]
    );
    const getPromoterByReferralOnBC = useCallback(
        async (referralCode: string): Promise<PromoterModel> => {
            if (contract) {
                try {
                    const result = await contract.getPromoterByReferralCode(referralCode);
                    return getFormatedPromoterObject(result);

                    // return {
                    //     percentage: convertToDecimal(result.percentage),
                    //     isActive: result.isActive,
                    //     promoterAddress: result.promoterAddress,
                    //     profit: convertToDecimal(result.profit),
                    //     referralCode: result.referralCode,
                    // };
                } catch (error: any) {
                    checkErrorMessage(error.message);
                    return null as unknown as PromoterModel;
                }
            } else {
                return null as unknown as PromoterModel;
            }
        },
        [contract]
    );
    const addPromoterOnBC = useCallback(
        async (promoterAddress: string, referral: string): Promise<PromoterModel | null> => {
            console.log("🚀 ~ promoterAddress:", promoterAddress);

            if (contract) {
                console.log("🚀 ~ referralCode:", referral);
                try {
                    const gasPrice = await provider.getFeeData();
                    console.log("🚀 promoterAddress ~ gasPrice:", gasPrice);

                    const estimatedGas = await contract.estimateGas.addPromoter(promoterAddress, referral);
                    console.log("🚀 promoterAddress ~ estimatedGas:", estimatedGas);

                    const finalGasLimit = Math.floor((estimatedGas.toNumber() * 110) / 100);
                    console.log("🚀 promoterAddress ~ finalGasLimit:", finalGasLimit);

                    if (!gasPrice.maxFeePerGas || !gasPrice.maxPriorityFeePerGas) {
                        throw new Error("Gas price data is missing");
                    }

                    const maxFeePerGas = ethers.BigNumber.from(gasPrice.maxFeePerGas);
                    const maxPriorityFeePerGas = ethers.BigNumber.from(gasPrice.maxPriorityFeePerGas);
                    const gasLimit = ethers.BigNumber.from(finalGasLimit);

                    console.log("🚀 ~ maxFeePerGas:", maxFeePerGas.toString());
                    console.log("🚀 ~ maxPriorityFeePerGas:", maxPriorityFeePerGas.toString());
                    console.log("🚀 ~ gasLimit:", gasLimit.toString());

                    const result = await contract.addPromoter(
                        promoterAddress, referral,
                        {
                            maxFeePerGas: maxFeePerGas,
                            maxPriorityFeePerGas: maxPriorityFeePerGas,
                            gasLimit: gasLimit,
                        }
                    );
                    console.log("🚀promoterAddress ~ tx:", result.hash);
                    const receipt = await result.wait();
                    console.log("🚀 ~ receipt:", receipt);

                    // Verifica la presenza di eventi nel receipt
                    if (!receipt.events) {
                        console.warn("No events found in receipt");
                    }

                    // Aggiungi log dettagliati per gli eventi trovati
                    console.log("🚀 ~ receipt.events:", receipt.events);

                    // Estrai i dati necessari dagli eventi dei log
                    const promoterAddedEvent = receipt.events?.find((event: any) => event.event === 'PromoterAdded');
                    const referralCodeAddedEvent = receipt.events?.find((event: any) => event.event === 'ReferralCodeAdded');

                    if (!promoterAddedEvent || !referralCodeAddedEvent) {
                        throw new Error("PromoterAdded or ReferralCodeAdded event not found");
                    }

                    const promoter = {
                        promoterAddress: promoterAddedEvent.args.promoterAddress,
                        percentage: promoterAddedEvent.args.percentage,
                        isActive: promoterAddedEvent.args.isActive,
                        profit: ethers.BigNumber.from(0), // Profit is initialized to 0 in the contract
                        referralCode: referralCodeAddedEvent.args.referralCode,
                    };

                    return getFormatedPromoterObject(promoter);
                } catch (error: any) {
                    console.error("Errore nella transazione:", error);
                    checkTxError(error);
                    return null;
                }
            } else {
                return null as unknown as PromoterModel;
            }
        },
        [contract]
    );
    const registerAsPromoterOnBC = useCallback(
        async (referral: string): Promise<PromoterModel | null> => {

            if (contract) {
                console.log("🚀 ~ referralCode:", referral);
                try {
                    const gasPrice = await provider.getFeeData();
                    console.log("🚀 promoterAddress ~ gasPrice:", gasPrice);

                    const estimatedGas = await contract.estimateGas.registerAsPromoter(referral);
                    console.log("🚀 promoterAddress ~ estimatedGas:", estimatedGas);

                    const finalGasLimit = Math.floor((estimatedGas.toNumber() * 110) / 100);
                    console.log("🚀 promoterAddress ~ finalGasLimit:", finalGasLimit);

                    if (!gasPrice.maxFeePerGas || !gasPrice.maxPriorityFeePerGas) {
                        throw new Error("Gas price data is missing");
                    }

                    const maxFeePerGas = ethers.BigNumber.from(gasPrice.maxFeePerGas);
                    const maxPriorityFeePerGas = ethers.BigNumber.from(gasPrice.maxPriorityFeePerGas);
                    const gasLimit = ethers.BigNumber.from(finalGasLimit);

                    console.log("🚀 ~ maxFeePerGas:", maxFeePerGas.toString());
                    console.log("🚀 ~ maxPriorityFeePerGas:", maxPriorityFeePerGas.toString());
                    console.log("🚀 ~ gasLimit:", gasLimit.toString());

                    const result = await contract.registerAsPromoter(
                        referral,
                        {
                            maxFeePerGas: maxFeePerGas,
                            maxPriorityFeePerGas: maxPriorityFeePerGas,
                            gasLimit: gasLimit,
                        }
                    );
                    console.log("🚀promoterAddress ~ tx:", result.hash);
                    const receipt = await result.wait();
                    console.log("🚀 ~ receipt:", receipt);

                    // Verifica la presenza di eventi nel receipt
                    if (!receipt.events) {
                        console.warn("No events found in receipt");
                    }

                    // Aggiungi log dettagliati per gli eventi trovati
                    console.log("🚀 ~ receipt.events:", receipt.events);

                    // Estrai i dati necessari dagli eventi dei log
                    const promoterAddedEvent = receipt.events?.find((event: any) => event.event === 'PromoterAdded');
                    const referralCodeAddedEvent = receipt.events?.find((event: any) => event.event === 'ReferralCodeAdded');

                    if (!promoterAddedEvent || !referralCodeAddedEvent) {
                        throw new Error("PromoterAdded or ReferralCodeAdded event not found");
                    }

                    const promoter = {
                        promoterAddress: promoterAddedEvent.args.promoterAddress,
                        percentage: promoterAddedEvent.args.percentage,
                        isActive: promoterAddedEvent.args.isActive,
                        profit: ethers.BigNumber.from(0), // Profit is initialized to 0 in the contract
                        referralCode: referralCodeAddedEvent.args.referralCode,
                    };

                    return getFormatedPromoterObject(promoter);
                } catch (error: any) {
                    console.error("Errore nella transazione:", error);
                    checkTxError(error);
                    return null;
                }
            } else {
                return null as unknown as PromoterModel;
            }
        },
        [contract]
    );
    const setPromoterActiveOnBC = useCallback(
        async (promoterAddress: string, isActive: boolean) => {
            if (contract) {
                try {
                    const tx = await contract.setPromoterActive(promoterAddress, isActive);
                    await tx.wait();
                    const { data, error } = await supabase.from('users').update({ is_active: isActive }).eq('wallet_address', promoterAddress);

                    if (error) {
                        Swal.fire({ title: 'is_promoter field NOT updated', icon: 'error', text: error.message });
                    } else {
                        Swal.fire({ title: 'is_promoter field updated', icon: 'success' });
                    }
                } catch (error: any) {
                    checkErrorMessage(error.message);
                }
            }
        },
        [contract]
    );
    const setPromoterPercentageOnBC = useCallback(
        async (promoterAddress: string, percentage: number) => {
            console.log("🚀 ~ setPromoterPercentage - useCallback - percentage:", percentage)
            if (contract) {
                try {
                    // Ottieni le tariffe del gas dal provider
                    const feeData = await provider.getFeeData();
                    console.log('🚀 ~ Fee Data:', feeData);
                    // Configura la transazione con le tariffe del gas
                    const transactionOptions = {
                        maxFeePerGas: feeData.maxFeePerGas,
                        maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
                    };

                    // Invia la transazione con le tariffe del gas adeguate
                    const tx = await contract.setPromoterPercentage(promoterAddress, percentage, transactionOptions);
                    await tx.wait();
                } catch (error: any) {
                    if (error.code === 'TRANSACTION_REPLACED') {
                        console.log('🚀 ~ Transaction was replaced:', error.replacement);
                        console.log('🚀 ~ Reason:', error.reason);
                        console.log('🚀 ~  error.replacement.status:', error.replacement.status);
                        if (error.replacement && error.replacement === 'repriced') {
                            console.log('🚀 ~ Replacement transaction succeeded');
                            Swal.fire({
                                title: 'Promoter created successfully (replacement)!',
                                icon: 'success',
                            });

                            const result = error.replacement;
                            return null;
                        } else {
                            console.log('🚀 ~ Replacement transaction failed or was cancelled');
                        }
                    } else {
                        console.log('🚀 ~ error:', error);
                        checkErrorMessage(error.message);
                    }
                    return null;
                }
            } else {
                console.log('Contract not initialized');
            }
        },
        [contract]
    );
    const setPromoterProfitOnBC = useCallback(
        async (promoterAddress: string, newProfit: number) => {
            if (contract) {
                try {
                    // Ottieni le tariffe del gas dal provider
                    const feeData = await provider.getFeeData();
                    console.log('🚀 ~ Fee Data:', feeData);

                    // Configura la transazione con le tariffe del gas
                    const transactionOptions = {
                        maxFeePerGas: feeData.maxFeePerGas,
                        maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
                    };

                    // Invia la transazione con le tariffe del gas adeguate
                    const tx = await contract.setPromoterProfit(promoterAddress, newProfit, transactionOptions);
                    await tx.wait();
                } catch (error: any) {
                    checkErrorMessage(error.message);
                    throw error;
                }
            } else {
                console.log('Contract not initialized');
            }
        },
        [contract]
    );
    const promoterWithdrawalProfitsOnBC = useCallback(async () => {
        if (contract) {
            try {
                const tx = await contract.PromoterWithdrawalProfits();
                await tx.wait();
            } catch (error) {
                console.error('Error withdrawing promoter profits:', error);
            }
        }
    }, [contract]);

    return {
        account,
        getPromotersOnBC,
        getPromoterOnBC,
        getPromoterByReferralOnBC,
        getAllPromotersSubsByAddressOnBC,
        addPromoterOnBC,
        setPromoterActiveOnBC,
        setPromoterPercentageOnBC,
        setPromoterProfitOnBC,
        promoterWithdrawalProfitsOnBC,
        registerAsPromoterOnBC

    };
};

export default usePromoterManagement;
