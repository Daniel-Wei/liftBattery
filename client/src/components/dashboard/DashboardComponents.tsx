import type { ReactNode } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type ChartPoint = {
  label: string;
  value: number;
};

export type TrendChartPoint = {
  label: string;
  load: number;
  volume: number;
};

type DashboardCardProps = {
  title?: string;
  eyebrow?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
};

type DashboardMetricCardProps = {
  label: string;
  value: string;
  change?: string;
  helper?: string;
  accent?: "cyan" | "mint" | "purple" | "yellow";
  data: ChartPoint[];
};

type DonutMetricProps = {
  value: number;
  label: string;
  helper?: string;
};

type ProgressMetricProps = {
  label: string;
  value: string;
  percent: number;
  helper?: string;
};

type ActivityItem = {
  title: string;
  detail: string;
  meta: string;
  tone?: "cyan" | "mint" | "purple" | "yellow";
};

type InsightItem = {
  title: string;
  detail: string;
  action: string;
  tone?: "cyan" | "mint" | "yellow";
};

function clampPercent(value: number) {
  if (Number.isNaN(value)) {
    return 0;
  }

  return Math.max(0, Math.min(100, value));
}

export function DashboardCard({
  title,
  eyebrow,
  action,
  children,
  className = "",
}: DashboardCardProps) {
  return (
    <article className={`dashboard-card ${className}`.trim()}>
      {(title || eyebrow || action) && (
        <header className="dashboard-card-header">
          <div>
            {eyebrow ? <p className="dashboard-card-eyebrow">{eyebrow}</p> : null}
            {title ? <h2 className="dashboard-card-title">{title}</h2> : null}
          </div>
          {action ? <div className="dashboard-card-action">{action}</div> : null}
        </header>
      )}
      {children}
    </article>
  );
}

export function EmptyChartState({ label = "暂无可用数据" }: { label?: string }) {
  return (
    <div className="empty-chart-state">
      <span className="empty-chart-line" />
      <span>{label}</span>
    </div>
  );
}

export function SparklineChart({
  data,
  accent = "cyan",
}: {
  data: ChartPoint[];
  accent?: "cyan" | "mint" | "purple" | "yellow";
}) {
  if (data.length < 2) {
    return <EmptyChartState label="等待更多记录" />;
  }

  return (
    <div className="sparkline-chart">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 6, bottom: 4, left: 6 }}>
          <defs>
            <linearGradient id={`sparkline-fill-${accent}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={`var(--accent-${accent})`} stopOpacity={0.22} />
              <stop offset="100%" stopColor={`var(--accent-${accent})`} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke={`var(--accent-${accent})`}
            strokeWidth={2.2}
            fill={`url(#sparkline-fill-${accent})`}
            dot={false}
            activeDot={{ r: 3.5, strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function DashboardMetricCard({
  label,
  value,
  change,
  helper,
  accent = "cyan",
  data,
}: DashboardMetricCardProps) {
  const isNegativeChange = typeof change === "string" && change.trim().startsWith("-");
  const changePrefix = isNegativeChange ? "↓" : "↑";

  return (
    <DashboardCard className={`metric-card metric-card--${accent}`}>
      <span className="metric-accent-bar" />
      <p className="metric-label">{label}</p>
      <div className="metric-value-row">
        <strong className="metric-value">{value}</strong>
        {change ? (
          <span className={isNegativeChange ? "metric-change metric-change--negative" : "metric-change"}>
            {changePrefix} {change}
          </span>
        ) : null}
      </div>
      {helper ? <p className="metric-helper">{helper}</p> : null}
      <SparklineChart data={data} accent={accent} />
    </DashboardCard>
  );
}

export function DonutMetric({ value, label, helper }: DonutMetricProps) {
  const radius = 54;
  const stroke = 13;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const progress = clampPercent(value);
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="donut-metric">
      <svg className="donut-metric-svg" width="132" height="132" viewBox="0 0 132 132">
        <circle
          cx="66"
          cy="66"
          r={normalizedRadius}
          fill="transparent"
          stroke="var(--ring-track)"
          strokeWidth={stroke}
        />
        <circle
          cx="66"
          cy="66"
          r={normalizedRadius}
          fill="transparent"
          stroke="var(--accent-cyan)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          transform="rotate(-90 66 66)"
        />
      </svg>
      <div className="donut-metric-center">
        <strong>{Math.round(value)}</strong>
        <span>/100</span>
      </div>
      <div className="donut-metric-copy">
        <p>{label}</p>
        {helper ? <span>{helper}</span> : null}
      </div>
    </div>
  );
}

export function ProgressMetric({ label, value, percent, helper }: ProgressMetricProps) {
  return (
    <div className="progress-metric">
      <div className="progress-metric-row">
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
      <div className="nexora-progress-track">
        <span style={{ width: `${clampPercent(percent)}%` }} />
      </div>
      {helper ? <p>{helper}</p> : null}
    </div>
  );
}

function TrendTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ color?: string; name?: string; value?: number | string }>;
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  return (
    <div className="chart-tooltip">
      <p className="chart-tooltip-label">{label}</p>
      {payload.map((item) => (
        <div className="chart-tooltip-row" key={item.name}>
          <span>
            <i style={{ background: item.color }} />
            {item.name}
          </span>
          <strong>{typeof item.value === "number" ? item.value.toLocaleString("zh-CN") : item.value}</strong>
        </div>
      ))}
    </div>
  );
}

export function ChartLegend({
  items,
}: {
  items: Array<{ label: string; tone: "cyan" | "purple" | "mint" }>;
}) {
  return (
    <div className="chart-legend">
      {items.map((item) => (
        <span key={item.label}>
          <i className={`legend-dot legend-dot--${item.tone}`} />
          {item.label}
        </span>
      ))}
    </div>
  );
}

export function TrendLineChart({ data }: { data: TrendChartPoint[] }) {
  if (data.length < 2) {
    return <EmptyChartState label="当前周期还没有足够训练记录生成趋势" />;
  }

  return (
    <div className="trend-line-chart">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 18, right: 12, bottom: 4, left: 0 }}>
          <defs>
            <linearGradient id="trend-cyan-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent-cyan)" stopOpacity={0.18} />
              <stop offset="100%" stopColor="var(--accent-cyan)" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="trend-purple-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent-purple)" stopOpacity={0.18} />
              <stop offset="100%" stopColor="var(--accent-purple)" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--chart-grid)" vertical={false} />
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "var(--text-muted)", fontSize: 12 }}
            dy={8}
          />
          <YAxis
            yAxisId="load"
            axisLine={false}
            tickLine={false}
            width={44}
            tick={{ fill: "var(--text-muted)", fontSize: 12 }}
          />
          <YAxis yAxisId="volume" hide orientation="right" />
          <Tooltip content={<TrendTooltip />} cursor={{ stroke: "var(--border)", strokeWidth: 1 }} />
          <Area
            yAxisId="load"
            type="monotone"
            dataKey="load"
            name="Training Load"
            stroke="none"
            fill="url(#trend-cyan-fill)"
          />
          <Area
            yAxisId="volume"
            type="monotone"
            dataKey="volume"
            name="Volume"
            stroke="none"
            fill="url(#trend-purple-fill)"
          />
          <Line
            yAxisId="load"
            type="monotone"
            dataKey="load"
            name="Training Load"
            stroke="var(--accent-cyan)"
            strokeWidth={2.4}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
          />
          <Line
            yAxisId="volume"
            type="monotone"
            dataKey="volume"
            name="Volume"
            stroke="var(--accent-purple)"
            strokeWidth={2.4}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ActivityList({ items }: { items: ActivityItem[] }) {
  if (items.length === 0) {
    return <EmptyChartState label="暂无最近训练" />;
  }

  return (
    <div className="activity-list">
      {items.map((item) => (
        <div className="activity-row" key={`${item.title}-${item.meta}`}>
          <span className={`activity-dot activity-dot--${item.tone ?? "cyan"}`} />
          <div>
            <strong>{item.title}</strong>
            <p>{item.detail}</p>
          </div>
          <time>{item.meta}</time>
        </div>
      ))}
    </div>
  );
}

export function InsightList({ items }: { items: InsightItem[] }) {
  return (
    <div className="insight-list">
      {items.map((item) => (
        <div className="insight-row" key={item.title}>
          <span className={`activity-dot activity-dot--${item.tone ?? "cyan"}`} />
          <div>
            <strong>{item.title}</strong>
            <p>{item.detail}</p>
          </div>
          <a href="#" onClick={(event) => event.preventDefault()}>{item.action}</a>
        </div>
      ))}
    </div>
  );
}
