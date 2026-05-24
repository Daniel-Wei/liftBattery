import { ChartMock } from "../components/ChartMock";
import { EvidenceNote } from "../components/EvidenceNote";
import { MetricCard } from "../components/MetricCard";
import { SectionCard } from "../components/SectionCard";
import { StatusBadge } from "../components/StatusBadge";
import { primaryStimulusItems, supportWorkItems, volumeMetrics, volumeTrend } from "../data/mockData";

export function VolumePage() {
  return (
    <div className="page page-stack">
      <header className="page-header">
        <p className="eyebrow">Volume / 训练量</p>
        <h1 className="page-title">Separate priority stimulus from support work.</h1>
      </header>

      <section className="metric-grid">
        {volumeMetrics.map((metric) => (
          <MetricCard key={metric.label} metric={metric} showExplanation />
        ))}
      </section>

      <div className="two-column">
        <SectionCard title="Priority stimulus" titleZh="重点刺激" eyebrow="Target muscle hard sets">
          <div className="card-list">
            {primaryStimulusItems.map((item) => (
              <article key={item.name} className="work-card">
                <div className="info-row">
                  <p className="work-title">{item.name}</p>
                  <StatusBadge status={item.status} label={item.utilisation} />
                </div>
                <p className="info-subtitle">{item.nameZh}</p>
                <p className="work-detail">{item.completed} of {item.planned}</p>
              </article>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Support work" titleZh="支持性训练" eyebrow="Helpful, but limited">
          <div className="card-list">
            {supportWorkItems.map((item) => (
              <article key={item.name} className="work-card">
                <div className="info-row">
                  <p className="work-title">{item.name}</p>
                  <StatusBadge status={item.status} label={item.utilisation} />
                </div>
                <p className="info-subtitle">{item.nameZh}</p>
                <p className="work-detail">{item.completed} of {item.planned}</p>
              </article>
            ))}
          </div>
        </SectionCard>
      </div>

      <ChartMock title="Hard sets trend" titleZh="Hard sets 趋势" data={volumeTrend} variant="blue" />

      <EvidenceNote title="Volume boundary / 训练量边界" evidenceType="simpleArithmetic">
        <p>Volume load and hard sets are useful tracking tools, but they do not directly measure hypertrophy.</p>
        <p>Volume load 和 hard sets 是有用记录工具，但不能直接测量肌肥大。</p>
      </EvidenceNote>
    </div>
  );
}
