import Card from "../../../components/UI/Card";
import Link from "next/link";
import Image from 'next/image';
import { useRouter } from "next/router";
import { decryptData } from "../../../utils/utils";

const PaymentCompleted = () => {
	const router = useRouter()
	const { encryptedOrderId } = router.query;
	const orderId = decryptData(encryptedOrderId as string);

	return (
		<div className="container h-100 d-flex justify-content-center align-items-center">
			<div className="row w-100 justify-content-center">
				<div className="col-lg-7">
					<Card>
						<div className="card-title">
							<div className="img-check-completed position-relative d-flex justify-content-center">
								<Image src="/assets/check.png" width={250} height={250} alt="Order completed" />
							</div>
							<h1 className="mt-5">Order completed!</h1>
							<p className="text-center font-weight-light">
								Thank you for using <strong>SmartShopper</strong>.
							</p>
						</div>
						<div className="card-title text-center mt-4">
							<h5>Order N°{orderId}</h5>
							<p className="font-weight-light">You can now view your order in <Link href="/my-orders">My Orders</Link> section.</p>
						</div>
					</Card>
				</div>
			</div>
		</div>
	);
};

export default PaymentCompleted;