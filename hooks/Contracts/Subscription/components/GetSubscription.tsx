import React, { useContext, useEffect, useState } from 'react';

import { PromoterModel, SubscriptionManagementModel } from '../types';
import { Alert, Button, Form } from 'react-bootstrap';
import usePromoterManagement from '../customHooks/usePromoterManagement';
import { useSession } from 'next-auth/react';
import { SessionExt } from '../../../../types/SessionExt';
import { convertToBigNumber, convertToScaled } from '@/utils/utils';
import Swal from 'sweetalert2';
import useSubscriptionManagement from '../customHooks/useSubscriptionManagement';
import { SubscriptionContext } from '@/store/subscription-context';


function GetSubscription() {
    const subContext = useContext(SubscriptionContext);

    const { data: session }: { data: SessionExt | null } = useSession() as { data: SessionExt | null };
    const { changeTotShopAmountPaidOnBC: changeTotShopAmountPaid, getSubscriptionByIdOnBC: getSubscriptionById } = useSubscriptionManagement();
    const [subscription, setSubscription] = useState<SubscriptionManagementModel | null>(null); // Fix this
    const [subscriptionId, setSubscriptionId] = useState('');
    const [newTotShopAmountPaid, setNewTotShopAmountPaid] = useState(0);
    const changeTotShopAmountPaidHandleClick = async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {

        await changeTotShopAmountPaid(subscription?.id!, newTotShopAmountPaid);

        setNewTotShopAmountPaid(0);

    };

    const getSubscriptionByIdHandleClick = async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        try {
            if (subscriptionId) {
                const result: SubscriptionManagementModel | null = await getSubscriptionById(Number(subscriptionId));
                console.log("🚀 ~ getSubscriptionByIdHandleClick ~ result:", result)
                if (result?.subscriber === "0x0000000000000000000000000000000000000000") {

                    setSubscription(null);
                    Swal.fire({
                        icon: 'warning',
                        title: 'Subscription not found',
                        showConfirmButton: false,
                        timer: 1500
                    });
                } else {

                    setSubscription(result);
                }
            } else {

            }
        } catch (error) {
            console.error('Error fetching promoter:', error);
            setSubscription(null);
        }
    }
    const setsetNewTotShopAmountPaidHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
        setNewTotShopAmountPaid(Number(event.target.value));
    }
    useEffect(() => {
        if (subscription) {
            setNewTotShopAmountPaid(0);
        }
    }, [subscription]);

    return (
        <div className=" d-flex flex-column ">
            <h3 className="text-center">Find Subscription</h3>
            <div>
                <input
                    type="text"
                    className="form-control m-auto w-100 mt-2"
                    onChange={e => {
                        setSubscriptionId(e.target.value.trim());
                    }}
                    value={subscriptionId}
                    placeholder="Entersubscription ID"
                />

                <div className=" my-1 d-flex ">
                    <Button variant="primary" size="sm" onClick={getSubscriptionByIdHandleClick} className=" w-100 mt-1 px-0">
                        Search
                    </Button>
                </div>
            </div>
            {subscription ? (
                <div className="mt-3">
                    <ul className="list-group">
                        <li className="list-group-item d-flex justify-content-between ">
                            <strong>Subscription ID:</strong>
                            <span className="text-start">{Number(subscription?.id)}</span>
                        </li>
                        <li className="list-group-item d-flex justify-content-between ">
                            <strong>Subscriber:</strong>
                            <span className="text-start">...{subscription?.subscriber.substring(subscription?.subscriber.length - 20, subscription?.subscriber.length - 1)}</span>
                        </li>
                        {/* <li className="list-group-item d-flex justify-content-between">
                            <strong>Is active:</strong>
                            <Form.Check // prettier-ignore
                                type="switch"
                                id="custom-switch"
                                label={subscription?. ? 'Active' : 'Inactive'}
                                checked={subscription?.isActive}
                                onChange={e => setPromoterActiveHandler(subscription?.promoterAddress, e.target.checked)} // Fix this
                            />
                        </li> */}
                        {/* <li className="list-group-item d-flex col-12">
                            <div className="d-flex  align-items-center">
                                <strong>Percentage:</strong>
                            </div>
                            <div className="d-flex  align-items-center justify-content-end w-100">
                                <b>%</b>
                                <input
                                    type="number"
                                    value={subscription?.percentage}
                                    style={{ width: '15%', textAlign: 'center' }}
                                    onChange={e => setSubscription({ ...subscription!, percentage: Number(e.target.value) })}
                                    pattern="[0-9]"
                                    min={0}
                                    max={50}
                                />
                                <button
                                    className="mx-1 rounded-5 p-1 px-4"
                                    style={{ backgroundColor: '#ff9900', color: 'white', border: 'none' }}
                                    onClick={() => setPromoterPercentageHandler(subscription?.promoterAddress, subscription?.percentage)}
                                >
                                    confirm
                                </button>
                            </div>
                        </li> */}
                        <li className="list-group-item d-flex justify-content-between">
                            <strong>Sub Type:</strong>
                            <span className="text-end">{subscription?.subscriptionModel?.name}</span>
                        </li>

                        {
                            subscription?.subscriptionModel.subscriptionType === 0 ? (
                                <>
                                    <li className="list-group-item d-flex justify-content-between">
                                        <strong>Shop Limit:</strong>
                                        <span className="text-end">${subscription?.subscriptionModel.shopLimit.toFixed(2)}</span>
                                    </li>
                                    <li className="list-group-item d-flex justify-content-between">
                                        <strong>Shop spent:</strong>
                                        <span className="text-end">${subscription?.totShopAmountPaid.toFixed(2)}</span>
                                    </li>
                                    <li className="list-group-item d-flex col-12">
                                        <div className="d-flex  align-items-center">
                                            <strong>Change Shop spent:</strong>
                                        </div>
                                        <div className="d-flex  align-items-center justify-content-end w-100">
                                            <b>$</b>
                                            <input
                                                type="number"
                                                value={newTotShopAmountPaid}
                                                style={{ width: '30%', textAlign: 'center' }}
                                                onChange={setsetNewTotShopAmountPaidHandler}
                                                pattern="[0-9]"
                                                min={0}
                                                max={subscription?.subscriptionModel?.shopLimit!}
                                            //   disabled={subContext.currentSubscription?.subscriptionModel.shopLimit! === 0 || subContext.currentSubscription?.totShopAmountPaid! > subContext.currentSubscription?.subscriptionModel.shopLimit!}

                                            />
                                            <button
                                                className="mx-1 rounded-5 p-1 px-4"
                                                style={{ backgroundColor: '#ff9900', color: 'white', border: 'none' }}
                                                onClick={changeTotShopAmountPaidHandleClick}
                                            //   disabled={newTotShopAmountPaid === 0 ||    subContext.currentSubscription?.totShopAmountPaid! >  subContext.currentSubscription?.subscriptionModel.shopLimit!}


                                            >
                                                confirm
                                            </button>
                                        </div>
                                    </li>
                                </>
                            ) : (
                                <li className="list-group-item d-flex justify-content-between">  <div className="d-flex  align-items-center">
                                    <strong>Expences:</strong>
                                </div>
                                    <div className="d-flex  align-items-center justify-content-end w-100">
                                        <b> UNLIMITED</b>
                                    </div>
                                </li>)

                        }

                        {/* <li className="list-group-item d-flex justify-content-between">
                            <strong>Referral:</strong>
                            <span className="text-end">{subscription?.referralCode}</span>
                        </li> */}
                    </ul>
                </div>
            ) : (
                <p className=" text-center w-100">No Subscription found</p>
            )}
        </div>
    );
}

export default GetSubscription;
