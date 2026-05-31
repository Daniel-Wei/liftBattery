import { ChartMock } from "../components/ChartMock";
import { MetricCard } from "../components/MetricCard";
import { getLevelData } from "../data/mockData";
import type { UserLevel } from "../types/appTypes";

type RecoveryPageProps = {
  selectedLevel: UserLevel;
};

export function RecoveryPage({ selectedLevel }: RecoveryPageProps) {
  const data = getLevelData(selectedLevel);

  return (
    <div className="page page-stack">
      <header className="page-header">
        <p className="eyebrow">Recovery / 恢复</p>
        <h1 className="page-title">Use wellness signals as a readiness proxy.</h1>
      </header>

      <section className="metric-grid">
        {data.recoveryMetrics.map((metric) => (
          <MetricCard key={metric.label} metric={metric} showExplanation />
        ))}
      </section>

      <div className="two-column">
        <ChartMock title="Recovery trend" titleZh="恢复趋势" data={data.recoveryTrend} variant="green" />
        <ChartMock title="Training pressure trend" titleZh="训练压力趋势" data={data.loadTrend} variant="dark" />
      </div>

    </div>
  );
}
