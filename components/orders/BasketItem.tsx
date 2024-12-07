import { OrderContext } from '@/store/order-context';
import { SubscriptionContext } from '@/store/subscription-context';
import { Fab } from '@mui/material';
import React, { useState, useEffect, useContext, useRef } from 'react';
import Swal from 'sweetalert2';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';

const BasketItem = ({ id, el }: { id: any; el: any }) => {
    const [quantity, setQuantity] = useState(el.quantity);
    const [inputValue, setInputValue] = useState(el.quantity); // Stato per l'input temporaneo
    const orderContext = useContext(OrderContext);
    const subContext = useContext(SubscriptionContext);

    const timeoutRef = useRef<NodeJS.Timeout | null>(null); // Ref per il timeout

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value, 10);

        if (!isNaN(value) && value > 0) {
            setInputValue(value); // Aggiorna solo il valore di input temporaneo

            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            // console.log("🚀 ~ timeoutRef.current=setTimeout ~ subContext?.currentSubscription?.subscriptionModel?.shopLimit:", subContext?.currentSubscription?.subscriptionModel?.shopLimit)

            timeoutRef.current = setTimeout(() => {
                if (subContext?.currentSubscription?.subscriptionModel?.shopLimit! > 0) {
                    if (
                        CanAddMoreItems(value) <
                        subContext?.currentSubscription?.subscriptionModel?.shopLimit! - subContext?.currentSubscription?.totShopAmountPaid!
                    ) {
                        setQuantity(value); // Imposta il valore finale
                    } else {
                        Swal.fire({
                            title: 'Exceeded Monthly Amount Limit',
                            text: 'This amount exceed maximum limit for this subscription level.',
                            icon: 'error',
                        });
                        setInputValue(quantity); // Reimposta l'input a `quantity` corrente se il limite è superato
                    }
                } else {
                    setQuantity(value); return;

                }

            }, 1500);
        } else {
            return
        }
    };

    // Esegui `editBasketQtyHandler` quando `quantity` viene aggiornato
    const handleClick = (newQuantity: number) => {
        setQuantity(newQuantity);
        if (newQuantity !== el.quantity) {
            setInputValue(newQuantity);
            orderContext.editBasketQtyHandler(id, newQuantity);
        }
    };

    const CanAddMoreItems = (newQuantity: number): number => {
        return orderContext.items.reduce((total, item) => {
            return total + item.price! * newQuantity;
        }, 0);
    };

    // Cleanup del timeout quando il componente si smonta
    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    return (
        <div className="row mt-3 d-flex col-12 justify-content-lg-center align-items-end  justify-content-center  flex-column ">
            <div className='d-flex align-items-center '>
                <i className="fa fa-trash cursor-pointer mx-2" aria-hidden="true" onClick={() => orderContext.deleteAllItems()} > </i>
                <div
                    className="d-flex  align-items-center justify-content-center px-1 col-8 col-lg-5 "
                    style={{ border: '3px solid #ff9900', borderRadius: '0px', outline: 'none', backgroundColor: 'white' }}

                >
                    {/* {quantity < 2 ?
                     <i className="fa fa-trash cursor-pointer" aria-hidden="true" onClick={() => orderContext.deleteAllItems()} > </i>
                     : <i className="fa fa-minus cursor-pointer" aria-hidden="true" onClick={() => setQuantity(quantity - 1)}></i>
            
                 }  */}
                    {quantity > 1 && <i className="fa fa-minus cursor-pointer" aria-hidden="true" onClick={() => setQuantity(quantity - 1)}></i>}
                    <input
                        type="number"
                        inputMode="numeric"
                        onChange={handleChange}
                        className="font-weight-bold bg-white mx-4 flex-column m-2 text-center "
                        style={{ border: 'none', borderRadius: '5px', outline: 'none', width: '100px', }}
                        value={inputValue}
                        min={0}
                    />
                    <i className="fa fa-plus" aria-hidden="true" onClick={() => handleClick(quantity + 1)}></i>

                </div>
            </div>
            <span className='mt-2' style={{ width: 'fit-content' }}>${(el?.quantity * el?.price).toFixed(2)}</span>

        </div>
    );
};

export default BasketItem;
