import React, { useContext, useEffect, useState } from 'react';
import { Form, Button, Col } from 'react-bootstrap';
import { useSession } from 'next-auth/react';
import useSubscriptionManagement from '../customHooks/useSubscriptionManagement';
import useSubscriptionPlan from '../customHooks/useSubscriptionPlan';
import { PromoterModel, SubscriptionModel } from '../types';
import { SessionExt } from '../../../../types/SessionExt';
import usePromoterManagement from '../customHooks/usePromoterManagement';
import { SubscriptionContext } from '@/store/subscription-context';
import { createSubscription } from '@/components/controllers/SubscriptionController';
import PromotersTable from './PromotersTable';
import { BigNumber } from 'ethers';
import { checkErrorMessage } from '@/utils/utils';
import Swal from 'sweetalert2';
import DatePicker from "react-datepicker";
const AddSubscription: React.FC = () => {
    const { data: session }: { data: SessionExt | null } = useSession() as { data: SessionExt | null };
    const ctx = useContext(SubscriptionContext);
    const [subscriptionTypeId, setSubscriptionTypeId] = useState('');
    const [subscriber, setSubscriber] = useState('');
    const [paymentTx, setPaymentTx] = useState('');
    const [startDate, setStartDate] = useState<Date>(new Date());
    const [formatedDate, setFormatedDate] = useState<number>(0);
    const [promoterAddress, setPromoterAddress] = useState<string>('');
    const [promoters, setPromoters] = useState<PromoterModel[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    // const { subscribe } = useSubscriptionManagement();
    const { getSubscriptionModels } = useSubscriptionPlan();
    const { getPromotersOnBC } = usePromoterManagement();

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsSubmitting(true);
        setError(null);
        let endDate;
        const subPeriod = Number(ctx?.subscriptionsModels?.find(sub => sub.id === parseInt(subscriptionTypeId))?.subscriptionPeriod);
        console.log("🚀 ~ handleSubmit ~ subPeriod:", subPeriod)

        if (subPeriod === 0) {
            endDate = formatedDate + 30 * 24 * 60 * 60; // 365 giorni * 24 ore * 60 minuti * 60 secondi
        }
        else if (subPeriod === 1) {
            endDate = formatedDate + 365 * 24 * 60 * 60; // 365 giorni * 24 ore * 60 minuti * 60 secondi
        }
        console.log("🚀 ~ handleSubmit ~ endDate:", endDate)

        try {
            const res = await createSubscription(parseInt(subscriptionTypeId), subscriber, paymentTx, promoterAddress || undefined, formatedDate, endDate);
            if (res.tx) {
                resetForm();
            } else if (res.error) {
                const errorMessage = checkErrorMessage(res.error.reason);
                console.log("🚀 ~ handleSubmit ~ errorMessage:", errorMessage)
                setError(errorMessage! ?? res.error.reason);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };
    const handleChangeDate = (date: any) => {
        setStartDate(date);
        console.log(date);
    };
    useEffect(() => {
        if (startDate) {
            const formatDateTime: number = (Math.floor(new Date(startDate).getTime() / 1000)) ?? 0;
            console.log("🚀 ~ useEffect ~ formatDateTime:", formatDateTime)
            setFormatedDate(formatDateTime);

        }
    }, [startDate])



    const resetForm = () => {
        setSubscriptionTypeId('');
        setSubscriber('');
        setPaymentTx('');
        setPromoterAddress('');
        setError(null);
    };
    useEffect(() => { }, [ctx]);

    useEffect(() => {
        const fetchSubscriptions = async () => {
            if (!getSubscriptionModels) return;
            try {
                const result = await getSubscriptionModels();
                ctx.setSubscriptionModels(result);
                // setSubscriptions(result);
            } catch (error) {
                console.error(error);
            }
        };

        fetchSubscriptions();
    }, [getSubscriptionModels]);

    const safeRenderValue = (value: any) => {
        if (BigNumber.isBigNumber(value)) {
            return value.toString();
        }
        return value;
    };
    useEffect(() => {
        if (promoterAddress && subscriber) {
            if (promoterAddress === subscriber) {
                Swal.fire({ title: 'Promoter and subscriber cannot be the same', icon: 'error' });
                setPromoterAddress('');
            }
        }
    }, [promoterAddress, subscriber])


    useEffect(() => {
        if (session) {
            const fetchPromoters = async () => {
                try {
                    const result = await getPromotersOnBC();
                    const promotersData: any[] = result.map((item: any) => ({
                        promoterAddress: item.promoterAddress,
                        isActive: item.isActive,
                        percentage: item.percentage,
                        profit: item.profit,
                        referralCode: item.referralCode,
                    }));
                    setPromoters(promotersData);
                } catch (error) {
                    console.error('Error fetching promoters:', error);
                }
            };

            fetchPromoters();
        }
    }, [getPromotersOnBC, session]);

    return (
        <Form onSubmit={handleSubmit} className="d-flex flex-column">
            <h2 className="text-center mb-5">Create Subscription</h2>
            <Form.Group as={Col} controlId="subscriptionTypeId" className="my-2">
                <Form.Label>Subscription Type ID</Form.Label>
                <Form.Select
                    value={subscriptionTypeId}
                    onChange={e => setSubscriptionTypeId(e.target.value)}
                    required
                    className="form-select form-select-lg mb-3 border-3"
                    aria-label=".form-select-lg example"
                    style={{ backgroundColor: '#ececec' }}
                >
                    <option value="">Select Subscription</option>
                    {ctx?.subscriptionsModels?.map(subscription => (
                        <option key={subscription.id} value={subscription.id}>
                            {safeRenderValue(subscription.name)}
                        </option>
                    ))}
                </Form.Select>
            </Form.Group>
            <Form.Group as={Col} controlId="subscriber" className="my-2">
                <Form.Label>Subscriber Address</Form.Label>
                <Form.Control
                    type="text"
                    value={subscriber}
                    onChange={e => setSubscriber(e.target.value.trim())}
                    required
                    placeholder="Insert wallet Address"
                />
            </Form.Group>
            <Form.Group as={Col} controlId="paymentTx" className="my-2">
                <Form.Label>Payment Tx</Form.Label>
                <Form.Control
                    type="text"
                    value={paymentTx}
                    onChange={e => setPaymentTx(e.target.value)}
                    required
                    placeholder="Insert payment Tx"
                />
            </Form.Group>
            {Number(subscriptionTypeId) === 3 ? <Form.Group as={Col} controlId="promoterAddress" className="my-2">
                <Form.Label>Promoter Address (optional)</Form.Label>
                <Form.Control
                    type="text"
                    value={promoterAddress}
                    onChange={e => setPromoterAddress(e.target.value.trim())}
                    placeholder="Insert wallet Address"
                />
            </Form.Group> : <></>}
            <Form.Group as={Col} controlId="start-date" className="my-2 d-flex flex-column">
                <Form.Label>Start Date (optional)</Form.Label>
                <DatePicker selected={startDate} onChange={handleChangeDate} className='form-control' />
            </Form.Group>
            {error && <p className="text-danger">{error}</p>}
            <Button variant="primary" type="submit" className="col-12 my-5" size="sm" disabled={isSubmitting}>
                {isSubmitting ? 'Subscribing...' : 'Subscribe'}
            </Button>
            <PromotersTable promoters={promoters} />
        </Form>
    );
};

export default AddSubscription;
