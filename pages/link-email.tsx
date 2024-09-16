// pages/link-email.tsx

import { SessionExt } from '@/types/SessionExt';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { Card } from 'react-bootstrap';

export default function LinkEmailPage() {
    const [email, setEmail] = useState('');
    const { data: session }: { data: SessionExt | null } = useSession() as { data: SessionExt | null };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // Invia una richiesta per inviare l'email di verifica
        const res = await fetch('/api/send-email-verification', {
            method: 'POST',
            body: JSON.stringify({ email, walletAddress: session?.address }),
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (res.ok) {
            alert('È stata inviata un’email di verifica al tuo indirizzo.');
        } else {
            alert('Errore durante l’invio dell’email di verifica.');
        }
    };

    // if (!session?.address) {
    //     // L'utente non è autenticato tramite wallet
    //     return <p>Effettua prima l’accesso con il tuo wallet.</p>;
    // }

    return (
        session && <div className="email"></div> && (
            <div className="container my-5 d-flex justify-content-center">
                <Card className="text-center" style={{ maxWidth: '500px' }}>
                    <Card.Body className="d-flex flex-column justify-content-center text-center align-items-center">
                        <Card.Title as="h2" className="mb-3">
                            This is a new wallet
                        </Card.Title>
                        <div>
                            <h1>Associa la tua email</h1>
                            <p>Indirizzo del wallet: {session?.address}</p>
                            <form onSubmit={handleSubmit} className="col-12 ">
                                <label>
                                    Email:
                                    <input
                                        className="form-control col-12"
                                        type="email"
                                        name="email"
                                        required
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                    />
                                </label>
                                <button type="submit" className="btn  btn-primary">
                                    Associa Email
                                </button>
                            </form>
                        </div>
                    </Card.Body>
                </Card>
            </div>
        )
    );
}
