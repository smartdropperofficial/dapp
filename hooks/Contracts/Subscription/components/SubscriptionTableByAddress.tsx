import { SubscriptionContext } from '@/store/subscription-context';
import { getSubscriptionPeriod, isDateExpired } from '@/utils/utils';
import Link from 'next/link';
import React, { useContext, useEffect, useState } from 'react'
import Skeleton from 'react-loading-skeleton';
import useSubscriptionManagement from '../customHooks/useSubscriptionManagement';

function SubscriptionTableByAddress({ wallet, search }: { wallet: string | null; search: boolean }) {

    const [isLoadingContract, setIsLoadingContract] = useState(true);
    const { getAllSubsByAddressOnBC: getAllSubsByAddress } = useSubscriptionManagement();

    const ctx = useContext(SubscriptionContext);



    useEffect(() => {
        if (search) {
            setIsLoadingContract(true);
        }
        if (ctx && wallet && getAllSubsByAddress) {
            getAllSubsByAddress(wallet).then(data => {
                setTimeout(() => {
                    console.log("🚀 ~ getAllSubsByAddress ~ wallet:", wallet)
                    if (data.length > 0) {
                        console.log('🚀 ~ getAllSubsByAddress ~ data:', data);
                        ctx.setAllSubscriptionsHandler(data);
                    }
                    setIsLoadingContract(false);
                }, 5000);


            });
        } else {
        }

    }, [getAllSubsByAddress, wallet]);

    useEffect(() => {
        ctx.setAllSubscriptionsHandler([]);
        setIsLoadingContract(true);

    }, [wallet])




    const ShowTable = () => {
        return (<table className="table table-striped table-bordered w-100" style={{ maxWidth: '100%' }}>
            <thead>
                <tr>
                    <th scope="col">#Id</th>
                    <th scope="col">Type</th>
                    <th scope="col">Period</th>
                    <th scope="col">Price</th>
                    <th scope="col">Tx</th>
                    <th scope="col">Started</th>
                    <th scope="col">End</th>
                    <th scope="col">Exprired</th>
                </tr>
            </thead>
            <tbody>
                {isLoadingContract ? (
                    <tr>
                        <td colSpan={8}>
                            <Skeleton height={20} count={4} />
                        </td>
                    </tr>
                ) : (
                    !isLoadingContract && ctx.allSubscriptions?.length! < 1 ? (
                        <tr>
                            <td colSpan={8} className='text-center'>No subscriptions found</td>
                        </tr>
                    ) : (
                        ctx.allSubscriptions?.map((sub, index) => {
                            return (
                                <tr key={index}>
                                    <th scope="row"><Link href={`/sub/${sub.id}/details`} target='_blank'>{Number(sub.id)}</Link></th>
                                    <td>{sub.subscriptionModel.name}</td>
                                    <td>{getSubscriptionPeriod(sub.subscriptionModel.subscriptionPeriod)}</td>
                                    <td>${sub.subscriptionModel.price.toFixed(2)}</td>
                                    <td><Link href={`https://polygonscan.com/tx/${sub.paymentTx}`} target="_blank">{sub.paymentTx.substring(0, 10)}...</Link></td>
                                    <td>{sub.start}</td>
                                    <td>{sub.end}</td>
                                    <td>{isDateExpired(sub.end) ? 'yes' : 'no'}</td>
                                </tr>
                            );
                        })
                    )
                )}

            </tbody>
        </table>)
    }

    return (
        <div> <section className="mt-5 d-flex table-responsive p-3 " style={{ maxWidth: '100%', backgroundColor: 'white', overflowY: 'auto', maxHeight: '500px' }}>
            {wallet !== null && <ShowTable></ShowTable>}
            {wallet === null ? <span></span> : <></>}
        </section></div>
    )
}

export default SubscriptionTableByAddress