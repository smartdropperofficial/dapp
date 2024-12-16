import { useContext, useEffect, useState } from 'react';
import useSubscriptionManagement from '../customHooks/useSubscriptionManagement';
import { Button, Col, Form, Modal, Table } from 'react-bootstrap';
import WithdrawlProfit from './WithdrawlProfit';
import { SessionExt } from '../../../../types/SessionExt';
import { useSession } from 'next-auth/react';
import { ConfigContext } from '@/store/config-context';
import { useBalance, useContractReads } from 'wagmi';
import ModalOverlay from '@/components/UI/ModalOverlay';
import Spinner from 'react-bootstrap/Spinner';
function GetFunds() {
    const configContext = useContext(ConfigContext);

    const { data: session }: { data: SessionExt | null } = useSession() as { data: SessionExt | null };
    const [currentCoinAddress, setCurrentCoinAddress] = useState<string | null>();
    const [coinAddress, setCoinAddress] = useState<string | null>('');
    const [funds, setFunds] = useState(''); // Fix this
    const [isloading, setIsLoading] = useState(false);

    const { changeCoinContractAddressOnBC } = useSubscriptionManagement();
    interface CryptoAddress {
        symbol: string;
        address: string;
    }
    const cryptoAddresses: { [key: string]: CryptoAddress } = {
        USDT: {
            symbol: 'USDT',
            address: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f',
        },
        USDC: {
            symbol: 'USDC',
            address: '0xa8ce8aee21bc2a48a5ef670afcc9274c7bbbc035',
        },
        EURC: {
            symbol: 'DAI',
            address: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
        },
    };
    const changeCoinHandler = async () => {
        try {
            setIsLoading(true);
            await changeCoinContractAddressOnBC(coinAddress!);
            setIsLoading(false);
        } catch (error) {
            console.log('🚀 ~ changeCoinHandler ~ error:', error);
        } finally {
            setIsLoading(false);
        }
    };
    useEffect(() => {
        if (configContext) {
            setCurrentCoinAddress(configContext.configuration?.coin_contract!);
        }
    }, [configContext]);

    const { data: balanceData } = useBalance({
        address: configContext.configuration?.subscription_management_contract as `0x${string}`,
        token: configContext.configuration?.coin_contract as `0x${string}`,
    });
    // useContractReads({
    //     contracts: [
    //         {
    //             address: process.env.NEXT_PUBLIC_ORDER_MANAGER_ADDRESS as `0x${string}`,
    //             abi: subscriptionManagementABI,
    //             functionName: 'coin',
    //             // args: [orderId],
    //         },
    //     ],
    //     onSuccess(data: any) {
    //         if (data[0]) {
    //             Swal.fire({
    //                 text: data[0],
    //                 icon: 'success',
    //             });
    //         }
    //     },
    //     onError(error) { },
    // });

    useEffect(() => {
        if (balanceData) {
            setFunds(balanceData.formatted || '0');
        }
    }, [balanceData]);

    return (
        <div className="d-flex justify-content-between align-items-center flex-column ">
            <Table striped bordered hover responsive className=" overflow-y-scroll ">
                <thead>
                    <tr>
                        <th className="text-center">Contract Funds</th>
                        <th className="text-center">Contract</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td className="text-center">{Number(funds).toFixed(2)}</td>
                        <td className="text-center">{currentCoinAddress}</td>
                    </tr>
                </tbody>
            </Table>
            <div className="d-flex mb-5 w-75">
                <Form.Group as={Col} controlId="cryptoAddress" className="my-2">
                    <Form.Label>{coinAddress}</Form.Label>
                    <div className="d-flex flex-column">
                        <Form.Select
                            value={coinAddress!}
                            onChange={e => setCoinAddress(e.target.value.trim())}
                            required
                            className="form-select form-select-lg mb-3 border-3"
                            aria-label=".form-select-lg example"
                            style={{ backgroundColor: '#ececec' }}
                        >
                            <option value=""> -</option>
                            {Object.entries(cryptoAddresses)?.map(([symbol, address]: [string, CryptoAddress]) => (
                                <option key={symbol} value={address.address}>
                                    {symbol}
                                </option>
                            ))}
                        </Form.Select>
                        <Button onClick={changeCoinHandler} disabled={isloading}>
                            {isloading ? 'loading...' : 'Change'}
                        </Button>
                    </div>
                </Form.Group>
            </div>
            <div className=" d-flex  text-center align-items-center">
                <WithdrawlProfit funds={funds} />
                <ModalOverlay show={isloading}>
                    <Spinner animation="grow" role="status" variant="light">
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                </ModalOverlay>
            </div>
        </div>
    );
}

export default GetFunds;
