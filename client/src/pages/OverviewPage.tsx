import { ChartMock } from "../components/ChartMock";
import { EvidenceNote } from "../components/EvidenceNote";
import { GanttTimeline } from "../components/GanttTimeline";
import { MetricCard } from "../components/MetricCard";
import { SectionCard } from "../components/SectionCard";
import { StatusBadge } from "../components/StatusBadge";
import { getLevelData } from "../data/mockData";
import type { UserLevel } from "../types/appTypes";

type OverviewPageProps = {
  selectedLevel: UserLevel;
};

export function OverviewPage({ selectedLevel }: OverviewPageProps) {
  const data = getLevelData(selectedLevel);

  return (
    <div className="page page-stack">
      <header className="hero-panel">
        <p className="landing-eyebrow">Training science overview / 训练科学总览</p>
        <h1 className="page-title">{data.trainingBlock.name}</h1>
        <p className="page-subtitle">{data.trainingBlock.subtitle}</p>
        <div className="preview-risk">
          <p className="preview-eyebrow">
            User case: {data.userCase.name}, {data.userCase.age} · {data.userCase.trainingAge}
          </p>
          <p className="preview-risk-title">{data.userCase.currentDay}</p>
          <p className="body-text">{data.userCase.shortStory}</p>
          <p className="body-text">{data.userCase.shortStoryZh}</p>
        </div>
        <div className="hero-badge-row">
          <StatusBadge status="neutral" label={`Week ${data.trainingBlock.currentWeek} / ${data.trainingBlock.totalWeeks}`} />
          <StatusBadge status={selectedLevel === "level1" ? "good" : "watch"} label={`Today: ${data.trainingBlock.trainingMode}`} />
          <StatusBadge status="watch" label={data.trainingBlock.mode} />
        </div>
      </header>

      <section className="metric-grid">
        {data.overviewMetrics.map((metric) => (
          <MetricCard key={metric.label} metric={metric} />
        ))}
      </section>

      <div className="two-column">
        <GanttTimeline phases={data.timelinePhases} currentWeek={data.trainingBlock.currentWeek} />
        <SectionCard title="Watch states" titleZh="观察状态" eyebrow="Pattern-based, not diagnostic">
          <div className="card-list">
            {data.riskWatches.map((risk) => (
              <article key={risk.title} className="risk-card">
                <div className="info-row">
                  <div>
                    <p className="risk-title">{risk.title}</p>
                    <p className="info-subtitle">{risk.titleZh}</p>
                  </div>
                  <StatusBadge status={risk.severity === "high" ? "risk" : "watch"} label={risk.severity} />
                </div>
                <p className="risk-detail">{risk.recommendation}</p>
              </article>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="two-column">
        <ChartMock title="Training pressure trend" titleZh="训练压力趋势" data={data.loadTrend} variant="dark" />
        <ChartMock title="Recovery trend" titleZh="恢复趋势" data={data.recoveryTrend} variant="green" />
      </div>

      <EvidenceNote title="Boundary / 边界" evidenceType="proxy">
        <p>LiftOps shows interpretable training signals. It does not diagnose recovery, overtraining, or medical risk.</p>
        <p>LiftOps 展示可解释训练信号，不诊断恢复、过度训练或医学风险。</p>
      </EvidenceNote>
    </div>
  );
}
