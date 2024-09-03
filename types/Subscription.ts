import { BigNumber } from "ethers";

export interface Subscription {
	id: BigNumber;
	subscriber: `0x${string}`;
	start: BigNumber;
	end: BigNumber;
	idSubType: BigNumber;
}

export interface SubscriptionType {
	id: BigNumber;
	name: string;
	price: BigNumber;
	period: BigNumber;
	enabled: boolean;
}
