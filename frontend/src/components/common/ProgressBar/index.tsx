import styles from "./index.module.css";

interface ProgressBarProps {
  title: string;
  percentCompleted: number;
  complete?: boolean | undefined;
}

const ProgressBar = ({
  title,
  percentCompleted,
  complete,
}: ProgressBarProps) => {
  return (
    <div className={`${styles.wrapper} ${complete ? styles.complete : ""}`}>
      {complete
        ? title
        : `${title} ${Math.round(percentCompleted * 100) / 100}% complete`}
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
