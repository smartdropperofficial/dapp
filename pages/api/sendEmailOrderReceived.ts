import { NextApiRequest, NextApiResponse } from "next";
import { decryptData } from "../../utils/utils";
import { OrderSB } from "../../types/OrderSB";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
     if (req.method === "POST") {
          try {
               const orderEncrypted = req.body;
               const orderBody = JSON.parse(decryptData(orderEncrypted as string));
               console.log("🚀 ~  ~ api/sendEmailOrderReceived ~  ~ orderBody:", orderBody);

               if (orderBody) {
                    console.log("🚀 ~  ~ api/sendEmailOrderReceived ~  ~ dncryptedOrder:", orderBody);

                    const headers = {
                         "Content-Type": "application/json",
                         authorization: "Bearer " + process.env.MAILER_TOKEN!,
                    };

                    const url = `${process.env.MAILER_WEBHOOK!}/neworder`;

                    //  console.log("🚀 ~ sendEmailOrderReceived ~ headers:", headers);
                    console.log("🚀 ~ api/sendEmailOrderReceived ~ url:", url);

                    console.log("🚀 ~ api/sendEmailOrderReceived ~ process.env.MAILER_TOKEN!:", process.env.MAILER_TOKEN!);
                    const response = await fetch(url, {
                         method: "POST",
                         headers: headers,
                         body: JSON.stringify(orderBody), // Devi convertire decryptbody in una stringa JSON prima di inviarlo come corpo della richiesta
                    });
                    console.log("🚀 ~ api/sendEmailOrderReceived ~ response:", response);
                    if (response.ok) {
                         // const data = await response.json();
                         //  console.log("🚀 ~ handler ~ data:",);

                         return res.status(200);
                    } else {
                         return res.status(response.status).json({ error: "External service error." });
                    }
               } else {
                    return res.status(401).json({});
               }
          } catch (error) {
               console.error("Error:", error);
               return res.status(500).json({ error: " ~ api/sendEmailOrderReceived ~ Internal server error." });
          }
     } else {
          return res.status(405).json({ error: " ~ api/sendEmailOrderReceived ~ Method Not Allowed" });
     }
}
