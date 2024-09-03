import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../utils/supabaseClient";
import { decryptData } from "../../utils/utils";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method === "GET") {
		try {
			const encryptedOrderId = req.query.orderId;
			const orderId = decryptData(encryptedOrderId as string);

			if (encryptedOrderId) {
				const orderStatusResponse = await supabase.from("returns").select("order_id, created_at, reason_text, products, status").eq("order_id", orderId).single();

				if (orderStatusResponse.data) {
					res.status(200).json(orderStatusResponse.data);
				} else {
					res.status(400).json({});
				}
			} else {
				res.status(401).json({});
			}
		} catch {
			res.status(400).json({});
		}
	}
}
