import { useEffect, useState } from "react";
import * as ReactDOM from "react-dom";

const ModalOverlay: React.FC<{ show: boolean; children: React.ReactNode }> = ({ show, children }) => {
	const [isBrowser, setIsBrowser] = useState(false);

	useEffect(() => {
		setIsBrowser(true);
	}, []);

	const modalContent = (
		<>
			<div className="modal-overlay active"></div>
			<div className="modal-main">{children}</div>
		</>
	);

	return show && isBrowser ? ReactDOM.createPortal(modalContent, document.getElementById("modal")!) : null;
};

export default ModalOverlay;
