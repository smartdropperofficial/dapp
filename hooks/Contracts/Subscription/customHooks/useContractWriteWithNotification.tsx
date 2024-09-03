import { useState } from 'react';
import { usePrepareContractWrite, useContractWrite } from 'wagmi';
import Swal from 'sweetalert2';
// import SubscriptionContractABI from '../abi/'; // Update with the correct path to your ABI

interface UseContractWriteWithNotificationProps {
    functionName: string;
    args: unknown[];
    contractAdress: string;
    abiContract: any;
}

const useContractWriteWithNotification = ({ functionName, args, contractAdress, abiContract }: UseContractWriteWithNotificationProps) => {
    const { config, error: prepareError } = usePrepareContractWrite({
        address: contractAdress as `0x${string}`,
        abi: abiContract,
        functionName,
        args,
    });

    const { write, isLoading, isSuccess, isError, error } = useContractWrite({
        ...config,
        onSuccess: () => {
            Swal.fire({
                title: 'Operation successful.',
                icon: 'success',
            });
        },
        onError: () => {
            Swal.fire({
                title: 'Error: please try again.',
                icon: 'error',
            });
        },
        abi: abiContract, // Add the correct type for the 'abi' property
    });

    const handleClick = () => {
        if (write) {
            write();
        } else if (prepareError) {
            Swal.fire({
                title: 'Error: Invalid configuration.',
                text: prepareError.message,
                icon: 'error',
            });
        }
    };

    return { handleClick, isLoading, isSuccess, isError, error };
};

export default useContractWriteWithNotification;
