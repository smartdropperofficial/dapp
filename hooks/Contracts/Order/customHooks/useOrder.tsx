import { useEffect, useState, useCallback, useContext } from 'react';
import { ethers, BigNumber } from 'ethers';
import { useProvider, useSigner, useAccount } from 'wagmi';
// import OrderABI from '../abi/OrderABI.json'; // Adjust the path to your ABI file
import Swal from 'sweetalert2';
import { Order } from '../types';
import { ConfigContext } from '@/store/config-context';
import { convertToDecimal, fetchAbiFromDatabase } from '@/utils/utils';

const useOrderManagement = () => {
    const { config, setAbiConfigHandler } = useContext(ConfigContext);

    const contractAddress = config?.order_contract as `0x${string}`;
    const { data: signer } = useSigner();
    const { address: account } = useAccount();
    const [contract, setContract] = useState<ethers.Contract | null>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const [exchangeTax, setExchangeTax] = useState<string>('0.5');
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [OrderABI, setOrderABI] = useState<any>(null);

    useEffect(() => {
        const loadContract = async () => {
            if (signer && config?.order_contract) {
                try {
                    const abi = await fetchAbiFromDatabase('order');
                    if (abi) {
                        const contract = new ethers.Contract(config.order_contract as `0x${string}`, abi, signer);
                        setContract(contract);
                        setAbiConfigHandler({ orderAbi: abi });
                    }
                } catch (error) {
                    console.error("Errore nel caricamento dell'ABI o nella creazione del contratto:", error);
                }
            }
        };

        loadContract();
    }, [signer, config?.subscription_management_contract]);

    const createOrderOnBC = useCallback(
        async (orderId: string, subscriptionTypeId: number, orderAmount: number, commission: number, shippingFee: number, buyer: string): Promise<boolean> => {
            console.log('🚀 ~ orderAmount:', orderAmount);
            if (contract) {
                try {
                    const tx = await contract.createOrder(orderId, subscriptionTypeId, orderAmount, commission, shippingFee, buyer);
                    await tx.wait();
                    console.log('🚀 createOrderOnBC ~ tx:', tx.hash);

                    return true;
                } catch (error: any) {
                    console.log('🚀 ~ error:', error);
                    return false;
                }
            }
            return false;
        },
        [contract]
    );

    const claimOrder = useCallback(
        async (orderId: string) => {
            if (contract) {
                try {
                    const tx = await contract.claimOrder(orderId);
                    await tx.wait();
                    Swal.fire('Order Claimed', 'Order has been successfully claimed', 'success');
                } catch (error: any) {
                    Swal.fire('Error', 'Failed to claim order', 'error');
                }
            }
        },
        [contract]
    );

    const claimRefund = useCallback(
        async (orderId: string) => {
            if (contract) {
                try {
                    const tx = await contract.claimRefund(orderId);
                    await tx.wait();
                    Swal.fire('Order Refunded', 'Order has been successfully refunded', 'success');
                } catch (error: any) {
                    Swal.fire('Error', 'Failed to claim refund', 'error');
                    console.error('Error claiming refund:', error);
                }
            }
        },
        [contract]
    );

    const claimAll = useCallback(async () => {
        if (contract) {
            try {
                const tx = await contract.claimAll();
                await tx.wait();
                Swal.fire('All Funds Claimed', 'All funds have been successfully claimed', 'success');
            } catch (error: any) {
                Swal.fire('Error', 'Failed to claim all funds', 'error');
                console.error('Error claiming all funds:', error);
            }
        }
    }, [contract]);

    const claimOrders = useCallback(
        async (ordersToClaim: string[]) => {
            if (contract) {
                try {
                    const tx = await contract.claimOrders(ordersToClaim);
                    await tx.wait();
                    Swal.fire('Orders Claimed', 'Orders have been successfully claimed', 'success');
                } catch (error: any) {
                    Swal.fire('Error', 'Failed to claim orders', 'error');
                    console.error('Error claiming orders:', error);
                }
            }
        },
        [contract]
    );

    const getOrder = useCallback(
        async (orderId: string): Promise<Order | null> => {
            if (contract) {
                try {
                    const order = await contract.getOrder(orderId);
                    return {
                        orderId: order.orderId,
                        orderAmount: order.orderAmount,
                        commission: order.commission,
                        shippingFee: order.shippingFee,
                        buyer: order.buyer,
                        orderClaimed: order.orderClaimed,
                        commissionClaimed: order.commissionClaimed,
                        shippingFeeClaimed: order.shippingFeeClaimed,
                        orderRefunded: order.orderRefunded,
                    };
                } catch (error: any) {
                    Swal.fire('Error', 'Failed to fetch order', 'error');
                    console.error('Error fetching order:', error);
                    return null;
                }
            }
            return null;
        },
        [contract]
    );

    const getExchangeTax = useCallback(async (): Promise<number> => {
        if (contract) {
            try {
                const exchangeTaxRate = await contract.getExchangeTax();
                const tax = Number(exchangeTaxRate);
                return tax;
            } catch (error: any) {
                return 0;
            }
        } else {
            return 0; // Add a return statement here
        }
    }, [contract]);

    const setExchangeTaxValue = useCallback(
        async (newExchangeTax: BigNumber) => {
            if (contract) {
                try {
                    const tx = await contract.setExchangeTax(newExchangeTax);
                    await tx.wait();
                    Swal.fire('Exchange Tax Updated', 'Exchange tax has been successfully updated', 'success');
                } catch (error: any) {
                    Swal.fire('Error', 'Failed to update exchange tax', 'error');
                    console.error('Error updating exchange tax:', error);
                }
            }
        },
        [contract]
    );

    const pauseContract = useCallback(async () => {
        if (contract) {
            try {
                const tx = await contract.pause();
                await tx.wait();
                Swal.fire('Contract Paused', 'Contract has been successfully paused', 'success');
            } catch (error: any) {
                Swal.fire('Error', 'Failed to pause contract', 'error');
                console.error('Error pausing contract:', error);
            }
        }
    }, [contract]);

    const unpauseContract = useCallback(async () => {
        if (contract) {
            try {
                const tx = await contract.unpause();
                await tx.wait();
                Swal.fire('Contract Unpaused', 'Contract has been successfully unpaused', 'success');
            } catch (error: any) {
                Swal.fire('Error', 'Failed to unpause contract', 'error');
                console.error('Error unpausing contract:', error);
            }
        }
    }, [contract]);

    const changeOwner = useCallback(
        async (newOwner: string) => {
            if (contract) {
                try {
                    const tx = await contract.changeOwner(newOwner);
                    await tx.wait();
                    Swal.fire('Owner Changed', 'Contract owner has been successfully changed', 'success');
                } catch (error: any) {
                    Swal.fire('Error', 'Failed to change owner', 'error');
                    console.error('Error changing owner:', error);
                }
            }
        },
        [contract]
    );

    const fetchOrders = useCallback(
        async (userAddress: string) => {
            setIsLoading(true);
            try {
                const orderIds = await contract?.addressToOrders(userAddress);

                const orderPromises = orderIds.map((orderId: string) => contract?.getOrder(orderId));
                const fetchedOrders = await Promise.all(orderPromises);

                const formattedOrders = fetchedOrders.map((order: any) => ({
                    orderId: order.orderId,
                    orderAmount: order.orderAmount,
                    commission: order.commission,
                    shippingFee: order.shippingFee,
                    buyer: order.buyer,
                    orderClaimed: order.orderClaimed,
                    commissionClaimed: order.commissionClaimed,
                    shippingFeeClaimed: order.shippingFeeClaimed,
                    orderRefunded: order.orderRefunded,
                }));

                setOrders(formattedOrders);
            } catch (error) {
                console.error('Error fetching orders:', error);
            } finally {
                setIsLoading(false);
            }
        },
        [contract]
    );

    return {
        account,
        orders,
        exchangeTax,
        isLoading,
        createOrderOnBC,
        claimOrder,
        claimRefund,
        claimAll,
        claimOrders,
        getOrder,
        getExchangeTax,
        setExchangeTaxValue,
        pauseContract,
        unpauseContract,
        changeOwner,
        fetchOrders,
    };
};

export default useOrderManagement;
