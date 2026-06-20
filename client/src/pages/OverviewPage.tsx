import { type CSSProperties } from "react";
import { MetricCard } from "../components/MetricCard";
import { SectionCard } from "../components/SectionCard";
import { StatusBadge } from "../components/StatusBadge";
import { getLevelData } from "../data/mockData";
import { getDerivedOverviewMetrics } from "../domain/overviewMetrics";
import { useAppSelector } from "../store/hooks";
import { MetricStatus, RiskSeverity, UserLevel } from "../types/appTypes";
import { getPreCheckData, selectCurrentReadiness } from "../store/selectors/preCheckSelector";
import { selectTrainingSessions } from "../store/selectors/trainingSelector";
import { selectProgramSettings } from "../store/selectors/programSettingsSelector";
import { getRiskSeverityLabel } from "../helpers/displayLabels";

export function OverviewPage() {
  // mock data for now, will be replaced by live data in the future
  const data = getLevelData(UserLevel.Level1);
  const currentReadiness = useAppSelector(selectCurrentReadiness);
  const { latest7Logs } = useAppSelector(getPreCheckData);
  const latestLog = latest7Logs?.[0] ?? null;
  const trainingSessions = useAppSelector(selectTrainingSessions);
  const programSettings = useAppSelector(selectProgramSettings);

  const derivedOverviewMetrics = getDerivedOverviewMetrics({
    trainingSessions,
    programSettings,
    currentReadiness,
  });

  const batteryRingStyle = {
    "--battery-score": `${currentReadiness.score}%`,
  } as CSSProperties;

  return (
    <div className="page page-stack">
      <header className="dashboard-hero">
        <div className="dashboard-title-row">
          <div>
            <p className="landing-eyebrow">训练科学总览</p>
            <h1 className="page-title">训练计划总览</h1>
            <p className="page-subtitle">第 {data.trainingBlock.currentWeek} 周：先建立稳定习惯，再逐步增加复杂度。</p>
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
              <p className="battery-meta-label">当前周</p>
              <p className="battery-meta-value">
                {data.trainingBlock.currentWeek} / {data.trainingBlock.totalWeeks}
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
            label={`第 ${data.trainingBlock.currentWeek} 周 / 共 ${data.trainingBlock.totalWeeks} 周`}
          />
          <StatusBadge
            status={MetricStatus.Good}
            label="今天：按计划训练"
          />
          <StatusBadge status={MetricStatus.Watch} label="综合健身与力量基础" />
        </div>
      </header>

      <section className="metric-grid">
        {derivedOverviewMetrics.map((metric) => (
          <MetricCard key={metric.label} metric={metric} />
        ))}
      </section>

      <SectionCard title="需要留意的状态" eyebrow="基于记录模式，仅供训练参考">
        <div className="card-list">
          {data.riskWatches.map((risk) => (
            <article key={risk.title} className="risk-card">
              <div className="info-row">
                <div>
                  <p className="risk-title">{risk.titleZh}</p>
                </div>
                <StatusBadge
                  status={risk.severity === RiskSeverity.High ? MetricStatus.Risk : MetricStatus.Watch}
                  label={getRiskSeverityLabel(risk.severity)}
                />
              </div>
              <p className="risk-detail">{risk.recommendationZh}</p>
            </article>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
