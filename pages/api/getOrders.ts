import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../utils/supabaseClient";
import { decryptData } from "../../utils/utils";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
     if (req.method === "GET") {
          try {
               const encryptedAddress = req.query.address;
               const address = decryptData(encryptedAddress as string);

               if (address) {
                    const { data, error } = await supabase.rpc('get_orders_with_tickets')
                         .eq("wallet_address", address)
                         .order("created_at", { ascending: false });

                    console.log("🚀 ~ handler ~ error:", error);

                    if (error) {
                         res.status(400).json(error);
                    } else if (data) {
                         console.log("🚀 ~ handler ~ data:", data)
                         // Filtra solo i ticket di supporto aperti
                         // const filteredData = data.map(order => ({
                         //      ...order,
                         //      support_tickets: order.support_tickets.filter(ticket => ticket.status === 'open')
                         // }));

                         res.status(200).json(data);
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
