import { AES, enc } from 'crypto-js';
import { ethers } from 'ethers';
import Swal from 'sweetalert2';
import { ErrorManager } from '../errors/ErrorManager';
import { supabase } from './supabaseClient';
import { v4 as uuidv4 } from 'uuid';
import { formatUnits } from 'ethers/lib/utils.js';
import { parse, isValid, format } from 'date-fns';
import { SubscriptionManagementModel } from '@/hooks/Contracts/Subscription/types';
import { Abi, AbiFunction, AbiEvent } from 'viem';
import { ContextProductInfo } from '@/types/Product';

export const encryptData = (data: string) => {
    const ciphertext = AES.encrypt(data, process.env.NEXT_PUBLIC_API_ENCRYPTER!);
    return encodeURIComponent(ciphertext.toString());
};
export const decryptData = (data: string) => {
    try {
        const decodedStr = decodeURIComponent(data);
        const res = AES.decrypt(decodedStr, process.env.NEXT_PUBLIC_API_ENCRYPTER!).toString(enc.Utf8);
        return res;
    } catch (error) {
        console.log('🚀 ~ decryptData ~ error:', error);
        return '';
    }
};
export const isSubActive = (today: Date, endDate: Date) => {
    if (
        today.getFullYear() < endDate.getFullYear() ||
        (today.getFullYear() === endDate.getFullYear() && today.getMonth() < endDate.getMonth()) ||
        (today.getFullYear() === endDate.getFullYear() && today.getMonth() === endDate.getMonth() && today.getDate() < endDate.getDate())
    ) {
        return true;
    } else {
        return false;
    }
};
export const showInfoSwal = (text: string) => {
    return Swal.fire({
        title: text,
        icon: 'info',
    });
};
export const convertToDecimal = (value: ethers.BigNumber): number => {
    const res = Number(value) / 100; // Convert the value to decimal
    return res;
};
export const convertToNumber = (value: ethers.BigNumber): number => {
    return Number(value);
};
export const convertToString = (value: ethers.BigNumber): string => {
    return value.toString();
};
export const convertToBigNumber = (value: number): ethers.BigNumber => {
    return ethers.BigNumber.from(value);
};
export const convertToScaled = (value: number | null): number => {
    return Math.floor(value! * 100);
};
export function formatDateTime(timestampSeconds?: number): string {
    // Convert seconds to milliseconds
    const timestampMilliseconds = timestampSeconds! * 1000;
    return new Date(timestampMilliseconds).toLocaleString();
}
export function isDateExpired(dateString?: string): boolean {
    if (!dateString) {
        throw new Error('La data deve essere fornita');
    }

    const now = new Date();
    const inputDate = parse(dateString, 'd/M/yyyy, HH:mm:ss', new Date());

    if (!isValid(inputDate)) {
        return false;
    }

    return inputDate < now;
}
export const ReferralCodeGenerator = (): string => {
    const newCode = uuidv4().substring(0, 8);
    return newCode;
};
export const checkErrorMessage = (message: string): string | void => {
    const unauthorizedKeywords = ['Not Authorized', 'OwnableUnauthorizedAccount'];

    if (unauthorizedKeywords.some(keyword => message.indexOf(keyword) !== -1)) {
        throw new ErrorManager();
    }

    // Aggiungi altri controlli per altre eccezioni se necessario
};
export async function getUserConfig(config: boolean | undefined) {
    try {
        let { data, error } = await supabase.from('config').select('*').eq('config_id', Number(config)).single();

        if (error) {
            return null;
        }
        return data || null;
    } catch (error) {
        return null;
    }
}
export const getSubscriptionType = (type: number): string => {
    return type === 0 ? 'Retailer' : 'Business';
};
export const getSubscriptionPeriod = (type: number): string => {
    return type === 0 ? 'Monthly' : 'Annual';
};
export const checkTxError = (error: any): boolean => {
    if (error.code === 'TRANSACTION_REPLACED') {
        console.log('🚀 ~ Transaction was replaced:', error.replacement);
        console.log('🚀 ~ Reason:', error.reason);
        console.log('🚀 ~  error.replacement.status:', error.replacement.status);
        if (error.replacement && error.replacement === 'repriced') {
            console.log('🚀 ~ Replacement transaction succeeded');

            return true;
        } else {
            console.log('🚀 ~ Replacement transaction failed or was cancelled');
            return false;
        }
    } else {
        console.log('🚀 ~ error:', error);
        checkErrorMessage(error.message);
        return false;
    }
};
export const getFormatedSubscriptionObject = (subscription: any): SubscriptionManagementModel => {
    return {
        id: subscription.id,
        subscriber: subscription.subscriber,
        promoterAddress: subscription.promoterAddress,
        start: formatDateTime(Number(subscription.start)),
        end: formatDateTime(Number(subscription.end)),
        subscriptionModel: {
            id: Number(subscription.subscriptionModel.id),
            subscriptionType: Number(subscription.subscriptionModel.subscriptionType),
            subscriptionPeriod: Number(subscription.subscriptionModel.subscriptionPeriod),
            name: subscription.subscriptionModel.name,
            price: Number(formatUnits(subscription.subscriptionModel.price, 6)),
            promoPrice: Number(formatUnits(subscription?.subscriptionModel.promoPrice, 6)),
            period: Number(subscription.subscriptionModel.period),
            enabled: subscription.subscriptionModel.enabled,
            fees: convertToDecimal(subscription.subscriptionModel.fees),
            promoFees: convertToDecimal(subscription.subscriptionModel.promoFees as any),
            isPromoActive: subscription.subscriptionModel.isPromoActive,
            shopLimit: Number(formatUnits(convertToDecimal(ethers.BigNumber.from(subscription.subscriptionModel.shopLimit)), 4)),
        },
        totAmountPaid: Number(formatUnits(subscription.totAmountPaid, 6)),
        monthlyBudget: Number(convertToDecimal(subscription.totShopAmountPaid) / 10 ** 4),
        paymentTx: subscription?.paymentTx,
        promoterProfit: Number(formatUnits(Number(ethers.BigNumber.from(subscription?.promoterProfit)), 6)),
        promoterWithdrawn: subscription.promoterWithdrawn,
    };
};
export const formatSPDate = (dateString: string): string => {
    const date = new Date(dateString);
    const formattedDate = format(date, 'yyyy-MM-dd HH:mm:ss');
    return formattedDate;
};

export const fetchAbiFromDatabase = async (contractName: string): Promise<any | null> => {
    try {
        // Define the data type as an object with string keys
        const { data, error } = await supabase.from('abi_contracts').select(contractName).single();

        // Handle errors returned by Supabase
        if (error) {
            return null;
        }

        // Type assertion or generic typing to ensure `data` has string keys
        if (data && typeof data === 'object' && contractName in data) {
            try {
                // Attempt to parse the ABI
                const abi = JSON.parse(data[contractName as keyof typeof data]);
                return abi;
            } catch (parseError) {
                return null;
            }
        } else {
            // No ABI data found for the given contractNa   me
            return null;
        }
    } catch (exception) {
        // Catch unexpected errors outside of Supabase or JSON parsing
        return null;
    }
};
export const filterAbi = (abi: Abi): (AbiFunction | AbiEvent)[] => {
    return abi.filter((item): item is AbiFunction | AbiEvent => item.type === 'function' || item.type === 'event');
};
export const FormatedAbi = (abi: any) => {
    return abi.abiConfig?.orderAbi
        ? typeof abi.abiConfig.orderAbi === 'string'
            ? filterAbi(JSON.parse(abi.abiConfig.orderAbi) as Abi)
            : filterAbi(abi.abiConfig.orderAbi as Abi) // Se è già un oggetto
        : undefined;
};
export async function getUserByWalletAddress(walletAddress: string) {
    try {
        const { data: userWallet, error } = await supabase
            .from('user_wallets')
            .select(
                `
          wallet_address,
          user:users!inner (
            user_id,
            email,
            email_verified, 
            config_db,
            is_admin, 
            is_promoter
          )
        `
            )
            .eq('wallet_address', walletAddress)
            .single();

        if (error || !userWallet) {
            return null;
        }

        //   console.log("🚀 ~ getUserByWalletAddress ~ userWallet:", userWallet);

        const user = userWallet.user;

        return {
            ...user,
            address: walletAddress,
        };
    } catch (error) {
        return null;
    }
}
export const modifyBasketOnDB = async (wallet: string, items: any) => {
    try {
        // Calcola total_items e basket_price
        const total_items = items.reduce((acc: number, item: any) => acc + item.quantity, 0); // Somma delle quantità
        const basket_price = items.reduce((acc: number, item: any) => acc + parseFloat(item.price) * item.quantity, 0); // Somma del prezzo totale (price * quantity)

        // Prova ad aggiornare il record
        const { data: editData, error: editError } = await supabase
            .from('basket')
            .update({
                products: items,
                total_items,
                basket_price,
            })
            .eq('wallet_address', wallet)
            .select();

        if (editError) {
            return;
        }

        // Se nessun record è stato aggiornato (editData è vuoto), inserisci un nuovo record
        if (editData.length === 0) {
            const { data: addData, error: addError } = await supabase
                .from('basket')
                .insert([
                    {
                        wallet_address: wallet,
                        products: items,
                        total_items,
                        basket_price,
                    },
                ])
                .select();

            if (addError) {
                console.log('🚀 ~ modifyBasketOnDB ~ addError:', addError);
            } else {
                console.log('Record aggiunto con successo:', addData);
            }
        } else {
            console.log('Record aggiornato con successo:', editData);
        }
    } catch (error) {
        console.log('🚀 ~ modifyBasketOnDB ~ error:', error);
    }
};
export const deleteBasketOnDB = async (wallet: string): Promise<boolean> => {
    console.log('🚀 ~ deleteBasketOnDB ~ wallet:', wallet);
    try {
        const { data: deleteItem, error: editError } = await supabase.from('basket').delete().eq('wallet_address', wallet);

        if (editError) {
            console.log('🚀 ~ deleteBasketOnDB ~ editError:', editError);
            return false;
        }
        if (deleteItem) {
            console.log('🚀 ~ deleteBasketOnDB ~ deleteItem:', deleteItem);
        }

        return true;
    } catch (error) {
        console.log('🚀 ~ modifyBasketOnDB ~ error:', error);
        return true;
    }
};

export const getBasketOnDB = async (wallet: string): Promise<ContextProductInfo[]> => {
    try {
        let { data: basket, error } = await supabase.from('basket').select('*').eq('wallet_address', wallet);
        if (error || !basket || basket.length === 0) {
            return [];
        }
        const products = typeof basket[0]?.products === 'string' ? JSON.parse(basket[0]?.products) : basket[0]?.products;
        console.log('🚀 ~ getBasketOnDB ~ products:', products);

        return products as ContextProductInfo[];
    } catch (error) {
        console.log('🚀 ~ getBasketOnDB ~ error:', error);
        return [];
    }
};
