import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../utils/supabaseClient";
import { OrderSB } from "../../types/OrderSB";
import { decryptData } from "../../utils/utils";
import { error } from "console";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
     if (req.method === "POST") {
          try {
               const orderEncrypted = req.body;
               const order: OrderSB = JSON.parse(decryptData(orderEncrypted as string));
               console.log("🚀 ~ handler ~ order:", order)
               const total = order.products?.reduce((acc, product) => acc + product.quantity * product.price, 0);
               console.log("🚀 ~ handler ~ total:", total);
               if (total! > 25.0) {
                    if (order) {
                         const { data: supabaseOrderCreationResponse, error } = await supabase.from("orders").insert(order).select();

                         if (supabaseOrderCreationResponse) {
                               console.log("🚀 ~ file: createOrder.ts:16 ~ handler ~ res.status(201");
                               console.log("🚀 ~ file: createOrder.ts:17 ~ handler ~ supabaseOrderCreationResponse.data:", supabaseOrderCreationResponse);

                              res.status(201).json(supabaseOrderCreationResponse[0]);
                         } else {
                              console.log("🚀 ~ file: createOrder.ts:21 ~ handler ~ res.status(400", error);

                              res.status(400).json({});
                         }
                    } else {
                         console.log("🚀 ~ file: createOrder.ts:26 ~ handler ~ res.status(401");

                         res.status(400).json({ error: "No order" });
                    }
               } else {
                    res.status(400).json("Order amount less $ 25.00");
               }
          } catch {
               res.status(400).json({});
          }
     }
}
