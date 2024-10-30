import { useState } from 'react';
import ItemCard from '../UI/ItemCard';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { OrderSB, ProductSB } from '../../types/OrderSB';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import InfoIcon from '@mui/icons-material/Info';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';

interface IMyOrderProductProps {
    product: ProductSB;
    order?: OrderSB;
}

const OrderProduct: React.FC<IMyOrderProductProps> = ({ product, order }) => {
    const [orderCopy, setorderCopy] = useState('Copy');
    const [PaymentCopy, setPaymentCopy] = useState('Copy');

    const copyToClipboard = (text: string, setCopyState: React.Dispatch<React.SetStateAction<string>>) => {
        navigator.clipboard
            .writeText(text)
            .then(() => {
                console.log(text);
                setCopyState('Copied');
            })
            .catch(error => {
                console.error('Unable to copy text: ', error);
                // You might want to show an error message to the user
            });
    };
    const BreakCode = (code: string) => {
        const length = code?.length;
        const chunkSize = Math.ceil(length / 4);
        const chunks = [];
        const firstPart = code?.substring(0, chunkSize);
        const lastPart = code?.substring(length - chunkSize, length);

        return firstPart + '...' + lastPart;
    };

    return (
        <ItemCard key={product.asin}>
            <div className="d-flex flex-column">
                <div className="row align-items-center justify-content-sm-start justify-content-center">
                    <div className="col-3 col-sm-2">
                        <img
                            src={product.image}
                            alt={product.title}
                            style={{ borderRadius: '5%', boxShadow: '0px 20px 39px -9px rgba(0,0,0,0.1)' }}
                            className="img-thumbnail img-fluid"
                        />
                    </div>
                    <div className="col-xl-6 my-4 my-xl-0">
                        <div className="item-info text-start">
                            <p>{product.title}</p>
                            <a href={product.url} target="_blank" rel="noopener noreferrer">
                                Open on Amazon
                            </a>
                        </div>
                    </div>

                    <div className="col-6 col-lg-2 position-relative d-flex justify-content-lg-center">Q.ty: {product.quantity}</div>

                    <div className="col-6 col-lg-2">
                        {product.price && (
                            <p className="order-price text-end">
                                {product.symbol} {(product.price * product.quantity).toFixed(2)}
                            </p>
                        )}
                    </div>
                </div>
                <hr />

                <div className="d-flex mt-4  flex-column  align-items-xl-start py-2">
                    <div className="my-2 d-flex flex-column align-items-xl-start col-12 justify-content-between">
                        <div className="">
                            <b> Order TX:</b>
                            {/* <Tooltip title="This represents your order created on the blockchain">
                        <IconButton>
                           <InfoIcon fontSize="small" sx={{ color: "black" }} />
                        </IconButton>
                     </Tooltip> */}

                            <OverlayTrigger
                                trigger={['hover', 'focus']}
                                key={'right'}
                                placement={'right'}
                                overlay={
                                    <Popover id={`popover-positioned-${'right'}`}>
                                        <Popover.Header as="h3">This represents your order created on the blockchain</Popover.Header>
                                        <Popover.Body>You will see the Tx hash after your order will be completed.</Popover.Body>
                                    </Popover>
                                }
                            >
                                <InfoIcon fontSize="small" sx={{ color: 'black' }} />
                            </OverlayTrigger>
                        </div>
                        <div className="d-flex flex-column flex-xl-row col-12 justify-content-between">
                            <a className="disclaimer pe-auto" href={`https://polygonscan.com/tx/${order?.creation_tx}`} target="_blank">
                                {order?.creation_tx ? BreakCode(order?.creation_tx!) : 'No transaction hash'}

                                <Tooltip title="Open on polygonscan">
                                    <IconButton>
                                        <OpenInNewIcon sx={{ color: '#ff9900' }} />
                                    </IconButton>
                                </Tooltip>
                            </a>
                            <div
                                onClick={() => copyToClipboard(order?.creation_tx ?? '', setorderCopy)}
                                style={{ cursor: 'pointer' }}
                                onMouseLeave={() => {
                                    setorderCopy('Copy');
                                }}
                            >
                                <Tooltip title={orderCopy}>
                                    <IconButton>
                                        <ContentCopyIcon />
                                    </IconButton>
                                </Tooltip>
                            </div>
                        </div>
                    </div>
                    <div className="my-2 d-flex flex-column align-items-xl-start col-12 justify-content-between">
                        <div>
                            <b>Pre-Order Payment TX:</b>
                            <OverlayTrigger
                                trigger={['hover', 'focus']}
                                key={'right'}
                                placement={'right'}
                                overlay={
                                    <Popover id={`popover-positioned-${'right'}`}>
                                        <Popover.Header as="h3">
                                            This represents your <b>payment Tx</b> created on the blockchain
                                        </Popover.Header>
                                        <Popover.Body>You will see the Tx hash after your payment will be completed.</Popover.Body>
                                    </Popover>
                                }
                            >
                                <InfoIcon fontSize="small" sx={{ color: 'black' }} />
                            </OverlayTrigger>
                        </div>
                        <div className="d-flex flex-column flex-xl-row col-12 justify-content-between">
                            <a className="disclaimer pe-auto" href={`https://polygonscan.com/tx/${order?.payment_tx}`} target="_blank">
                                {order?.payment_tx ? BreakCode(order?.payment_tx!) : 'No transaction hash'}

                                <Tooltip title="Open on polygonscan">
                                    <IconButton>
                                        <OpenInNewIcon sx={{ color: '#ff9900' }} />
                                    </IconButton>
                                </Tooltip>
                            </a>

                            <div
                                onClick={() => copyToClipboard(order?.payment_tx ?? '', setPaymentCopy)}
                                style={{ cursor: 'pointer' }}
                                onMouseLeave={() => {
                                    setPaymentCopy('Copy');
                                }}
                            >
                                <Tooltip title={PaymentCopy}>
                                    <IconButton>
                                        <ContentCopyIcon />
                                    </IconButton>
                                </Tooltip>
                            </div>
                        </div>
                    </div>
                </div>
                {order?.payment_tx && !order?.creation_tx && (
                    <div className="d-flex col-12">
                        <span className="disclaimer alert alert-warning my-1 text-center col-12">
                            * If you don&apos;t see any <b> Order code</b> 1 hour after your payment, contact support on Telegram
                        </span>
                    </div>
                )}
            </div>
        </ItemCard>
    );
};

export default OrderProduct;
