import { useContractWrite, usePrepareContractWrite, useWaitForTransaction } from "wagmi";
import IERC20ABI from "../../utils/abi/IERC20ABI.json";
import { MaxUint256 } from "@ethersproject/constants";
import Swal from "sweetalert2";
import { useState } from "react";

const Approve: React.FC<{ token: `0x${string}`; spender: string }> = ({ token, spender }) => {
	const [txHash, setTxHash] = useState<`0x${string}`>();

	const { isLoading: waitTx } = useWaitForTransaction({
		hash: txHash,
		onSuccess() {
			Swal.fire({
				title: "Approved successfully.",
				icon: "success",
			});
		},
		onError() {
			Swal.fire({
				title: "An error has occured. Please try again or contact the support",
				icon: "error",
			});
		},
	});

	const { config } = usePrepareContractWrite({
		address: token,
		abi: IERC20ABI,
		functionName: "approve",
		args: [spender, MaxUint256],
	});
	const { writeAsync, isLoading: waitConfirm } = useContractWrite({
		...config,
		onSuccess(data) {
			setTxHash(data.hash);
		},
	});

	return (
		<button className="btn btn-primary mt-2" disabled={waitConfirm || waitTx} onClick={() => writeAsync?.()}>
			Approve
		</button>
	);
};

export default Approve;
