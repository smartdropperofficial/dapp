import { OrderReturnAmazon } from "../../types/OrderAmazon";
import { ReturnSB } from "../../types/ReturnSB";
import { encryptData } from "../../utils/utils";

export const getReturn = async (orderId: string): Promise<ReturnSB | null> => {
	try {
		const encryptedOrderId = encryptData(orderId);
		const response = await fetch(`/api/getReturn?${new URLSearchParams({ orderId: encryptedOrderId })}`);
		const order = await response.json();

		return order;
	} catch {
		return null;
	}
};

export const getReturnStatusFromAmazon = async (requestId: string) => {
	try {
		const encryptedRequestId = encryptData(requestId);
		const response = await fetch(`/api/getReturnStatus?${new URLSearchParams({ requestId: encryptedRequestId })}`);

		if (response.status === 200) {
			const retrunDetails = await response.json();
			return retrunDetails;
		} else {
			return null;
		}
	} catch {
		return null;
	}
};

export const updateReturn = async (orderId: string, returnObject: ReturnSB) => {
	try {
		const order = {
			orderId: orderId,
			order: returnObject,
		};

		const encryptedOrder = encryptData(JSON.stringify(order));
		const response = await fetch("/api/updateReturn", {
			method: "PATCH",
			body: encryptedOrder,
			headers: { "Content-Type": "plain/text" },
		});

		switch (response.status) {
			case 200:
				return true;
			default:
				return null;
		}
	} catch {
		return null;
	}
};

export const createReturn = async (order: ReturnSB) => {
	try {
		const encryptedReturn = encryptData(JSON.stringify(order));
		const createReturnResponse = await fetch("/api/createReturn", {
			method: "POST",
			body: encryptedReturn,
			headers: { "Content-Type": "plain/text" },
		});

		switch (createReturnResponse.status) {
			case 201:
				return true;
			default:
				return null;
		}
	} catch {
		return null;
	}
};

export const createReturnOnAmazon = async (order: OrderReturnAmazon) => {
	try {
		const encryptedReturn = encryptData(JSON.stringify(order));
		const createReturnResponse = await fetch("/api/createReturnOnAmazon", {
			method: "POST",
			body: encryptedReturn,
			headers: { "Content-Type": "plain/text" },
		});

		switch (createReturnResponse.status) {
			case 201:
				return true;
			default:
				return null;
		}
	} catch {
		return null;
	}
};
