import "./ProgressBar.css";

interface ProgressBarProps {
  title: string;
  percentCompleted: number;
}

const ProgressBar = ({ title, percentCompleted }: ProgressBarProps) => {
  return (
    <div className="ProgressBar">
      {title} {`${Math.round(percentCompleted * 100) / 100}% complete`}
      <br />
      <div className="ProgressBar--container">
        <div
          className="ProgressBar--indicator"
          style={{ width: `${percentCompleted}%` }}
        ></div>
      </div>
    </div>
  );
};

export { ProgressBar };
