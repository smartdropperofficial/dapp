import { useState, useCallback } from 'react';

interface Metadata {
    id?: string;
    email?: string;
    address?: string;
}

interface ChargeParams {
    amount: number;
    currency: string;
    name?: string;
    description?: string;
    metadata?: Metadata;
    redirectUrl?: string;
    orderId?: string;
}

export const useCreateCharge = () => {
    const [hostedUrl, setHostedUrl] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const createCharge = useCallback(async ({ amount, currency, name, description, metadata, redirectUrl }: ChargeParams) => {
        setLoading(true);
        setError(null);
        if (amount !== null && currency && hostedUrl === '') {

            try {
                const response = await fetch('/api/createCharge', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ amount, currency, name, description, metadata, redirectUrl }),
                });
                if (!response.ok) {
                    throw new Error(`HTTP error Status: ${response.status}`);
                }
                const chargeData = await response.json();
                if (chargeData && chargeData.data && chargeData.data.hosted_url) {
                    setHostedUrl(chargeData.data.hosted_url);
                }
            } catch (error) {
                setError((error as Error).message);
                console.error('Error creating charge:', error);
            } finally {
                setLoading(false);
            }
        }
    }, []);

    return { createCharge, hostedUrl, loading, error };
};
