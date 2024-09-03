import { NextApiRequest, NextApiResponse } from "next";
import { decryptData } from "../../utils/utils";
import { OrderSB } from "../../types/OrderSB";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
     if (req.method === "POST") {
          try {
               console.log("🚀 ~ handler ~ req.body:", req.body);

               const headers = {
                    "Content-Type": "application/json",
                    authorization: "Bearer " + process.env.MAILER_TOKEN!,
               };
               const url = `${process.env.MAILER_WEBHOOK!}/checkout`;

               console.log("🚀 ~ handler ~ url:", url);
               const response = await fetch(url, {
                    method: "POST",
                    headers: headers,
                    body: JSON.stringify(req.body), // Devi convertire decryptbody in una stringa JSON prima di inviarlo come corpo della richiesta
               });

               console.log("🚀 ~ handler ~ response:", response);

               if (response.ok) {
                    const data = await response;
                    return res.status(200).json(data);
               } else {
                    return res.status(response.status).json({ error: "External service error." });
               }
          } catch (error) {
               console.error("Error:", error);
               return res.status(500).json({ error: "Internal server error." });
          }
     } else {
          return res.status(405).json({ error: "Method Not Allowed" });
     }
}
