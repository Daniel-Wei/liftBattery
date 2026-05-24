import { ChartMock } from "../components/ChartMock";
import { EvidenceNote } from "../components/EvidenceNote";
import { GanttTimeline } from "../components/GanttTimeline";
import { MetricCard } from "../components/MetricCard";
import { SectionCard } from "../components/SectionCard";
import { StatusBadge } from "../components/StatusBadge";
import {
  loadTrend,
  overviewMetrics,
  recoveryTrend,
  riskWatches,
  timelinePhases,
  trainingBlock,
} from "../data/mockData";

export function OverviewPage() {
  return (
    <div className="page page-stack">
      <header className="hero-panel">
        <p className="landing-eyebrow">Training science overview / 训练科学总览</p>
        <h1 className="page-title">{trainingBlock.name}</h1>
        <p className="page-subtitle">{trainingBlock.subtitle}</p>
        <div className="hero-badge-row">
          <StatusBadge status="neutral" label={`Week ${trainingBlock.currentWeek} / ${trainingBlock.totalWeeks}`} />
          <StatusBadge status="good" label={`Today: ${trainingBlock.trainingMode}`} />
          <StatusBadge status="watch" label={trainingBlock.mode} />
        </div>
      </header>

      <section className="metric-grid">
        {overviewMetrics.map((metric) => (
          <MetricCard key={metric.label} metric={metric} />
        ))}
      </section>

      <div className="two-column">
        <GanttTimeline phases={timelinePhases} currentWeek={trainingBlock.currentWeek} />
        <SectionCard title="Watch states" titleZh="观察状态" eyebrow="Pattern-based, not diagnostic">
          <div className="card-list">
            {riskWatches.map((risk) => (
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
        <ChartMock title="Session load trend" titleZh="训练课负荷趋势" data={loadTrend} variant="dark" />
        <ChartMock title="Wellness readiness proxy" titleZh="Wellness readiness proxy" data={recoveryTrend} variant="green" />
      </div>

      <EvidenceNote title="Boundary / 边界" evidenceType="proxy">
        <p>LiftOps shows interpretable training signals. It does not diagnose recovery, overtraining, or medical risk.</p>
        <p>LiftOps 展示可解释训练信号，不诊断恢复、过度训练或医学风险。</p>
      </EvidenceNote>
    </div>
  );
}
