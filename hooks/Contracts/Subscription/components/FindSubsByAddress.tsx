import React, { useContext, useEffect, useState } from 'react';

import { PromoterModel, SubscriptionManagementModel } from '../types';
import { Alert, Button, Form } from 'react-bootstrap';
import usePromoterManagement from '../customHooks/usePromoterManagement';
import { useSession } from 'next-auth/react';
import { SessionExt } from '../../../../types/SessionExt';
import { convertToBigNumber, convertToScaled } from '@/utils/utils';
import Swal from 'sweetalert2';
import useSubscriptionManagement from '../customHooks/useSubscriptionManagement';
import { SubscriptionContext } from '@/store/subscription-context';
import SubscriptionTableByAddress from './SubscriptionTableByAddress';
import { Fab } from '@mui/material';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';



function FindSubsByAddress() {

    const [wallet, setWallet] = useState<string | null>(null);
    const [search, setSearch] = useState<boolean>(false)
    const [inputStyle, setInputStyle] = useState({
        borderColor: 'none',
    });
    const getSubscriptionByWalletHandleClick = async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        try {
            console.log('wallet:', wallet);
            if (wallet && wallet !== "0x0000000000000000000000000000000000000000") {
                setSearch(true);
            } else {
                alert('Please enter a valid promoter address');
            }
        } catch (error) {
            console.error('Error fetching promoter:', error);
            setSearch(false);
        }
    }

    const handleFocus = () => {
        setInputStyle({ borderColor: 'none' });
    };
    // useEffect(() => {
    //     setWallet(wallet);
    // }, [wallet])

    return (
        <div className=" d-flex flex-column ">
            <h3 className="text-center">Find Subscription by wallet</h3>
            <div>

                <div className='d-flex form-control m-auto w-100 mt-2 align-items-center px-3 justify-content-between'>
                    <input
                        type="text"
                        className="form-control m-automt-2  border-0 focus-ring-danger"
                        onChange={e => {
                            setWallet(e.target.value.trim());
                        }}
                        value={wallet ? wallet : ''}
                        placeholder="Enter wallet address"
                        onFocus={handleFocus}
                        style={{ backgroundColor: 'transparent', border: 'none', outline: 'none', boxShadow: 'none' }}


                    />
                    {wallet ? <span className="form-clear" onClick={() => { setWallet(null) }}><HighlightOffIcon /></span> : <></>}

                </div>
                <div className=" my-1 d-flex ">
                    {/* <Button variant="primary" size="sm" onClick={getSubscriptionByWalletHandleClick} className=" w-100 mt-1 px-0">
                        Search
                    </Button> */}
                </div>
            </div>
            <SubscriptionTableByAddress wallet={wallet!} search={search} />
        </div>
    );
}

export default FindSubsByAddress;
