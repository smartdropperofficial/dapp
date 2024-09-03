import React from 'react'
import useSubscriptionManagement from '../customHooks/useSubscriptionManagement';

function ChangePromoterProfit() {
    const { changePromoterProfitOnBC: changePromoterProfit } = useSubscriptionManagement();

    return (
        <div>changePromoterProfit</div>
    )
}

export default ChangePromoterProfit