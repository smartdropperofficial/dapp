import React, { useState, useContext, useEffect } from 'react';
import Image from 'next/image';
import { OrderContext } from '../../store/order-context';
import { RETAILERS } from '../../utils/constants';
import useChromeDetection from '../../hooks/useChromeDetection';
import Swal from 'sweetalert2';

function ShopPicker() {
    const isChrome = useChromeDetection();

    const ctx = useContext(OrderContext);
    const [selectedRetailer, setSelectedRetailer] = useState<string | null>(ctx.retailer);

    const getBorderColor = (retailer: string) => {
        return retailer === selectedRetailer ? '#0382f9' : '#ccc';
    };

    const handleRetailerClick = (retailer: string) => {
        setSelectedRetailer(retailer);
        ctx.retailerHandler(retailer);
    };

    useEffect(() => {
        const middleOfPage = window.innerHeight / 2;
        window.scrollTo({ top: middleOfPage, behavior: 'smooth' });
    }, []);
    useEffect(() => {
    }, [ctx.retailer]);
    useEffect(() => {
        if (!isChrome && localStorage.getItem('isChrome') === 'false') {
            Swal.fire({
                title: 'You are not using Chrome! Some features could d not work properly.',
                icon: 'info',
            });
            localStorage.setItem('isChrome', 'true');
        }
    }, [isChrome]);
    return (
        <div className="d-flex flex-column justify-content-center align-items-center align-items-center">
            <h3>Please, choose a retailer</h3>
            <div className="d-flex my-5 flex-column flex-lg-row justify-content-center ">
                <div
                    className={`d-flex col-12 col-lg-7 py-3 px-3 m-1 rounded-3`}
                    style={{
                        cursor: 'pointer',
                        borderColor: getBorderColor(RETAILERS.AMAZON),
                        borderWidth: '3px',
                        borderStyle: 'solid',
                        borderRadius: '5px',
                    }}
                    onClick={() => handleRetailerClick(RETAILERS.AMAZON)}
                >
                    <div className="d-flex col-12 flex-lg-row justify-content-between">
                        <div onClick={() => handleRetailerClick(RETAILERS.AMAZON)} style={{ cursor: 'pointer' }}>
                            <div className="d-flex align-items-center">
                                <div
                                    className="d-inline-block rounded-circle border border-primary mr-2"
                                    style={{
                                        width: '16px',
                                        height: '16px',
                                        backgroundColor: selectedRetailer === RETAILERS.AMAZON ? '#007bff' : 'transparent',
                                    }}
                                />
                                <span className="fw-bold mx-2">AMAZON US </span>
                            </div>
                        </div>
                        <Image src="/icons/amazon.png" alt={RETAILERS.AMAZON} width={64} height={64} />
                    </div>
                </div>
                <div
                    className={`d-flex col-12 col-lg-7 py-3 px-3 m-1 rounded-2`}
                    style={{
                        cursor: 'pointer',
                        // borderColor: "#ccc",
                        // borderWidth: "3px",
                        // borderStyle: "solid,
                        borderRadius: '5px',
                        backgroundColor: '#ebebeb',
                    }}
                // onClick={() => handleRetailerClick(RETAILERS.EBAY)}
                >
                    <div className="d-flex col-12 justify-content-between ">
                        <div className="d-flex justify-content-between flex-column ">
                            <div
                                // onClick={() => handleRetailerClick(RETAILERS.EBAY)}
                                style={{ cursor: 'pointer' }}
                            >
                                <div className="d-flex align-items-center justify-content-start">
                                    <div
                                        className="d-inline-block rounded-circle border border-primary mr-2"
                                        style={{
                                            width: '16px',
                                            height: '16px',
                                            backgroundColor: selectedRetailer === RETAILERS.EBAY ? '#ccc' : 'transparent',
                                        }}
                                    />

                                    <div className="d-flex flex-column">
                                        <span className="fw-bold mx-2">EBAY</span>
                                    </div>
                                </div>
                            </div>
                            <span className=" mx-2 disclaimer">(Coming soon)</span>
                        </div>
                        <Image src="/icons/ebay.png" alt={RETAILERS.EBAY} width={64} height={64} />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ShopPicker;
