import type { NextApiRequest, NextApiResponse } from "next";
import { OrderReturnAmazon } from "../../types/OrderAmazon";
import { AMAZON_API_URL } from "../../utils/constants";
import { decryptData } from "../../utils/utils";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method === "POST") {
		try {
			const encryptedPayload = req.body;
			const payload: OrderReturnAmazon = JSON.parse(decryptData(encryptedPayload as string));

			if (payload) {
				const headers = new Headers();
				headers.append("Authorization", `Basic ${Buffer.from(`${process.env.NEXT_PUBLIC_AMAZON_API_KEY}:`).toString("base64")}`);
				headers.append("Content-Type", "application/json");

				const payloadToAmazon: OrderReturnAmazon = {
					products: payload.products,
					reason_code: payload.reason_code,
					method_code: payload.method_code,
					explanation: payload.explanation
				};
				const response = await fetch(`${AMAZON_API_URL}/orders/${payload.requestId}/return`, {
					method: "POST",
					headers: headers,
					body: JSON.stringify(payloadToAmazon)
				});

				const amazonResponse: any = await response.json();

				if (amazonResponse._type === "error") {
					res.status(400).json({});
				} else {
					res.status(201).json(amazonResponse);
				}
			} else {
				res.status(401).json({});
			}
		} catch {
			res.status(400).json({});
		}
	}
}
