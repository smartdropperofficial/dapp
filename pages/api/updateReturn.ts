import type { NextApiRequest, NextApiResponse } from "next";
import { ReturnSB } from "../../types/ReturnSB";
import { supabase } from "../../utils/supabaseClient";
import { decryptData } from "../../utils/utils";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method === "PATCH") {
		try {
			const orderEncrypted = req.body;
			const orderBody = JSON.parse(decryptData(orderEncrypted as string));

			if (orderBody) {
				const order: ReturnSB = orderBody.order;
				const orderId = orderBody.orderId;

				const previousStatus: string[] | null = await (await supabase.from("returns").select("previous_status").eq("order_id", orderId).single()).data?.previous_status;

				if (previousStatus && previousStatus.includes(order.status!)) {
					res.status(401).json({});
				} else if (!previousStatus || (previousStatus && !previousStatus.includes(order.status!))) {
					const tmpStatus = previousStatus ? previousStatus : [];
					tmpStatus.push(order.status!);

					const finalOrder: ReturnSB = {
						...order,
						previous_status: tmpStatus,
					};
					const supabaseReturnUpdateResponse = await supabase.from("returns").update(finalOrder).eq("order_id", orderId);

					if (supabaseReturnUpdateResponse.status === 204) {
						res.status(200).json(supabaseReturnUpdateResponse.data);
					} else {
						res.status(400).json({});
					}
				} else {
				}
			} else {
				res.status(401).json({});
			}
		} catch {
			res.status(400).json({});
		}
	}
}
