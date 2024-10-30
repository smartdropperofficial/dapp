import Link from 'next/link';
import { useCallback, useContext, useEffect, useState } from 'react';
import { OrderContext } from '../../store/order-context';
import ItemCard from '../UI/ItemCard';
import Alert from 'react-bootstrap/Alert';

import { SessionExt } from '@/types/SessionExt';
import { useSession } from 'next-auth/react';
import { getBasketOnDB } from '@/utils/utils';
import { useAccount } from 'wagmi';
import Swal from 'sweetalert2';
import { ConfigContext } from '@/store/config-context';
import useOrderManagement from '@/hooks/Contracts/Order/customHooks/useOrder';
import Skeleton from 'react-loading-skeleton';
import { useOrder } from '../controllers/useOrder';
import Image from 'react-bootstrap/Image';

const AmazonConditions: React.FC = () => {
    const order_context = useContext(OrderContext);
    useEffect(() => {
        if (order_context) console.log('Component re-rendered with termsConditions:', order_context.termsConditions);
    }, [order_context.termsConditions]);
    return (
        order_context && (
            <div>
                <section id="pay" className="mt-4">
                    <h4 className="mb-4">
                        <strong>Amazon Order Terms and Conditions</strong>
                    </h4>
                    <h5 className="mb-4">Since orders are handled directly on Amazon, we operate under the same conditions as Amazon itself.</h5>
                </section>
                <section id="terms-order">
                    <div className="mt-5">
                        <Alert variant="warning">
                            <Alert.Heading> *Shipping Fees</Alert.Heading>
                            <p>
                                {' '}
                                Since we operate through blockchain oracle networks, <b>we can't use any Amazon Prime Account</b> . Anyway, on Amazon US,
                                shipping is often free for orders over $25, but there are some conditions.{' '}
                                <ul>
                                    <li>
                                        This offer applies{' '}
                                        <u>
                                            only to products sold by Amazon (<b>where applicable</b>)
                                        </u>{' '}
                                        and not by third-party sellers
                                    </li>
                                    <li>
                                        <b>Amazon Basics items</b> do not automatically mean that they are not sold directly by Amazon.
                                    </li>
                                    <li>
                                        The free shipping option is usually available with standard shipping, which may take longer compared to Prime shipping.
                                        Some items, such as bulky or very heavy ones, may be excluded from the offer
                                    </li>
                                </ul>{' '}
                            </p>
                            <p className="disclaimer text-start" style={{ backgroundColor: '' }}>
                                (To learn more about Amazon US State Shipping and Delivery, please check &nbsp;
                                <a
                                    className=""
                                    href="https://www.amazon.com/gp/help/customer/display.html/ref=chk_help_shipcosts_pri?nodeId=GGE5X8EV7VNVTK6R&ie=UTF8&ref_=chk_help_shipcosts_pri"
                                    target="_black"
                                >
                                    Amazon page
                                </a>
                                )
                            </p>
                        </Alert>
                        <Alert variant="warning">
                            <Alert.Heading> ** US Local Taxes</Alert.Heading>
                            <p>
                                "Note that in the United States, purchases on Amazon are always subject to State and local taxes in most States. The amount of
                                tax varies depending on the state, city, and sometimes the county where the buyer is located. Additionally, it should be noted{' '}
                                <u>that only the shipping costs are typically waived for orders over $25</u>, while the taxes still apply."
                            </p>
                            <p className="disclaimer text-start" style={{ backgroundColor: '' }}>
                                (To learn more about US State Sales Tax, please check &nbsp;
                                <a className="" href="https://www.amazon.com/gp/help/customer/display.html?nodeId=202036190" target="_black">
                                    Amazon page
                                </a>
                                )
                            </p>
                        </Alert>
                    </div>

                    <div id="pre-order-payment-button" className="mt-5 d-flex flex-column align-items-center col-12">
                        <h4>
                            {' '}
                            <br />
                        </h4>
                        <div className="my-4">
                            <div className="d-lg-flex col-12 flex-column">
                                <div className="form-check  col-lg-12">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        name="termsCheckbox"
                                        id="termsCheckbox"
                                        onChange={order_context.setTermsAndConditions}
                                        checked={order_context.termsConditions}
                                    />
                                    <label className="form-check-label" htmlFor="termsCheckbox">
                                        I Accept all the Terms
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className="col-6"></div>
                    </div>
                </section>
            </div>
        )
    );
};

export default AmazonConditions;
