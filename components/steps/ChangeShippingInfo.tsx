import React, { useContext, useState, useEffect } from 'react';
import { OrderContext } from '../../store/order-context';
import { USA_COUNTRIES } from '../../utils/constants';
import Swal from 'sweetalert2';
import { Alert, AlertTitle } from '@mui/material';
import { OrderSB } from '@/types/OrderSB';

const ChangeShippingInfo: React.FC<{ order: OrderSB }> = ({ order }) => {
    const ctx = useContext(OrderContext);

    const [shippingType, setShippingType] = useState('address');
    const inputHandler = (e: React.FormEvent<HTMLInputElement | HTMLSelectElement>, type: string) => {
        ctx.shippingInfoHandler({
            ...ctx.shippingInfo,
            [type]: e.currentTarget.value,
        });
    };
    const DeliveryTypeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.persist();
        setShippingType(e.currentTarget.value);
    };

    return (
        <>
            <section id="shipping-type" className="flex-column col-lg-12 col-12 d-lg-flex text-start">
                <div className="my-4">
                    <div className="d-lg-flex col-12 flex-column">
                        <div className="form-check  col-lg-12">
                            <input
                                className="form-check-input"
                                type="radio"
                                name="flexRadioDefault"
                                value="address"
                                id="flexRadioDefault1"
                                onChange={DeliveryTypeHandler}
                                checked={shippingType === 'address'}
                            />
                            <label className="form-check-label" htmlFor="flexRadioDefault1">
                                <b>Deliver to address</b>
                            </label>
                        </div>
                        <div className="form-check   col-lg-12  my-lg-0 my-3">
                            <input
                                className="form-check-input"
                                type="radio"
                                name="flexRadioDefault"
                                value="locker"
                                id="flexRadioDefault2"
                                onChange={DeliveryTypeHandler}
                                checked={shippingType === 'locker'}
                                disabled={true}
                            />
                            <label className="form-check-label" htmlFor="flexRadioDefault2">
                                <span>Deliver to Amazon Locker</span>
                                <span className="disclaimer"> - (coming soon)</span>
                            </label>
                        </div>
                    </div>
                </div>
            </section>
            {shippingType === 'address' ? (
                <form className="row text-start">
                    <section id="shipping-info" className="mt-4">
                        <div className="row">
                            <div className="col-lg-6 mb-4">
                                <div className="form-group d-flex flex-column">
                                    <label>First Name* </label>
                                    {/* <span className="disclaimer">(whatever you wish)</span> */}
                                    <input
                                        type="text"
                                        onChange={e => inputHandler(e, 'first_name')}
                                        value={order?.shipping_info?.first_name}
                                        className="form-control mt-2"
                                    />
                                    {ctx.showErrors && !order?.shipping_info?.first_name && <small className="d-block text-danger mt-2">Field Required.</small>}
                                </div>
                            </div>
                            <div className="col-lg-6 mb-4 ">
                                <div className="form-group d-flex flex-column">
                                    <label>Last Name* </label>
                                    {/* <span className="disclaimer">(whatever you wish)</span> */}

                                    <input
                                        type="text"
                                        onChange={e => inputHandler(e, 'last_name')}
                                        value={order?.shipping_info?.last_name}
                                        className="form-control mt-2"
                                    />
                                    {ctx.showErrors && !order?.shipping_info?.last_name && <small className="d-block text-danger mt-2">Field Required.</small>}
                                </div>
                            </div>
                            <div className="col-12 mb-4">
                                <div className="form-group">
                                    <div className=" d-flex ">
                                        <label>
                                            {' '}
                                            <b>(Receiver)</b> Email address*
                                        </label>{' '}
                                        &nbsp;
                                        <span className="disclaimer d-flex align-items-center">(The person receiving the package)</span>
                                    </div>
                                    <input
                                        type="email"
                                        onChange={e => inputHandler(e, 'email')}
                                        value={order?.shipping_info?.email}
                                        className="form-control mt-2"
                                    />
                                    {ctx.showErrors && !order?.shipping_info?.email && <small className="d-block text-danger mt-2">Field Required.</small>}
                                </div>
                            </div>
                            <div className="col-12 mb-4">
                                <div className="form-group d-flex flex-column">
                                    <label>Address Line 1*</label>
                                    {/* <span className="disclaimer">(whatever you wish)</span> */}

                                    <input
                                        type="text"
                                        onChange={e => inputHandler(e, 'address_line1')}
                                        value={order?.shipping_info?.address_line1}
                                        className="form-control mt-2"
                                    />
                                    {ctx.showErrors && !order?.shipping_info?.address_line1 && <small className="d-block text-danger mt-2">Field Required.</small>}
                                </div>
                            </div>
                            <div className="col-12 mb-4">
                                <div className="form-group d-flex flex-column">
                                    <label>Address Line 2</label>
                                    {/* <span className="disclaimer">(whatever you wish)</span> */}

                                    <input type="text" onChange={(e) => inputHandler(e, "address_line2")} value={order?.shipping_info?.address_line2} className="form-control mt-2" />
                                </div>
                            </div>
                            <div className="col-xl-2 mb-4">
                                <div className="form-group">
                                    <label>Zip Code*</label>
                                    <input type="text" onChange={(e) => inputHandler(e, "zip_code")} value={order?.shipping_info?.zip_code} className="form-control mt-2" />
                                    {ctx.showErrors && !order?.shipping_info?.zip_code && <small className="d-block text-danger mt-2">Field Required.</small>}
                                </div>
                            </div>
                            <div className="col-xl-6 mb-4">
                                <div className="form-group">
                                    <label>City*</label>
                                    <input type="text" onChange={(e) => inputHandler(e, "city")} value={order?.shipping_info?.city} className="form-control mt-2" />
                                    {ctx.showErrors && !order?.shipping_info?.city && <small className="d-block text-danger mt-2">Field Required.</small>}
                                </div>
                            </div>
                            <div className="col-xl-4 mb-4">
                                <div className="form-group">
                                    <label>State*</label>
                                    <select onChange={(e) => inputHandler(e, "state")} value={order?.shipping_info?.state} className="py-0 form-control mt-2">
                                        <option value="">--- Select State ---</option>
                                        {USA_COUNTRIES.map((el, i) => (
                                            <option key={i} value={el?.abbreviation}>
                                                {el?.name}
                                            </option>
                                        ))}
                                    </select>
                                    {ctx.showErrors && !order?.shipping_info?.state && <small className="d-block text-danger mt-2">Field Required.</small>}
                                </div>
                            </div>
                            <div className="col-lg-12 mb-4">
                                <div className="form-group">
                                    <div className="d-flex align-items-center">
                                        <label> <b>(Receiver)</b> Phone Number*</label> &nbsp; &nbsp;
                                        <span className="disclaimer m-0">( mandatory in order to be contacted by the courier if necessary.)</span>
                                    </div>

                                    <input
                                        onKeyDown={event => {
                                            if (!/[0-9]/.test(event.key) && !(event.key === 'Backspace') && !(event.key === '+')) {
                                                event.preventDefault();
                                            }
                                        }}
                                        pattern="^[0-9]*[.,]?[0-9]*$"
                                        type="text"
                                        onChange={e => inputHandler(e, 'phone_number')}
                                        value={order?.shipping_info?.phone_number}
                                        className="form-control mt-2"
                                    />
                                    {ctx.showErrors && !order?.shipping_info?.phone_number && <small className="d-block text-danger mt-2">Field Required.</small>}
                                </div>
                            </div>
                        </div>
                    </section>
                </form>
            ) : (
                <form className="row">
                    <section id="shipping-info" className="mt-4">
                        <div className="col-lg-12 mb-4">
                            <Alert severity="warning" className="col-12 d-flex justify-content-center rounded-3 mt-2">
                                <AlertTitle className="">
                                    <span>
                                        Items shipped or returned to an Amazon Locker Location <b>need to meet certain guidelines</b>
                                    </span>
                                    <br />
                                    <span>
                                        Please, check Amazon Pickup Location Eligibility on this link{' '}
                                        <a
                                            href="https://www.amazon.com/gp/help/customer/display.html?ref_=hp_left_v4_sib&nodeId=G201910770"
                                            target="_blank"
                                            className="text-decoration-line"
                                        >
                                            <u>Amazon Pickup Location Eligibility</u>
                                        </a>
                                    </span>
                                    {/* <br /> Otherwise you will get the error:  <strong className="text-center"> No payment option found!</strong> */}
                                    <br />
                                    <br />*
                                    <span className="disclaimer">
                                        You can also check the items eligibility directly in the{' '}
                                        <i>
                                            {' '}
                                            <b> checkout </b> page
                                        </i>{' '}
                                        at www.amazon.com:{' '}
                                    </span>
                                    <br />
                                    <span className="disclaimer">
                                        Add an item to cart. If the item is eligible to Locker, you will se the voice <b>Your pickup locations</b>.{' '}
                                        {/* <a href="#">
                                                       <u onClick={fireImage} className="pe-auto">
                                                            Click here to see image{" "}
                                                       </u>
                                                  </a>{" "} */}
                                    </span>
                                </AlertTitle>{' '}
                            </Alert>
                        </div>
                        {/* <div className="col-lg-12 mb-4">
							<div className="form-group">
								<label>Amazon Locker Name*</label>
								<input type="text" onChange={(e) => inputHandler(e, "lockerName")} value={ctx.shippingInfo.lockerName} className="form-control mt-2" />
								{ctx.showErrors && !ctx.shippingInfo.lockerName && <small className="d-block text-danger mt-2">Field Required.</small>}
							</div>
						</div> */}

                        <div className="col-12 mb-4">
                            <div className="form-group">
                                <div className=" d-flex ">
                                    <label>Your Email*</label> &nbsp;
                                    <span className="disclaimer">(Mandatory to communicate the delivery process)</span>
                                </div>
                                <input type="email" onChange={e => inputHandler(e, 'email')} value={order?.shipping_info?.email} className="form-control mt-2" />
                                {ctx.showErrors && !order?.shipping_info?.email && <small className="d-block text-danger mt-2">Field Required.</small>}
                            </div>
                        </div>
                        <div className="col-12 mb-4">
                            <div className="form-group">
                                <label>Address Line 1*</label>
                                <input
                                    type="text"
                                    onChange={e => inputHandler(e, 'address_line1')}
                                    value={order?.shipping_info?.address_line1}
                                    className="form-control mt-2"
                                />
                                {ctx.showErrors && !order?.shipping_info?.address_line1 && <small className="d-block text-danger mt-2">Field Required.</small>}
                            </div>
                        </div>
                        <div className="col-12 mb-4">
                            <div className="form-group">
                                <label>Address Line 2</label>
                                <input
                                    type="text"
                                    onChange={e => inputHandler(e, 'address_line2')}
                                    value={order?.shipping_info?.address_line2}
                                    className="form-control mt-2"
                                />
                            </div>
                        </div>
                        <div className="col-lg-2 mb-4">
                            <div className="form-group">
                                <label>Zip Code*</label>
                                <input
                                    type="text"
                                    onChange={e => inputHandler(e, 'zip_code')}
                                    value={order?.shipping_info?.zip_code}
                                    className="form-control mt-2"
                                />
                                {ctx.showErrors && !order?.shipping_info?.zip_code && <small className="d-block text-danger mt-2">Field Required.</small>}
                            </div>
                        </div>
                        <div className="col-lg-6 mb-4">
                            <div className="form-group">
                                <label>City*</label>
                                <input type="text" onChange={e => inputHandler(e, 'city')} value={order?.shipping_info?.city} className="form-control mt-2" />
                                {ctx.showErrors && !order?.shipping_info?.city && <small className="d-block text-danger mt-2">Field Required.</small>}
                            </div>
                        </div>
                        <div className="col-lg-4 mb-4">
                            <div className="form-group">
                                <label>State*</label>
                                <select onChange={e => inputHandler(e, 'state')} value={order?.shipping_info?.state} className="py-0 form-control mt-2">
                                    <option value="">--- Select State ---</option>
                                    {USA_COUNTRIES.map((el, i) => (
                                        <option key={i} value={el.abbreviation}>
                                            {el.name}
                                        </option>
                                    ))}
                                </select>
                                {ctx.showErrors && !order?.shipping_info?.state && <small className="d-block text-danger mt-2">Field Required.</small>}
                            </div>
                        </div>
                        <div className="col-lg-12 mb-4">
                            <div className="form-group">
                                <label>Your Phone Number*</label>

                                <input
                                    onKeyDown={event => {
                                        if (!/[0-9]/.test(event.key) && !(event.key === 'Backspace') && !(event.key === '+')) {
                                            event.preventDefault();
                                        }
                                    }}
                                    pattern="^[0-9]*[.,]?[0-9]*$"
                                    type="text"
                                    onChange={e => inputHandler(e, 'phone_number')}
                                    value={order?.shipping_info?.phone_number}
                                    className="form-control mt-2"
                                />
                                {ctx.showErrors && !order?.shipping_info?.phone_number && <small className="d-block text-danger mt-2">Field Required.</small>}
                            </div>
                        </div>
                    </section>
                </form>
            )}
        </>
    );
};

export default ChangeShippingInfo;
