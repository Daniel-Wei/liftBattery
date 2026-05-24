import { ChartMock } from "../components/ChartMock";
import { EvidenceNote } from "../components/EvidenceNote";
import { MetricCard } from "../components/MetricCard";
import { SectionCard } from "../components/SectionCard";
import { getLevelData } from "../data/mockData";
import type { UserLevel } from "../types/appTypes";

type BodyweightPageProps = {
  selectedLevel: UserLevel;
};

export function BodyweightPage({ selectedLevel }: BodyweightPageProps) {
  const data = getLevelData(selectedLevel);
  const bodyweightMetric = data.nutritionMetrics[0];

  return (
    <div className="page page-stack">
      <header className="page-header">
        <p className="eyebrow">Bodyweight / 体重</p>
        <h1 className="page-title">Use bodyweight as context, not a daily judgment.</h1>
        <p className="page-subtitle">
          For regular lifters, the useful question is whether the trend is changing training quality, hunger, and recovery.
        </p>
      </header>

      <section className="metric-grid">
        {data.nutritionMetrics.map((metric) => (
          <MetricCard key={metric.label} metric={metric} />
        ))}
      </section>

      <div className="two-column">
        <ChartMock title="Bodyweight trend" titleZh="体重趋势" data={data.bodyweightTrend} variant="blue" />
        <ChartMock title="Calories trend" titleZh="热量趋势" data={data.nutritionTrend} variant="purple" />
      </div>

      <SectionCard title="Plain-language read" titleZh="直白解读" eyebrow={`${data.userCase.name}'s current week`}>
        <div className="compact-card-list">
          <article className="compact-signal-card">
            <div>
              <p className="work-title">{bodyweightMetric.label}</p>
              <p className="info-subtitle">{bodyweightMetric.labelZh}</p>
            </div>
            <span className="signal-chip">{bodyweightMetric.value}</span>
          </article>
          <article className="compact-signal-card">
            <div>
              <p className="work-title">Use trend as context</p>
              <p className="info-subtitle">把趋势当作训练语境</p>
            </div>
            <span className="signal-chip signal-chip--muted">{bodyweightMetric.status}</span>
          </article>
        </div>
      </SectionCard>

      <EvidenceNote title="Boundary / 边界" evidenceType="watch">
        <p>Bodyweight trend helps explain training state during a cut. It is not a dieting command.</p>
        <p>体重趋势用于解释减脂期训练状态，不是节食命令。</p>
      </EvidenceNote>
    </div>
  );
}
