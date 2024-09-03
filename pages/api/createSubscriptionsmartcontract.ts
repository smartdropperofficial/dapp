import { NextApiRequest, NextApiResponse } from "next";
import { decryptData } from "../../utils/utils";
import { OrderSB } from "../../types/OrderSB";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
     if (req.method === "POST") {
          try {
               const encryptedcode = req.body;
               console.log("🚀 ~ api/createSubscriptionOnWeb3 ~ encryptedcode:", encryptedcode);
               const decryptbody = JSON.parse(decryptData(encryptedcode as string));
               console.log("🚀 ~ handler ~ decryptbody:", decryptbody)

               const headers = {
                    "Content-Type": "application/json",
                    authorization: "Bearer " + process.env.MAILER_TOKEN!,
               };
               const url = `${process.env.WEB3_WEBHOOK!}/createsubscription`;

               console.log("🚀 ~ handler ~ url:", url);
               const response = await fetch(url, {
                    method: "POST",
                    headers: headers,
                    body: JSON.stringify(decryptbody), // Devi convertire decryptbody in una stringa JSON prima di inviarlo come corpo della richiesta
               });
               const data = await response.json();
               console.log("🚀 ~ handler ~ response status:", response.status)
               console.log("🚀 ~ handler ~ data:", data)
               if (response.ok) {
                    console.log("🚀 ~ handler ~ (response.ok:", (response.ok));

                    console.log("🚀 ~ handler ~ data:", data)
                    return res.status(200).json(data);
               } else {
                    return res.status(response.status).json(data);
               }
          } catch (error) {
               return res.status(500).json({ error: "Internal server error." });
          }
     } else {
          return res.status(405).json({ error: "Method Not Allowed" });
     }
}
