import React, { useState, useContext, useEffect } from 'react';
import Image from 'next/image';
import { OrderContext } from '../../store/order-context';
import { ZONE } from '../../utils/constants';
import useChromeDetection from '../../hooks/useChromeDetection';
import Swal from 'sweetalert2';

function ZonePicker() {
    const isChrome = useChromeDetection();

    const ctx = useContext(OrderContext);
    const [selectedZone, setSelectedZone] = useState<string | null>(ctx.zone);

    const getBorderColor = (zone: string) => {
        return zone === selectedZone ? '#0382f9' : '#ccc';
    };

    const handleZoneClick = (zone: string) => {
        setSelectedZone(zone);
        ctx.retailerHandler(zone);
    };

    useEffect(() => {
        const middleOfPage = window.innerHeight / 10;
        window.scrollTo({ top: middleOfPage, behavior: 'smooth' });
        ctx.isLoadingHandler(false);
    }, []);
    useEffect(() => {
    }, [ctx.zone]);
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
            <h3>Please, choose a zone</h3>
            <div className="d-flex my-5 flex-column flex-lg-row justify-content-center col-xl-6 ">
                <div
                    className={`d-flex col-12 col-lg-7 py-3 px-3 m-1 rounded-3`}
                    style={{
                        cursor: 'pointer',
                        borderColor: getBorderColor(ZONE.US),
                        borderWidth: '3px',
                        borderStyle: 'solid',
                        borderRadius: '5px',
                        height: '100px',
                    }}
                // onClick={() => handleZoneClick(ZONE.US)}
                >
                    <div className="d-flex col-12 flex-lg-row justify-content-between" style={{ height: '40px' }}>
                        <div
                            // onClick={() => handleZoneClick(ZONE.US)}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className="d-flex align-items-center">
                                <div
                                    className="d-inline-block rounded-circle border border-primary mr-2"
                                    style={{
                                        width: '16px',
                                        height: '16px',
                                        backgroundColor: selectedZone === ZONE.US ? '#007bff' : 'transparent',
                                    }}
                                />
                                <span className="fw-bold mx-2">USA</span>
                            </div>
                        </div>
                        <Image src="/icons/usa.png" alt={ZONE.US} width={40} height={40} />
                    </div>
                </div>

                <div
                    className={`d-flex col-12 col-lg-7 py-3 px-3 m-1 rounded-3 d-flex flex-column`}
                    style={{
                        cursor: 'pointer',
                        //   borderColor: getBorderColor(ZONE.EU),
                        // borderWidth: "3px",
                        //   borderStyle: "solid",
                        borderRadius: '5px',
                        height: '100px',
                        backgroundColor: '#ebebeb',
                    }}
                //  onClick={() => handleZoneClick(ZONE.EU)}
                >
                    <div>
                        <div className="d-flex col-12 flex-lg-row justify-content-between" style={{ height: '40px' }}>
                            <div
                                //  onClick={() => handleZoneClick(ZONE.EU)}
                                style={{ cursor: 'pointer' }}
                            >
                                <div className="d-flex align-items-center">
                                    <div
                                        className="d-inline-block rounded-circle border border-primary mr-2"
                                        style={{
                                            width: '16px',
                                            height: '16px',
                                            backgroundColor: selectedZone === ZONE.EU ? '#007bff' : 'transparent',
                                        }}
                                    />
                                    <span className="fw-bold mx-2">EU</span>
                                </div>
                            </div>
                            <Image src="/icons/eu.png" alt={ZONE.EU} width={40} height={40} />
                        </div>
                    </div>
                    <span className="disclaimer">(Comming soon)</span>
                </div>
            </div>
        </div>
    );
}

export default ZonePicker;
