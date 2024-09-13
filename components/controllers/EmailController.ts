import { encryptData } from "../../utils/utils";
import { OrderSB } from "../../types/OrderSB";
import { supabase } from "../../utils/supabaseClient";

export const SendEmailVerificationCode = async (data: any) => {
     try {
          const encripedEmail = encryptData(JSON.stringify(data));
          const response = await fetch("/api/sendOpt", {
               method: "POST",
               body: encripedEmail,
               headers: { "Content-Type": "plain/text" },
          });

          console.log("🚀 ~ file: EmailController.ts ~ line 47 ~ SendEmailVerificationCode ~ response", response.status);

          switch (response.status) {
               case 200:
                    return true;
               default:
                    return null;
          }
     } catch (error) {
          console.log("🚀 ~ file: EmailController.ts ~ line 47 ~ SendEmailVerificationCode ~ error", error);
          return null;
     }
};
export const SendEmailOrderReceived = async (orderId: string) => {
     console.log("🚀 ~ SendEmailOrderReceived ~ orderId:", orderId);
     try {
          //   const order: any = await supabase.from("orders").select("*").eq("order_id", orderId).single();
          const { data: order, error } = await supabase.from("orders").select("*").eq("order_id", orderId).single();

          console.log("🚀  EmailController ~ SendEmailOrderReceived ~ order:", order);
          const data = encryptData(JSON.stringify(order));

          const response = await fetch("/api/sendEmailOrderReceived", {
               method: "POST",
               body: data,
               headers: { "Content-Type": "plain/text" },
          });
          console.log("🚀 EmailController  ~ SendEmailOrderReceived ~ data:", response.status);

          switch (response.status) {
               case 200:
                    return true;
               default:
                    return null;
          }
     } catch (error) {
          console.log("🚀 ~ file: EmailController.ts ~ SendEmailOrderReceived ~ error", error);
          return null;
     }
};
export const SendEmailCheckout = async (order: any) => {
     try {
          const data = encryptData(JSON.stringify(order));
          console.log("🚀 ~ SendEmaiPaymentReceived ~ data:", data);

          const response = await fetch("/api/sendEmailCheckout", {
               method: "POST",
               body: data,
               headers: { "Content-Type": "plain/text" },
          });

          console.log("🚀 ~ file: EmailController.ts ~ line 47 ~ SendEmaiPaymentReceived ~ response", response);

          switch (response.status) {
               case 200:
                    return true;
               default:
                    return null;
          }
     } catch (error) {
          console.log("🚀 ~ file: EmailController.ts ~ line 47 ~ SendEmaiPaymentReceived ~ error", error);
          return null;
     }
};
export const SendEmailPaymentReceived = async (order: any) => {
     try {
          const data = encryptData(JSON.stringify(order));
          console.log("🚀 ~ SendEmaiPaymentReceived ~ data:", data);

          const response = await fetch("/api/sendEmaiPaymentReceived", {
               method: "POST",
               body: data,
               headers: { "Content-Type": "plain/text" },
          });

          console.log("🚀 ~ file: EmailController.ts ~ line 47 ~ SendEmaiPaymentReceived ~ response", response);

          switch (response.status) {
               case 200:
                    return true;
               default:
                    return null;
          }
     } catch (error) {
          console.log("🚀 ~ file: EmailController.ts ~ line 47 ~ SendEmaiPaymentReceived ~ error", error);
          return null;
     }
};
export const SendEmailOrderShipped = async (order: any) => {
     try {
          const data = encryptData(JSON.stringify(order));
          console.log("🚀 ~ SendEmaiPaymentReceived ~ data:", data);

          const response = await fetch("/api/sendEmailOrderShipped", {
               method: "POST",
               body: data,
               headers: { "Content-Type": "plain/text" },
          });

          console.log("🚀 ~ file: EmailController.ts ~ line 47 ~ SendEmaiPaymentReceived ~ response", response);

          switch (response.status) {
               case 200:
                    return true;
               default:
                    return null;
          }
     } catch (error) {
          console.log("🚀 ~ file: EmailController.ts ~ line 47 ~ SendEmaiPaymentReceived ~ error", error);
          return null;
     }
};
