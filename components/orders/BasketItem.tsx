import { OrderContext } from '@/store/order-context';
import { SubscriptionContext } from '@/store/subscription-context';
import { Fab } from '@mui/material';
import React, { useState, useEffect, useContext, useRef } from 'react';
import Swal from 'sweetalert2';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import useSubscriptionModel from '@/hooks/Database/subscription/useSubscription';

const BasketItem = ({ id, el }: { id: any; el: any }) => {
    const [quantity, setQuantity] = useState(el.quantity);
    const [inputValue, setInputValue] = useState(el.quantity); // Stato per l'input temporaneo
    const orderContext = useContext(OrderContext);
    const subContext = useContext(SubscriptionContext);
    const [canshop, setCanShop] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null); // Ref per il timeout
    const { getShopExpenses } = useSubscriptionModel();

    const handleBlur = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value, 10);

        if (!isNaN(value) && value > 0) {
            setInputValue(value); // Aggiorna solo il valore di input temporaneo
            await updateHandler(value);

            // if (timeoutRef.current) clearTimeout(timeoutRef.current);

            // timeoutRef.current = setTimeout(async () => {
            //     await updateHandler(value);
            // }, 1500);
        } else {
            return;
        }
    };
    const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value, 10);

        if (!isNaN(value) && value > 0) {
            setInputValue(value); // Aggiorna solo il valore di input temporaneo

            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            return;
        }
    };

    const handleClick = async (newQuantity: number) => {
        await updateHandler(newQuantity);
    };
    // const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    //     const value = parseInt(e.target.value, 10);

    //     if (!isNaN(value) && value > 0) {
    //         if (timeoutRef.current) clearTimeout(timeoutRef.current);

    //         timeoutRef.current = setTimeout(async () => {
    //             await updateHandler(value);
    //         }, 1500);
    //     }
    // };

    const updateHandler = async (newQuantity: number): Promise<boolean> => {
        if (newQuantity !== el.quantity) {
            await fetchShopExpenses(newQuantity);

            return true;
        } else {
            return false;
        }
    };

    const cartTotal = (newQuantity: number): number => {
        return orderContext.items.reduce((total, item) => {
            return total + item.price! * newQuantity;
        }, 0);
    };
    async function fetchShopExpenses(newQuantity: number) {
        const res = await getShopExpenses(subContext?.currentSubscription?.id!);
        const amount = cartTotal(newQuantity) + res;
        setCanShop(amount <= subContext?.currentSubscription?.subscriptionModel.shopLimit!);

        if (amount >= subContext?.currentSubscription?.subscriptionModel.shopLimit!) {
            setCanShop(false);
            Swal.fire({
                title: 'Exceeded Monthly Amount Limit',
                text: 'This amount exceed maximum limit for this subscription level.',
                icon: 'error',
            });
            setInputValue(quantity);
        } else {
            setCanShop(true);
            setInputValue(newQuantity);
            setQuantity(newQuantity);
        }
    }
    // useEffect(() => {
    //     fetchShopExpenses(inputValue);
    // }, [inputValue, getShopExpenses]);

    useEffect(() => {
        if (quantity && canshop) {
            orderContext.editBasketQtyHandler(id, quantity);
        }
    }, [canshop, quantity]);

    // Cleanup del timeout quando il componente si smonta
    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    return (
        <div className="row mt-3 d-flex col-12 justify-content-lg-center align-items-end  justify-content-center  flex-column ">
            <div className="d-flex align-items-center ">
                <i className="fa fa-trash cursor-pointer mx-2" aria-hidden="true" onClick={() => orderContext.deleteAllItems()}>
                    {' '}
                </i>
                <div
                    className="d-flex  align-items-center justify-content-center px-1 col-8 col-lg-5 "
                    style={{ border: '3px solid #ff9900', borderRadius: '0px', outline: 'none', backgroundColor: 'white' }}
                >
                    {quantity > 1 && <i className="fa fa-minus cursor-pointer" aria-hidden="true" onClick={() => handleClick(inputValue - 1)}></i>}
                    <input
                        type="number"
                        inputMode="numeric"
                        onChange={handleChange}
                        className="font-weight-bold bg-white mx-4 flex-column m-2 text-center "
                        style={{ border: 'none', borderRadius: '5px', outline: 'none', width: '100px' }}
                        value={inputValue}
                        min={0}
                        onBlur={handleBlur}
                    />
                    <i className="fa fa-plus" aria-hidden="true" onClick={() => handleClick(inputValue + 1)}></i>
                </div>
            </div>
            <span className="mt-2" style={{ width: 'fit-content' }}>
                ${(el?.quantity * el?.price).toFixed(2)}
            </span>
        </div>
    );
};

export default BasketItem;
