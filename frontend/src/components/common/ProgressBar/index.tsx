import styles from "./index.module.css";

interface ProgressBarProps {
  title: string;
  percentCompleted: number;
}

const ProgressBar = ({ title, percentCompleted }: ProgressBarProps) => {
  return (
    <div className={styles.wrapper}>
      {title} {`${Math.round(percentCompleted * 100) / 100}% complete`}
      <br />
      <div className={styles.indicator}>
        <div
          className={styles.indicatorFill}
          style={{ width: `${percentCompleted}%` }}
        ></div>
      </div>
    </div>
  );
};

export { ProgressBar };
