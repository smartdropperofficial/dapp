import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Table } from 'react-bootstrap';
import { BigNumber } from 'ethers';
import subscriptionManagementABI from '@/hooks/Contracts/Subscription/abi/subscriptionManagementABI.json'; // Sostituisci con il percorso corretto del file ABI

import { PromoterModel } from '../types';
import { useContractReads } from 'wagmi';
import { useSession } from 'next-auth/react';
import { SessionExt } from '../../../../types/SessionExt';
const GetPromoters = () => {
    const [promoters, setPromoters] = useState<PromoterModel[]>([]);
    const { data: session }: { data: SessionExt | null } = useSession() as { data: SessionExt | null };

    useContractReads({
        contracts: [
            {
                address: process.env.NEXT_PUBLIC_SUBSCRIPTION_MANAGER_ADDRESS as `0x${string}`,
                abi: subscriptionManagementABI,
                functionName: 'getPromoters',
                //  args: [session?.address],
            },
        ],
        watch: true,
        onSuccess(data: [PromoterModel[]]) {
            setPromoters(data[0]);
            console.log(data);
        },
    });

    return (
        <Container>
            <Table striped bordered hover responsive>
                <thead>
                    <tr>
                        <th>Indirizzo</th>
                        <th>isActive</th>
                        <th>Percentuale</th>
                        <th>Profit</th>
                    </tr>
                </thead>
                <tbody>
                    {promoters.length > 0 ? (
                        promoters.map(promoter => (
                            <tr key={promoter.promoterAddress}>
                                <td>{promoter.promoterAddress}</td>
                                <td>{promoter.isActive ? 'Active' : 'Inactive'}</td>
                                <td>{Number(promoter.percentage) / 100}</td>
                                <td>{Number(promoter.profit)}</td>
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

export default GetPromoters;
