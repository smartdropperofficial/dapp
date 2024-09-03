import { encryptData } from "../../utils/utils";

export const getAmountToPay = async (configCtx: any, taxRequestId: string) => {
     try {
          const encryptedTaxRequestId = encryptData(taxRequestId);

          const response = await fetch(`/api/getAmountToPay?${new URLSearchParams({ taxRequestId: encryptedTaxRequestId, amazon_api: configCtx.config.amazon_api })}`);

          //console.log("🚀 ~ file: PaymentController.ts:8 ~ getAmountToPay ~ encryptedTaxRequestId:", encryptedTaxRequestId)
          //console.log("🚀 ~ file: PaymentController.ts:8 ~ getAmountToPay ~ response:", response.status)
          if (response.status === 200) {
               const orderDetails = await response.json();
               return orderDetails;
          } else {
               return null;
          }
     } catch {
          return null;
     }
};
