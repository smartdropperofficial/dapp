import { useState, useEffect, useCallback } from 'react';
import useSubscriptionManagement from './useSubscriptionManagement';
import { SubscriptionManagementModel } from '../types';
import { SessionExt } from '../../../../types/SessionExt';

const useGetPromoterProfit = (session: SessionExt | null) => {
  const [subscriptions, setSubscriptions] = useState<SubscriptionManagementModel[]>([]);
  const [profit, setProfit] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const { getAllPromotersSubscriptionsOnBC: getAllPromotersSubscriptions } = useSubscriptionManagement();

  const filterWithdrawnSubscriptions = (subscriptions: SubscriptionManagementModel[]) => {
    return subscriptions?.filter(item => !item.promoterWithdrawn);
  };

  const calcPromoterProfit = useCallback((subs: SubscriptionManagementModel[]) => {
    const tot = subs.reduce((acc, item) => acc + item.promoterProfit, 0);
    setProfit(tot);
  }, []);

  const fetchSubscriptions = async (address: string) => {
    if (!getAllPromotersSubscriptions) return;
    try {
      const result = await getAllPromotersSubscriptions(address);
      const subs = filterWithdrawnSubscriptions(result);
      setSubscriptions(subs);
      calcPromoterProfit(subs);
      setIsLoading(false);
    } catch (error) {
      console.error(error);
    }
  };

  // useEffect(() => {
  //   if (session?.address) {
  //     fetchSubscriptions(session?.address);
  //   }
  // }, [getAllPromotersSubscriptions, session, calcPromoterProfit]);

  return { subscriptions, profit, isLoading, session, setProfit, fetchSubscriptions };
};

export default useGetPromoterProfit;
