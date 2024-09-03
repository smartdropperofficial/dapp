// import React, { useEffect, useState } from 'react';
// import { FiSave, FiCheck } from 'react-icons/fi';
// import Card from '../components/UI/Card';
// import { supabase } from '../utils/supabaseClient';
// import { useSession } from 'next-auth/react';
// import { SessionExt } from '../types/SessionExt';
// import { Alert, AlertTitle } from '@mui/material';

import router from "next/router";
import { useEffect } from "react";
import { useAccount } from "wagmi";

const Settings = () => {  
    const { address } = useAccount();

    useEffect(() => {
        if (!address) {
            router.push('/login');
        }  else {
            router.push('/verify-email');  
        }
    }, [address]);
   
};

export default Settings;
