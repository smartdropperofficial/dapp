import { SubscriptionContext } from '@/store/subscription-context';
import React, { use, useContext, useEffect, useState } from 'react';
import useSubscriptionPlan from '../customHooks/useSubscriptionPlan';
import { SubscriptionPlans } from '../types';
import { Accordion } from 'react-bootstrap';

function SubscriptionPlansList() {
    const [isLoadingContract, setIsLoadingContract] = useState(true);
    const { updateSubscriptionFeeOnBC, getSubscriptionModels, updateSubscriptionPriceOnBC } = useSubscriptionPlan();
    const [subscriptionsPlans, setSubscriptionsPlans] = useState<SubscriptionPlans[]>([]);

    const ctx = useContext(SubscriptionContext);

    useEffect(() => {
        if (ctx.subscriptionsModels) {
            setSubscriptionsPlans(ctx.subscriptionsModels);
        }
    }, [ctx.subscriptionsModels]);


    const handleFeesChange = (event: React.ChangeEvent<HTMLInputElement>, id: number) => {
        const updatedFees = parseFloat(event.target.value);
        setSubscriptionsPlans((prevPlans) =>
            prevPlans.map((plan) =>
                plan.id === id ? { ...plan, fees: updatedFees } : plan
            )
        );
    };
    const handlePriceChange = (event: React.ChangeEvent<HTMLInputElement>, id: number) => {
        const updatedPrice = parseFloat(event.target.value);
        setSubscriptionsPlans((prevPlans) =>
            prevPlans.map((plan) =>
                plan.id === id ? { ...plan, price: updatedPrice } : plan
            )
        );
    }
    useEffect(() => {
        //logs subscriptionsPlans changes 
        console.log('subscriptionsPlans', subscriptionsPlans);

    }, [subscriptionsPlans]);


    const setUpdateSubscriptionHandler = async (id: number, fees: number) => {
        // console.log('setPromoterPercentageHandler', id, fees);
        await updateSubscriptionFeeOnBC(id, fees);
    }
    const setUpdateSubscriptionPriceHandler = async (id: number, price: number) => {
        console.log("🚀 ~ setUpdateSubscriptionPriceHandler ~ price:", price)
        await updateSubscriptionPriceOnBC(id, price);
    }
    return (
        <Accordion defaultActiveKey="0" className="  col-12">
            {subscriptionsPlans.map((subscription, index) => (
                <Accordion.Item eventKey={index.toString()} key={subscription.id}>
                    <Accordion.Header>
                        Subscription ID: {Number(subscription?.id)} - {subscription?.name.toUpperCase()}
                    </Accordion.Header>
                    <Accordion.Body>
                        <ul className="list-group">
                            <li className="list-group-item d-flex align-items-center  justify-content-lg-between justify-content-center flex-column flex-lg-row">
                                <strong>Percentage:</strong>
                                <div className="d-flex align-items-center justify-content-center justify-content-lg-end flex-column flex-lg-row">
                                    <b>%</b>
                                    <input
                                        type="number"
                                        value={subscription.fees}
                                        style={{ width: '100px', textAlign: 'center', marginLeft: '10px' }}
                                        onChange={(event) => handleFeesChange(event, subscription.id!)}
                                        pattern="\d*"
                                        min={0}
                                        max={50}
                                        step={1}
                                        className='my-1 mx-0'
                                    />
                                    <button
                                        className="mx-1 rounded-5 p-1 px-4"
                                        style={{ backgroundColor: '#ff9900', color: 'white', border: 'none' }}
                                        onClick={() =>
                                            setUpdateSubscriptionHandler(subscription.id!, subscription.fees)
                                        }
                                    >
                                        Confirm
                                    </button>
                                </div>
                            </li>
                            <li className="list-group-item d-flex align-items-center justify-content-lg-between justify-content-center flex-column flex-lg-row">
                                <strong>Price:</strong>
                                <div className="d-flex align-items-center justify-content-center justify-content-lg-end flex-column flex-lg-row">
                                    <b>%</b>
                                    <input
                                        type="number"
                                        value={subscription.price}
                                        style={{ width: '100px', textAlign: 'center', marginLeft: '10px' }}
                                        onChange={(event) => handlePriceChange(event, subscription.id!)}
                                        pattern="\d*"
                                        min={0}
                                        max={50}
                                        step={1}
                                        className='my-1 mx-0'


                                    />
                                    <button
                                        className="mx-1 rounded-5 p-1 px-4"
                                        style={{ backgroundColor: '#ff9900', color: 'white', border: 'none' }}
                                        onClick={() =>
                                            setUpdateSubscriptionPriceHandler(subscription.id!, subscription.price)
                                        }
                                    >
                                        Confirm
                                    </button>
                                </div>
                            </li>
                            <li className="list-group-item d-flex justify-content-between">
                                <strong>PLAN:</strong>
                                <span className="text-end">{subscription?.name.toUpperCase()}</span>
                            </li>
                            {subscription?.subscriptionType === 0 ? (
                                <>
                                    <li className="list-group-item d-flex justify-content-between">
                                        <strong>Shop Limit:</strong>
                                        <span className="text-end">${subscription?.shopLimit.toFixed(2)}</span>
                                    </li>

                                </>
                            ) : (
                                <li className="list-group-item d-flex justify-content-between">
                                    <strong>Expenses:</strong>
                                    <span>UNLIMITED</span>
                                </li>
                            )}


                        </ul>
                    </Accordion.Body>
                </Accordion.Item>
            ))}
        </Accordion>
    );


}

export default SubscriptionPlansList;
