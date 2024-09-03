import { BigNumber } from "ethers";

export interface OrderSC {
	orderId: string;
	amount: BigNumber;
	buyer: string;
	lockStartTime: BigNumber;
	lockEndTime: BigNumber;
	returned: boolean;
	claimed: boolean;
	returnedAmount: BigNumber;
}
