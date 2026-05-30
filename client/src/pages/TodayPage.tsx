import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { EvidenceNote } from "../components/EvidenceNote";
import { StatusBadge } from "../components/StatusBadge";
import { calculateReadiness } from "../domain/readiness";
import type { TrainingInput, UserLevel } from "../types/appTypes";
import { SectionCard } from "../components/SectionCard";

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

const initialTrainingInput: TrainingInput = {
  sleepHours: 6.5,
  soreness: 3,
  motivation: 3,
  restingHeartRateDelta: 4,
  previousSessionRpe: 8,
  previousSessionDurationMinutes: 75,
};

const TODAY_TRAINING_INPUT_STORAGE_KEY = "liftops.todayTrainingInput";

function isNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value);
}

// localStorage gives us untyped JSON, so this guard proves the parsed value matches TrainingInput.
function isTrainingInput(value: unknown): value is TrainingInput {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const input = value as Record<string, unknown>;

  return (
    isNumber(input.sleepHours)
    && isNumber(input.soreness)
    && isNumber(input.motivation)
    && isNumber(input.restingHeartRateDelta)
    && isNumber(input.previousSessionRpe)
    && isNumber(input.previousSessionDurationMinutes)
  );
}

function loadTrainingInput() {
  try {
    const savedValue = localStorage.getItem(TODAY_TRAINING_INPUT_STORAGE_KEY);

    if (savedValue === null) {
      return initialTrainingInput;
    }

    // JSON.parse is unsafe because it can throw and because the parsed value has unknown shape.
    const parsedValue: unknown = JSON.parse(savedValue);

    if (isTrainingInput(parsedValue)) {
      return parsedValue;
    }

    return initialTrainingInput;
  } catch {
    return initialTrainingInput;
  }
}

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
  const [trainingInput, setTrainingInput] = useState<TrainingInput>(() => loadTrainingInput());
  const readiness = calculateReadiness(trainingInput);

  useEffect(() => {
    // useEffect runs after React updates state, which makes it the right place to persist UI changes.
    // therefore, if later other places need to update trainingInput, they can just call setTrainingInput 
    // and this effect will take care of persistence in localStorage.
    try {
      localStorage.setItem(TODAY_TRAINING_INPUT_STORAGE_KEY, JSON.stringify(trainingInput));
    } catch {
      // If browser storage is unavailable, keep the app usable and just skip persistence.
    }
  }, [trainingInput]);

  function updateTrainingInput(field: TrainingInputField, value: number) {
    setTrainingInput((currentInput) => ({
      ...currentInput,
      [field]: value,
    }));
  }

  return (
    <div className="page page-stack">
      <header className="log-hero">
        <div className="page-header">
          <p className="eyebrow">Today / 今天</p>
          <h1 className="page-title">Log daily signals and see today&apos;s readiness.</h1>
          <p className="page-subtitle">
            This prototype calculates a simple readiness score from sleep, soreness, motivation,
            resting heart rate change, and the previous session&apos;s RPE.
          </p>
        </div>

        <div className="log-output-stack">
          <div className="log-output-card log-output-card--dark">
            <div className="metric-card-header">
              <p className="log-output-label">Calculated readiness</p>
              <StatusBadge status={readiness.badgeStatus} label={readiness.statusLabel} />
            </div>
            <p className="log-output-value">{readiness.score} / 100</p>
            <p className="log-output-detail">{readiness.statusLabelZh}</p>
          </div>

          <div className="log-output-card">
            <p className="log-output-label">Recommendation</p>
            <p className="log-output-value">{readiness.statusLabel}</p>
            <p className="log-output-detail">{readiness.recommendation}</p>
          </div>
        </div>
      </header>

      <section className="quick-log-shell">
        <div className="quick-log-header">
          <div>
            <p className="section-eyebrow">Controlled inputs</p>
            <h2 className="section-title">Readiness log / 状态记录</h2>
          </div>
          <span className="status-badge status-badge--good">Live calculation</span>
        </div>

        <div className="quick-control-grid">
          {readinessControls.map((control) => {
            const value = trainingInput[control.field];
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

      <SectionCard title="Main drivers" titleZh="主要驱动因素" >
        <div className="compact-card-list">
          {readiness.mainDrivers.map((md) => (
            <article key={md.id} className="compact-signal-card">
              <div>
                <p className="work-title">{md.message}</p>
              </div>
              <span className="signal-chip">{md.reason}</span>
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

      <EvidenceNote title="Readiness is a coaching proxy / 状态分数是训练 proxy" evidenceType="proxy">
        <p>
          This score is a simple training-readiness estimate, not a diagnosis. It combines common
          self-report signals with resting heart rate change and previous session effort.
        </p>
        <p>
          这个分数只是训练状态估计，不是医学诊断。它结合了常见主观状态、静息心率变化和上次训练难度。
        </p>
      </EvidenceNote>
    </div>
  );
}
