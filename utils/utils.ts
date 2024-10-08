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

export const encryptData = (data: string) => {
    const ciphertext = AES.encrypt(data, process.env.NEXT_PUBLIC_API_ENCRYPTER!);
    return encodeURIComponent(ciphertext.toString());
};
export const decryptData = (data: string) => {
    console.log("🚀 ~ decryptData ~ data:", data)
    try {
        const decodedStr = decodeURIComponent(data);
        console.log("🚀 ~ decryptData ~ decodedStr:", decodedStr)
         const res=  AES.decrypt(decodedStr, process.env.NEXT_PUBLIC_API_ENCRYPTER!).toString(enc.Utf8); 
         console.log("🚀 ~ decryptData ~ res:", res)
         return res; 
    } catch (error) {
        console.log("🚀 ~ decryptData ~ error:", error)
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
        throw new Error("La data deve essere fornita");
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
}
export const getFormatedSubscriptionObject = (subscription: any): SubscriptionManagementModel => {
    return {
        id: Number(subscription.id),
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
        totShopAmountPaid: Number(convertToDecimal(subscription.totShopAmountPaid)),
        paymentTx: subscription?.paymentTx,
        promoterProfit: Number(formatUnits(Number(ethers.BigNumber.from(subscription?.promoterProfit)), 6)),
        promoterWithdrawn: subscription.promoterWithdrawn
    }
}
export const formatSPDate = (dateString: string): string => {
    const date = new Date(dateString);
    const formattedDate = format(date, 'yyyy-MM-dd HH:mm:ss');
    return formattedDate;
};

export const fetchAbiFromDatabase = async (contractName: string): Promise<any | null> => {
    try {
        // Define the data type as an object with string keys
        const { data, error } = await supabase
            .from('abi_contracts')
            .select(contractName)
            .single();

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
    return abi.filter(
        (item): item is AbiFunction | AbiEvent =>
            item.type === 'function' || item.type === 'event'
    );
}; 
export const FormatedAbi = (abi: any) => { 
   return  abi.abiConfig?.orderAbi ? (typeof abi.abiConfig.orderAbi === 'string'
    ? filterAbi(JSON.parse(abi.abiConfig.orderAbi) as Abi)
    : filterAbi(abi.abiConfig.orderAbi as Abi)) // Se è già un oggetto
: undefined;
}  
export async function getUserByWalletAddress(walletAddress: string) {
    try {
      const { data: userWallet, error } = await supabase
        .from('user_wallets')
        .select(`
          wallet_address,
          user:users!inner (
            id,
            email,
            email_verified,
            config_db,
            is_admin
          )
        `)
        .eq('wallet_address', walletAddress)
        .single();
  
      if (error || !userWallet) {
        console.log("🚀 ~ getUserByWalletAddress ~ errore:", error);
        return null;
      }
  
    //   console.log("🚀 ~ getUserByWalletAddress ~ userWallet:", userWallet);
  
      const user = userWallet.user;
  
      return {
        ...user,
        address: walletAddress,
      };
    } catch (error) {
      console.error('Errore in getUserByWalletAddress:', error);
      return null;
    }
  }
  
