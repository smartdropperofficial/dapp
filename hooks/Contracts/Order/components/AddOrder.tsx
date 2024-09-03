import React, { useContext, useEffect, useState } from 'react';
import { Form, Button, Col } from 'react-bootstrap';
import { useSession } from 'next-auth/react';
import { SessionExt } from '../../../../types/SessionExt';
import { SubscriptionContext } from '@/store/subscription-context';
import { createOrderOnWeb3 } from '@/components/controllers/OrderController';
import useOrderManagement from '../customHooks/useOrder';
import { BigNumber } from 'ethers';
import { convertToScaled } from '@/utils/utils';
import { parseUnits } from 'ethers/lib/utils.js';
import Swal from 'sweetalert2';

const AddOrder: React.FC = () => {
  const { data: session }: { data: SessionExt | null } = useSession() as { data: SessionExt | null };
  const [subscriptionTypeId, setSubscriptionTypeId] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>('');
  const [buyer, setBuyer] = useState<string | null>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { createOrderOnBC } = useOrderManagement();
  const [orderAmount, setOrderAmount] = useState<number>(0);
  const [commission, setCommission] = useState<number>(0);
  const [shippingFee, setShippingFee] = useState<number>(0);
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await createOrderOnWeb3(Number(subscriptionTypeId!), orderId!, session?.address!);
      // const res = await createOrderOnWeb3(Number(subsContext.currentSubscription), orderId, session?.address!)) buyer!);
      if (res) {

        Swal.fire('Order Created', 'Order has been successfully created', 'success');
        // resetForm();
      } else {
        Swal.fire('Error', 'Failed to create order', 'error');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSubscriptionTypeId('');
    setOrderId('');
    setError(null);
  };
  return (
    <Form onSubmit={handleSubmit} className="d-flex flex-column">
      <h2 className="text-center mb-5">Create Order</h2>

      <Form.Group as={Col} controlId="subscriber" className="my-2">
        <Form.Label>Subscription Id</Form.Label>
        <Form.Control
          type="text"
          value={subscriptionTypeId!}
          onChange={e => setSubscriptionTypeId(e.target.value.trim())}
          required
          placeholder="Insert wallet Address"
        />
      </Form.Group>
      <Form.Group as={Col} controlId="paymentTx" className="my-2">
        <Form.Label>Order Id</Form.Label>
        <Form.Control
          type="text"
          value={orderId!}
          onChange={e => setOrderId(e.target.value)}
          required
          placeholder="Insert payment Tx"
        />
      </Form.Group>
      <Form.Group as={Col} controlId="buyer" className="my-2">
        <Form.Label>Buyer Wallet</Form.Label>
        <Form.Control
          type="text"
          value={buyer!}
          onChange={e => setBuyer(e.target.value)}
          required
          placeholder="Insert buyer address"
        />
      </Form.Group>
      <Form.Group as={Col} controlId="amount" className="my-2">
        <Form.Label>Order Amount</Form.Label>
        <Form.Control
          type="number"
          value={orderAmount!}
          onChange={e => setOrderAmount(Number(e.target.value))}
          required
          min={0}
          step="0.01"

          placeholder="Insert buyer address"
        />
      </Form.Group>
      <Form.Group as={Col} controlId="commisions" className="my-2">
        <Form.Label>Commisions</Form.Label>
        <Form.Control
          type="number"
          value={commission!}
          onChange={e => setCommission(Number(e.target.value))}
          required
          min={0}
          step="0.01"
          placeholder="Insert buyer address"
        />
      </Form.Group>
      <Form.Group as={Col} controlId="shippingfees" className="my-2">
        <Form.Label>Shipping fees</Form.Label>
        <Form.Control
          type="number"
          value={shippingFee!}
          onChange={e => setShippingFee(Number(e.target.value))}
          required
          min={0}
          step="0.01"
          placeholder="ie: 0.5 %"
        />
      </Form.Group>


      {error && <p className="text-danger">{error}</p>}
      <Button variant="primary" type="submit" className="col-12 my-5" size="sm" disabled={isSubmitting}>
        {isSubmitting ? 'Subscribing...' : 'Subscribe'}
      </Button>
      {/* <PromotersTable promoters={promoters} /> */}
    </Form>
  );
};

export default AddOrder;
