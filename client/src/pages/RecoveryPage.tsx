import { ChartMock } from "../components/ChartMock";
import { EvidenceNote } from "../components/EvidenceNote";
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

      <ChartMock title="Recovery trend" titleZh="恢复趋势" data={data.recoveryTrend} variant="green" />

      <EvidenceNote title="Recovery boundary / 恢复边界" evidenceType="proxy">
        <p>Fatigue, sleep, soreness, stress, and mood are subjective monitoring inputs, not diagnostic markers.</p>
        <p>疲劳、睡眠、酸痛、压力和情绪是主观监控输入，不是诊断标志。</p>
      </EvidenceNote>
    </div>
  );
}
