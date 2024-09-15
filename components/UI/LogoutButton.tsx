import { useSession, signOut } from 'next-auth/react';

function LogoutButton() {
    const { data: session } = useSession(); // Ottieni lo stato della sessione

    if (!session) {
        // Se non c'è una sessione, non mostrare il pulsante di logout
        return null;
    }

    return (
        <button className="btn btn-dark rounded-3 " onClick={() => signOut({ callbackUrl: '/login' })}>
            Logout
        </button>
    );
}

export default LogoutButton;
