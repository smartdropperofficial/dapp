import { NextApiRequest, NextApiResponse } from "next";
import { decryptData } from "../../utils/utils";
import { OrderSB } from "../../types/OrderSB";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
     if (req.method === "POST") {
          try {
               const encryptedcode = req.body;
               console.log("🚀 ~ api/createOrderOnWeb3 ~ encryptedcode:", encryptedcode);
               const decryptbody = JSON.parse(decryptData(encryptedcode as string)) as OrderSB;

               const headers = {
                    "Content-Type": "application/json",
                    authorization: "Bearer " + process.env.MAILER_TOKEN!,
               };
               const url = `${process.env.WEB3_WEBHOOK!}/createorder`;

               console.log("🚀 ~ handler ~ url:", url);
               const response = await fetch(url, {
                    method: "POST",
                    headers: headers,
                    body: JSON.stringify(decryptbody), // Devi convertire decryptbody in una stringa JSON prima di inviarlo come corpo della richiesta
               });
               console.log("🚀 ~ handler ~ response:", response.status);

               if (response.ok) {
                    const data = await response.json();
                    return res.status(200).json(data);
               } else {
                    console.log("🚀 ~ handler ~ External service error.:");

                    return res.status(response.status).json({ error: "External service error." });
               }
          } catch (error) {
               console.error("Error:Internal server error.", error);
               return res.status(500).json({ error: "Internal server error." });
          }
     } else {
          return res.status(405).json({ error: "Method Not Allowed" });
     }
}
