import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../utils/supabaseClient";
import { decryptData } from "../../utils/utils";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method === "POST") {
		try {
			const subEncrypted = req.body;
			const subBody = JSON.parse(decryptData(subEncrypted as string));

			if (subBody) {
				const supabaseSubInsertResponse = await supabase.from("subscriptions").insert(subBody);

				if (supabaseSubInsertResponse.status === 201) {
					res.status(201).json(supabaseSubInsertResponse.data);
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
