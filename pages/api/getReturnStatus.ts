import type { NextApiRequest, NextApiResponse } from "next";
import { decryptData } from "../../utils/utils";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method === "GET") {
		try {
			const encryptedRequestId = req.query.requestId;
			const requestId = decryptData(encryptedRequestId as string);

			if (requestId) {
				const headers = new Headers();
				headers.append("Authorization", `Basic ${Buffer.from(`${process.env.NEXT_PUBLIC_ZINC_API_KEY}:`).toString("base64")}`);

				const response = await fetch(`${process.env.ORDER_API_URL}/returns/${requestId}`, {
					method: "GET",
					headers: headers,
				});

				const amazonResponse: any = await response.json();

				if (amazonResponse._type === "return_response") {
					const labelUrls = amazonResponse?.label_urls?.length > 0 ? amazonResponse.label_urls : ["waiting"];
					const labelUrlsObj = { labelUrls: labelUrls };

					console.log("🚀 ~ handler ~ labelUrlsObj:", labelUrlsObj)
					res.status(200).json(labelUrlsObj);
				} else {
					res.status(200).json({ error: amazonResponse.code });
				}
			} else {
				res.status(401).json({});
			}
		} catch {
			res.status(400).json({});
		}
	}
}
