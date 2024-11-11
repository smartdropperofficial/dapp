/* eslint-disable @next/next/no-img-element */
import React, { useContext } from 'react';
import { OrderContext } from '../../store/order-context';
import ItemCard from '../UI/ItemCard';
import '@/utils/utils/';
import Link from 'next/link';
import BasketItem from './BasketItem';
function Basket() {
    const orderContext = useContext(OrderContext);


    const basketTotal = (): number => {
        let total = 0;
        orderContext.items.forEach(el => {
            total += el.price! * el.quantity;
        });
        return total;
    };


    return (
        <section id="basket">
            <div className="mt-4">
                {orderContext.items.length < 1 && <h5 className="text-center pt-5 mb-3">Your Cart Items</h5>}
                {orderContext.items.length < 1 && <small className="d-block text-center mb-3">No Items added.</small>}
                {orderContext.items.length > 0 &&
                    orderContext.items.map((el, i) => {
                        return (
                            <div className="mb-3" key={i}>
                                <ItemCard>
                                    <div className="row align-items-center justify-content-sm-start justify-content-center">
                                        <div className="col-3 col-sm-2 ">
                                            <img
                                                src={el.image}
                                                alt={el.title}
                                                style={{ borderRadius: '5%', boxShadow: '0px 20px 39px -9px rgba(0,0,0,0.1)' }}
                                                className="img-thumbnail img-fluid"
                                            />
                                        </div>
                                        <div className="col-10">
                                            <div className="item-info my-1 ">
                                                <p>{el.title}</p>
                                                <Link href={el.url} target="_blank">
                                                    Open on Amazon
                                                </Link>
                                            </div>
                                            {/* <b> Price: ${el.price!.toFixed(2)}  </b> */}
                                        </div>
                                        <BasketItem id={el.id} el={el} />

                                    </div>
                                </ItemCard>
                            </div>
                        );
                    })}
            </div>
            <hr />
            <div className="my-4 mx-3 flex-column  d-flex align-items-end ">
                <div className="d-flex flex-column align-items-end mb-5">
                    <h3>Total Basket</h3>
                    <h2>
                        <b>{'$' + basketTotal().toFixed(2)}</b>
                    </h2>
                </div>
            </div>
        </section>
    );
}

export default Basket;
