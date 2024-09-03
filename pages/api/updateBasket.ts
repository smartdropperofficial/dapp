import type { NextApiRequest, NextApiResponse } from "next";
import { OrderSB } from "../../types/OrderSB";
import { supabase } from "../../utils/supabaseClient";
import { decryptData } from "../../utils/utils";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "PATCH") {
        try {
            const basketEncrypted = req.body;
            const basketBody = JSON.parse(decryptData(basketEncrypted as string));
            console.log("🚀 ~ file: updateBasket.ts:11 ~ handler ~ basketBody:", basketBody)

            if (basketBody) {
                const wallet: string = basketBody.wallet_address;
                //  console.log("🚀 ~ file: updateBasket.ts:15 ~ handler ~ wallet:", wallet)
                const basket_payload = basketBody.basket;
                //  console.log("🚀 ~ file: updateBasket.ts:17 ~ handler ~ basket_payload:", basket_payload.products)

                const { data, error, status } = await supabase
                    .from('users')
                    .update({ basket: basket_payload.products })
                    .eq('wallet_address', wallet)
                    .select().single()

                //console.log("🚀 ~ file: updateBasket.ts:25 ~ data:", data)

                if (status === 204 || status === 200) {
                    //  console.log("🚀 ~ file: updateBasket.ts:27 ~ status: 204", data)
                    res.status(200).json(data.data);
                } else {
                    console.log("🚀 ~ file: updateBasket.ts:31 ~ status:", status)
                    console.log("🚀 ~ file: updateBasket.ts:32 ~ error:", error)
                    res.status(400).json({});
                }

            } else {
            }
        } catch {
            res.status(400).json({});
        }
    }


}

