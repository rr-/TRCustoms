import styles from "./index.module.css";

interface GFXCardProps {
  name: string;
  variant?: "big" | "stripe" | undefined;
  children?: React.ReactNode | undefined;
}

const GFXCard = ({ name, variant, children }: GFXCardProps) => {
  variant ||= "stripe";

  const url = `/card-${name}.jpg`;

  return (
    <div className={variant === "big" ? styles.card : styles.stripe}>
      {variant === "big" ? (
        <img className={styles.background} src={url} alt={name} />
      ) : (
        <div
          className={styles.background}
          style={{
            backgroundImage: `url('${url}')`,
          }}
        />
      )}
      <aside className={styles.aside}>{children}</aside>
    </div>
  );
};

export { GFXCard };
