import type { NextApiRequest, NextApiResponse } from "next";
import { ReturnSB } from "../../types/ReturnSB";
import { supabase } from "../../utils/supabaseClient";
import { decryptData } from "../../utils/utils";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method === "POST") {
		try {
			const returnEncrypted = req.body;
			const returnObject: ReturnSB = JSON.parse(decryptData(returnEncrypted as string));

			if (returnObject) {
				const supabaseReturnCreationResponse = await supabase.from("returns").insert(returnObject).select();

				if (supabaseReturnCreationResponse.data) {
					res.status(201).json(supabaseReturnCreationResponse.data[0]);
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
