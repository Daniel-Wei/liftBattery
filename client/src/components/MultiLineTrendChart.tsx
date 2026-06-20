import type { TrendPoint } from "../types/appTypes";

type MultiLineTrendSeries = {
  id: string;
  label: string;
  detail?: string;
  variant: "dark" | "green" | "blue" | "purple" | "amber";
  data: TrendPoint[];
};

type MultiLineTrendChartProps = {
  title: string;
  titleZh?: string;
  series: MultiLineTrendSeries[];
  xLabels?: string[];
};

const chartWidth = 640;
const chartHeight = 210;
const chartPadding = {
  top: 16,
  right: 16,
  bottom: 32,
  left: 30,
};
const plotWidth = chartWidth - chartPadding.left - chartPadding.right;
const plotHeight = chartHeight - chartPadding.top - chartPadding.bottom;
const overlappingPointOffset = 6;

type ChartPoint = TrendPoint & {
  x: number;
  y: number;
  displayX: number;
};

function formatAxisValue(value: number) {
  if (Math.abs(value) >= 100 || Number.isInteger(value)) {
    return Math.round(value).toLocaleString("zh-CN");
  }

  return value.toFixed(1);
}

function getChartDomain(series: MultiLineTrendSeries[]) {
  const values = series.flatMap((line) => line.data.map((point) => point.value));
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const valueRange = maxValue - minValue;

  if (valueRange === 0) {
    return {
      min: Math.max(0, minValue - 1),
      max: maxValue + 1,
    };
  }

  return {
    min: Math.max(0, minValue - (valueRange * 0.15)),
    max: maxValue + (valueRange * 0.15),
  };
}

function getXLabels(series: MultiLineTrendSeries[], configuredLabels?: string[]) {
  if (configuredLabels !== undefined) {
    return configuredLabels;
  }

  return [...new Set(series.flatMap((line) => line.data.map((point) => point.label)))];
}

function isReadableSubtitle(titleZh: string | undefined) {
  return titleZh !== undefined && !/[ÃÂæèåçé]/.test(titleZh);
}

export function MultiLineTrendChart({
  title,
  titleZh,
  series,
  xLabels: configuredXLabels,
}: MultiLineTrendChartProps) {
  const visibleSeries = series.filter((line) => line.data.length > 0);
  const shouldShowSubtitle = isReadableSubtitle(titleZh);

  if (visibleSeries.length === 0) {
    return (
      <div className="chart-card">
        <p className="chart-title">{title}</p>
        {shouldShowSubtitle ? <h2 className="chart-subtitle">{titleZh}</h2> : null}
        <div className="chart-line-frame chart-line-frame--empty">
          <p className="muted-text">暂无趋势数据。</p>
        </div>
      </div>
    );
  }

  const xLabels = getXLabels(visibleSeries, configuredXLabels);
  const chartDomain = getChartDomain(visibleSeries);
  const chartRange = chartDomain.max - chartDomain.min || 1;
  const yTicks = [
    chartDomain.max,
    chartDomain.min + (chartRange / 2),
    chartDomain.min,
  ];

  function getX(label: string) {
    const labelIndex = xLabels.indexOf(label);

    if (labelIndex === -1) {
      return null;
    }

    return chartPadding.left + (
      xLabels.length === 1 ? plotWidth / 2 : (labelIndex / (xLabels.length - 1)) * plotWidth
    );
  }

  function getY(value: number) {
    return chartPadding.top + (((chartDomain.max - value) / chartRange) * plotHeight);
  }

  function getOverlappingPointOffset(point: TrendPoint, seriesIndex: number) {
    const overlappingSeriesIndexes = visibleSeries
      .map((line, index) => ({
        index,
        hasOverlap: line.data.some((candidatePoint) => (
          candidatePoint.label === point.label && candidatePoint.value === point.value
        )),
      }))
      .filter((candidate) => candidate.hasOverlap)
      .map((candidate) => candidate.index);

    if (overlappingSeriesIndexes.length <= 1) {
      return 0;
    }

    const overlapIndex = overlappingSeriesIndexes.indexOf(seriesIndex);
    const midpoint = (overlappingSeriesIndexes.length - 1) / 2;

    return (overlapIndex - midpoint) * overlappingPointOffset;
  }

  return (
    <div className="chart-card">
      <div className="chart-title-row">
        <div>
          <p className="chart-title">{title}</p>
          {shouldShowSubtitle ? <h2 className="chart-subtitle">{titleZh}</h2> : null}
        </div>
        <div className="chart-legend">
          {visibleSeries.map((line) => (
              <span key={line.id} className="chart-legend-item">
                <span className={`chart-legend-dot chart-point--${line.variant}`} />
                {line.label}
                {line.detail ? <span className="chart-legend-detail">{line.detail}</span> : null}
              </span>
          ))}
        </div>
      </div>

      <div className="chart-line-frame">
        <svg
          className="chart-line-svg"
          role="img"
          aria-label={`${title}多折线图`}
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        >
          {yTicks.map((tick) => {
            const y = getY(tick);

            return (
              <g key={tick} className="chart-y-tick">
                <line
                  x1={chartPadding.left}
                  x2={chartWidth - chartPadding.right}
                  y1={y}
                  y2={y}
                />
                <text x={chartPadding.left - 3} y={y + 2.5}>
                  {formatAxisValue(tick)}
                </text>
              </g>
            );
          })}

          <line
            className="chart-y-axis"
            x1={chartPadding.left}
            x2={chartPadding.left}
            y1={chartPadding.top}
            y2={chartHeight - chartPadding.bottom}
          />

          {visibleSeries.map((line, seriesIndex) => {
            const points = line.data
              .map<ChartPoint | null>((point) => {
                const x = getX(point.label);

                if (x === null) {
                  return null;
                }

                return {
                  ...point,
                  x,
                  displayX: x + getOverlappingPointOffset(point, seriesIndex),
                  y: getY(point.value),
                };
              })
              .filter((point) => point !== null);
            const linePath = points.map((point, index) => (
              `${index === 0 ? "M" : "L"} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`
            )).join(" ");

            return (
              <g key={line.id}>
                {linePath ? (
                  <path className={`chart-line chart-line--${line.variant}`} d={linePath} />
                ) : null}

                {points.map((point) => (
                  <g key={`${line.id}-${point.label}`}>
                    <circle
                      className={`chart-point chart-point--${line.variant}`}
                      cx={point.displayX}
                      cy={point.y}
                      r="3"
                    />
                    <title>{`${line.label}：${formatAxisValue(point.value)} 千克`}</title>
                  </g>
                ))}
              </g>
            );
          })}

          {xLabels.map((label) => {
            const x = getX(label);

            if (x === null) {
              return null;
            }

            return (
              <text key={label} className="chart-x-label" x={x} y={chartHeight - 8}>
                {label}
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
