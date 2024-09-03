/* eslint-disable @next/next/no-img-element */
import React, { useContext } from 'react'
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { OrderContext } from '../../store/order-context';
import ItemCard from '../UI/ItemCard';

import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import Link from 'next/link';
import { Fab } from '@mui/material';
import { SubscriptionContext } from '@/store/subscription-context';
import Swal from 'sweetalert2';
function Basket() {
    const subContext = useContext(SubscriptionContext);
    const orderContext = useContext(OrderContext);

    const incrementButtonHandler = (id: number, price: number) => {
        if (subContext?.currentSubscription?.subscriptionModel?.shopLimit! > 0) {
            if ((price + basketTotal() + subContext?.currentSubscription?.totShopAmountPaid!) > subContext?.currentSubscription?.subscriptionModel?.shopLimit!) {
                Swal.fire({
                    title: 'Warning',
                    text: 'You have reached the limit of your subscription',
                    icon: 'warning',
                    confirmButtonText: 'Ok'
                })

            } else {
                orderContext.incrementHandler(id, 'add')

            }
        } else {
            // console.log('incrementButtonHandler', id)   
            orderContext.incrementHandler(id, 'add')
        }
    }
    const basketTotal = (): number => {
        let total = 0;
        orderContext.items.forEach((el) => {
            total += el.price! * el.quantity;
        });
        return total;
    }
    const amountLeft = (): string => {
        if (subContext?.currentSubscription?.subscriptionModel.shopLimit! && subContext?.currentSubscription?.totShopAmountPaid! && basketTotal()) {
            const tot = subContext?.currentSubscription?.subscriptionModel.shopLimit! - subContext?.currentSubscription?.totShopAmountPaid! - basketTotal();
            // return tot.toFixed(2); 
            return tot > 0 ? "$" + tot.toFixed(2) : '$0.00';
        } else {
            return "Unlimited";
        }
    }


    return (
        <section id='basket'>
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
                                        <div className="row d-flex mt-3 col-12 flex-column ">
                                            <div className="col-12   d-flex my-lg-0 my-3 align-items-center mb-5 ">
                                                Total: <span className="font-weight-bold bg-white py-2 px-4  flex-column m-2 ">{el.quantity}</span>
                                                {el.symbol} {(el.price! * el.quantity).toFixed(2)}
                                            </div>
                                            <div className="col-12  position-relative d-flex p-0 justify-content-end align-items-center">
                                                <div className="d-flex">
                                                    <Fab aria-label="add" className="mx-2" onClick={e => incrementButtonHandler(el.id, el.price!)}>
                                                        <AddIcon />
                                                    </Fab>
                                                    <Fab
                                                        aria-label="add"
                                                        sx={{ color: 'black' }}
                                                        className="mx-2"
                                                        onClick={e => orderContext.incrementHandler(el.id, 'decrement')}
                                                    >
                                                        <RemoveIcon />
                                                    </Fab>
                                                </div>
                                                <div className=" d-flex ">
                                                    <Fab
                                                        sx={{ color: 'red' }}
                                                        aria-label="add"
                                                        className="mx-2"
                                                        onClick={e => orderContext.incrementHandler(el.id, 'delete')}
                                                    >
                                                        <DeleteForeverIcon />
                                                    </Fab>
                                                </div>
                                                {/* <div className="col-12  position-relative d-flex justify-content-end mt-5"> */}
                                                {/* <div className="col-6">
                                        {' '}
                                        <div className="col-lg-2 d-flex p-0"  >
                                            <span className=" fw-bold "> Total:</span>{' '} 
                                            { el.quantity}
                                        </div>
                                        {el.quantity === 0 ? (
                                            <span className="text-danger fs-6">Possibly unavailable</span>
                                        ) : (
                                            <div className="fs-5 fw-semibold">
                                                {el.price === 0.0 ? (
                                                    <span className="text-danger">Product not available</span>
                                                ) : (
                                                    <span>
                                                        {el.symbol} {(el.price! * el.quantity).toFixed(2)}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div> */}

                                                {/* </div> */}
                                            </div>
                                        </div>

                                    </div>
                                </ItemCard>
                            </div>
                        );
                    })}
            </div>
            <hr />
            <div className="my-4 mx-3 flex-column  d-flex align-items-end ">

                <div className='d-flex flex-column align-items-end mb-5'>
                    <h3>
                        Total Basket
                    </h3>
                    <h2>

                        <b>{'$' + basketTotal().toFixed(2)}</b>
                    </h2>
                </div>


            </div>

        </section>
    )
}

export default Basket