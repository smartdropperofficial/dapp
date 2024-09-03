import { Checkbox, FormControlLabel } from '@mui/material';
import { verifyMessage } from 'ethers/lib/utils.js';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { useSignMessage } from 'wagmi';
import { OrderStatus } from '../../types/Order';
import { OrderSB, ProductSB } from '../../types/OrderSB';
import { OrderReturnMethodAmazon, OrderReturnReasonAmazon, OrderReturnAmazon, ProductAmazon, OrderAmazon, AmazonProduct } from '../../types/OrderAmazon';
import { ReturnSB, ReturnStatus } from '../../types/ReturnSB';
import { ReturnSteps } from '../../types/ReturnSteps';
import { SessionExt } from '../../types/SessionExt';
import { updateOrder } from '../controllers/OrderController';
import { createReturn, createReturnOnAmazon, updateReturn } from '../controllers/ReturnController';
import Loading from '../UI/Loading';
import ProductForRefund from './ProductForRefund';

export interface Quantity {
    asin: string;
    quantity: number;
    checked: boolean;
}

const ModalRefund: React.FC<{ order: OrderSB; close: (success?: string) => void }> = ({ order, close }) => {
    const { data: session }: { data: SessionExt | null } = useSession() as { data: SessionExt | null };

    const returnReasons = Object.values(OrderReturnReasonAmazon);

    const [reasonText, setReasonText] = useState<string>('');
    const [returnStep, setReturnStep] = useState<ReturnSteps | null>(null);
    const [quantities, setQuantities] = useState<Quantity[]>([]);

    const [selectedReason, setSelectedReason] = useState<OrderReturnReasonAmazon>(returnReasons[0]);

    const { isLoading: isSigning, signMessageAsync } = useSignMessage({
        onSuccess(data, variables) {
            const address = verifyMessage(variables.message, data);
            if (address === session?.address) {
                processReturn();
            }
        },
    });

    const submitReturn = async () => {
        if (reasonText && quantities.some(el => el.checked) && returnReasons.includes(selectedReason)) {
            await signMessageAsync({
                message:
                    'Signing this message you will commit to handle the item return following the Amazon policies.\nWhen the request will be accepted come back on this page and download the return label provided.\n\nAfter the return process has been completed you will receive the refund in your wallet.',
            });
        } else {
            Swal.fire({
                title: 'Insert Reason.',
                icon: 'error',
            });
        }
    };

    const placeReturnOnAmazon = async () => {
        const amazonOrderObject = generateAmazonOrderObject();

        if (amazonOrderObject) {
            const hasCreated = await createReturnOnAmazon(amazonOrderObject);

            if (hasCreated) {
                setReturnStep(ReturnSteps.UPDATING_LAST_DATA);

                const updateDb: OrderSB = {
                    status: OrderStatus.RETURNED_TO_AMAZON,
                };
                const returnDb: ReturnSB = {
                    status: ReturnStatus.SENT_TO_AMAZON,
                };

                const hasUpdatedOrder = await updateOrder(order.order_id!, updateDb);
                const hasUpdatedReturn = await updateReturn(order.order_id!, returnDb);

                setReturnStep(null);
                close('refetch');

                if (hasUpdatedOrder && hasUpdatedReturn) {
                    Swal.fire({
                        title: 'Refund request sent.',
                        icon: 'success',
                    });
                } else {
                    Swal.fire({
                        title: 'Request has been sent successfully but you. Please try again or contact the support.',
                        icon: 'warning',
                    });
                }
            } else {
                Swal.fire({
                    title: 'Error during the refund request. Please try again or contact the support',
                    icon: 'error',
                });
            }
        } else {
            Swal.fire({
                title: 'Error during the refund request. Please try again or contact the support',
                icon: 'error',
            });
        }
    };

    const processReturn = async () => {
        setReturnStep(ReturnSteps.CREATING_RETURN);

        const returnObject = generateOrderObject();

        if (returnObject) {
            const hasCreated = await createReturn(returnObject);

            if (hasCreated) {
                setReturnStep(ReturnSteps.PLACING_RETURN_ON_AMAZON);
                placeReturnOnAmazon();
            } else {
                Swal.fire({
                    title: 'Error during the refund request. Please try again or contact the support',
                    icon: 'error',
                });
            }
        } else {
            Swal.fire({
                title: 'Error during the refund request. Please try again or contact the support',
                icon: 'error',
            });
        }
    };

    const generateAmazonOrderObject = (): OrderReturnAmazon => {
        const newProducts: ProductAmazon[] = order.products!.map(prod => {
            return {
                product_id: prod.asin,
                quantity: quantities.find(qty => qty.asin === prod.asin)!.quantity,
            };
        });

        return {
            products: newProducts,
            reason_code: selectedReason,
            method_code: OrderReturnMethodAmazon.UPS_DROPOFF,
            explanation: reasonText,
            requestId: order.request_id!,
        };
    };

    const generateOrderObject = (): ReturnSB | null => {
        const newProducts: ProductSB[] = [];

        for (let i = 0; i < order.products!.length; i++) {
            for (let j = 0; j < quantities.length; j++) {
                if (quantities[j].checked && order.products![i].asin === quantities[j].asin) {
                    order.products![i].quantity = quantities[j].quantity;
                    newProducts.push(order.products![i]);
                }
            }
        }

        try {
            return {
                order_id: order.order_id,
                reason_code: selectedReason,
                method_code: OrderReturnMethodAmazon.UPS_DROPOFF,
                reason_text: reasonText,
                products: newProducts,
                status: ReturnStatus.CREATED,
            };
        } catch {
            return null;
        }
    };

    const selectAllProducts = (check: boolean) => {
        const newQuantities: Quantity[] = quantities.map(qty => {
            return {
                ...qty,
                checked: check,
            };
        });

        setQuantities(newQuantities);
    };

    const selectProduct = (asin: string, check: boolean) => {
        const currentQuantity = quantities.find(qty => qty.asin === asin);
        const index = quantities.indexOf(currentQuantity!);
        const newQuantities = [...quantities];
        newQuantities[index].checked = check;

        setQuantities(newQuantities);
    };

    const selectQuantity = (asin: string, quantity: number) => {
        const currentQuantity = quantities.find(qty => qty.asin === asin);
        const index = quantities.indexOf(currentQuantity!);
        const newQuantities = [...quantities];
        newQuantities[index].quantity = quantity;

        setQuantities(newQuantities);
    };

    useEffect(() => {
        const tmpQuantities: Quantity[] = order.products!.map(product => {
            return {
                asin: product.asin,
                quantity: product.quantity,
                checked: false,
            };
        });

        setQuantities(tmpQuantities);
    }, []);

    return (
        <>
            <div className="modal-body">
                {returnStep !== null ? (
                    <Loading dark={true} />
                ) : (
                    <>
                        <div className="text-end mb-2">
                            <FormControlLabel
                                label="Select all"
                                control={
                                    <Checkbox
                                        checked={quantities.every(el => el.checked)}
                                        indeterminate={quantities.some(el => el.checked) && !quantities.every(el => el.checked)}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => selectAllProducts(e.target.checked)}
                                    />
                                }
                            />
                        </div>
                        {quantities.length > 0 &&
                            order.products?.map(product => {
                                return (
                                    <ProductForRefund
                                        key={product.asin}
                                        product={product}
                                        selectProduct={selectProduct}
                                        quantity={quantities.find(qty => qty.asin === product.asin)!}
                                        selectQuantity={selectQuantity}
                                    />
                                );
                            })}
                        <form>
                            <label className="d-block mt-5">Why do you want to ask for a refund?</label>
                            <select
                                className="form-select text-dark border border-3 border-secondary  w-100 mt-3 mb-5"
                                onChange={e => e.target.value as OrderReturnReasonAmazon}
                            >
                                {returnReasons &&
                                    returnReasons.length > 0 &&
                                    returnReasons.map((reason, i) => {
                                        return (
                                            <option className="text-secondary" value={reason} key={i}>
                                                {reason}
                                            </option>
                                        );
                                    })}
                            </select>

                            <label>Additional Informations</label>
                            <textarea value={reasonText} onChange={e => setReasonText(e.target.value)} className="mt-3 w-100 form-control"></textarea>
                        </form>
                    </>
                )}
            </div>
            <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => close()}>
                    Close
                </button>
                <button
                    type="button"
                    className="btn btn-primary"
                    disabled={isSigning || returnStep !== null || !quantities.some(el => el.checked) || !returnReasons.includes(selectedReason) || !reasonText}
                    onClick={submitReturn}
                >
                    {isSigning ? 'Signing...' : 'Submit request'}
                </button>
            </div>
        </>
    );
};

export default ModalRefund;
