import React, { useState, useEffect } from 'react';
import { Form, Button } from 'react-bootstrap';
import Swal from 'sweetalert2';
import PromotersTable from './PromotersTable';
import usePromoterContract from '../customHooks/usePromoterManagement';
import { PromoterModel } from '../types';
import { convertToDecimal } from '@/utils/utils';

const AddPromoterForm: React.FC = () => {
    const { getPromotersOnBC, addPromoterOnBC } = usePromoterContract();
    // const { addPromoter } = usePromoter();
    const [promoterAddress, setPromoterAddress] = useState('');
    const [email, setEmail] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [loading, setLoading] = useState(false);



    const validateEmail = (email: string): boolean => {
        const re = /\S+@\S+\.\S+/;
        return re.test(email);
    };

    const handleAddPromoter = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!validateEmail(email)) {
            Swal.fire({ title: 'Invalid Email!', icon: 'error' });
            return;
        }

        setLoading(true);
        try {
            console.log('handleAddPromoter - addPromoter - start');
            await addPromoterOnBC(promoterAddress, email);
            resetForm();
            console.log('handleAddPromoter - addPromoter - end');
        } catch (error: any) {
            console.log('🚀 ~ handleAddPromoter ~ error:', error);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setPromoterAddress('');
        setEmail('');
        setIsActive(true);
    };

    return (
        <div className='container'>
            <h2>Create Promoter</h2>
            <Form onSubmit={handleAddPromoter}>
                <Form.Group controlId="formPromoterAddress">
                    <Form.Label>Indirizzo Promoter</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Inserisci l'indirizzo del promoter"
                        value={promoterAddress}
                        onChange={e => setPromoterAddress(e.target.value)}
                        required
                    />
                </Form.Group>
                <Form.Group controlId="formEmail">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                        type="email"
                        placeholder="Inserisci l'email del promoter"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                    />
                </Form.Group>
                <Form.Group controlId="formIsActive">
                    <Form.Check
                        type="checkbox"
                        label="Attivo"
                        checked={isActive}
                        onChange={e => setIsActive(e.target.checked)}
                    />
                </Form.Group>
                <div className="my-4 mx-auto text-center col-12">
                    <Button variant="primary" type="submit" size="sm" disabled={loading} className="w-100">
                        {loading ? 'Loading...' : 'Add Promoter'}
                    </Button>
                </div>
            </Form>
            <div className="h-50 overflow-y-auto">
                <PromotersTable />
            </div>
        </div>
    );
};

export default AddPromoterForm;
