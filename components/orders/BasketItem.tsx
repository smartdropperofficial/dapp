import { OrderContext } from '@/store/order-context';
import { SubscriptionContext } from '@/store/subscription-context';
import React, { useState, useEffect, useContext, useRef } from 'react';
import Swal from 'sweetalert2';

const BasketItem = ({ id, el }: { id: string; el: any }) => {
    const [quantity, setQuantity] = useState(el.quantity);
    const [inputValue, setInputValue] = useState(el.quantity); // Stato per l'input temporaneo
    const orderContext = useContext(OrderContext);
    const subContext = useContext(SubscriptionContext);

    const timeoutRef = useRef<NodeJS.Timeout | null>(null); // Ref per il timeout

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value, 10);

        if (!isNaN(value) && value >= 0) {
            setInputValue(value); // Aggiorna solo il valore di input temporaneo

            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            console.log("🚀 ~ timeoutRef.current=setTimeout ~ subContext?.currentSubscription?.subscriptionModel?.shopLimit:", subContext?.currentSubscription?.subscriptionModel?.shopLimit)

            timeoutRef.current = setTimeout(() => {
                if(subContext?.currentSubscription?.subscriptionModel?.shopLimit! > 0 )  {
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
                } else{
                    setQuantity(value); return;
                   
                }

               
            }, 1500);
        }
    };

    // Esegui `editBasketQtyHandler` quando `quantity` viene aggiornato
    useEffect(() => {
        if (quantity !== el.quantity) {
            orderContext.editBasketQtyHandler(id, quantity);
        }
    }, [quantity, id, orderContext, el.quantity]);

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
        <div className="row mt-3 d-flex flex-column col-12">
            <div className="col-12 d-flex align-items-center mb-5 justify-content-start">
                <span className="font-weight-bold">Total:</span>
                <input
                    type="number"
                    inputMode="numeric"
                    onChange={handleChange}
                    className="font-weight-bold bg-white py-2 px-4 flex-column m-2"
                    value={inputValue}
                    min={0}
                />
                <span>${(el?.quantity * el?.price).toFixed(2)}</span>
            </div>
        </div>
    );
};

export default BasketItem;
