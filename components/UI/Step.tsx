const Step: React.FC<{active: boolean, number: number, text: string, status?: boolean}> = ({active, number, text, status = false}) => {
	return (
                <div className={`step ${active && 'active'}`}>
                    <div className="step-circle">{number}</div>
                    <p className={` flex-wrape text-center`} style={{maxWidth:'8em'}}>{text}</p>
                </div>
	);
};

export default Step;
