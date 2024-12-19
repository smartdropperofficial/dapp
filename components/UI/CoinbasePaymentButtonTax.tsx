import React, { useState } from 'react';

interface PaymentButtonProps {
    orderId: string;
}

const PaymentButton: React.FC<PaymentButtonProps> = ({ orderId }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [paymentUrl, setPaymentUrl] = useState<string | null>(null);

    const handlePayment = async () => {
        setLoading(true);
        setError(null);
        setPaymentUrl(null);

        try {
            console.log('🚀 Starting payment process with orderId:', orderId);

            const response = await fetch('/api/create-payment-link-tax', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ order_id: orderId }),
            });

            console.log('🚀 API response status:', response.status);

            // Controlla che la risposta sia valida
            if (!response.ok) {
                const errorData = await response.json();
                console.error('🚀 API error response:', errorData);
                throw new Error(errorData.error || 'Failed to create payment link');
            }

            const data = await response.json();
            console.log('🚀 API success response:', data);

            setPaymentUrl(data.hosted_url);
        } catch (err: any) {
            console.error('🚀 Error during payment process:', err.message);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <button onClick={handlePayment} disabled={loading}>
                {loading ? 'Processing...' : 'Pay with Crypto'}
            </button>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {paymentUrl && (
                <p>
                    Payment link created!{' '}
                    <a href={paymentUrl} target="_blank" rel="noopener noreferrer">
                        Click here to pay
                    </a>
                </p>
            )}
        </div>
    );
};

export default PaymentButton;
