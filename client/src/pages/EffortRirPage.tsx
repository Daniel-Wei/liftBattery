import { EvidenceNote } from "../components/EvidenceNote";
import { MetricCard } from "../components/MetricCard";
import { SectionCard } from "../components/SectionCard";
import { effortMetrics } from "../data/mockData";

export function EffortRirPage() {
  return (
    <div className="page page-stack">
      <header className="page-header">
        <p className="eyebrow">Effort / RIR / 努力程度</p>
        <h1 className="page-title">Use RIR and RPE to describe proximity to failure.</h1>
      </header>

      <section className="metric-grid">
        {effortMetrics.map((metric) => (
          <MetricCard key={metric.label} metric={metric} showExplanation />
        ))}
      </section>

      <SectionCard title="How to read it" titleZh="如何理解" eyebrow="Resistance-training specific">
        <div className="card-list">
          <article className="info-card">
            <p className="info-title">RIR 3-4</p>
            <p className="info-detail">More reps in reserve. Often easier to recover from.</p>
          </article>
          <article className="info-card">
            <p className="info-title">RIR 1-2</p>
            <p className="info-detail">Close to failure. Useful but fatigue cost rises.</p>
          </article>
          <article className="info-card">
            <p className="info-title">RIR 0</p>
            <p className="info-detail">At failure. Treat as a high-effort signal, not a default target.</p>
          </article>
        </div>
      </SectionCard>

      <EvidenceNote title="RIR/RPE boundary / RIR/RPE 边界" evidenceType="established">
        <p>RIR-based RPE helps describe effort in resistance training, but it still depends on user judgement and experience.</p>
        <p>RIR-based RPE 能描述阻力训练努力程度，但仍依赖用户判断和经验。</p>
      </EvidenceNote>
    </div>
  );
}
