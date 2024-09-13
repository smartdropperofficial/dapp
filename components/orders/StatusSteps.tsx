import { useEffect, useState } from "react";
import { OrderStatusSteps } from "../../types/OrderSteps";
import Step from "../UI/Step";
import { Tracking } from "../../types/Tracking";
import Link from "next/link";
import { AmazonProduct } from "../../types/OrderAmazon";

interface DeliveryDate {
	date: string;
	products: AmazonProduct[];
	days: number;
	delivery_date: string;
}

export interface AlternativeDeliveryDate {
	products: string[];
	deliveryDate: string;
}

const StatusSteps: React.FC<{ asin: string; amazonStatus: any }> = ({
	asin,
	amazonStatus
}) => {
	const [currentStep, setCurrentStep] = useState<OrderStatusSteps>();
	const [tracking, setTracking] = useState<Tracking[]>();
	const [trackingUrl, setTrackingUrl] = useState<string>();
	const [estimatedDelivery, setEstimatedDelivery] = useState<string>();

	const showTracking = () => {
		if (currentStep === OrderStatusSteps.ORDER_SHIPPED || currentStep === OrderStatusSteps.ORDER_RECEIVED) {
			return trackingUrl ? (
				<div className="text-center mt-4 mb-3">
					{/* <Link href={trackingUrl!} target="_blank">View tracking</Link> */}
				</div>
			) : (
				<p className="text-center mt-5">Tracking URL not available yet.</p>
			);
		}
		return null;
	};

	useEffect(() => {
		if (tracking) {
			const tmpTracking = tracking.find((track) => track.product_ids?.includes(asin));

			if (tmpTracking) {
				if (tmpTracking.delivery_status === "Delivered") {
					setCurrentStep(OrderStatusSteps.ORDER_RECEIVED);
				} else {
					setCurrentStep(OrderStatusSteps.ORDER_SHIPPED);
				}
				setTrackingUrl(tmpTracking.tracking_url);
			} else {
				setCurrentStep(OrderStatusSteps.ORDER_PLACED);
			}
		}
	}, [tracking]);

	useEffect(() => {
		if (amazonStatus?.error) {
			if (amazonStatus.error === "request_processing") {
				setCurrentStep(OrderStatusSteps.PLACING_ORDER);
			} else {
				setCurrentStep(OrderStatusSteps.ERROR);
			}
		} else if (amazonStatus?.tracking && amazonStatus.tracking === "waiting") {
			setCurrentStep(OrderStatusSteps.ORDER_PLACED);
		} else if (amazonStatus?.tracking && amazonStatus.tracking !== "waiting") {
			setTracking(amazonStatus.tracking);
		} else {
			setCurrentStep(OrderStatusSteps.ERROR);
		}

		if (amazonStatus?.deliveryDates?.length > 0) {
			for (let i = 0; i < amazonStatus?.deliveryDates?.length; i++) {
				const currentDelivery: DeliveryDate = amazonStatus?.deliveryDates[i];
				const currentDeliveryDate = currentDelivery.products.find((prod) => prod.product_id === asin);

				if (currentDeliveryDate) {
					setEstimatedDelivery(currentDelivery.delivery_date);
				}
			}
		} else if (amazonStatus?.alternativeDates?.length > 0) {
			for (let i = 0; i < amazonStatus?.alternativeDates?.length; i++) {
				const currentDelivery: AlternativeDeliveryDate = amazonStatus?.alternativeDates[i];
				const currentDeliveryDate = currentDelivery.products.find((prod) => prod === asin);

				if (currentDeliveryDate) {
					setEstimatedDelivery(currentDelivery.deliveryDate);
				}
			}
		}
	}, []);

	return (
		<div className="container">
			{currentStep && currentStep !== OrderStatusSteps.ERROR && (
				<div id="steps" className="mx-lg-5">
					<div className={`line line-1`}></div>
					<div className="step-row step-4">
						<Step number={1} text="Placing order"
							active={currentStep === OrderStatusSteps.PLACING_ORDER || currentStep === OrderStatusSteps.ORDER_PLACED || currentStep === OrderStatusSteps.ORDER_SHIPPED || currentStep === OrderStatusSteps.ORDER_RECEIVED}
							status />
						<Step number={2} text="Waiting for shipping"
							active={currentStep === OrderStatusSteps.ORDER_PLACED || currentStep === OrderStatusSteps.ORDER_SHIPPED || currentStep === OrderStatusSteps.ORDER_RECEIVED}
							status />
						<Step number={3} text="Product shipped"
							active={currentStep === OrderStatusSteps.ORDER_SHIPPED || currentStep === OrderStatusSteps.ORDER_RECEIVED}
							status />
						<Step number={4} text="Product delivered"
							active={currentStep === OrderStatusSteps.ORDER_RECEIVED} status />
					</div>
				</div>
			)}
			{estimatedDelivery && <p className="text-center">Estimated delivery date: {estimatedDelivery}</p>}

			{showTracking()}
			{currentStep === OrderStatusSteps.ERROR &&
				<p className="text-center text-danger">AN ERROR HAS OCCURRED RETRIEVING TRACKING, <br /> PLEASE CONTACT SUPPORT</p>}
		</div>
	);
};

export default StatusSteps;
