import type { CSSProperties } from "react";
import { SectionCard } from "../components/SectionCard";
import { StatusBadge } from "../components/StatusBadge";
import { useTrainingLog } from "../state/TrainingLogContext";
import { MetricStatus, type TrainingInput, type UserLevel } from "../types/appTypes";

type TodayPageProps = {
  selectedLevel: UserLevel;
};

type TrainingInputField = keyof TrainingInput;

type ReadinessControl = {
  field: TrainingInputField;
  label: string;
  labelZh: string;
  min: number;
  max: number;
  step: number;
  unit: string;
  output: string;
};

const readinessControls = [
  {
    field: "sleepHours",
    label: "Sleep Hours",
    labelZh: "睡眠时长",
    min: 3,
    max: 10,
    step: 0.5,
    unit: "h",
    output: "Changes: recovery capacity",
  },
  {
    field: "soreness",
    label: "Soreness",
    labelZh: "肌肉酸痛",
    min: 1,
    max: 5,
    step: 1,
    unit: "/5",
    output: "Changes: training tolerance",
  },
  {
    field: "motivation",
    label: "Motivation",
    labelZh: "训练动力",
    min: 1,
    max: 5,
    step: 1,
    unit: "/5",
    output: "Changes: readiness score",
  },
  {
    field: "restingHeartRateDelta",
    label: "Resting HR Delta",
    labelZh: "静息心率变化",
    min: -5,
    max: 20,
    step: 1,
    unit: "bpm",
    output: "Changes: recovery watch",
  },
  {
    field: "previousSessionRpe",
    label: "Previous Session RPE",
    labelZh: "上次训练 RPE",
    min: 1,
    max: 10,
    step: 1,
    unit: "/10",
    output: "Changes: fatigue cost",
  },
  {
    field: "previousSessionDurationMinutes",
    label: "Previous Session Duration",
    labelZh: "上次训练时长",
    min: 20,
    max: 120,
    step: 5,
    unit: "min",
    output: "Feeds: previous session load",
  },
] satisfies ReadinessControl[];

function getRangeProgress(value: number, min: number, max: number) {
  return `${Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100))}%`;
}

function formatInputValue(value: number, unit: string) {
  if (unit === "bpm" && value > 0) {
    return `+${value} ${unit}`;
  }

  return `${value} ${unit}`;
}

export function TodayPage(_props: TodayPageProps) {
  const {
    todayDraft,
    currentReadiness,
    updateTodayDraft,
    resetTodayDraft,
    saveTodayLog,
    todayDraftUpdated,
  } = useTrainingLog();
  const readiness = currentReadiness;
  const batteryRingStyle = {
    "--battery-score": `${readiness.score}%`,
  } as CSSProperties;

  function updateTrainingInput(field: TrainingInputField, value: number) {
    updateTodayDraft(field, value);
  }

  function resetTrainingInput() {
    resetTodayDraft();
  }

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
              status={todayDraftUpdated ? MetricStatus.Watch : MetricStatus.Good}
              label={todayDraftUpdated ? "Draft updated" : "Draft saved"}
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
            <button type="button" className="button-dark" onClick={saveTodayLog}>
              Save readiness check-in
            </button>
            <button type="button" className="button-dark" onClick={resetTrainingInput}>
              Reset inputs
            </button>
          </div>
        </div>

        <div className="quick-control-grid">
          {readinessControls.map((control) => {
            const value = todayDraft[control.field];
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
                    updateTrainingInput(control.field, Number(event.target.value))
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

          <article key={readiness.recommendation} className="compact-signal-card">
            <div>
              <p className="work-title">{readiness.recommendation}</p>
              <p className="info-subtitle">{readiness.recommendationZh}</p>
            </div>
            <span className="signal-chip">{readiness.statusLabel}</span>
          </article>
        </div>
      </SectionCard>

    </div>
  );
}
