import { OrderSB, ProductSB } from "../../types/OrderSB";
import OrderProduct from "./OrderProduct";
import { useEffect, useState, useContext } from "react";
import ModalOverlay from "../UI/ModalOverlay";
import Modal from "../UI/Modal";
import ModalRefund from "./ModalRefund";
import { getOrder, getOrderStatusFromAmazon, updateOrder } from "../controllers/OrderController";
import { OrderStatus } from "../../types/Order";
import ModalStatusSteps from "./ModalStatusSteps";
import ModalReturnSteps from "./ModalReturnSteps";
import { Tracking } from "../../types/Tracking";
import { getAmountToPay } from "../controllers/PaymentController";
import { AmazonProduct } from "../../types/OrderAmazon";
import { useRouter } from "next/router";
import { encryptData, showInfoSwal } from "../../utils/utils";
import Swal from "sweetalert2";
import Loading from "../UI/Loading";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { OrderContext } from "../../store/order-context";
import { ConfigContext } from "@/store/config-context";
import Image from 'next/image';
import { useSession } from "next-auth/react";
import { SessionExt } from "@/types/SessionExt";

import StatusSteps from "./StatusSteps";

interface IMyOrderProps {
     order: OrderSB;
}

const Order: React.FC<IMyOrderProps> = (props: IMyOrderProps) => {
     const { order: currentOrder } = props;
     const { data: session }: { data: SessionExt | null } = useSession() as { data: SessionExt | null };

     const router = useRouter();
     const orderCtx = useContext(OrderContext);
     const configCtx = useContext(ConfigContext);
     const [order, setOrder] = useState<OrderSB>(currentOrder);
     const [orderItems, setOrderItems] = useState<ProductSB[]>([]);
     const [returnItems, setReturnItems] = useState<ProductSB[]>([]);
     const [isLoading, setIsLoading] = useState<boolean>(false);
     const [amazonStatus, setAmazonStatus] = useState<any>();
     const [taxRequestId, setTaxRequestId] = useState<string>();
     const [isDelivered, setIsDelivered] = useState<boolean>(false);
     const [showModal, setShowModal] = useState<{ show: boolean; type: string; asin?: string }>({
          show: false,
          type: "",
     });
     const [isThirtyPassed, setIsThirtyPassed] = useState<number>(0);

     const closeModal = (success?: string) => {
          setShowModal({ show: false, type: "" });
          if (success === "refetch") {
               refetchOrder();
          }
     };

     const refetchOrder = async () => {
          const newOrder = await getOrder(order.order_id!);

          if (newOrder) {
               setOrder(newOrder);
          }
     };

     const fetchOrderStatus = async () => {
          setTaxRequestId(order.tax_request_id);


          if (order.request_id) {
               const tmpAmazonStatus = await getOrderStatusFromAmazon(order.request_id!);
               //  console.log("🚀 ~ fetchOrderStatus ~ tmpAmazonStatus:", tmpAmazonStatus);
               setAmazonStatus(tmpAmazonStatus);
               setOrderItems(order.products!);

               if (tmpAmazonStatus?.tracking && tmpAmazonStatus.tracking !== "waiting") {
                    const tracking: Tracking[] = tmpAmazonStatus.tracking;

                    const areAllDelivered: boolean[] = [];
                    for (let i = 0; i < order.products!.length; i++) {
                         const isDelivered = tracking.some((track) => track.product_ids?.includes(order.products![i].asin) && track.delivery_status === "Delivered");
                         areAllDelivered.push(isDelivered);
                    }

                    if (areAllDelivered.every((del) => del)) {
                         setIsDelivered(true);
                    }
               }
          } else {
               setOrderItems(order.products!);
          }
     };

     const processError = async (status: OrderStatus, errorText: string) => {
          const updateDb: OrderSB = {
               status: status,
          };

          if (order && order.order_id) {
               await updateOrder(order.order_id!, updateDb);
          }
          refetchOrder();

          setIsLoading(false);
     };
     useEffect(() => {
          fetchStatus();
     }, [taxRequestId]);

     const fetchStatus = async () => {
          if (order.status === OrderStatus.WAITING_TAX && taxRequestId !== undefined && order && order.order_id) {
               console.log("🚀 ~ fetchStatus ~ taxRequestId:", taxRequestId);

               const amountToPay = await getAmountToPay(configCtx, taxRequestId!);
               console.log("🚀 ~ fetchStatus ~ amountToPay - 148:", amountToPay);

               if (amountToPay && amountToPay.error) {
                    console.log("🚀 ~ fetchStatus ~  if (amountToPay && amountToPay.error):", amountToPay);

                    switch (amountToPay.error) {
                         case "request_processing":
                              break;
                         case "product_unavailable":
                              processError(OrderStatus.PRODUCT_UNAVAILABLE, "Product unavailable, please try again or contact the support.");
                              break;
                         case "shipping_address_refused":
                              processError(OrderStatus.SHIPPING_ADDRESS_REFUSED, "Shipping address refused, please try again or contact the support.");
                              break;

                         default:
                              processError(OrderStatus.ERROR, "Error during the request, please try again or contact the support.");
                              console.log("🚀 ~ file: Order.tsx:246 ~ proceedToPayment ~ amountToPay.error:", amountToPay.error);

                              break;
                    }
               } else if (amountToPay && Object.keys(amountToPay).length !== 0 && !amountToPay.error) {
                    console.log("🚀 ~ fetchStatus ~ amountToPay: 172", amountToPay);
                    const newProducts = order.products?.map((product) => {
                         try {
                              const price = amountToPay.products.filter((p: AmazonProduct) => p.product_id === product.asin)[0].price;
                              return {
                                   ...product,
                                   price: price / 100,
                              };
                         } catch {
                              return {
                                   ...product,
                              };
                         }
                    });

                    const updateDb: OrderSB = {
                         status: OrderStatus.WAITING_PAYMENT,
                         products: newProducts,
                         tax_amount: amountToPay.tax,
                         subtotal_amount: amountToPay.subtotal,
                         total_amount: amountToPay.total,
                         shipping_amount: amountToPay.shipping,
                    };
                    console.log("🚀 ~ fetchStatus ~ updateDb:", updateDb);

                    const hasUpdated = await updateOrder(order.order_id!, updateDb);
                    console.log("🚀 ~ proceedToPayment ~ hasUpdated - 195:", hasUpdated);
               } else if (amountToPay && amountToPay.error) {
                    switch (amountToPay.error) {
                         case "insufficient_zma_balance":
                              processError(OrderStatus.INSUFFICIENT_ZMA_BALANCE, "insufficient_zma_balance");
                              break;
                    }
               }
          }
     };

     const proceedToPayment = async () => {
          setIsLoading(true);
          const products = order.products;

          const hasAlreadySavedPrice = products?.filter((product) => product.price);

          if (hasAlreadySavedPrice?.length === products?.length) {
               const encryptedOrderId = encryptData(order.order_id!);
               router.push(`/pay/${encryptedOrderId}/checkout`);
          }
     };
     const openNewRequest = (order_id: string | undefined) => {
          // Crea il messaggio con l'order_id
          const message = `order_id=${order_id}`;
          const user = `order_id=${session?.address}`;

          // Codifica il messaggio in base64
          const encodedMessage = Buffer.from(message).toString('base64');  // Corretto: codifica in base64
          const encodedUser = Buffer.from(user).toString('base64');  // Corretto: codifica in base64

          // Crea l'URL Telegram con il messaggio codificato
          const telegramUrl = `https://t.me/SmartDropperSupport_Bot?start=${encodedMessage}&user=${encodedUser}`;

          // Apri il link in una nuova scheda
          window.open(telegramUrl, '_blank');
     }

     const renderSwitch = (status: OrderStatus, asin: string, isReturned: boolean) => {
          switch (status) {
               case OrderStatus.PAYMENT_RECEIVED:
                    return ( 
                         <button onClick={() => showInfoSwal("We are placing your order on Amazon, please come back later")} className="btn btn-primary col-lg-6 col-md-8 col-sm-12 col-xs-12" 
                         style={{backgroundColor:'#ffd595', color:'white'}}>
                              Placing order on retailer...
                         </button>
                    );
                   case OrderStatus.SENT_TO_AMAZON:
                    return ( 
                         <div className="d-flex flex-column  justify-content-center align-items-center mt-5 ">
                         <span className="h2 fw-bold text-center  col-10 col-xl-8" onClick={() => setShowModal({ show: true, type: "View Status", asin: asin })}>
                              Order Status
                         </span> 
                              <StatusSteps  asin={asin} amazonStatus={amazonStatus} /> 
                              </div>

                    );
               case OrderStatus.RETURNED:
                    if (isReturned) {
                         return (
                              <button onClick={() => showInfoSwal("The refund has been completed")} className="btn btn-success  col-lg-6 col-md-8 col-sm-12 col-xs-12">
                                   Product returned
                              </button>
                         );
                    } else {
                         return (
                              <button className="btn btn-primary col-lg-6 col-md-8 col-sm-12 col-xs-12" onClick={() => setShowModal({ show: true, type: "View Status", asin: asin })}>
                                   View Status
                              </button>
                         );
                    }
               case OrderStatus.RETURNED_TO_AMAZON:
                    if (isReturned) {
                         return (
                              <button className="btn btn-secondary col-10 col-xl-8 " onClick={() => setShowModal({ show: true, type: "View Return Status" })}>
                                   View Return Status
                              </button> 
                         );
                    } else {
                         return (
                              <div className="d-flex justify-content-center">
                                   <button className="btn btn-primary col-10 col-xl-8" onClick={() => setShowModal({ show: true, type: "View Status", asin: asin })}>
                                        View Status
                                   </button>
                              </div>
                         );
                    }
               case OrderStatus.CANCELED:
                    return (
                         <button onClick={() => showInfoSwal("Your order have been canceled")} className="btn btn-danger col-lg-6 col-md-8 col-sm-12 col-xs-12">
                              Order canceled
                         </button>
                    ); 
                   
               case OrderStatus.SHIPPING_ADDRESS_REFUSED:
                    return (
                         <>
                              <button className="btn btn-secondary m-1 col-10 col-xl-8" onClick={() => showInfoSwal("Your shipping address has been refused, please create a new order")}>
                                   <WarningAmberIcon /> <span className="text-danger m-1 d-flex align-items-center">Shipping address refused</span>
                              </button>
                              {/* <button className="btn btn-primary m-1 col-10 col-xl-8" onClick={() => ChangeAddress()}>
              Change address
            </button> */}
                         </>
                    );
               case OrderStatus.PRODUCT_UNAVAILABLE:
                    return (
                         <a href="#" onClick={() => showInfoSwal("One ore more products in your order are not available, please create a new one")} className=" text-danger col-12 text-center  link-danger">
                              Product unavailable
                         </a>
                    );
          }
     };

     useEffect(() => {
          let date = new Date();
          let orderDate = new Date(order.created_at!);
          let diff = Math.abs(Number(date) - Number(orderDate));
          setIsThirtyPassed(diff / 60000 / 60 / 24);
     }, []);

     useEffect(() => {
          if (order && order.order_id) {
               fetchOrderStatus();
          }
     }, [order]);

     return (
          <>
               {isLoading && (
                    <ModalOverlay show={isLoading}>
                         <Loading loadingText="Checking tax..." />
                    </ModalOverlay>
               )}
               <div className="order-details">
                    <Image src="/icons/amazon-avatar.png" height={100} width={100} alt="avatar" className="mb-5" />

                    <div className="d-lg-flex justify-content-center align-items-center mb-3">
                         <div className="order-info">
                              <h5 className="m-0">
                                   <strong>Order #{order.order_id}</strong>
                              </h5>
                              <span className="d-block mt-1">{new Date(order.created_at!).toLocaleString()}</span>
                         </div>
                    </div>

                    {orderItems?.map((product, i) => {
                         return (
                              <div key={`${order.order_id}-${i}-order`} className="mt-4 mb-5">
                                    <OrderProduct product={product} order={order} />   
                                    <div className="my-5 order-buttons mt-3 text-end d-flex justify-content-center">{order.status && renderSwitch(order.status, product.asin, true)}</div>

                              </div>
                         );
                    })}
                    {returnItems?.map((product, i) => {
                         return (
                              <div key={`${order.order_id}-${i}-return`} className="mt-4 mb-5">
                                   <OrderProduct product={product} /> 
                                   
                                   <div className="order-buttons mt-3 text-end d-flex justify-content-center">{order.status && renderSwitch(order.status, product.asin, true)}</div>
                              </div>
                         );
                    })}

                    {order.status === OrderStatus.SHIPPING_ADDRESS_REFUSED && (
                         <div className="order-buttons text-center text-lg-end mt-3 mt-md-0 d-flex justify-content-center">
                              <span className=" col-10 col-xl-8 text-danger text-center">
                                   <b>Shipping address refused</b> <br />
                                   Please, create order again.
                              </span>
                         </div>
                    )}
                    {order.status === OrderStatus.WAITING_TAX && (
                         <div className="order-buttons text-center text-lg-end mt-3 mt-md-0 d-flex justify-content-center d-flex flex-column align-items-center">
                              <span className="  col-10 col-xl-8 text-danger text-primary text-center my-1">
                                   <b>Waiting for taxes... </b> <br />
                              </span>
                              <button
                                   className="btn btn-success col-10 col-xl-8 my-1"
                                   disabled={true}
                                   // onClick={() => {
                                   //      router.push(`/pay/${encryptData(order.order_id!)}/checkout`);
                                   // }}
                                   onClick={() => {
                                        Swal.fire({
                                             title: "We are retrieving the total order amount from the Amazon Provider. This process can take up to 10 minutes, please wait and try again.",
                                             icon: "info",
                                        });
                                   }}
                                   style={{ backgroundColor: "#83ce89" }}
                              >
                                   Click here to pay
                              </button>
                              <div className="d-flex col-10 col-xl-8">
                                   <span className="disclaimer alert alert-warning my-1 text-center">
                                        {" "}
                                        <b>* If you don&apos;t see any update after 1 hour please contact support on Telegram.</b>{" "}
                                   </span>
                                   {/* <div className="m-auto">
                                        <a href="https://discord.gg/FnMwpGfezw" target="_blank">
                                             <Image src="/icons/discord.png" alt="discord" width={50} height={50} />
                                        </a>
                                        
                                   </div> */}
                              </div>
                         </div>
                    )}
                    {order.status === OrderStatus.WAITING_PAYMENT && (
                         <div className="order-buttons text-center text-lg-end mt-3 mt-md-0 d-flex justify-content-center">
                              <button className="btn btn-success col-10 col-xl-8" disabled={taxRequestId === undefined} onClick={proceedToPayment}>
                                   Click here to pay
                              </button>
                         </div>
                    )}
                    {order.status === OrderStatus.ERROR && (
                         <div className=" d-flex justify-content-center flex-column align-items-center">
                              <span className="my-2 col-10 col-xl-8 fw-bold">Error during the request, please try again or contact the support</span>
                              <button className="btn btn-danger d-flex col-10 col-xl-8 " onClick={() => openNewRequest(order.order_id!)} >
                                   Please, contact us on Telegram
                              </button>
                         </div>
                    )}
               </div>
               <ModalOverlay show={showModal.show}>
                    <Modal
                         close={closeModal}
                         title={showModal.type}
                         content={
                              showModal.type === "View Return Status" ? (
                                   <ModalReturnSteps orderId={order.order_id!} requestId={order.request_id!} close={(success?: string) => closeModal(success)} />
                              ) : showModal.type === "View Status" ? (
                                   <ModalStatusSteps close={closeModal} asin={showModal.asin!} amazonStatus={amazonStatus} />
                              ) : (
                                   <ModalRefund order={order} close={(success?: string) => closeModal(success)} />
                              )
                         }
                    />
               </ModalOverlay>
          </>
     );
};

export default Order;
