import React, { useEffect, useLayoutEffect, useState } from 'react';
import useSubscriptionManagement from '../customHooks/useSubscriptionManagement';
import { SessionExt } from '../../../../types/SessionExt';
import { useSession } from 'next-auth/react';
import { Button } from 'react-bootstrap';
import { SubscriptionManagementModel } from '../types';
import useGetPromoterProfit from '../customHooks/useGetPromoterProfit';

function WithdrawlProfit({ funds }: { funds: string }) {
    const { data: session }: { data: SessionExt | null } = useSession() as { data: SessionExt | null };

    const [result, setResult] = useState<boolean>(false);

    const { withdrawlAllCoinFundsOnBC } = useSubscriptionManagement();
    const { profit, fetchSubscriptions } = useGetPromoterProfit(session);

    useEffect(() => {
        if (session?.address) {
            fetchSubscriptions(session?.address);
        }
    }, [profit, session?.address]);

    useEffect(() => {
        if (result && session?.address) {
            fetchSubscriptions(session?.address);
            setResult(false);
        }
    }, [result, session?.address]);

    const withdrawlFundsHandler = async () => {
        try {
            const result = await withdrawlAllCoinFundsOnBC();
            // setResult(result);
        } catch (error) {
            console.error('Error withdrawing funds:', error);
        }
    };
    return (
        <div className=" d-flex  text-center align-items-center flex-column">
            <b className="mx-3">Withdrawl all Funds:</b>
            <Button onClick={withdrawlFundsHandler}>USDT {Number(funds).toFixed(2)}</Button>
        </div>
    );
}

export default WithdrawlProfit;
