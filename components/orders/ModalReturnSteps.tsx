import { useEffect, useState } from "react";
import { ReturnStatusSteps } from "../../types/ReturnSteps";
import Loading from "../UI/Loading";
import Step from "../UI/Step";
import { getReturnStatusFromAmazon } from "../controllers/ReturnController";
import Link from "next/link";
import { useContractRead } from "wagmi";
import SmartShopperABI from "../../utils/abi/SmartShopperABI.json";
import { OrderSC } from "../../types/OrderSC";
import { Alert, AlertTitle } from "@mui/material";

const ModalReturnSteps: React.FC<{ orderId: string; requestId: string; close: (success?: string) => void }> = ({ orderId, requestId, close }) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentStep, setCurrentStep] = useState<ReturnStatusSteps>();
  const [labels, setLabels] = useState<string[]>();

  useContractRead({
    address: process.env.NEXT_PUBLIC_ORDER_MANAGER_ADDRESS as `0x${string}`,
    abi: SmartShopperABI,
    functionName: "getOrder",
    args: [orderId],
    onSuccess(data: OrderSC) {
      if (data.returned) {
        setCurrentStep(ReturnStatusSteps.RETURNED);
        setIsLoading(false);
      } else {
        fetchReturnStatus();
      }
    },
  });

  const fetchReturnStatus = async () => {
    const status = await getReturnStatusFromAmazon(requestId);

    if (status?.error) {
      if (status.error === "request_processing") {
        setCurrentStep(ReturnStatusSteps.PLACING_RETURN);
      } else {
        setCurrentStep(ReturnStatusSteps.ERROR);
      }
    } else if (status?.labelUrls) {
      setCurrentStep(ReturnStatusSteps.RETURN_PLACED);
      setLabels(status.labelUrls);
    } else {
      setCurrentStep(ReturnStatusSteps.ERROR);
    }
    setIsLoading(false);
  };

  const showReturnUrls = () => {
    if (currentStep === ReturnStatusSteps.RETURN_PLACED) {
      return labels![0] !== "waiting" ? (
        <h5>Refund Labels</h5> &&
          labels!.map((label, i) => {
            return (
              <Link target="_blank" href={label} key={i} legacyBehavior>
                <a className="d-block mt-3">Download label {i + 1}</a>
              </Link>
            );
          })
      ) : (
        <p>Waiting return label</p>
      );
    }
    return null;
  };

  return (
    <>
      <div className="modal-body">
        {isLoading && <Loading dark={true} loadingText="Loading return status..." />}
        {currentStep && !isLoading && (
          <div id="steps" className="mx-lg-5">
            <div className={`line line-1`}></div>
            <div className="step-row">
              <Step number={1} text="Placing return on Amazon" active={currentStep === ReturnStatusSteps.PLACING_RETURN || currentStep === ReturnStatusSteps.RETURN_PLACED || currentStep === ReturnStatusSteps.RETURNED} status />
              <Step number={2} text="Waiting for return, download label" active={currentStep === ReturnStatusSteps.RETURN_PLACED || currentStep === ReturnStatusSteps.RETURNED} status />
              <Step number={3} text="Refund completed" active={currentStep === ReturnStatusSteps.RETURNED} status />
            </div>
          </div>
        )}
        <div className="labels-return text-center mt-5">{showReturnUrls()}</div>
      </div>
      <div className="modal-footer flex-column">
        <Alert severity="warning" className="col-12">
          <AlertTitle>Warning</AlertTitle>
          If you dont see any progress AFTER some days, it could mean that your item is <strong>NOT RETURNABLE</strong> to the retailer.<br></br>
        </Alert>
      </div>
      <div className="modal-footer flex-column">
        <button type="button" className="btn btn-secondary" onClick={() => close()}>
          Close
        </button>
      </div>
    </>
  );
};

export default ModalReturnSteps;
