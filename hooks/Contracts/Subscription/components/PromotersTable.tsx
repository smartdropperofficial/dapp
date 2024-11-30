import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Table } from 'react-bootstrap';
import { BigNumber } from 'ethers';

import { PromoterModel } from '../types';
import { useSession } from 'next-auth/react';
import { SessionExt } from '../../../../types/SessionExt';
const PromotersTable = () => {
    const { data: session }: { data: SessionExt | null } = useSession() as { data: SessionExt | null };
    const [promoters, setPromoters] = useState<PromoterModel[]>([]);

    const scale = 100; // Define the scale for 2 decimal places
    const { getPromotersOnBC, addPromoterOnBC } = usePromoterContract();

    useEffect(() => {
        const fetchPromoters = async () => {
            try {
                const result = await getPromotersOnBC();
                console.log("🚀 ~ fetchPromoters ~ result:", result)
                // const promotersData: PromoterModel[] = result.map((item: any) => ({
                //     promoterAddress: item.promoterAddress,
                //     isActive: item.isActive,
                //     percentage: item.percentage,
                //     profit: item.profit,
                //     referralCode: item.referralCode,
                // }));
                setPromoters(result);
            } catch (error) {
                console.error('Error fetching promoters:', error);
            }
        };

        fetchPromoters();
    }, [getPromotersOnBC]);

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
function usePromoterContract(): { getPromotersOnBC: any; addPromoterOnBC: any; } {
    throw new Error('Function not implemented.');
}

