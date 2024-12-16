import { encryptData } from '../../utils/utils';

export const getAmountToPay = async (configCtx: any, taxRequestId: string) => {
    // console.log('🚀 ~ getAmountToPay ~ taxRequestId:', taxRequestId);
    //console.log('🚀 ~ getAmountToPay ~ configCtx.config.amazon_api:', configCtx.config.amazon_api);
    try {
        const encryptedTaxRequestId = encryptData(taxRequestId);

        const response = await fetch(
            `/api/getAmountToPay?${new URLSearchParams({ taxRequestId: encryptedTaxRequestId, amazon_api: configCtx.config.amazon_api })}`
        );

        // console.log('🚀 ~ file: PaymentController.ts:8 ~ getAmountToPay ~ response:', response.status);
        const orderDetails = await response.json();

        if (response.status === 200) {
            //  console.log('🚀 ~ getAmountToPay ~ orderDetails:', orderDetails);
            return orderDetails;
        } else {
            // console.log('🚀 ~ file: PaymentController.ts:8 ~ getAmountToPay ~ response:', response.status);

            return null;
        }
    } catch {
        return null;
    }
};
