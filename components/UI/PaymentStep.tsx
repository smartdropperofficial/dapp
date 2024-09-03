const Step: React.FC<{ active: boolean; number: number; text: string; status?: boolean }> = ({ active, number, text, status = false }) => {
  return (
    <div className={`step ${active && "active"}`}>
      <div className="step-circle">{number}</div>
      <p className={`d-lg-block text-center`}>{text}</p>
    </div>
  );
};

export default Step;
