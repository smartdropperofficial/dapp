import { useCallback } from 'react';
const useConfiguration = () => {
    const getPreOrderOwner = useCallback(async (): Promise<string> => {
        const data = await fetch('/api/getConfiguration');
        try {
            const resp = await data.json();
            return resp.order_owner;
        } catch (error) {
            return '';
        }
    }, []);
    const getTaxOwnerWallet = useCallback(async (): Promise<string> => {
        const data = await fetch('/api/getConfiguration');
        try {
            const resp = await data.json();
            return resp.tax_wallet;
        } catch (error) {
            return '';
        }
    }, []);

    return {
        getPreOrderOwner: getPreOrderOwner,
        getTaxOwnerWallet: getTaxOwnerWallet,
    };
};

export default useConfiguration;
