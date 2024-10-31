import { OrderContext } from '@/store/order-context';
import React, { useState, useEffect, useContext, useRef } from 'react';

const BasketItem = ({ id, el }) => {
    const [quantity, setQuantity] = useState(el.quantity);
    const orderContext = useContext(OrderContext);
    const quantityRef = useRef(quantity); // Ref per mantenere il valore aggiornato
    const timeoutRef = useRef<Timeout | null>(null); // Ref per il timeout

    const handleChange = e => {
        const value = parseInt(e.target.value, 10);
        if (!isNaN(value) && value > 0) {
            setQuantity(value); // Aggiorna lo stato locale
            quantityRef.current = value; // Aggiorna il ref per avere sempre il valore corrente
        }

        // Cancella il timeout precedente per avviare un debounce
        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        // Imposta un nuovo timeout per eseguire `editBasketQtyHandler` dopo 1000 ms
        timeoutRef.current = setTimeout(() => {
            console.log('🚀 ~ timeout ~ id, quantity:', id, quantityRef.current);
            orderContext.editBasketQtyHandler(id, quantityRef.current);
        }, 1000);
    };

    // Cleanup del timeout quando il componente si smonta
    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    useEffect(() => {
        if (id) console.log('🚀 ~ useEffect ~ id:', id);
    }, [id]);

    return (
        <div className="row mt-3 d-flex flex-column col-12">
            <div className="col-12 d-flex align-items-center mb-5 justify-content-between">
                <span className="font-weight-bold">Total:</span>
                <input
                    type="number"
                    inputMode="numeric"
                    onChange={handleChange}
                    className="font-weight-bold bg-white py-2 px-4 flex-column m-2"
                    value={quantity}
                    min={1}
                />
            </div>
        </div>
    );
};

export default BasketItem;
