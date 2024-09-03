const Modal: React.FC<{ close: () => void; title: string; content: React.ReactNode }> = ({ close, title, content }) => {
	return (
		<div className="modal fade show d-block">
			<div className="modal-dialog modal-dialog-centered">
				<div className="modal-content">
					<div className="modal-header">
						<h5 className="modal-title">{title}</h5>
						<button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={close}></button>
					</div>
					{content}
				</div>
			</div>
		</div>
	);
};

export default Modal;
