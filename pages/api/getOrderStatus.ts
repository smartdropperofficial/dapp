import type { NextApiRequest, NextApiResponse } from "next";
import { AMAZON_API_URL } from "../../utils/constants";
import { decryptData } from "../../utils/utils";
import { AlternativeDeliveryDate } from "../../components/orders/ModalStatusSteps";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
     // if (req.method === "GET") {
     //      let response: any;
     //      try {
     //           const encryptedRequestId = req.query.requestId;
     //           console.log("🚀 ~ handler ~ encryptedRequestId:", encryptedRequestId);
     //           const requestId = decryptData(encryptedRequestId as string);
     //           const url = `${process.env.AZURE_API_URL}/api/getOrderStatus?code=${process.env.AZURE_API_KEY}&requestId=${encryptedRequestId}`;

     //           console.log("🚀 ~ handler ~ url:", url);
     //           if (requestId) {
     //                const headers = new Headers();
     //                //headers.append("Authorization", `Basic ${Buffer.from(`${process.env.NEXT_PUBLIC_BLOCKCHAIN_API_KEY}:`).toString("base64")}`);

     //                try {
     //                     response = await fetch(`${url}`, {
     //                          method: "GET",
     //                          //headers: headers
     //                     });
     //                } catch (error) {
     //                     console.log("🚀 ~ file: getOrderStatus.ts:24 ~ handler ~ error:", error);
     //                }

     //                const orderStatus: any = await response!.json();
     //                // console.log("🚀 ~ file: getOrderStatus.ts:23 ~ handler ~ orderStatus:", orderStatus)

     //                if (orderStatus._type === "order_response") {
     //                     const tracking = orderStatus?.tracking ? orderStatus.tracking : "waiting";
     //                     const trackingObj = {
     //                          tracking: tracking,
     //                          deliveryDates: orderStatus.delivery_dates,
     //                          alternativeDates: orderStatus.merchant_order_ids.map((el: any) => {
     //                               return {
     //                                    products: el.product_ids,
     //                                    deliveryDate: el.delivery_date,
     //                               };
     //                          }) as AlternativeDeliveryDate[],
     //                     };
     //                     res.status(200).json(trackingObj);
     //                } else {
     //                     res.status(200).json({ error: orderStatus.code });
     //                }
     //           } else {
     //                console.log("🚀 ~ file: getOrderStatus.ts:23 ~ handler ~ error - 401:");

     //                res.status(401).json({});
     //           }
     //      } catch (error) {
     //           console.log("🚀 ~ file: getOrderStatus.ts:23 ~ handler ~ error:", error);
     //           res.status(400).json({});
     //      }
     // }
     if (req.method === "GET") {
          try {
               const encryptedRequestId = req.query.requestId;
               const requestId = decryptData(encryptedRequestId as string);

               if (requestId) {
                    const headers = new Headers();
                    headers.append("Authorization", `Basic ${Buffer.from(`${process.env.NEXT_PUBLIC_ZINC_API_KEY}:`).toString("base64")}`);

                    const response = await fetch(`${process.env.ORDER_API_URL}/orders/${requestId}`, {
                         method: "GET",
                         headers: headers,
                    });

                    const orderStatus: any = await response.json();

                    if (response.status === 200 && orderStatus._type === "order_response") {
                         res.status(200).json(orderStatus);
                         return;
                    } else {
                         res.status(200).json({ error: orderStatus.code });
                         return;
                    }

                    // if (orderStatus._type === "order_response") {
                    // 	const tracking = orderStatus?.tracking ? orderStatus.tracking : "waiting";
                    // 	const trackingObj = {
                    // 		tracking: tracking,
                    // 		deliveryDates: orderStatus.delivery_dates,
                    // 		alternativeDates: orderStatus.merchant_order_ids.map((el: any) => {
                    // 			return {
                    // 				products: el.product_ids,
                    // 				deliveryDate: el.delivery_date
                    // 			};
                    // 		}) as AlternativeDeliveryDate[]
                    // 	};
                    // 	context.res.status(200).json(trackingObj);
                    // } else {
                    // 	context.res.status(200).json({error: orderStatus.code});
                    // }
               } else {
                    res.status(401).json({});
               }
          } catch {
               res.status(400).json({});
          }
     }
}
