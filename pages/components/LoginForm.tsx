import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import Card from '../../components/UI/Card';

function LoginForm() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);

        const res = await signIn('email', {
            email,
            redirect: false, // Prevent automatic redirect
            callbackUrl: (router.query.redirect as string) || '/', // Optional: redirect after sign-in
        });

        setIsSubmitting(false);

        if (res?.ok) {
            setMessage('Check your email for a login link.');
            setEmail('');
        } else {
            setMessage(res?.error ? `Error: ${res.error}` : 'An error occurred. Please try again.');
        }
    };

    return (
        <div className="container h-100 d-flex justify-content-center align-items-center my-3">
            <div className="row w-100 justify-content-center ">
                <div className="col-lg-8 px-0 px-lg-3 ">
                    <div className="card border-0">
                        <form onSubmit={handleSubmit}>
                            <div className="form-group ">
                                <label htmlFor="email">Email address</label>
                                <input
                                    type="email"
                                    id="email"
                                    className="form-control"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    required
                                    aria-label="Email address"
                                    placeholder="email.addres@example.com"
                                />
                            </div>
                            <button type="submit" className="btn btn-primary mt-3" disabled={isSubmitting}>
                                {isSubmitting ? 'Sending...' : 'Submit'}
                            </button>
                            {message && <p className="mt-3 text-success">{message}</p>}
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LoginForm;
