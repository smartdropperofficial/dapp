import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../utils/supabaseClient";
import { decryptData } from "../../utils/utils";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    try {
      const encryptedAddress = req.query.address;
      const address = decryptData(encryptedAddress as string);

      if (address) {
        // Chiamata a RPC per ottenere i dati
        const { data, error } = await supabase
             .from('orders')
          // .rpc('get_orders_with_tickets', { wallet_address: address }) // Passaggio dei parametri RPC
          .select('*')  // Seleziona tutti i campi
          .eq('wallet_address', address)
          .order('created_at', { ascending: false }); // Ordina per data

        console.log("🚀 ~ handler ~ error:", error);

        if (error) {
          res.status(400).json(error);
        } else if (data) {
          console.log("🚀 ~ handler ~ data:", data);
          res.status(200).json(data);
        } else {
          res.status(400).json({});
        }
      } else {
        res.status(401).json({});
      }
    } catch (e) {
      console.error(e);
      res.status(400).json({});
    }
  }
}
