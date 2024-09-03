import { BigNumber } from 'ethers';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { useContractRead } from 'wagmi';
import { SessionExt } from '../types/SessionExt';
import IERC20ABI from '../utils/abi/IERC20ABI.json';

const useAllowance = (token: `0x${string}`, spender: string) => {
    const { data: session }: { data: SessionExt | null } = useSession() as { data: SessionExt | null };

    const [allowance, setAllowance] = useState<BigNumber>();

    useContractRead({
        address: token,
        abi: IERC20ABI,
        functionName: 'allowance',
        args: [session?.address, spender],
        watch: true,
        onSuccess(data: BigNumber) {
            setAllowance(data);
        },
    });

    return allowance;
};

export default useAllowance;
