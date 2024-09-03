import { OrderStatus } from "../../types/Order";
import { OrderSB } from "../../types/OrderSB";
import Card from "../UI/Card";
import Order from "./Order";

interface IMyOrderListProps {
     orders: OrderSB[];
}

const MyOrderList: React.FC<IMyOrderListProps> = (props: IMyOrderListProps) => {
     const { orders } = props;
     const filteredOrders = orders.filter((order) => order.status !== OrderStatus.CREATED);

     return (
          <>
               {filteredOrders.map((order) => {
                    return (
                         <div key={order.order_id} className="mt-4">
                              <Card>
                                   {" "}
                                   <Order order={order} />
                                   <div className="order-buttons mt-3 text-end d-flex flex-column  align-items-center ">
                                        <div className="bg-white rounded-2 p-2 mt-4 d-flex justify-content-center flex-column">
                                             <h4 className="fw-bold">Shipping address: </h4>
                                             <br></br>
                                             <div className="fw-bold m-0 text-center">
                                                  First name: <p className="fw-light">{order.shipping_info?.first_name}</p>
                                             </div>
                                             <div className="fw-bold m-0 text-center">
                                                  Last Name: <p className="fw-light">{order.shipping_info?.last_name}</p>
                                             </div>
                                             <div className="fw-bold m-0 text-center">
                                                  Address 1: <p className="fw-light">{order.shipping_info?.address_line1}</p>
                                             </div>
                                             <div className="fw-bold m-0 text-center">
                                                  City: <p className="fw-light">{order.shipping_info?.city}</p>
                                                  <div className="fw-bold m-0">
                                                       State: <p className="fw-light">{order.shipping_info?.state}</p>
                                                  </div>
                                                  <div className="fw-bold m-0 text-center">
                                                       Zip: <p className="fw-light">{order.shipping_info?.zip_code}</p>
                                                  </div>
                                                  <div className="fw-bold m-0 text-center">
                                                       Phone Number: <p className="fw-light">{order.shipping_info?.phone_number}</p>
                                                  </div>
                                             </div>
                                        </div>
                                   </div>
                              </Card>
                         </div>
                    );
               })}
          </>
     );
};

export default MyOrderList;
