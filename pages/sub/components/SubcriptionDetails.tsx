import useSubscriptionManagement from '@/hooks/Contracts/Subscription/customHooks/useSubscriptionManagement';
import { SubscriptionManagementModel, SubscriptionPlans } from '@/hooks/Contracts/Subscription/types';
import { isDateExpired } from '@/utils/utils';
import React, { useEffect, useState } from 'react';
import { Card } from 'react-bootstrap';
import Skeleton from 'react-loading-skeleton';

function SubcriptionDetails({ subId }: { subId: number }) {
    const { changeTotShopAmountPaidOnBC: changeTotShopAmountPaid, getSubscriptionByIdOnBC: getSubscriptionById, updateSubscriptionFeeOnBC } = useSubscriptionManagement();
    const [subscription, setSubscription] = useState<SubscriptionManagementModel | null>(null); // Fix this
    const [newTotShopAmountPaid, setNewTotShopAmountPaid] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    const changeTotShopAmountPaidHandleClick = async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        await changeTotShopAmountPaid(subscription?.id!, newTotShopAmountPaid);
        setNewTotShopAmountPaid(0);
    };

    // const getSubscriptionByIdHandleClick = async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {

    // }
    useEffect(() => {
        const getSub = async () => {
            try {
                const result: SubscriptionManagementModel | null = await getSubscriptionById(subId);
                if (result?.subscriber === '0x0000000000000000000000000000000000000000') {
                    setSubscription(null);
                } else {
                    setSubscription(result);
                }
            } catch (error) {
                console.error('Error fetching promoter:', error);
                setSubscription(null);
            } finally {
                setIsLoading(false);
            }
        };
        if (subId > -1) {
            getSub();
        }
    }, [getSubscriptionById, subId]);

    const setsetNewTotShopAmountPaidHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
        setNewTotShopAmountPaid(Number(event.target.value));
    };
    const handleFeesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newFees = Number(e.target.value);

        setSubscription((prev) => {
            if (prev && prev.subscriptionModel) {
                const updatedSubscriptionModel: SubscriptionPlans = {
                    ...prev.subscriptionModel,
                    fees: newFees,
                };

                return {
                    ...prev,
                    subscriptionModel: updatedSubscriptionModel,
                };
            }
            return prev;
        });
    };

    const setPromoterPercentageHandler = async (id: number, fees: number) => {
        // console.log('setPromoterPercentageHandler', id, fees);
        await updateSubscriptionFeeOnBC(id, fees);
    }




    // Controlla se il valore della percentuale è invariato o non valido
    const isPercentageUnchanged =
        subscription?.subscriptionModel?.fees === subscription?.subscriptionModel?.fees;

    const isPercentageInvalid =
        subscription?.subscriptionModel?.fees === undefined ||
        subscription?.subscriptionModel?.fees < 0 ||
        subscription?.subscriptionModel?.fees > 20;

    useEffect(() => {
        if (subscription) {
            setNewTotShopAmountPaid(0);
        }
    }, [subscription]);
    return (
        <div className="container col-lg-4 col-12">
            <div className=" d-flex flex-column ">
                {subscription && !isLoading ? (
                    <Card>
                        <div className="mt-3">
                            <ul className="list-group">
                                <li className="list-group-item d-flex justify-content-between ">
                                    <strong>Subscription ID:</strong>
                                    <span className="text-start">{Number(subscription?.id)}</span>
                                </li>
                                <li className="list-group-item d-flex justify-content-between ">
                                    <strong>Subscriber:</strong>
                                    <span className="text-start">
                                        ...{subscription?.subscriber?.substring(subscription?.subscriber?.length - 20, subscription?.subscriber?.length - 1)}
                                    </span>
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
                                <li className="list-group-item d-flex col-12">
                                    <div className="d-flex align-items-center">
                                        <strong>Percentage:</strong>
                                    </div>
                                    <div className="d-flex align-items-center justify-content-end w-100">
                                        <b>%</b>
                                        <input
                                            type="number"
                                            value={subscription.subscriptionModel.fees}
                                            style={{ width: '15%', textAlign: 'center' }}
                                            onChange={handleFeesChange}
                                            pattern="\d*"
                                            min={0}
                                            max={50}
                                            step={1}
                                        />

                                        <button
                                            className="mx-1 rounded-5 p-1 px-4"
                                            style={{ backgroundColor: '#ff9900', color: 'white', border: 'none' }}
                                            onClick={() =>
                                                setPromoterPercentageHandler(
                                                    subscription.id!,
                                                    subscription.subscriptionModel.fees
                                                )
                                            }
                                        >
                                            Confirm
                                        </button>
                                    </div>
                                </li>

                                <li className="list-group-item d-flex justify-content-between">
                                    <strong>PLAN:</strong>
                                    <span className="text-end">{subscription?.subscriptionModel?.name.toUpperCase()}</span>
                                </li>

                                {subscription?.subscriptionModel?.subscriptionType === 0 ? (
                                    <>
                                        <li className="list-group-item d-flex justify-content-between">
                                            <strong>Shop Limit:</strong>
                                            <span className="text-end">${subscription?.subscriptionModel.shopLimit.toFixed(2)}</span>
                                        </li>
                                        <li className="list-group-item d-flex justify-content-between">
                                            <strong>Shop spent:</strong>
                                            <span className="text-end">${subscription?.totShopAmountPaid?.toFixed(2)}</span>
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
                                    <li className="list-group-item d-flex justify-content-between">
                                        {' '}
                                        <div className="d-flex  align-items-center">
                                            <strong>Expences:</strong>
                                        </div>
                                        <div className="d-flex  align-items-center justify-content-end w-100">
                                            <b> UNLIMITED</b>
                                        </div>
                                    </li>
                                )}

                                <li className="list-group-item d-flex justify-content-between">
                                    <strong>Expired:</strong>
                                    <span>{isDateExpired(subscription.end) ? 'yes' : 'no'}</span>
                                </li>
                                <li className="list-group-item d-flex justify-content-between">
                                    <strong>Expiration:</strong>
                                    <td>{subscription.end}</td>
                                </li>
                            </ul>
                        </div>
                    </Card>
                ) : (
                    <Card>
                        <Skeleton height={20} count={4} />
                    </Card>
                )}
            </div>
        </div>
    );
}

export default SubcriptionDetails;
