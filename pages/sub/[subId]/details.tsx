import GetSubscription from '@/hooks/Contracts/Subscription/components/GetSubscription';
import { useRouter } from 'next/router';
import React from 'react'
import SubDetails from '../components/subDetails';
import { GetServerSideProps } from 'next';
import { withAuth } from '@/withAuth';

function Details() {
    const router = useRouter();
    const { subId } = router.query;
    return (
        <div> <SubDetails subId={Number(subId)}></SubDetails></div>
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