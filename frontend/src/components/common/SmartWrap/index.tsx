import styles from "./index.module.css";

interface SmartWrapProps {
  text: string;
}

const SmartWrap = ({ text }: SmartWrapProps) => {
  return (
    <span className={styles.line}>
      {text.split(/(\s*[:-]\s*)/).map((word, i) => (
        <span key={i} className={styles.part}>
          {word}
        </span>
      ))}
    </span>
  );
};

export { SmartWrap };
