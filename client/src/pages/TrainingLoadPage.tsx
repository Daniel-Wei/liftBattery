import { ChartMock } from "../components/ChartMock";
import { EvidenceNote } from "../components/EvidenceNote";
import { MetricCard } from "../components/MetricCard";
import { loadMetrics, loadTrend } from "../data/mockData";

export function TrainingLoadPage() {
  return (
    <div className="page page-stack">
      <header className="page-header">
        <p className="eyebrow">Training Load / 训练负荷</p>
        <h1 className="page-title">Track load size and load pattern.</h1>
      </header>

      <section className="metric-grid">
        {loadMetrics.map((metric) => (
          <MetricCard key={metric.label} metric={metric} showExplanation />
        ))}
      </section>

      <ChartMock title="Daily sRPE load" titleZh="每日 sRPE 负荷" data={loadTrend} variant="dark" />

      <EvidenceNote title="Load formula / 负荷公式" evidenceType="established">
        <p>Session load uses session RPE x duration. Weekly strain is shown as a watch concept from weekly load and monotony.</p>
        <p>训练课负荷使用 session RPE x 时长。周 strain 作为周负荷和 monotony 的观察概念展示。</p>
      </EvidenceNote>
    </div>
  );
}
