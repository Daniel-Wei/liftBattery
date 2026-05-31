import type { TrendPoint } from "../types/appTypes";

type ChartMockProps = {
  title: string;
  titleZh?: string;
  data: TrendPoint[];
  variant?: "dark" | "green" | "blue" | "purple" | "amber";
};

export function ChartMock({ title, titleZh, data, variant = "blue" }: ChartMockProps) {
  const maxValue = Math.max(1, ...data.map((point) => point.value));
  const barClassName = `chart-bar chart-bar--${variant}`;

  return (
    <div className="chart-card">
      <p className="chart-title">{title}</p>
      {titleZh ? <h2 className="chart-subtitle">{titleZh}</h2> : null}

      <div className="chart-bars">
        {data.map((point) => {
          const height = `${Math.max(12, (point.value / maxValue) * 100)}%`;

          return (
            <div key={point.label} className="chart-column">
              <div className="chart-track">
                <div className={barClassName} style={{ height }} />
              </div>
              <span className="chart-label">{point.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
