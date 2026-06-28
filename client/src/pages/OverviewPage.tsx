import { type CSSProperties } from "react";
import { MetricCard } from "../components/MetricCard";
import { SectionCard } from "../components/SectionCard";
import { StatusBadge } from "../components/StatusBadge";
import {
  getDerivedOverviewMetrics,
  getLatestTrainingSession,
  getSessionLoad,
  getTrainingSessionsInLast7Days,
} from "../domain/overviewMetrics";
import { getCurrentTrainingCycle } from "../domain/trainingTrendCharts";
import { useAppSelector } from "../store/hooks";
import { EvidenceType, MetricStatus, ReadinessStatus, TrendDirection, type Metric } from "../types/appTypes";
import { getPreCheckData, selectCurrentReadiness } from "../store/selectors/preCheckSelector";
import { selectTrainingSessions } from "../store/selectors/trainingSelector";
import { selectProgramSettings } from "../store/selectors/programSettingsSelector";

function getOverviewWatchCards(metrics: Metric[]): Metric[] {
  const watchCards = metrics.filter((metric) => (
    metric.status === MetricStatus.Watch || metric.status === MetricStatus.Risk
  ));

  if (watchCards.length > 0) {
    return watchCards;
  }

  return [{
    label: "No Active Watch",
    labelZh: "暂无明显风险",
    value: "正常",
    trend: TrendDirection.Stable,
    status: MetricStatus.Good,
    evidenceType: EvidenceType.Watch,
    explanation: "No current derived overview metric is in watch or risk state.",
    explanationZh: "当前训练记录和练前状态里没有明显需要警惕的信号。",
  }];
}

export function OverviewPage() {
  const currentReadiness = useAppSelector(selectCurrentReadiness);
  const { latest7Logs } = useAppSelector(getPreCheckData);
  const latestLog = latest7Logs?.[0] ?? null;
  const trainingSessions = useAppSelector(selectTrainingSessions);
  const programSettings = useAppSelector(selectProgramSettings);
  const currentTrainingCycle = getCurrentTrainingCycle(programSettings);
  const recentTrainingSessions = getTrainingSessionsInLast7Days(trainingSessions);
  const latestSession = getLatestTrainingSession(trainingSessions);
  const latestSessionLoad = latestSession ? getSessionLoad(latestSession) : null;

  const derivedOverviewMetrics = getDerivedOverviewMetrics({
    trainingSessions,
    programSettings,
    currentReadiness,
  });
  const overviewWatchCards = getOverviewWatchCards(derivedOverviewMetrics);

  const batteryRingStyle = {
    "--battery-score": `${currentReadiness.score}%`,
  } as CSSProperties;
  const readinessIsReady = currentReadiness.status === ReadinessStatus.Ready;

  return (
    <div className="page page-stack">
      <header className="dashboard-hero">
        <div className="dashboard-title-row">
          <div>
            <p className="landing-eyebrow">训练科学总览</p>
            <h1 className="page-title">训练计划总览</h1>
            <p className="page-subtitle">
              {currentTrainingCycle.label}：根据你的练前状态和已保存训练记录实时更新。
            </p>
          </div>
        </div>

        <div className="battery-focus-panel">
          <div className="battery-ring" style={batteryRingStyle}>
            <div className="battery-ring-core">
              <span className="battery-score">{currentReadiness.score}</span>
              <span className="battery-ring-label">训练电量</span>
            </div>
          </div>

          <div className="battery-focus-copy">
            <p className="battery-focus-eyebrow">
              根据今日练前记录实时计算
            </p>
            <h2 className="battery-focus-title">{currentReadiness.recommendationZh}</h2>
          </div>

          <div className="battery-focus-meta">
            <div>
              <p className="battery-meta-label">当前训练周期</p>
              <p className="battery-meta-value">
                {currentTrainingCycle.cycleNumber} · {programSettings.weeksPerCycle} 周/周期
              </p>
            </div>
            <div>
              <p className="battery-meta-label">最近记录</p>
              <p className="battery-meta-value">{latestLog?.date ?? "暂无"}</p>
            </div>
          </div>
        </div>

        <div className="hero-badge-row">
          <StatusBadge
            status={MetricStatus.Neutral}
            label={`${currentTrainingCycle.startDate} 至 ${currentTrainingCycle.endDate}`}
          />
          <StatusBadge
            status={currentReadiness.badgeStatus}
            label={readinessIsReady ? "今天：可以推进" : "今天：按状态调整"}
          />
          <StatusBadge
            status={latestSessionLoad !== null && latestSessionLoad >= 600 ? MetricStatus.Watch : MetricStatus.Neutral}
            label={latestSessionLoad === null ? "暂无" : `最近训练负荷 ${Math.round(latestSessionLoad)}`}
          />
          <StatusBadge
            status={MetricStatus.Neutral}
            label={`近 7 天训练 ${recentTrainingSessions.length} 次`}
          />
        </div>
      </header>

      <section className="metric-grid">
        {derivedOverviewMetrics.map((metric) => (
          <MetricCard key={metric.label} metric={metric} />
        ))}
      </section>

      <SectionCard title="需要留意的状态" eyebrow="基于记录模式，仅供训练参考">
        <div className="card-list">
          {overviewWatchCards.map((metric) => (
            <article key={metric.label} className="risk-card">
              <div className="info-row">
                <div>
                  <p className="risk-title">{metric.labelZh}</p>
                </div>
                <StatusBadge
                  status={metric.status}
                  label={metric.status === MetricStatus.Good ? "正常" : "留意"}
                />
              </div>
              <p className="risk-detail">{metric.explanationZh}</p>
            </article>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
