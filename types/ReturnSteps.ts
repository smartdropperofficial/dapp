export enum ReturnSteps {
	WAITING_CONFIRMATION = "WAITING_CONFIRMATION",
	CREATING_RETURN = "CREATING_RETURN",
	PLACING_RETURN_ON_AMAZON = "PLACING_RETURN_ON_AMAZON",
	UPDATING_LAST_DATA = "UPDATING_LAST_DATA",
	OPERATION_COMPLETED = "OPERATION_COMPLETED",
}

export enum ReturnStatusSteps {
	PLACING_RETURN = "PLACING_RETURN",
	RETURN_PLACED = "RETURN_PLACED",
	RETURNED = "RETURNED",
	ERROR = "ERROR",
}
