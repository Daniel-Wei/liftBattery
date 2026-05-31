import type { CSSProperties } from "react";
import { ChartMock } from "../components/ChartMock";
import { GanttTimeline } from "../components/GanttTimeline";
import { MetricCard } from "../components/MetricCard";
import { SectionCard } from "../components/SectionCard";
import { StatusBadge } from "../components/StatusBadge";
import { getLevelData } from "../data/mockData";
import { getDerivedOverviewMetrics } from "../domain/overviewMetrics";
import {
  getWeeklySessionLoadTrend,
  getWeeklyVolumeLoadTrend,
} from "../domain/trainingTrendCharts";
import { useTrainingLog } from "../state/TrainingLogContext";
import { MetricStatus, RiskSeverity, UserLevel } from "../types/appTypes";

type OverviewPageProps = {
  selectedLevel: UserLevel;
};

export function OverviewPage({ selectedLevel }: OverviewPageProps) {
  const data = getLevelData(selectedLevel);

  const {
    currentReadiness,
    latestLog,
    trainingSessions,
    bodyweightEntries,
    nutritionEntries,
    programSettings,
  } = useTrainingLog();

  const derivedOverviewMetrics = getDerivedOverviewMetrics({
    trainingSessions,
    bodyweightEntries,
    nutritionEntries,
    programSettings,
    currentReadiness,
  });
  const weeklySessionLoadTrend = getWeeklySessionLoadTrend(trainingSessions);
  const weeklyVolumeLoadTrend = getWeeklyVolumeLoadTrend(trainingSessions);
  
  const batteryRingStyle = {
    "--battery-score": `${currentReadiness.score}%`,
  } as CSSProperties;

  return (
    <div className="page page-stack">
      <header className="dashboard-hero">
        <div className="dashboard-title-row">
          <div>
            <p className="landing-eyebrow">Training science overview / 训练科学总览</p>
            <h1 className="page-title">{data.trainingBlock.name}</h1>
            <p className="page-subtitle">{data.trainingBlock.subtitle}</p>
          </div>
        </div>

        <div className="battery-focus-panel">
          <div className="battery-ring" style={batteryRingStyle}>
            <div className="battery-ring-core">
              <span className="battery-score">{currentReadiness.score}</span>
              <span className="battery-ring-label">Lift Battery</span>
              <span className="battery-ring-label-zh">训练电量</span>
            </div>
          </div>

          <div className="battery-focus-copy">
            <p className="battery-focus-eyebrow">
              Live readiness from today&apos;s draft / 今日实时状态
            </p>
            <h2 className="battery-focus-title">{currentReadiness.recommendation}</h2>
            <p className="battery-focus-detail">{currentReadiness.recommendationZh}</p>
          </div>

          <div className="battery-focus-meta">
            <div>
              <p className="battery-meta-label">Week</p>
              <p className="battery-meta-value">
                {data.trainingBlock.currentWeek} / {data.trainingBlock.totalWeeks}
              </p>
            </div>
            <div>
              <p className="battery-meta-label">Latest log</p>
              <p className="battery-meta-value">{latestLog?.date ?? "None"}</p>
            </div>
          </div>
        </div>

        <div className="hero-badge-row">
          <StatusBadge
            status={MetricStatus.Neutral}
            label={`Week ${data.trainingBlock.currentWeek} / ${data.trainingBlock.totalWeeks}`}
          />
          <StatusBadge
            status={selectedLevel === UserLevel.Level1 ? MetricStatus.Good : MetricStatus.Watch}
            label={`Today: ${data.trainingBlock.trainingMode}`}
          />
          <StatusBadge status={MetricStatus.Watch} label={data.trainingBlock.mode} />
        </div>
      </header>

      <section className="metric-grid">
        {derivedOverviewMetrics.map((metric) => (
          <MetricCard key={metric.label} metric={metric} />
        ))}
      </section>

      <div className="demo-section-note">
        <StatusBadge status={MetricStatus.Neutral} label="Demo preview" />
        <p>
          Preview sections below still use demo data until their data sources are connected.
        </p>
      </div>

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
                  <StatusBadge
                    status={risk.severity === RiskSeverity.High ? MetricStatus.Risk : MetricStatus.Watch}
                    label={risk.severity}
                  />
                </div>
                <p className="risk-detail">{risk.recommendation}</p>
              </article>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="two-column">
      <ChartMock
        title="Training pressure trend"
        titleZh="训练压力趋势"
        data={data.loadTrend}
        variant="dark"
      />

      <ChartMock
        title="Recovery trend"
        titleZh="恢复趋势"
        data={data.recoveryTrend}
        variant="green"
      />

      <ChartMock
        title="Training session load"
        titleZh={"\u8bad\u7ec3\u8bfe\u8d1f\u8377"}
        data={weeklySessionLoadTrend}
        variant="dark"
      />

      <ChartMock
        title="Training volume load"
        titleZh={"\u8bad\u7ec3\u91cf\u8d1f\u8377"}
        data={weeklyVolumeLoadTrend}
        variant="amber"
      />

      <ChartMock
        title="Bodyweight trend"
        titleZh="体重趋势"
        data={data.bodyweightTrend}
        variant="blue"
      />

      <ChartMock
        title="Calories context"
        titleZh="热量语境"
        data={data.nutritionTrend}
        variant="purple"
      />
      </div>
    </div>
  );
}
