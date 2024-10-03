const Loading: React.FC<{ loadingText?: string; dark?: boolean }> = ({ loadingText = 'loading....', dark = false }) => {
    return (
        <div className="text-center">
            <div className={`lds-ripple ${dark && 'dark'}`}>
                <div></div>
                <div></div>
            </div>
            <p className="mt-3 text-center fw-5 fw-5" style={{ color: '#fff' }}>
                {loadingText}
            </p>
        </div>
    );
};

export default Loading;
