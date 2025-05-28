import styles from "./index.module.css";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card = ({ children, className }: CardProps) => (
  <article className={`${styles.card}${className ? ` ${className}` : ""}`}>
    {children}
  </article>
);

interface CardGridProps {
  children: React.ReactNode;
  className?: string;
}

const CardGrid = ({ children, className }: CardGridProps) => (
  <div className={`${styles.grid}${className ? ` ${className}` : ""}`}>
    {children}
  </div>
);

export { Card, CardGrid };
