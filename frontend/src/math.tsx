const sum = (source: Array<number>): number =>
  source.reduce((a, b) => a + b, 0);
const avg = (source: Array<number>): number => sum(source) / source.length || 0;
const round = (source: number, precision: number) =>
  Math.round(source * Math.pow(10, precision)) / Math.pow(10, precision);

export { sum, avg, round };
