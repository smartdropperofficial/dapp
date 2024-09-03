import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";


export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
	if (req.method === "GET") {
		const { asin, scraper } = req.query;
		console.log("🚀 ~ file: scraper.ts:9 ~ handler ~ scraper:", scraper)
		console.log("🚀 ~ file: scraper.ts:9 ~ handler ~ asin:", asin)
		let data;
		try {
			console.log(" Service OXYLABS - start  ")
			const username = process.env.OXYLABS_USER;
			const password = process.env.OXYLABS_PASS;
			const body = {
				'source': 'amazon_product',
				'domain': process.env.AMAZON_ZONE_OXYLABS,
				'query': asin,
				'parse': true,
				'context': [
					{ 'key': 'autoselect_variant', 'value': true },
				],
			}; 

			const headers = {
				'Content-Type': 'application/json',
				'Authorization': 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64'),
			}
			console.log("🚀 ~ handler ~ headers:", headers) 
			console.log("🚀 ~ handler ~ body:", body)

			console.log("🚀 ~ handler ~ await axios.post('https://realtime.oxylabs.io/v1/queries-   Start")

			await axios.post('https://realtime.oxylabs.io/v1/queries', body, { headers })
				.then(response => {
					console.log(response.data);
					data = { data: response.data, scraper: "OXYLABS" }
					//res.status(200).json(data)  
					res.status(200).json(data);
					console.log(" Service OXYLABS - end  ")

					console.log("🚀 ~ handler ~ await axios.post('https://realtime.oxylabs.io/v1/queries-   End")

				}).catch(async (error) => {
					// catch and print the error
					console.log("catch and print the error");
					//res.status(400).json("Error on OXYLABS CALL")

					console.log(" Service RAINFOREST - start  ")

					const params = {
						api_key: process.env.RAINFOREST_API_KEY,
						amazon_domain: process.env.AMAZON_ZONE_RAINFOREST,
						asin: asin,
						type: "product"
					}
					console.log("🚀 ~ file: scraper.ts:51 ~ handler ~ params:", params)
					console.log("🚀 ~ file: scraper.ts:52 ~ await axios.get( ~ params:  - Started ")

					// make the http GET request to Rainforest API
					await axios.get('https://api.rainforestapi.com/request', { params })
						.then(response => {
							console.log(response.data);
							data = { data: response.data, scraper: "RAINFOREST" }
							res.status(200).json(data)
							console.log(" Service RAINFOREST - end  ")

						}).catch( (error) => {
							// catch and print the error
							console.log(error);
							res.status(400).json("Error on RAINFOREST CALL")

						})
				})
			// 	
		} catch (error) {
			console.log("🚀 ~ file: scraper.ts:40 ~ handler ~ error:", error)
			res.status(500)
			return

		}
	}
}






