import styles from "./index.module.css";

interface SpiderGraphData {
  name: string;
  value: number;
  minValue: number;
  maxValue: number;
}

interface SpiderGraphProps {
  data: SpiderGraphData[];
}

interface Point {
  x: number;
  y: number;
}

const SpiderGraph = ({ data }: SpiderGraphProps) => {
  const numCategories = data.length;
  const size = 250;

  const getCoordinatesForValue = (value: number, angle: number): Point => {
    const radius = size / 2;
    const length = radius * value;
    return {
      x: length * Math.sin(angle),
      y: -length * Math.cos(angle),
    };
  };

  const pointsToSvg = (points: Point[]): string => {
    return points.map((p) => `${p.x},${p.y}`).join(" ");
  };

  const legendPoints = data.map((_, index) => {
    const angle = (Math.PI * 2 * index) / numCategories;
    return getCoordinatesForValue(1.0, angle);
  });

  const valuePoints = data.map((cat, index) => {
    const angle = (Math.PI * 2 * index) / numCategories;
    const scaleFactor = (cat.value - cat.minValue) / cat.maxValue;
    return getCoordinatesForValue(scaleFactor, angle);
  });

  const renderAxis = (factor: number) => {
    const axisPoints = data.map((_, index) => {
      const angle = (Math.PI * 2 * index) / numCategories;
      return getCoordinatesForValue(factor, angle);
    });

    return (
      <>
        <polygon points={pointsToSvg(axisPoints)} className={styles.axis} />
        {axisPoints.map((p, index) => {
          return (
            <line
              key={index}
              x1="0"
              y1="0"
              x2={p.x}
              y2={p.y}
              className={styles.axis}
            />
          );
        })}
      </>
    );
  };

  const renderLegend = () => {
    return (
      <>
        {legendPoints.map((p, i) => (
          <text key={i} x={p.x * 1.1} y={p.y * 1.1} className={styles.legend}>
            {data[i].name}
          </text>
        ))}
      </>
    );
  };

  const minX = Math.min(...legendPoints.map((p) => p.x)) - 75;
  const maxX = Math.max(...legendPoints.map((p) => p.x)) + 75;
  const minY = Math.min(...legendPoints.map((p) => p.y)) - 25;
  const maxY = Math.max(...legendPoints.map((p) => p.y)) + 25;
  console.log(minX, maxX, minY, maxY);

  return (
    <svg
      height={`${maxY - minY}`}
      viewBox={`${minX} ${minY} ${maxX - minX} ${maxY - minY}`}
      className={styles.graph}
    >
      {renderAxis(0.25)}
      {renderAxis(0.5)}
      {renderAxis(0.75)}
      {renderAxis(1)}

      <polygon points={pointsToSvg(valuePoints)} className={styles.value} />

      {renderLegend()}
    </svg>
  );
};

export { SpiderGraph };
