import type { CSSProperties } from "react";
import { SectionCard } from "../components/SectionCard";
import { StatusBadge } from "../components/StatusBadge";
import { MetricStatus } from "../types/appTypes";
import { readinessControls } from "../data/programValues";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  getPreCheckData,
  selectCurrentReadiness,
} from "../store/selectors/preCheckSelector";
import { 
  savePreCheckLogDraft, 
  resetPreCheckDraft, 
  updatePreCheckDraft 
} from "../store/slices/preCheckSlice";

function getRangeProgress(value: number, min: number, max: number) {
  return `${Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100))}%`;
}

function formatInputValue(value: number, unit: string) {
  if (unit === "bpm" && value > 0) {
    return `+${value} ${unit}`;
  }

  return `${value} ${unit}`;
}

export function PreCheckPage() {

  const dispatch = useAppDispatch();
  const readiness = useAppSelector(selectCurrentReadiness);
  const {
    preCheckDraft,
    preCheckDraftUpdated,
    latest7Logs,
  } = useAppSelector(getPreCheckData);

  const batteryRingStyle = {
    "--battery-score": `${readiness.score}%`,
  } as CSSProperties;

  return (
    <div className="page page-stack">
      <header className="dashboard-hero today-dashboard-hero">
        <div className="dashboard-title-row">
          <div>
            <p className="landing-eyebrow">Today / 今天</p>
            <h1 className="page-title">Pre-workout readiness check-in.</h1>
            <p className="page-subtitle">
              Before training, log the few signals that shape today&apos;s recommendation:
              sleep, soreness, motivation, resting heart rate change, and previous session effort.
            </p>
          </div>
          
        </div>

        <div className="battery-focus-panel">
          <div className="battery-panel-badges">
            <StatusBadge
              status={readiness.badgeStatus}
              label={`${readiness.statusLabel} / ${readiness.statusLabelZh}`}
            />
            <StatusBadge
              status={preCheckDraftUpdated ? MetricStatus.Watch : MetricStatus.Good}
              label={preCheckDraftUpdated ? "Draft updated" : "Draft saved"}
            />
          </div>

          <div className="battery-ring" style={batteryRingStyle}>
            <div className="battery-ring-core">
              <span className="battery-score">{readiness.score}</span>
              <span className="battery-ring-label">Readiness</span>
              <span className="battery-ring-label-zh">今日状态</span>
            </div>
          </div>
          

          <div className="battery-focus-copy">
           
            <p className="battery-focus-eyebrow">Pre-workout output / 训练前输出</p>
            <h2 className="battery-focus-title">{readiness.recommendation}</h2>
            <p className="battery-focus-detail">{readiness.recommendationZh}</p>
          </div>

        </div>
      </header>

      <section className="quick-log-shell">
        <div className="quick-log-header">
          <div>
            <p className="section-eyebrow">Controlled inputs</p>
            <h2 className="section-title">Pre-workout readiness / 训练前状态</h2>
          </div>
          <div className="quick-log-actions">
            <StatusBadge status={MetricStatus.Good} label="Live calculation" />
            <button type="button" className="button-dark" onClick={() => dispatch(savePreCheckLogDraft(preCheckDraft))} disabled={!preCheckDraftUpdated}>
              Save readiness check-in
            </button>
            <button type="button" className="button-dark" onClick={() => dispatch(resetPreCheckDraft())}>
              Reset inputs
            </button>
          </div>
        </div>

        <div className="quick-control-grid">
          {readinessControls.map((control) => {
            const value = preCheckDraft[control.field];
            const progress = getRangeProgress(value, control.min, control.max);

            return (
              <article key={control.field} className="quick-control-card">
                <div className="quick-control-top">
                  <div>
                    <p className="quick-control-label">{control.label}</p>
                    <p className="quick-control-sub">{control.labelZh}</p>
                  </div>
                  <span className="quick-value-pill">
                    {formatInputValue(value, control.unit)}
                  </span>
                </div>
                <p className="quick-output">{control.output}</p>
                <input
                  type="range"
                  min={control.min}
                  max={control.max}
                  step={control.step}
                  value={value}
                  onChange={(event) => (
                    dispatch(updatePreCheckDraft({ field: control.field, value: Number(event.target.value) }))
                  )}
                  className="range-input range-input--modern"
                  style={{ "--range-progress": progress } as CSSProperties}
                />
              </article>
            );
          })}
        </div>
      </section>

      <SectionCard title="Main drivers" titleZh="主要驱动因素">
        <div className="compact-card-list">
          {readiness.mainDrivers.map((mainDriver) => (
            <article key={mainDriver.id} className="compact-signal-card">
              <div>
                <p className="work-title">{mainDriver.message}</p>
              </div>
              <span className="signal-chip">{mainDriver.reason}</span>
            </article>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Saved pre-check records" titleZh="已保存练前检查">
        <div className="compact-card-list">
          {latest7Logs.length === 0 ? (
            <p className="muted-text">
              No saved pre-check records yet. Save today&apos;s readiness check-in to send it to Trends.
            </p>
          ) : latest7Logs.map((log) => (
            <article key={log.id} className="compact-signal-card">
              <div>
                <p className="work-title">{log.date}</p>
                <p className="info-subtitle">{log.readiness.recommendation}</p>
              </div>
              <span className="signal-chip">{log.readiness.score} / 100</span>
            </article>
          ))}
        </div>
      </SectionCard>

    </div>
  );
}
