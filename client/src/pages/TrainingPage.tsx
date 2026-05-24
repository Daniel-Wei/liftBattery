import { ChartMock } from "../components/ChartMock";
import { EvidenceNote } from "../components/EvidenceNote";
import { MetricCard } from "../components/MetricCard";
import { SectionCard } from "../components/SectionCard";
import { StatusBadge } from "../components/StatusBadge";
import { getLevelData } from "../data/mockData";
import type { UserLevel } from "../types/appTypes";

type TrainingPageProps = {
  selectedLevel: UserLevel;
};

export function TrainingPage({ selectedLevel }: TrainingPageProps) {
  const data = getLevelData(selectedLevel);
  const mainTrainingMetrics = [
    ...data.loadMetrics.slice(0, 2),
    ...data.effortMetrics.slice(0, 2),
    ...data.volumeMetrics.slice(0, 2),
  ];

  return (
    <div className="page page-stack">
      <header className="page-header">
        <p className="eyebrow">Training / 训练</p>
        <h1 className="page-title">See whether the week is productive or just hard.</h1>
        <p className="page-subtitle">
          This page combines load, effort, and useful volume so regular lifters do not need separate sport-science tabs.
        </p>
        <div className="hero-badge-row">
          <StatusBadge status={selectedLevel === "level1" ? "good" : "watch"} label={data.trainingBlock.trainingMode} />
          <StatusBadge status="good" label="Useful work first" />
        </div>
      </header>

      <section className="metric-grid">
        {mainTrainingMetrics.map((metric) => (
          <MetricCard key={metric.label} metric={metric} />
        ))}
      </section>

      <div className="two-column">
        <SectionCard title="Useful work" titleZh="真正有用的训练" eyebrow="Priority stimulus">
          <div className="compact-card-list">
            {data.primaryStimulusItems.map((item) => (
              <article key={item.name} className="compact-signal-card">
                <div>
                  <p className="work-title">{item.name}</p>
                  <p className="info-subtitle">{item.nameZh}</p>
                </div>
                <span className="signal-chip">{item.completed} / {item.planned}</span>
              </article>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Extra work" titleZh="额外训练" eyebrow="Helpful until it crowds recovery">
          <div className="compact-card-list">
            {data.supportWorkItems.map((item) => (
              <article key={item.name} className="compact-signal-card">
                <div>
                  <p className="work-title">{item.name}</p>
                  <p className="info-subtitle">{item.nameZh}</p>
                </div>
                <span className={item.status === "watch" ? "signal-chip" : "signal-chip signal-chip--muted"}>
                  {item.utilisation}
                </span>
              </article>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="two-column">
        <ChartMock title="How hard the week feels" titleZh="本周训练压力" data={data.loadTrend} variant="dark" />
        <ChartMock title="Hard sets over weeks" titleZh="Hard sets 周趋势" data={data.volumeTrend} variant="amber" />
      </div>

      <EvidenceNote title="Advanced method / 进阶方法" evidenceType="established">
        <p>Behind the scenes, session load uses session RPE x duration, and volume uses hard sets plus sets x reps x load where available.</p>
        <p>后台会使用 session RPE x 时长估计训练负荷，并在有数据时用 hard sets 和 sets x reps x load 理解训练量。</p>
      </EvidenceNote>
    </div>
  );
}
