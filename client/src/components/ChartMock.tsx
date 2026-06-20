import type { TrendPoint } from "../types/appTypes";

type ChartMockProps = {
  title: string;
  titleZh?: string;
  data: TrendPoint[];
  variant?: "dark" | "green" | "blue" | "purple" | "amber";
};

const chartWidth = 640;
const chartHeight = 190;
const chartPadding = {
  top: 14,
  right: 12,
  bottom: 28,
  left: 24,
};
const plotWidth = chartWidth - chartPadding.left - chartPadding.right;
const plotHeight = chartHeight - chartPadding.top - chartPadding.bottom;

function formatAxisValue(value: number) {
  if (Math.abs(value) >= 100 || Number.isInteger(value)) {
    return Math.round(value).toLocaleString("zh-CN");
  }

  return value.toFixed(1);
}

function getChartDomain(data: TrendPoint[]) {
  const values = data.map((point) => point.value);
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

function isReadableSubtitle(titleZh: string | undefined) {
  return titleZh !== undefined && !/[ÃÂæèåçé]/.test(titleZh);
}

export function ChartMock({ title, titleZh, data, variant = "blue" }: ChartMockProps) {
  const shouldShowSubtitle = isReadableSubtitle(titleZh);

  if (data.length === 0) {
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

  const chartDomain = getChartDomain(data);
  const chartRange = chartDomain.max - chartDomain.min || 1;
  const yTicks = [
    chartDomain.max,
    chartDomain.min + (chartRange / 2),
    chartDomain.min,
  ];
  const chartPoints = data.map((point, index) => {
    const x = chartPadding.left + (
      data.length === 1 ? plotWidth / 2 : (index / (data.length - 1)) * plotWidth
    );
    const y = chartPadding.top + (
      ((chartDomain.max - point.value) / chartRange) * plotHeight
    );

    return {
      ...point,
      x,
      y,
    };
  });
  const linePath = chartPoints.map((point, index) => (
    `${index === 0 ? "M" : "L"} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`
  )).join(" ");

  return (
      <div className="chart-card">
      <p className="chart-title">{title}</p>
      {shouldShowSubtitle ? <h2 className="chart-subtitle">{titleZh}</h2> : null}

      <div className="chart-line-frame">
        <svg
          className="chart-line-svg"
          role="img"
          aria-label={`${title}折线图`}
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        >
          {yTicks.map((tick) => {
            const y = chartPadding.top + (((chartDomain.max - tick) / chartRange) * plotHeight);

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

          {linePath ? (
            <path className={`chart-line chart-line--${variant}`} d={linePath} />
          ) : null}

          {chartPoints.map((point) => (
            <g key={point.label}>
              <circle
                className={`chart-point chart-point--${variant}`}
                cx={point.x}
                cy={point.y}
                r="3"
              />
              <text className="chart-x-label" x={point.x} y={chartHeight - 7}>
                {point.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
