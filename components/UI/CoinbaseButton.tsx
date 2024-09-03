import React, { useContext, useEffect } from 'react';
import { useCreateCharge } from '@/hooks/useCreateCharge';
import { SubscriptionContext } from '@/store/subscription-context';

interface CoinbaseButtonProps {
    amount: number;
    currency: string;
    name?: string;
    description?: string;
    metadata?: {
        id?: string;
        email?: string;
        address?: string;
    };
    redirectUrl?: string;
}

const CoinbaseButton: React.FC<CoinbaseButtonProps> = ({ amount, currency, name, description, metadata, redirectUrl }) => {
    const subsContext = useContext(SubscriptionContext);

    const { createCharge, hostedUrl, loading, error } = useCreateCharge();

    useEffect(() => {
        if (createCharge && amount !== null && currency && hostedUrl === '') {
            console.log("🚀 ~ useEffect ~ amount:", amount)
            createCharge({ amount, currency, name, description, metadata, redirectUrl });
        }
    }, [amount, currency, name, description, metadata, redirectUrl, createCharge, hostedUrl]);

    const handleClick = () => {
        if (hostedUrl) {
            window.location.href = hostedUrl;
        }
    };

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <a target='_blank'>
            <button className={`btn form-control  mt-2 col-12 col-xl-10 ${subsContext.canPay === false ? 'btn-disabled' : 'btn-success'
                }`} onClick={handleClick} disabled={!hostedUrl || loading}>
                {loading ? 'Loading...' : 'Pay $' + amount}
            </button>
        </a>
    );
};

export default CoinbaseButton;
