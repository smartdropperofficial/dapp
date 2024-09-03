import { encryptData } from "../../utils/utils";
import { SubscriptionSB } from "../../types/SubscriptionSB";

export const createSubscription = async (subTypeId: number, subscriber: string, paymentTx: string, promoter?: string, startDate?: number, endDate?: number): Promise<any> => {
	try {
		console.log("🚀 ~ createSubscriptionController ~ Input data:", subTypeId, subscriber, paymentTx, promoter, startDate, endDate)
		const subscription = generateSubObject(subTypeId, subscriber, paymentTx, promoter!, startDate!, endDate!);
		console.log("🚀 ~ createSubscriptionController ~ Input data:", subscription)
		const encryptedSub = encryptData(JSON.stringify(subscription));

		const createSubResponse = await fetch("/api/createSubscriptionsmartcontract", {
			method: "POST",
			body: encryptedSub,
			headers: { "Content-Type": "plain/text" }
		});
		const data = await createSubResponse.json();
		console.log("🚀 ~ controller - createSubscription ~ data:", data)

		return data;
		// switch (createSubResponse.status) {
		// 	case 200:
		// 		return data;
		// 	default:
		// 		return data;
		// }
	} catch {
		return null;
	}
};


const generateSubObject = (subTypeId: number, subscriber: string, paymentTx: string, promoter?: string, startDate?: number, endDate?: number): SubscriptionSB | null => {
	try {
		return {
			payment_tx: paymentTx,
			subscriber: subscriber,
			subscription_type: subTypeId,
			promoter: promoter!,
			startDate: startDate!,
			endDate: endDate!
		};
	} catch {
		return null;
	}
};