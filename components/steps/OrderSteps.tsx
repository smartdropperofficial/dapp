import Step from '../UI/Step';

const OrderSteps: React.FC<{ currentStep: number }> = ({ currentStep }) => {
    return (
        <div id="steps">
            <div className={`line line-${currentStep}`}></div>
            <div className="step-row">
                <Step number={1} text="Zone" active />
                <Step number={2} text="Shop" active={currentStep > 1} />
                <Step number={3} text="Items" active={currentStep > 2} />
                <Step number={4} text="Shipping" active={currentStep > 3} />
                <Step number={5} text="pre-order" active={currentStep > 4} />
            </div>
        </div>
    );
};

export default OrderSteps;
