import { useEffect, useState, useCallback, useContext } from 'react';
import { ethers, BigNumber } from 'ethers';
import { useProvider, useSigner, useAccount } from 'wagmi';
import subscriptionManagementABI from '../abi/subscriptionManagementABI.json'; // Sostituisci con il percorso corretto del file ABI
import { SubscriptionManagementModel } from '../types'; // Assicurati che il percorso del tipo sia corretto
import Swal from 'sweetalert2';
import { checkTxError, convertToDecimal, convertToScaled, fetchAbiFromDatabase, getFormatedSubscriptionObject } from '@/utils/utils';
import { checkErrorMessage } from '@/errors/checkErrorMessage';
import { formatDateTime } from '@/utils/utils';
import { ConfigContext } from '@/store/config-context';
import { formatUnits } from 'ethers/lib/utils.js';
import { updateDataOnSB } from '@/hooks/Database/services/update';

const useSubscriptionManagement = () => {
    const { config } = useContext(ConfigContext);


    // const contractAddress = config?.subscription_management_contract as `0x${string}`;
    const provider = useProvider();
    const { data: signer } = useSigner();
    const { address: account } = useAccount();
    const [contract, setContract] = useState<ethers.Contract | null>(null);
    const [pk, setPk] = useState<string | undefined>(undefined);



    useEffect(() => {
        const loadContract = async () => {
            if (signer && config?.subscription_management_contract) {
                try {
                    const abi = await fetchAbiFromDatabase('subscription_management');
                    if (abi) {
                        const contract = new ethers.Contract(
                            config.subscription_management_contract as `0x${string}`,
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



    const createSubscriptionOnBC = useCallback(
        async (
            subscriptionTypeId: number,
            subscriber: string,
            paymentTx: string,
            promoterAddress?: string | null | undefined // Promoter address is optional
        ): Promise<boolean> => {
            // Assign default promoter address if undefined
            const PromoterAddress = promoterAddress || '0x0000000000000000000000000000000000000000';

            if (contract) {
                console.log('🚀 ~ createSubscription ~ subscriptionTypeId', subscriptionTypeId);
                console.log('🚀 ~ createSubscription ~ subscriber', subscriber);
                console.log('🚀 ~ createSubscription ~ paymentTx', paymentTx);
                console.log('🚀 ~ createSubscription ~ promoterAddress', PromoterAddress);

                try {
                    const tx = await contract.subscribe(subscriptionTypeId, subscriber, paymentTx, PromoterAddress);
                    console.log("🚀 ~ useSubscriptionManagement ~ tx:", tx)
                    Swal.fire({
                        title: 'Subscription successful',
                        icon: 'success',
                    });
                    console.log("🚀 ~ useSubscriptionManagement ~ tx:", tx)

                    return true;
                } catch (error: any) {
                    console.log('🚀 ~ useSubscriptionManagement ~ error:', error);
                    checkErrorMessage(error.message);
                    return false;
                }
            } else {
                return false;
            }
        },
        [contract]
    );
    const isSubscriptionValidByIdOnBC = useCallback(
        async (subscriptionId: number): Promise<boolean> => {
            if (contract) {
                try {
                    const isValid = await contract.isSubscriptionValidById(subscriptionId);
                    return isValid;
                } catch (error: any) {
                    checkErrorMessage(error.message);

                    return false;
                }
            } else {
                return false;
            }
        },
        [contract]
    );
    const getSubscriptionByIdOnBC = useCallback(
        async (subscriptionId: number): Promise<any | null> => {
            if (contract) {
                try {
                    const subscription = await contract.getSubscriptionById(subscriptionId);
                    return getFormatedSubscriptionObject(subscription);

                    // return {
                    //     id: subscription.id,
                    //     subscriber: subscription.subscriber,
                    //     promoterAddress: subscription.promoterAddress,
                    //     start: formatDateTime(subscription.start.toNumber()),
                    //     end: formatDateTime(subscription.end.toNumber()),
                    //     subscriptionModel: {
                    //         id: subscription.subscriptionModel.id,
                    //         subscriptionType: subscription.subscriptionModel.subscriptionType,
                    //         subscriptionPeriod: subscription.subscriptionModel.subscriptionPeriod,
                    //         name: subscription.subscriptionModel.name,
                    //         price: convertToDecimal(subscription.subscriptionModel.price),
                    //         promoPrice: convertToDecimal(subscription.subscriptionModel.promoPrice),
                    //         period: subscription.subscriptionModel.period,
                    //         enabled: subscription.subscriptionModel.enabled,
                    //         fees: convertToDecimal(subscription.subscriptionModel.fees),
                    //         promoFees: convertToDecimal(subscription.subscriptionModel.promoFees),
                    //         isPromoActive: subscription.subscriptionModel.isPromoActive,
                    //         shopLimit: convertToDecimal(subscription.subscriptionModel.shopLimit),
                    //     },
                    //     totAmountPaid: convertToDecimal(subscription.totAmountPaid),
                    //     paymentTx: subscription?.paymentTx,
                    //     promoterProfit: convertToDecimal(subscription?.promoterProfit),
                    //     totShopAmountPaid: convertToDecimal(subscription.totShopAmountPaid),
                    //     promoterWithdrawn: subscription.promoterWithdrawn,
                    // };
                } catch (error: any) {
                    console.log("🚀 ~ error:", error)
                    return null;
                }
            } else {
                return null;
            }
        },
        [contract]
    );
    const getSubscriptionByPaymentTxOnBC = useCallback(
        async (subscriptionId: number): Promise<SubscriptionManagementModel | null> => {
            if (contract) {
                try {
                    const subscription = await contract.getSubscriptionById(subscriptionId);
                    return getFormatedSubscriptionObject(subscription);
                    // return {
                    //     id: subscription.id,
                    //     subscriber: subscription.subscriber,
                    //     promoterAddress: subscription.promoterAddress,
                    //     start: formatDateTime(subscription.start.toNumber()),
                    //     end: formatDateTime(subscription.end.toNumber()),
                    //     subscriptionModel: {
                    //         id: subscription.subscriptionModel.id,
                    //         subscriptionType: subscription.subscriptionModel.subscriptionType,
                    //         subscriptionPeriod: subscription.subscriptionModel.subscriptionPeriod,
                    //         name: subscription.subscriptionModel.name,
                    //         price: convertToDecimal(subscription.subscriptionModel.price),
                    //         promoPrice: convertToDecimal(subscription.subscriptionModel.promoPrice),
                    //         period: subscription.subscriptionModel.period,
                    //         enabled: subscription.subscriptionModel.enabled,
                    //         fees: convertToDecimal(subscription.subscriptionModel.fees),
                    //         promoFees: convertToDecimal(subscription.subscriptionModel.promoFees),
                    //         isPromoActive: subscription.subscriptionModel.isPromoActive,
                    //         shopLimit: convertToDecimal(subscription.subscriptionModel.shopLimit),
                    //     },
                    //     totAmountPaid: convertToDecimal(subscription.totAmountPaid),
                    //     paymentTx: subscription?.paymentTx,
                    //     promoterProfit: convertToDecimal(subscription?.promoterProfit),
                    //     totShopAmountPaid: convertToDecimal(subscription.totShopAmountPaid),
                    //     promoterWithdrawn: subscription.promoterWithdrawn,
                    // };
                } catch (error: any) {
                    console.log("🚀 ~ error:", error)
                    return null;
                }
            } else {
                return null;
            }
        },
        [contract]
    );
    const isSubscriptionValidByAddressOnBC = useCallback(
        async (subscriber: string): Promise<boolean> => {
            if (contract) {
                try {
                    const isValid = await contract.isSubscriptionValidByAddress(subscriber);
                    return isValid;
                } catch (error: any) {
                    checkErrorMessage(error.message);

                    return false;
                }
            } else {
                return false;
            }
        },
        [contract]
    );
    const getAllSubsByAddressOnBC = useCallback(
        async (subscriber: string): Promise<SubscriptionManagementModel[]> => {
            if (contract) {
                try {
                    const subscriptions = await contract.getAllSubsByAddress(subscriber);
                    console.log("🚀 ~ subscriptions:", subscriptions)
                    return subscriptions.map((subscription: any) =>
                        getFormatedSubscriptionObject(subscription)
                    );
                } catch (error: any) {
                    console.log('🚀 ~ error:', error);
                    checkErrorMessage(error.message);
                    return [];
                }
            } else {
                return [];
            }
        },
        [contract]
    );
    // const getLastValidSubscription = useCallback(
    //     async (subscriber: string): Promise<SubscriptionManagementModel | undefined> => {
    //         if (contract) {
    //             try {
    //                 const subscriptions = await contract.getAllValidSubscriptionsByWalletAddress(subscriber);
    //                 const subscription = subscriptions.reduce(
    //                     (maxSubscription: { subscriptionModel: { id: number } }, subscription: { subscriptionModel: { id: number } }) => {
    //                         return subscription.subscriptionModel.id > maxSubscription.subscriptionModel.id ? subscription : maxSubscription;
    //                     },
    //                     subscriptions[0]
    //                 );
    //                 // const subscription = subscriptions.reduce(
    //                 //     (maxSubscription: { subscriptionModel: { id: number } }, subscription: { subscriptionModel: { id: number } }) => {
    //                 //         return subscription.subscriptionModel.id > maxSubscription.subscriptionModel.id ? subscription : maxSubscription;
    //                 //     },
    //                 //     subscriptions[0]
    //                 // );
    //                 if (!subscription) {
    //                     return null as unknown as SubscriptionManagementModel;
    //                 }  
    //                 console.log("🚀 ~ subscription:",  Number(subscription.id))
    //                 console.log("🚀 ~ totShopAmountPaid:",  convertToDecimal(subscription.totShopAmountPaid))

    //                 return {
    //                     id: Number(subscription.id),
    //                     subscriber: subscription.subscriber,
    //                     promoterAddress: subscription?.promoterAddress,
    //                     start: formatDateTime(subscription.start),
    //                     end: formatDateTime(subscription.end),
    //                     subscriptionModel: {
    //                         id: subscription.subscriptionModel.id,
    //                         subscriptionType: subscription.subscriptionModel.subscriptionType,
    //                         subscriptionPeriod: subscription.subscriptionModel.subscriptionPeriod,
    //                         name: subscription.subscriptionModel.name,
    //                         price: convertToDecimal(subscription.subscriptionModel.price),
    //                         promoPrice: convertToDecimal(subscription.subscriptionModel.promoPrice),
    //                         period: subscription.subscriptionModel.period,
    //                         enabled: subscription.subscriptionModel.enabled,
    //                         fees: convertToDecimal(subscription.subscriptionModel.fees),
    //                         promoFees: convertToDecimal(subscription.subscriptionModel.promoFees),
    //                         isPromoActive: subscription.subscriptionModel.isPromoActive,
    //                         shopLimit: convertToDecimal(subscription.subscriptionModel.shopLimit),
    //                     },
    //                     totAmountPaid: convertToDecimal(subscription.totAmountPaid),
    //                     paymentTx: subscription?.paymentTx,
    //                     promoterProfit: convertToDecimal(subscription?.promoterProfit), 
    //                     totShopAmountPaid: convertToDecimal(subscription.totShopAmountPaid),
    //                     promoterWithdrawn: subscription.promoterWithdrawn,
    //                 };
    //             } catch (error: any) {
    //                 console.log('🚀 ~ error:', error);

    //                 checkErrorMessage(error.message);
    //                 return null as unknown as SubscriptionManagementModel;
    //             }
    //         } else {
    //             return null as unknown as SubscriptionManagementModel;
    //         }
    //     },
    //     [contract]
    // );
    const getLastValidSubscriptionOnBC = useCallback(
        async (subscriber: string): Promise<SubscriptionManagementModel | undefined> => {
            if (contract) {
                try {
                    const subscriptions = await contract.getAllValidSubscriptionsByWalletAddress(subscriber);

                    if (!subscriptions || subscriptions.length === 0) {
                        console.log("Nessuna subscription valida trovata");
                        return undefined;
                    }

                    const subscription = subscriptions.reduce(
                        (maxSubscription: { subscriptionModel: { id: number } }, subscription: { subscriptionModel: { id: number } }) => {
                            return subscription.subscriptionModel.id > maxSubscription.subscriptionModel.id ? subscription : maxSubscription;
                        },
                        subscriptions[0]
                    );


                    return {
                        id: subscription.id,
                        subscriber: subscription.subscriber,
                        start: formatDateTime(subscription.start.toNumber()),
                        end: formatDateTime(subscription.end.toNumber()),
                        subscriptionModel: {
                            id: subscription.subscriptionModel.id,
                            subscriptionType: subscription.subscriptionModel.subscriptionType,
                            subscriptionPeriod: subscription.subscriptionModel.subscriptionPeriod,
                            name: subscription.subscriptionModel.name,
                            //price: subscription.subscriptionModel.price,
                            price: Number(formatUnits(subscription.subscriptionModel.price, 6)),
                            // promoPrice: convertToDecimal(subscription.subscriptionModel.promoPrice),
                            // promoPrice: formatUnits(Number(ethers.BigNumber.from(convertToDecimal(subscription.subscriptionModel.promoPrice))), 4), 
                            promoPrice: Number(formatUnits(subscription?.subscriptionModel.promoPrice, 6)),

                            period: subscription.subscriptionModel.period,
                            enabled: subscription.subscriptionModel.enabled,
                            fees: subscription.subscriptionModel.fees,
                            promoFees: convertToDecimal(subscription.subscriptionModel.promoFees),
                            isPromoActive: subscription.subscriptionModel.isPromoActive,
                            shopLimit: convertToDecimal(subscription.subscriptionModel.shopLimit),
                        },
                        totAmountPaid: convertToDecimal(subscription.totAmountPaid),
                        paymentTx: subscription?.paymentTx,
                        //promoterProfit: convertToDecimal(subscription?.promoterProfit),

                        promoterProfit: formatUnits(Number(ethers.BigNumber.from(subscription?.promoterProfit)), 6),
                        totShopAmountPaid: Number(formatUnits((subscription.totShopAmountPaid, 6))),

                        promoterWithdrawn: subscription.promoterWithdrawn
                    } as any;
                } catch (error: any) {
                    console.log('Errore in getLastValidSubscription:', error);
                    checkErrorMessage(error.message);
                    return null as unknown as SubscriptionManagementModel;
                }
            } else {
                return null as unknown as SubscriptionManagementModel;
            }
        },
        [contract]
    );
    const getAllPromotersSubscriptionsOnBC = useCallback(
        async (promoterAddress: string): Promise<SubscriptionManagementModel[]> => {
            if (contract) {
                try {
                    const subscriptions = await contract.getAllPromotersSubsByAddress(promoterAddress);

                    // return subscriptions.map((subscription: any) => ({
                    //     id: subscription.id,
                    //     subscriber: subscription.subscriber,
                    //     start: formatDateTime(subscription.start.toNumber()),
                    //     end: formatDateTime(subscription.end.toNumber()),
                    //     subscriptionModel: {
                    //         id: subscription.subscriptionModel.id,
                    //         subscriptionType: subscription.subscriptionModel.subscriptionType,
                    //         subscriptionPeriod: subscription.subscriptionModel.subscriptionPeriod,
                    //         name: subscription.subscriptionModel.name,
                    //         price: convertToDecimal(subscription.subscriptionModel.price).toFixed(2),
                    //         promoPrice: convertToDecimal(subscription.subscriptionModel.promoPrice), // Add the missing property 'promoPrice'
                    //         period: subscription.subscriptionModel.period,
                    //         enabled: subscription.subscriptionModel.enabled,
                    //         fees: subscription.subscriptionModel.fees,
                    //         promoFees: convertToDecimal(subscription.subscriptionModel.promoFees),
                    //         isPromoActive: subscription.subscriptionModel.isPromoActive,
                    //         shopLimit: convertToDecimal(subscription.subscriptionModel.shopLimit),
                    //     },
                    //     totAmountPaid: convertToDecimal(subscription.totAmountPaid),
                    //     paymentTx: subscription?.paymentTx,
                    //     promoterProfit: convertToDecimal(subscription?.promoterProfit),
                    //     totShopAmountPaid: convertToDecimal(subscription.totShopAmountPaid),

                    //     promoterWithdrawn: subscription.promoterWithdrawn,
                    // }));  
                    return subscriptions.map((subscription: any) => getFormatedSubscriptionObject(subscription));

                    // return subscriptions.map((subscription: any) => ({
                    //     id: subscription.id,
                    //     subscriber: subscription.subscriber,
                    //     start: formatDateTime(subscription.start.toNumber()),
                    //     end: formatDateTime(subscription.end.toNumber()),
                    //     subscriptionModel: {
                    //         id: subscription.subscriptionModel.id,
                    //         subscriptionType: subscription.subscriptionModel.subscriptionType,
                    //         subscriptionPeriod: subscription.subscriptionModel.subscriptionPeriod,
                    //         name: subscription.subscriptionModel.name,
                    //         //price: subscription.subscriptionModel.price,
                    //         price: Number(formatUnits(subscription.subscriptionModel.price, 6)),
                    //         // promoPrice: convertToDecimal(subscription.subscriptionModel.promoPrice),
                    //         // promoPrice: formatUnits(Number(ethers.BigNumber.from(convertToDecimal(subscription.subscriptionModel.promoPrice))), 4), 
                    //         promoPrice: Number(formatUnits(subscription?.subscriptionModel.promoPrice, 6)),

                    //         period: subscription.subscriptionModel.period,
                    //         enabled: subscription.subscriptionModel.enabled,
                    //         fees: subscription.subscriptionModel.fees,
                    //         promoFees: convertToDecimal(subscription.subscriptionModel.promoFees),
                    //         isPromoActive: subscription.subscriptionModel.isPromoActive,
                    //         shopLimit: convertToDecimal(subscription.subscriptionModel.shopLimit),
                    //     },
                    //     totAmountPaid: convertToDecimal(subscription.totAmountPaid),
                    //     paymentTx: subscription?.paymentTx,
                    //     //promoterProfit: convertToDecimal(subscription?.promoterProfit),

                    //     promoterProfit: formatUnits(Number(ethers.BigNumber.from(subscription?.promoterProfit)), 6),
                    //     totShopAmountPaid: Number(formatUnits((subscription.totShopAmountPaid, 6))),
                    //     promoterWithdrawn: subscription.promoterWithdrawn
                    // }));
                } catch (error: any) {
                    console.log('🚀 ~ error:', error);
                    // checkErrorMessage(error.message);

                    return [];
                }
            } else {
                return [];
            }
        },
        [contract]
    );
    const getSubsByIdOnBC = useCallback(
        async (subId: number): Promise<SubscriptionManagementModel> => {
            if (contract) {
                try {
                    const subscription = await contract.getSubscriptionById(subId);
                    return getFormatedSubscriptionObject(subscription);
                    // return {
                    //     id: subscription.id,
                    //     subscriber: subscription.subscriber,
                    //     promoterAddress: subscription.promoterAddress,
                    //     start: formatDateTime(subscription.start.toNumber()),
                    //     end: formatDateTime(subscription.end.toNumber()),
                    //     subscriptionModel: {
                    //         id: subscription.subscriptionModel.id,
                    //         subscriptionType: subscription.subscriptionModel.subscriptionType,
                    //         subscriptionPeriod: subscription.subscriptionModel.subscriptionPeriod,
                    //         name: subscription.subscriptionModel.name,
                    //         price: convertToDecimal(subscription.subscriptionModel.price),
                    //         promoPrice: convertToDecimal(subscription.subscriptionModel.promoPrice), // Add the missing property 'promoPrice'
                    //         period: subscription.subscriptionModel.period,
                    //         enabled: subscription.subscriptionModel.enabled,
                    //         fees: convertToDecimal(subscription.subscriptionModel.fees),
                    //         promoFees: convertToDecimal(subscription.subscriptionModel.promoFees),
                    //         isPromoActive: subscription.subscriptionModel.isPromoActive,
                    //         shopLimit: convertToDecimal(subscription.subscriptionModel.shopLimit),
                    //     },
                    //     totAmountPaid: subscription.totAmountPaid,
                    //     paymentTx: subscription?.paymentTx,
                    //     promoterProfit: convertToDecimal(subscription?.promoterProfit),
                    //     totShopAmountPaid: convertToDecimal(subscription.totShopAmountPaid),
                    //     promoterWithdrawn: subscription.promoterWithdrawn,
                    // };
                } catch (error: any) {
                    console.log("🚀 ~ error:", error)
                    checkErrorMessage(error.message);
                    return null as unknown as SubscriptionManagementModel;
                }
            } else {
                return null as unknown as SubscriptionManagementModel;
            }
        },
        [contract]
    );
    const changeTotShopAmountPaidOnBC = useCallback(
        async (subId: number, newAmount: number) => {
            if (contract && provider) {
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
                    const tx = await contract.changeTotShopAmountPaid(subId, newAmount, transactionOptions);
                    await tx.wait();
                    console.log("🚀 ~ tx:", tx);

                    Swal.fire({ title: 'Change successful', icon: 'success' });
                } catch (error: any) {
                    console.log("🚀 ~ error:", error);
                    checkErrorMessage(error.message);
                    throw error;
                }
            } else {
                console.log('Contract not initialized');
            }
        },
        [contract, provider]
    );
    // const incrementTotShopAmountPaid = useCallback(
    //     async (subId: number, newAmount: number) => {
    //         // if (contract) {
    //         //     try {
    //         //         const tx = await contract.incrementTotShopAmountPaid(subId, newAmount);
    //         //         await tx.wait();
    //         //     console.log("🚀 ~ tx:", tx)
    //         //         process.env.NODE_ENV === 'development' && Swal.fire({ title: 'Change successful', icon: 'success' });
    //         //     } catch (error: any) {
    //         //         console.log("🚀 ~ error:", error)
    //         //     }
    //         // }  
    //         if (contract && pk) {
    //             console.log("🚀 ~ process.env.SUBSCRIPTION_WALLET_ONWER_PKEY:", pk!)
    //             try {
    //                 // Creazione del provider e del wallet utilizzando la chiave privata
    //                 // const ownerProvider = new ethers.providers.InfuraProvider('mainnet', process.env.REACT_APP_INFURA_PROJECT_ID);  
    //                 const providerUrl = process.env.NODE_ENV === 'development'
    //                     ? 'http://localhost:8545'
    //                     : `https://mainnet.infura.io/v3/${process.env.REACT_APP_INFURA_PROJECT_ID}`;
    //                 console.log("🚀 ~ providerUrl:", providerUrl)

    //                 const ownerProvider = new ethers.providers.JsonRpcProvider(providerUrl);
    //                 console.log("🚀 ~ ownerProvider:", ownerProvider)
    //                 const ownerWallet = new ethers.Wallet(process.env.SUBSCRIPTION_WALLET_ONWER_PKEY!, ownerProvider);
    //                 console.log("🚀 ~ ownerWallet:", ownerWallet)
    //                 const ownerContract = new ethers.Contract(contractAddress, subscriptionManagementABI, ownerWallet);
    //                 console.log("🚀 ~ ownerContract:", ownerContract)

    //                 // Stima delle gas fees
    //                 const gasPrice = await provider.getGasPrice();
    //                 console.log("🚀 ~ gasPrice:", gasPrice)
    //                 const gasLimit = await ownerContract.estimateGas.incrementTotShopAmountPaid(subId, newAmount);
    //                 console.log("🚀 ~ gasLimit:", gasLimit)

    //                 // Creazione e invio della transazione
    //                 const tx = await ownerContract.incrementTotShopAmountPaid(subId, newAmount, {
    //                     gasPrice,
    //                     gasLimit,
    //                 });
    //                 console.log("🚀 ~ tx:", tx)

    //                 const res = await tx.wait();
    //                 console.log("🚀 ~ TX-res:", res)
    //                 Swal.fire({ title: 'Change successful', icon: 'success' });
    //             } catch (error: any) {
    //                 console.log('🚀 ~ error:', error);
    //                 checkErrorMessage(error.message);
    //             }
    //         }

    //     },
    //     [contract, pk]
    // );
    // const getNativeFunds = useCallback(async (): Promise<number> => {
    //     if (contract) {
    //         try {
    //             const amount = await contract.getNativeFunds();
    //             return Number(ethers.utils.formatEther(amount));
    //         } catch (error: any) {
    //             checkErrorMessage(error.message);
    //             return 0;
    //         }
    //     } else {
    //         return 0;
    //     }
    // }, [contract]);
    // const getFunds = useCallback(async (): Promise<number> => {
    //     if (contract) {
    //         try {
    //             const amount = await contract.getCoinFunds();
    //             console.log("🚀 ~ getFunds ~ amount:", Number(amount))
    //             console.log("🚀 ~ getFunds ~ amount to decimal:", convertToDecimal(amount))
    //             // return Number(ethers.utils.formatEther(amount));
    //             return Number(formatUnits(amount, 6));
    //         } catch (error: any) {
    //             console.log("🚀 ~ getFunds ~ error:", error)
    //             checkErrorMessage(error.message);
    //             return 0;
    //         }
    //     } else {
    //         return 0;
    //     }
    // }, [contract]);
    // const withdrawPromoterFundsOnBC = useCallback(async (): Promise<boolean> => {
    //     if (contract) {
    //         try {
    //             const tx = await contract.withdrawPromoterProfit();
    //             const receipt = await tx.wait();
    //             console.log("🚀 ~ withdrawPromoterFunds ~ receipt:", receipt)

    //             // Find the event
    //             //  const event = receipt.events.find((event: any) => event.event === 'OnWithdrawPromoterFunds');
    //             // if (!event) {
    //             //   Swal.fire({
    //             //     title: 'Withdrawal NOT Successful',
    //             //     icon: 'error',
    //             //     text: 'OnWithdrawPromoterFunds event not found',
    //             //   });
    //             //   return 0;
    //             // }

    //             // console.log('🚀 ~ withdrawPromoterFunds ~ event.args:', event.args);

    //             // Assuming you want to convert the amount from wei to ether
    //             Swal.fire({ title: 'Withdrawal successful', icon: 'success' });

    //             return true;
    //         } catch (error: any) {
    //             // Check for specific error messages and handle accordingly
    //             checkErrorMessage(error.message);
    //             return false;
    //         }
    //     } else {
    //         return false;
    //     }
    // }, [contract]);
    const withdrawlAllCoinFundsOnBC = useCallback(async (): Promise<boolean> => {
        if (contract) {
            try {
                // Ottieni le tariffe del gas dal provider
                const feeData = await provider.getFeeData();
                console.log('🚀 ~ Fee Data:', feeData);
                const transactionOptions = {
                    maxFeePerGas: feeData.maxFeePerGas,
                    maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
                };

                // Invia la transazione con le tariffe del gas adeguate
                const tx = await contract.withdrawlAllCoinFunds(transactionOptions);
                const receipt = await tx.wait();
                console.log("🚀 ~ withdrawlAllCoinFunds ~ receipt:", receipt)
                Swal.fire({ title: 'Withdrawal successful', icon: 'success' });
                return true;
            } catch (error: any) {
                checkErrorMessage(error.message);
                return false;
            }
        } else {
            return false;
        }
    }, [contract]);
    const changeCoinContractAddressOnBC = useCallback(async (newAddress: string) => {
        if (contract) {
            try {
                const tx = await contract.changeCoinContract(newAddress);
                await tx.wait();
                console.log("🚀 ~ changeCoinContractAddressOnBC ~ tx:", tx)

                Swal.fire({ title: 'Change successful', icon: 'success' });
            } catch (error: any) {
                checkErrorMessage(error.message);
                throw error;
            }
        }
    }, [contract]);
    // const withdrawlEthFunds = useCallback(async (): Promise<boolean> => {
    //     if (contract) {
    //         try {
    //             const tx = await contract.withdrawlEthFunds();
    //             const receipt = await tx.wait();

    //             // Find the event
    //             //  const event = receipt.events.find((event: any) => event.event === 'OnWithdrawPromoterFunds');
    //             // if (!event) {
    //             //   Swal.fire({
    //             //     title: 'Withdrawal NOT Successful',
    //             //     icon: 'error',
    //             //     text: 'OnWithdrawPromoterFunds event not found',
    //             //   });
    //             //   return 0;
    //             // }

    //             // console.log('🚀 ~ withdrawPromoterFunds ~ event.args:', event.args);

    //             // Assuming you want to convert the amount from wei to ether
    //             Swal.fire({ title: 'Withdrawal successful', icon: 'success' });

    //             return true;
    //         } catch (error: any) {
    //             // Check for specific error messages and handle accordingly
    //             checkErrorMessage(error.message);
    //             return false;
    //         }
    //     } else {
    //         return false;
    //     }
    // }, [contract]);
    const changePromoterProfitOnBC = useCallback(async (subId: number, newAmount: number) => {
        if (contract) {
            try {
                const tx = await contract.changePromoterProfit(subId, newAmount);
                await tx.wait();
                Swal.fire({ title: 'Change successful', icon: 'success' });
            } catch (error: any) {
                checkErrorMessage(error.message);
                throw error;
            }
        }
    }, [contract]);
    const withdrawPromoterProfitOnBC = useCallback(async (): Promise<boolean> => {
        if (contract && provider) {
            try {
                // Ottieni le tariffe del gas dal provider
                const gasPrice = await provider.getFeeData();
                console.log("🚀 withdrawPromoterProfit ~ gasPrice:", gasPrice);
                const estimatedGas = await contract.estimateGas.withdrawPromoterProfit();
                console.log("🚀 withdrawPromoterProfit ~ estimatedGas:", estimatedGas)

                const finalGasLimit = Math.floor((estimatedGas.toNumber() * 110) / 100);
                console.log("🚀 withdrawPromoterProfit ~ finalGasLimit:", finalGasLimit);

                const maxFeePerGas = ethers.BigNumber.from(gasPrice.maxFeePerGas);
                const maxPriorityFeePerGas = ethers.BigNumber.from(gasPrice.maxPriorityFeePerGas);
                const gasLimit = ethers.BigNumber.from(finalGasLimit);

                // Creazione e invio della transazione
                const TxResult = await contract.withdrawPromoterProfit(

                    {
                        maxFeePerGas: maxFeePerGas,
                        maxPriorityFeePerGas: maxPriorityFeePerGas,
                        gasLimit: gasLimit,
                    }
                );
                const receipt = await TxResult.wait();
                console.log("🚀 withdrawPromoterProfit ~ receipt:", receipt.transactionHash);

                updateDataOnSB("subscription", { promoter_withdrawn_tx: receipt.transactionHash }, { promoter_withdrawn: false }).then((result: { data: any; error: any; }) => {

                    if (!result) return;
                    if (result.error || !result.data) {
                        throw new Error(`Errore nell'aggiornamento dei dati: ${result.error.message}`)
                    }

                }).catch((error: { message: any; }) => {
                    throw new Error(`Errore nell'aggiornamento dei dati: ${error.message}`)
                });
                updateDataOnSB("subscription", { promoter_withdrawn: true }, { promoter_withdrawn_tx: receipt.transactionHash }).then((result: { data: any; error: any; }) => {
                    if (!result) return;
                    if (result.error) {
                        throw new Error(`Errore nell'aggiornamento dei dati: ${result.error.message}`)
                    }
                }).catch((error: { message: any; }) => {
                    throw new Error(`Errore nell'aggiornamento dei dati: ${error.message}`)
                });
                return true;
            } catch (error: any) {
                if (checkTxError(error)) {
                    return true;

                } else {
                    return false;
                }
            }
        } else {
            return false;
        }
    }, [contract, provider]);

    return {
        account,
        createSubscriptionOnBC,
        isSubscriptionValidByIdOnBC,
        isSubscriptionValidByAddressOnBC,
        getAllSubsByAddressOnBC,
        getAllPromotersSubscriptionsOnBC,
        getSubsByIdOnBC,
        getLastValidSubscriptionOnBC,
        changeTotShopAmountPaidOnBC,
        getSubscriptionByIdOnBC,
        changePromoterProfitOnBC,
        withdrawPromoterProfitOnBC,
        getSubscriptionByPaymentTxOnBC,
        withdrawlAllCoinFundsOnBC,
        changeCoinContractAddressOnBC
    };
};

export default useSubscriptionManagement;
