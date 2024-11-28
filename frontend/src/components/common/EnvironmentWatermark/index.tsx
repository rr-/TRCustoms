import styles from "./index.module.css";
import { CSSProperties } from "react";
import ReactDOMServer from "react-dom/server";

interface EnvironmentWatermarkProps {
  children: React.ReactNode;
}

const EnvironmentWatermark = ({ children }: EnvironmentWatermarkProps) => {
  const environment = import.meta.env.VITE_ENVIRONMENT;
  if (!environment || environment === "prod") {
    return <>{children}</>;
  }

  const size = 150;
  const fontSize = 30;
  const color = "rgba(96, 96, 96, 0.08)";
  const text = environment.toUpperCase();

  const svg = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      version="1.1"
      height={size}
      width={size}
    >
      <text
        x="50%"
        y="50%"
        fontFamily="sans-serif"
        textAnchor="middle"
        transform={`rotate(-45 ${size / 2} ${size / 2})`}
        fill={color}
        fontSize={fontSize}
      >
        {text}
      </text>
    </svg>
  );
  const svgString = ReactDOMServer.renderToStaticMarkup(svg);

  const style: CSSProperties = {
    backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(svgString)
      .replace(/'/g, "%27")
      .replace(/"/g, "%22")}")`,
  };
  return (
    <>
      <div style={{ ...style }} className={styles.wrapper} />
      {children}
    </>
  );
};

export { EnvironmentWatermark };
