import GetSubscription from '@/hooks/Contracts/Subscription/components/GetSubscription';
import { useRouter } from 'next/router';
import React from 'react'
import SubcriptionDetails from '../components/SubcriptionDetails';
import { GetServerSideProps } from 'next';
import { withAuth } from '@/withAuth';

function Details() {
    const router = useRouter();
    const { subId } = router.query;
    return (
        <div> <SubcriptionDetails subId={Number(subId)}></SubcriptionDetails></div>
    )
}
// export const getServerSideProps: GetServerSideProps = withAuth(async (context) => {
//     // Logica aggiuntiva per la tua pagina
//     return {
//         props: {
//             // Props aggiuntive per il tuo componente
//         },
//     };
// });
export default Details