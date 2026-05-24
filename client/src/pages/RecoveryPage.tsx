import { ChartMock } from "../components/ChartMock";
import { EvidenceNote } from "../components/EvidenceNote";
import { MetricCard } from "../components/MetricCard";
import { recoveryMetrics, recoveryTrend } from "../data/mockData";

export function RecoveryPage() {
  return (
    <div className="page page-stack">
      <header className="page-header">
        <p className="eyebrow">Recovery / 恢复</p>
        <h1 className="page-title">Use wellness signals as a readiness proxy.</h1>
      </header>

      <section className="metric-grid">
        {recoveryMetrics.map((metric) => (
          <MetricCard key={metric.label} metric={metric} showExplanation />
        ))}
      </section>

      <ChartMock title="Wellness readiness trend" titleZh="Wellness readiness 趋势" data={recoveryTrend} variant="green" />

      <EvidenceNote title="Recovery boundary / 恢复边界" evidenceType="proxy">
        <p>Fatigue, sleep, soreness, stress, and mood are subjective monitoring inputs, not diagnostic markers.</p>
        <p>疲劳、睡眠、酸痛、压力和情绪是主观监控输入，不是诊断标志。</p>
      </EvidenceNote>
    </div>
  );
}
