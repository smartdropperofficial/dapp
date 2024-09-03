import React, { useEffect, useState } from 'react';

import { PromoterModel, SubscriptionManagementModel } from '../types';
import { Alert, Button, Form } from 'react-bootstrap';
import usePromoterManagement from '../customHooks/usePromoterManagement';
import { useSession } from 'next-auth/react';
import { SessionExt } from '../../../../types/SessionExt';
import { convertToScaled } from '../../../../utils/utils';
import Swal from 'sweetalert2';
import useSubscriptionManagement from '../customHooks/useSubscriptionManagement';
import usePromoter from '@/hooks/Database/subscription/usePromoter';

function GetPromoter() {
    const { data: session }: { data: SessionExt | null } = useSession() as { data: SessionExt | null };

    const { setPromoterActiveOnDB, setPromoterProfitOnDB } = usePromoter();
    const { changePromoterProfitOnBC: changePromoterProfit, getSubscriptionByIdOnBC: getSubscriptionById } = useSubscriptionManagement();
    const { setPromoterPercentageOnBC, getPromoterOnBC, setPromoterActiveOnBC, setPromoterProfitOnBC } = usePromoterManagement();

    const [subscriptionId, setSubscriptionId] = useState('');
    const [subscription, setSubscription] = useState<SubscriptionManagementModel | null>(null); // Fix this

    const [promoter, setPromoter] = useState<PromoterModel>(null as unknown as PromoterModel); // Fix this
    const [promoterAddress, setPromoterAddress] = useState('');

    const handleClick = async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        try {
            if (promoterAddress) {
                const result = await getPromoterOnBC(promoterAddress);
                setPromoter(result!);
                setPromoterAddress('');
            } else {
                alert('Please enter a valid promoter address');
            }
        } catch (error) {
            console.error('Error fetching promoter:', error);
        }
    };
    const setPromoterActiveHandler = async (promoterAddress: string, isActive: boolean) => {
        {
            console.log('promoterAddress:', promoterAddress);
            console.log('isActive:', isActive);
            try {
                await setPromoterActiveOnBC(promoterAddress, isActive);
                setPromoter({ ...promoter!, isActive });
                Swal.fire({ title: 'Promoter active status updated', icon: 'success' });
            } catch (error) {
                console.error('Error setting promoter active:', error);
            }
        }
    };
    const setPromoterPercentageHandler = async (promoterAddress: string, percentage: number) => {
        console.log('promoterAddress:', promoterAddress);
        console.log('percentage:', percentage);
        const _percentage = convertToScaled(percentage); // Fix this

        try {
            await setPromoterPercentageOnBC(promoterAddress, _percentage);
            setPromoter({ ...promoter!, percentage });
            Swal.fire({ title: 'Promoter percentage updated', icon: 'success' });
        } catch (error) {
            Swal.fire({ title: 'Error updating promoter percentage', icon: 'error' });
        }
    };
    const setPromoterProfitHandler = async (promoterAddress: string, profit: number) => {
        console.log('promoterAddress:', promoterAddress);
        console.log('profit:', profit);
        try {
            const _profit = convertToScaled(profit); // Fix this
            await setPromoterProfitOnBC(promoterAddress, _profit);
            setPromoter({ ...promoter!, profit });
            Swal.fire({ title: 'Promoter profit updated', icon: 'success' });
        } catch (error) {
            console.error('Error setting promoter profit:', error);
        }
    };
    const getSubscriptionByIdHandleClick = async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        try {
            if (subscriptionId) {
                const result = await getSubscriptionById(Number(subscriptionId));
                setSubscription(result);
            } else {
                alert('Please enter a valid promoter address');
            }
        } catch (error) {
            console.error('Error fetching promoter:', error);
            setSubscription(null);
        }
    }
    useEffect(() => {
        if (promoter) {
            console.log(promoter.percentage);
        }
    }, [promoter]);


    return (
        <div className=" d-flex flex-column ">
            <h3 className="text-center">Find Promoter</h3>
            <div>
                <input
                    type="text"
                    className="form-control m-auto w-100 mt-2"
                    onChange={e => {
                        console.log(e.target.value.trim());
                        setPromoterAddress(e.target.value.trim());
                    }}
                    value={promoterAddress}
                    placeholder="Enter promoter address"
                />

                <div className=" my-1 d-flex ">
                    <Button variant="primary" size="sm" onClick={handleClick} className=" w-100 mt-1 px-0">
                        Search
                    </Button>
                </div>
            </div>
            {promoter ? (
                <div className="mt-3">
                    <ul className="list-group">
                        <li className="list-group-item d-flex justify-content-between ">
                            <strong>Indirizzo:</strong>
                            <span className="text-end">{promoter?.promoterAddress}</span>
                        </li>
                        <li className="list-group-item d-flex justify-content-between">
                            <strong>Is active:</strong>
                            <Form.Check // prettier-ignore
                                type="switch"
                                id="custom-switch"
                                label={promoter?.isActive ? 'Active' : 'Inactive'}
                                checked={promoter?.isActive}
                                onChange={e => setPromoterActiveHandler(promoter?.promoterAddress, e.target.checked)} // Fix this
                            />
                        </li>
                        <li className="list-group-item d-flex col-12">
                            <div className="d-flex  align-items-center">
                                <strong>Percentage:</strong>
                            </div>
                            <div className="d-flex  align-items-center justify-content-end w-100">
                                <b>%</b>
                                <input
                                    type="number"
                                    value={promoter?.percentage}
                                    style={{ width: '15%', textAlign: 'center' }}
                                    onChange={e => setPromoter({ ...promoter!, percentage: Number(e.target.value) })}
                                    pattern="[0-9]"
                                    min={0}
                                    max={50}
                                />
                                <button
                                    className="mx-1 rounded-5 p-1 px-4"
                                    style={{ backgroundColor: '#ff9900', color: 'white', border: 'none' }}
                                    onClick={() => setPromoterPercentageHandler(promoter?.promoterAddress, promoter?.percentage)}
                                >
                                    confirm
                                </button>
                            </div>
                        </li>
                        {/* <li className="list-group-item d-flex justify-content-between">
                            <strong>Profit:</strong>
                            <div>
                                $ <input
                                    type="number"
                                    value={promoter?.profit.toFixed(2)}
                                    style={{ width: '', textAlign: 'center' }}
                                    onChange={e => setPromoter({ ...promoter!, percentage: Number(e.target.value) })}
                                    pattern="[0-9]"
                                    min={0}
                                    max={50}
                                />
                                <button
                                    className="mx-1 rounded-5 p-1 px-4"
                                    style={{ backgroundColor: '#ff9900', color: 'white', border: 'none' }}
                                    onClick={() => setPromoterPercentageHandler(promoter?.promoterAddress, promoter?.percentage)}
                                >
                                    confirm
                                </button>
                            </div>
                        </li> */}
                        <li className="list-group-item d-flex justify-content-between">
                            <strong>Referral:</strong>
                            <span className="text-end">{promoter?.referralCode}</span>
                        </li>
                    </ul>
                </div>
            ) : (
                <p className=" text-center w-100">No promoter found</p>
            )}
        </div>
    );
}

export default GetPromoter;
