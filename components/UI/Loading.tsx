const Loading: React.FC<{ loadingText?: string, dark?: boolean }> = ({ loadingText = "Checking items...", dark = false }) => {

	return (
			<div className="text-center">
				<div className={`lds-ripple ${dark && 'dark'}`}>
					<div></div>
					<div></div>
				</div>
				<p className="mt-3 text-center">{loadingText}</p>
			</div>
	);

};

export default Loading;
