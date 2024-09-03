import type { NextApiRequest, NextApiResponse } from "next";
import { OrderSB } from "../../types/OrderSB";
import { supabase } from "../../utils/supabaseClient";
import { decryptData } from "../../utils/utils";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
     if (req.method === "PATCH") {
          try {
               const orderEncrypted = req.body;
               const orderBody = JSON.parse(decryptData(orderEncrypted as string));
               console.log("🚀 ~ handler ~ api/updateOrder - orderBody:", orderBody);

               if (orderBody) {
                    const order: OrderSB = orderBody.order;
                    const orderId = orderBody.orderId;

                    const previousStatus: string[] | null = await (await supabase.from("orders").select("previous_status").eq("order_id", orderId).single()).data?.previous_status;

                    if (previousStatus && previousStatus.includes(order.status!)) {
                         res.status(401).json({});
                    } else if (!previousStatus || (previousStatus && !previousStatus.includes(order.status!))) {
                         const tmpStatus = previousStatus ? previousStatus : [];
                         tmpStatus.push(order.status!);

                         const finalOrder: OrderSB = {
                              ...order,
                              previous_status: tmpStatus,
                         };
                         const supabaseOrderUpdateResponse = await supabase.from("orders").update(finalOrder).eq("order_id", orderId);

                         if (supabaseOrderUpdateResponse.status === 204) {
                              res.status(200).json(supabaseOrderUpdateResponse.data);
                         } else {
                              res.status(400).json({});
                         }
                    } else {
                    }
               } else {
                    res.status(400).json("decrypted body is empty");
               }
          } catch (error) {
               console.log("🚀 ~ handler ~  api/updateOrder - error:", error);

               res.status(400).json(error);
          }
     }
}
