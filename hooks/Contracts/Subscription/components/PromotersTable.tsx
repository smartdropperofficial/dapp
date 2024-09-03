import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Table } from 'react-bootstrap';
import { BigNumber } from 'ethers';
import PromoterManagementABI from '../abi/PromoterManagementABI.json'; // Sostituisci con il percorso corretto del file ABI
import { ethers, Signer } from 'ethers';

import { PromoterModel } from '../types';
import { useContractReads } from 'wagmi';
import { useSession } from 'next-auth/react';
import { SessionExt } from '../../../../types/SessionExt';
import { convertToDecimal } from '../../../../utils/utils';
const PromotersTable = ({ promoters: promotersProp }: { promoters: PromoterModel[] }) => {
    const { data: session }: { data: SessionExt | null } = useSession() as { data: SessionExt | null };

    const scale = 100; // Define the scale for 2 decimal places

    // useContractReads({
    //     contracts: [
    //         {
    //             address: process.env.NEXT_PUBLIC_PROMOTER_MANAGER_ADDRESS as `0x${string}`,
    //             abi: PromoterManagementABI,
    //             functionName: 'getPromoters',
    //             //  args: [session?.address],
    //         },
    //     ],
    //     watch: true,
    //     onSuccess(data: any) {
    //         if (data && data[0]) {
    //             const promotersData = data[0].map((promoter: any) => ({
    //                 promoterAddress: promoter.promoterAddress,
    //                 isActive: promoter.isActive,
    //                 percentage: convertToDecimal(promoter.percentage),
    //                 profit: convertToDecimal(promoter.profit),
    //                 referralCode: promoter.referralCode,
    //             }));
    //             // setPromoters(promotersData);
    //             console.log(promotersData);
    //         }
    //     },
    // });

    return (
        <Container>
            <Table striped bordered hover responsive className=" overflow-y-scroll">
                <thead>
                    <tr>
                        <th>Indirizzo</th>
                        <th>isActive</th>
                        <th>Percentuale</th>
                        <th>Profit</th>
                        <th>ReferralCode</th>
                    </tr>
                </thead>
                <tbody>
                    {promotersProp?.length > 0 ? (
                        promotersProp?.map(promoter => (
                            <tr key={promoter.promoterAddress}>
                                <td>{promoter?.promoterAddress}</td>
                                <td>{promoter?.isActive ? 'Active' : 'Inactive'}</td>
                                <td>{promoter?.percentage}%</td>
                                <td>${promoter?.profit}</td>
                                <td>{promoter?.referralCode}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={4}>No promoters found</td>
                        </tr>
                    )}
                </tbody>
            </Table>
        </Container>
    );
};

export default PromotersTable;
