import Image from "next/image";
import Link from "next/link";
import { useContext, useEffect } from "react";
import { OrderContext } from "../../store/order-context";
import ItemCard from "../UI/ItemCard";
import { Fab } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
const OrderSummary: React.FC = () => {
     const ctx = useContext(OrderContext);

     return (
          <section id="pay" className="mt-4">
               <h5>
                    <strong>1. Shipping Info</strong>
               </h5>
               <div className="row mt-4 mb-5">
                    <div className="col-md-6">
                         <p>
                              <strong>Email:</strong> {ctx.shippingInfo.email}
                         </p>
                         <p>
                              <strong>First Name:</strong> {ctx.shippingInfo.firstName}
                         </p>
                         <p>
                              <strong>Last Name:</strong> {ctx.shippingInfo.lastName}
                         </p>
                         <p>
                              <strong>Address Line:</strong> {ctx.shippingInfo.addressLine1}
                         </p>
                    </div>
                    <div className="col-md-6">
                         <p>
                              <strong>Zip Code:</strong> {ctx.shippingInfo.zipCode}
                         </p>
                         <p>
                              <strong>City:</strong> {ctx.shippingInfo.city}
                         </p>
                         <p>
                              <strong>State:</strong> {ctx.shippingInfo.state}
                         </p>
                         <p>
                              <strong>Phone Number:</strong> {ctx.shippingInfo.phoneNumber}
                         </p>
                    </div>
               </div>
               <h5 className="mb-4">
                    <strong>2. Order Items</strong>
               </h5>
               <div className="row">
                    {ctx.items.map((el) => {
                         return (
                              <div className="mb-3" key={el.id}>
                                   <ItemCard>
                                        <div className="row align-items-center justify-content-sm-start justify-content-start">
                                             <div className="col-3 col-sm-2 ">
                                                  <img src={el.image} alt={el.title} style={{ borderRadius: "5%", boxShadow: "0px 20px 39px -9px rgba(0,0,0,0.1)" }} className="img-thumbnail img-fluid" />
                                             </div>
                                             <div className="col-10">
                                                  <div className="item-info my-3 ">
                                                       <p>{el.title}</p>
                                                       <Link href={el.url} target="_blank">
                                                            Open on Amazon
                                                       </Link>
                                                  </div>
                                             </div>
                                             <div className="row d-flex mt-3 col-12 ">
                                                  <br />
                                                  <div className="col-12  position-relative d-flex justify-content-between  ">
                                                       <div>
                                                            <b>Q.ty:</b>
                                                            <span className="font-weight-bold bg-white py-2 px-4  flex-column m-2 ">
                                                                 {el.quantity}
                                                            </span>
                                                       </div>
                                                       <br />
                                                       <span>
                                                            <b>Total:</b>  {el.symbol} {(el.price! * el.quantity).toFixed(2)}

                                                       </span>
                                                  </div>

                                             </div>

                                        </div>
                                   </ItemCard>

                              </div>
                         );
                    })}
               </div>
               <div className="my-4 mx-3 text-end">
                    <h3>
                         {" "}
                         <b>{"$" + ctx.basketTotal().toFixed(2)}</b>{" "}
                    </h3>{" "}
               </div>
               {/* <div className="subtotal d-flex justify-content-between mt-3">
				<p>
					<strong>SUBTOTAL:</strong>
				</p>
				<p>
					<strong>
						s
					</strong>
				</p>
			</div> */}
          </section>
     );
};

export default OrderSummary;
