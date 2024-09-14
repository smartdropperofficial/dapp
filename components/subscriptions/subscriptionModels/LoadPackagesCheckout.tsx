import React, { useEffect, useState, useContext } from 'react';
import { Card } from 'react-bootstrap';
import useSubscriptionPlan from '../../../hooks/Contracts/Subscription/customHooks/useSubscriptionPlan';
import { SubscriptionType, SubscriptionPeriod, SubscriptionModel } from '../../../hooks/Contracts/Subscription/types';
import useSubscriptionManagement from '@/hooks/Contracts/Subscription/customHooks/useSubscriptionManagement';
import { SubscriptionContext } from '@/store/subscription-context';
import Skeleton from 'react-loading-skeleton';

const LoadPackagesCheckout: React.FC<{
    activePackage: number;
    selectedPackage: SubscriptionModel;
    subscriptionId: number;
    setSubscriptionId: (id: number) => void;
    selectPackage: (subType: number) => void;
}> = ({ activePackage }) => {
    const ctx = useContext(SubscriptionContext);
    // const { getSubscriptionModels } = useSubscriptionModel();

    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => { }, [ctx.selectedPackageId]);

    // useEffect(() => {
    //     const fetchSubscriptions = async () => {
    //         if (!getSubscriptionModels) return;
    //         try {
    //             const result = await getSubscriptionModels();
    //             setTimeout(() => {
    //                 ctx.setSubscriptionModels(result!);
    //             }, 3000);
    //         } catch (error) {
    //             console.error(error);
    //         } finally {
    //         }
    //     };

    //     fetchSubscriptions();
    // }, [getSubscriptionModels, ctx]);


    useEffect(() => {
        if (ctx.subscriptionsModels && ctx.subscriptionsModels.length > 0) {
            setIsLoading(false);
        }
    }, [ctx]);


    const handlePackageSelect = (subType: SubscriptionModel | null) => {
        if (subType === null) {
            ctx.setSelectedPackageHandler(null);
            // ctx.setSubscriptionIdHandler(-1);
            return;
        }
        ctx.setSelectedPackageHandler(subType.id!);
        ctx.setSubscriptionIdHandler(subType.id);
    };

    const renderButtonDisabledStyle = (isActive: boolean) => {
        return isActive ? { backgroundColor: '#f7f7f7', border: 'none', color: 'grey' } : {};
    };

    const getSubscriptionPeriod = (sub: SubscriptionModel): string => {
        if ([SubscriptionType.BUSINESS, SubscriptionType.RETAILER].includes(sub.subscriptionType)) {
            return sub.subscriptionPeriod === SubscriptionPeriod.MONTHLY ? 'Month' : 'Annual';
        }
        return '';
    };

    const isBestChoice = (sub: SubscriptionModel): boolean => {
        return sub.subscriptionType === SubscriptionType.BUSINESS && sub.subscriptionPeriod === SubscriptionPeriod.ANNUAL;
    };
    const RenderSkeleton = () => {
        return (
            <div className="d-flex col-12 flex-column justify-content-center align-items-center">
                <div className="d-flex col-12 flex-column flex-lg-row">
                    <div className="col-lg-6 col-12 mt-3 p-1 ">
                        <div>
                            <Skeleton height={100} count={1} />
                        </div>
                    </div>
                    <div className="col-lg-6 col-12 mt-3 p-1">
                        <div>
                            <Skeleton height={100} count={1} />
                        </div>
                    </div>
                </div>
                <div className="d-flex col-12 flex-column flex-lg-row">
                    <div className="col-lg-6 col-12 mt-3 p-1">
                        <div>
                            <Skeleton height={100} count={1} />
                        </div>
                    </div>
                    <div className="col-lg-6 col-12 mt-3 p-1 ">
                        <div>
                            <Skeleton height={100} count={1} />
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="subscription-packages mt-4 mb-5 d-flex flex-column flex-xl-row justify-content-center align-items-center m-auto">
            {isLoading ? (
                <RenderSkeleton />
            ) : (
                <>
                    <div className="col-xl-4 col-12 mx-1 h-auto d-flex align-items-lg-center" id="free-sub" style={{ height: '300px' }}>
                        <div className="col-12 mb-3 h-xl-100 h-50" style={{ height: '100%' }}>
                            <button
                                className={`card align-items-center card-secondary px-3 w-100 h-100 ${(ctx.selectedPackageId === -1 || ctx.selectedPackage === null) && ctx.currentSubscription === null ? 'active' : ''
                                    }  justify-content-center`}
                                disabled={ctx.currentSubscription?.id! > -1}
                                onClick={() => handlePackageSelect(null)}
                                style={renderButtonDisabledStyle(ctx.currentSubscription?.subscriptionModel?.id! > -1)}
                            >
                                <h3>
                                    <b>Free</b>
                                </h3>
                                <h4 className="mt-2 mb-0">${0.0} / Month</h4>
                                <p className="mt-3 mb-0">
                                    <strong>{7}% commission</strong> / order.
                                </p>
                            </button>
                        </div>
                    </div>
                    <div className="ccol-xl-8 d-flex flex-wrap" id="pay-subs">
                        <div className="d-flex flex-wrap col-12 ">
                            <div className="subscription-packages mt-4 mb-5 d-flex flex-column flex-xl-row justify-content-center align-items-center m-auto">
                                <div className="col-xl-12 d-flex  " id="pay-subs">
                                    <div className="d-flex flex-wrap col-12  ">
                                        {ctx.subscriptionsModels &&
                                            ctx.subscriptionsModels?.map(sub => (
                                                <div key={sub.id} className="col-12 col-xl-6 mb-1 p-2 h-lg-50 ">
                                                    <button
                                                        className={`card align-items-center card-secondary px-5 h-md-100  d-flex justify-content-center justify-content-lg-start py-4  
                                                      ${sub.id === ctx.selectedPackage?.id ? 'active' : ''}    ${sub.id === ctx.currentSubscription?.subscriptionModel.id! ? 'current-sub' : ''
                                                            }    ${sub.id === ctx.selectedPackageId ? 'active' : ''}   `}
                                                        onClick={() => handlePackageSelect(sub)}
                                                        style={{
                                                            ...renderButtonDisabledStyle(sub.id <= ctx.currentSubscription?.subscriptionModel.id!),
                                                            width: '100%',
                                                        }}
                                                        disabled={sub.id <= ctx.currentSubscription?.subscriptionModel.id!}
                                                    >
                                                        {' '}
                                                        {sub.id === ctx.currentSubscription?.subscriptionModel.id! && (
                                                            <div className="flag best-choice">Active</div>
                                                        )}
                                                        <div>
                                                            <span className="responsive-heading text-wrap" style={isBestChoice(sub) ? { color: '#000' } : {}}>
                                                                <b>{sub.name}</b>
                                                            </span>
                                                            {isBestChoice(sub) ? (
                                                                <>
                                                                    <del>
                                                                        <h6 className="mt-2 mb-0">
                                                                            $ {(ctx.subscriptionsModels[sub.id - 1].price * 12).toFixed(2)} /{' '}
                                                                            {getSubscriptionPeriod(sub)}
                                                                        </h6>
                                                                    </del>
                                                                    <div className="mt-4">
                                                                        <h6 className="mt-2 mb-0">
                                                                            {(sub?.price).toFixed(2)} / {getSubscriptionPeriod(sub)}
                                                                        </h6>
                                                                        <div>{activePackage}</div>
                                                                        <h5 className="mt-2 mb-0">
                                                                            <b>${(sub?.price / 12).toFixed(2)} / Month</b>
                                                                        </h5>
                                                                    </div>
                                                                </>
                                                            ) : (
                                                                <h5 className="mt-2 mb-0">
                                                                    ${sub.price.toFixed(2)} / {getSubscriptionPeriod(sub)}
                                                                </h5>
                                                            )}

                                                            <div>
                                                                <p className="mt-3 mb-0">
                                                                    <strong>{sub.fees}% commission</strong> / order.
                                                                </p>
                                                            </div>

                                                            <div className="mt-3 mb-0">
                                                                <span>Shop limit / Month</span>
                                                                <h6 style={{ color: 'primary' }}>
                                                                    {sub.subscriptionType === SubscriptionType.BUSINESS ? (
                                                                        <strong>UNLIMITED</strong>
                                                                    ) : (
                                                                        <strong>${(sub.shopLimit / 100).toFixed(2)}</strong>
                                                                    )}
                                                                </h6>
                                                            </div>
                                                        </div>
                                                    </button>
                                                    {sub.id === ctx.currentSubscription?.subscriptionModel.id! && (
                                                        <h3 className="my-3 text-center">
                                                            <b>Your current plan</b>
                                                        </h3>
                                                    )}
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default LoadPackagesCheckout;
