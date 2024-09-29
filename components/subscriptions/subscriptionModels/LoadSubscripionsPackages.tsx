import React, { useEffect, useState, useContext } from 'react';
import { Alert, Card } from 'react-bootstrap';
import useSubscriptionPlan from '../../../hooks/Contracts/Subscription/customHooks/useSubscriptionPlan';
import { SubscriptionType, SubscriptionPeriod, SubscriptionPlans } from '../../../hooks/Contracts/Subscription/types';
import useSubscriptionManagement from '@/hooks/Contracts/Subscription/customHooks/useSubscriptionManagement';
import { SubscriptionContext } from '@/store/subscription-context';
import Skeleton from 'react-loading-skeleton';

const LoadSubscripionsPackages: React.FC<{}> = () => {
    const ctx = useContext(SubscriptionContext);
    const { account, getSubscriptionModels } = useSubscriptionPlan();

    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (ctx.subscriptionsModels && ctx.subscriptionsModels.length > 0) {
            setIsLoading(false);
        }
    }, [ctx.subscriptionsModels]);
    const handlePackageSelect = (subType: SubscriptionPlans | null) => {
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

    const getSubscriptionPeriod = (sub: SubscriptionPlans): string => {
        if ([SubscriptionType.BUSINESS, SubscriptionType.RETAILER].includes(sub.subscriptionType)) {
            return sub.subscriptionPeriod === SubscriptionPeriod.MONTHLY ? 'Month' : 'Annual';
        }
        return '';
    };

    const isBestChoice = (sub: SubscriptionPlans): boolean => {
        return sub.subscriptionType === SubscriptionType.BUSINESS && sub.subscriptionPeriod === SubscriptionPeriod.ANNUAL;
    };
    const RenderSkeleton = () => {
        return (
            <div className="d-flex col-12 col-lg-12 flex-column justify-content-center">
                <div className="d-flex col-12 flex-column flex-lg-row  justify-content-center align-items-center">
                    <div className="col-lg-6 col-8 mt-lg-3 mx-1">
                        <div>
                            <Skeleton height={100} count={1} />
                        </div>
                    </div>
                    <div className="col-lg-6 col-8 mt-lg-3 mx-1">
                        <div>
                            <Skeleton height={100} count={1} />
                        </div>
                    </div>
                </div>
                <div className="d-flex col-12 flex-column flex-lg-row justify-content-center align-items-center">
                    <div className="col-lg-6 col-8 mt-lg-3 mx-1 ">
                        <div>
                            <Skeleton height={100} count={1} />
                        </div>
                    </div>
                    <div className="col-lg-6 col-8 mt-lg-3 mx-1 ">
                        <div>
                            <Skeleton height={100} count={1} />
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="subscription-packages mt-4 mb-5 d-flex flex-column flex-xl-rowjustify-content-center align-items-center m-auto">
            <Alert className="alert-success">* You cannot activate a plan lower than the current active one. </Alert>

            <div className="col-xl-10 col-12 d-flex" id="pay-subs">
                <div className="d-flex flex-wrap col-12 ">
                    {ctx.subscriptionsModels!.length < 1 ? (
                        <>
                            <RenderSkeleton />
                        </>
                    ) : (
                        <div className="subscription-packages mt-4 mb-5 d-flex flex-column flex-xl-rowjustify-content-center align-items-center m-auto">
                            <div className="col-xl-10  d-flex  " id="pay-subs">
                                <div className="d-flex flex-wrap col-12 d-flex justify-content-center ">
                                    {ctx.subscriptionsModels &&
                                        ctx.subscriptionsModels?.map(sub => (
                                            <div key={sub.id} className="col-8 col-xl-6 mb-1 p-2 h-lg-50  ">
                                                <button
                                                    className={`card align-items-center card-secondary px-5 h-md-100  d-flex justify-content-center justify-content-lg-start py-4  
                                                  ${sub?.id === ctx.selectedPackage?.id ? 'active' : ''}    ${
                                                        sub?.id === ctx.currentSubscription?.subscriptionModel?.id! ? 'current-sub' : ''
                                                    }    ${sub.id === ctx.selectedPackageId ? 'active' : ''}   `}
                                                    onClick={() => handlePackageSelect(sub)}
                                                    style={{
                                                        ...renderButtonDisabledStyle(sub.id <= ctx.currentSubscription?.subscriptionModel?.id!),
                                                        width: '100%',
                                                    }}
                                                    disabled={sub.id <= ctx.currentSubscription?.subscriptionModel?.id!}
                                                >
                                                    {' '}
                                                    {sub.id === ctx.currentSubscription?.subscriptionModel?.id! && (
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
                                                {sub.id === ctx.currentSubscription?.subscriptionModel?.id! && (
                                                    <h3 className="my-3 text-center">
                                                        <b>Your current plan</b>
                                                    </h3>
                                                )}
                                            </div>
                                        ))}
                                </div>
                            </div>
                            {/* <div className='overlay'>

                            </div> */}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LoadSubscripionsPackages;
