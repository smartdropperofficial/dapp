import { useContext } from "react";
import { OrderContext } from "../../store/order-context";
import Image from 'next/image';

const Input: React.FC<{ id: number; link: string }> = ({ id, link }) => {
	const ctx = useContext(OrderContext);

	return (
		<div className="items-input position-relative mb-3">
			<input className="form-control w-100" type="text" placeholder="Insert Item Link" value={link} disabled />
			<button className="btn btn-remove" onClick={(e) => ctx.itemsHandler(id, ctx.scraper, "remove")}>
				<Image src="/assets/close.png" fill alt="SmartShopper Remove Icon" />
			</button>
		</div>
	);
};

export default Input;
