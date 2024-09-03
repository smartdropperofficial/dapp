import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../utils/supabaseClient";
import { verify } from "@depay/js-verify-signature";
import crypto from "crypto";

import { OrderSB } from "../../types/OrderSB";
import { decryptData } from "../../utils/utils";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
     if (req.method === "POST") {
          const publicKey = process.env.DEPAY_PUBLIC_KEY;
          console.log("🚀 ~ app.post ~ publicKey:", publicKey);

          console.log(` req.headers["x-signature"]:  ${req.headers["x-signature"]}`);

          try {
               let verified = await verify({
                    signature: req.headers["x-signature"],
                    data: JSON.stringify(req.body),
                    publicKey,
               });
               if (!verified) {
                    throw new Error("Request was not authentic!");
               }
          } catch (error) {
               console.log("🚀 ~ ERROR with Depay public key:", error);
               res.status(500).json("ERROR with Depay public key: " + error);
               return;
          }

          const privateKeyString = process.env.MY_PRIVATE_KEY;
          console.log("🚀 ~ app.post ~ privateKeyString:", privateKeyString);
          let configuration;
          try {
               console.log("crypto.createPrivateKey - start");
               const privateKey = crypto.createPrivateKey(privateKeyString!);
               console.log("crypto.createPrivateKey - end");

               const orderid = req.body.orderid;
               if (orderid) {
                    console.log("🚀 ~ app.post ~ orderid:", orderid);

                    const orderStatusResponse = await supabase.from("orders").select("tax_request_id, tax_amount, subtotal_amount, total_amount,shipping_amount").eq("order_id", orderid).single();
                    // console.log("🚀 ~ handler ~ orderStatusResponse:", orderStatusResponse.data);

                    const tax_amount = Number(orderStatusResponse?.data?.tax_amount);
                    const subtotal_amount = Number(orderStatusResponse?.data?.subtotal_amount);
                    const total_amount = Number(orderStatusResponse?.data?.total_amount);
                    const total = tax_amount + total_amount;
                    console.log("🚀 ~ app.get ~ total:", total);

                    configuration = {
                         accept: [
                              {
                                   blockchain: "polygon",
                                   amount: total_amount,
                                   token: "0xdac17f958d2ee523a2206206994597c13d831ec7",
                                   receiver: "0x4e260bB2b25EC6F3A59B478fCDe5eD5B8D783B02",
                              },
                         ],
                    };
               } else {
                    res.status(500).json("No orderid entered!");
                    return;
               }

               const dataToSign = JSON.stringify(configuration);

               const signer = crypto.createSign("sha256");
               signer.update(dataToSign);
               //   const signature = signer.sign(privateKey, "base64");
               const signature = crypto.sign("sha256", Buffer.from(dataToSign), {
                    key: privateKey,
                    padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
                    saltLength: 64,
               });
               //  const urlSafeBase64Signature = signature.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");

               // res.setHeader("x-signature", urlSafeBase64Signature);
               const urlSafeBase64Signature = signature.toString("base64").replace("+", "-").replace("/", "_").replace(/=+$/, "");

               res.setHeader("x-signature", urlSafeBase64Signature);
               res.json(configuration); // Make sure to return JSON without line breaks (\n) or unnecessary whitespace
          } catch (error) {
               console.log("-> Error with response signature::", error);
               res.status(500).json("Error with response signature:" + error);
               return;
          }
     }
}
