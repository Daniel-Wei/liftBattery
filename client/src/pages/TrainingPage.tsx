import { useState } from "react";
import { ChartMock } from "../components/ChartMock";
import { EvidenceNote } from "../components/EvidenceNote";
import { MetricCard } from "../components/MetricCard";
import { SectionCard } from "../components/SectionCard";
import { StatusBadge } from "../components/StatusBadge";
import { useTrainingLog } from "../state/TrainingLogContext";
import {
  EvidenceType,
  MetricStatus,
  TrendDirection,
  type Metric,
  type MuscleGroup,
  type SetEntry,
  type TrainingSession,
  type TrendPoint,
  type UserLevel,
} from "../types/appTypes";

type TrainingPageProps = {
  selectedLevel: UserLevel;
};

// The form keeps input values as strings so users can freely edit number fields before saving.
type TrainingSessionForm = {
  date: string;
  durationMinutes: string;
  sessionRpe: string;
  exerciseName: string;
  primaryMuscleGroup: MuscleGroup;
  setsCount: string;
  reps: string;
  weightKg: string;
  setRpe: string;
  rir: string;
};

type TrainingSessionTextField =
  | "date"
  | "durationMinutes"
  | "sessionRpe"
  | "exerciseName"
  | "setsCount"
  | "reps"
  | "weightKg"
  | "setRpe"
  | "rir";

type ExerciseSummary = {
  key: string;
  exerciseName: string;
  muscleGroups: string;
  sessions: number;
  sets: number;
  volumeLoad: number;
};

type MuscleSummary = {
  muscleGroup: MuscleGroup;
  hardSets: number;
  volumeLoad: number;
};

const muscleGroupOptions: MuscleGroup[] = [
  "Chest",
  "Back",
  "Shoulders",
  "Biceps",
  "Triceps",
  "Quads",
  "Hamstrings",
  "Glutes",
  "Calves",
  "Abs",
];

function getLocalDateString() {
  return new Date().toISOString().slice(0, 10);
}

function createId(prefix: string) {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.round(Math.random() * 100000)}`;
}

function createDefaultTrainingSessionForm(primaryMuscleGroup: MuscleGroup): TrainingSessionForm {
  return {
    date: getLocalDateString(),
    durationMinutes: "60",
    sessionRpe: "7",
    exerciseName: "Squat",
    primaryMuscleGroup,
    setsCount: "3",
    reps: "8",
    weightKg: "60",
    setRpe: "8",
    rir: "",
  };
}

function getOptionalNumber(value: string) {
  if (value.trim() === "") {
    return undefined;
  }

  return Number(value);
}

// Validates the simple post-workout form before it becomes a typed TrainingSession.
function getTrainingFormError(form: TrainingSessionForm) {
  const durationMinutes = Number(form.durationMinutes);
  const sessionRpe = Number(form.sessionRpe);
  const setsCount = Number(form.setsCount);
  const reps = Number(form.reps);
  const weightKg = Number(form.weightKg);
  const setRpe = getOptionalNumber(form.setRpe);
  const rir = getOptionalNumber(form.rir);

  if (form.date.trim() === "") {
    return "Please choose a session date.";
  }

  if (form.exerciseName.trim() === "") {
    return "Please enter an exercise name.";
  }

  if (!Number.isFinite(durationMinutes) || durationMinutes <= 0) {
    return "Duration must be greater than 0 minutes.";
  }

  if (!Number.isFinite(sessionRpe) || sessionRpe < 1 || sessionRpe > 10) {
    return "Session RPE must be between 1 and 10.";
  }

  if (!Number.isInteger(setsCount) || setsCount <= 0) {
    return "Sets must be a whole number greater than 0.";
  }

  if (!Number.isFinite(reps) || reps <= 0) {
    return "Reps must be greater than 0.";
  }

  if (!Number.isFinite(weightKg) || weightKg < 0) {
    return "Weight must be 0 kg or higher.";
  }

  if (setRpe !== undefined && (!Number.isFinite(setRpe) || setRpe < 1 || setRpe > 10)) {
    return "Set RPE must be blank or between 1 and 10.";
  }

  if (rir !== undefined && (!Number.isFinite(rir) || rir < 0)) {
    return "RIR must be blank or 0 or higher.";
  }

  return null;
}

// Newest-first sorting makes the "latest session" card stable and predictable.
function sortTrainingSessionsNewestFirst(trainingSessions: TrainingSession[]) {
  return [...trainingSessions].sort((firstSession, secondSession) => (
    secondSession.date.localeCompare(firstSession.date)
    || secondSession.updatedAt.localeCompare(firstSession.updatedAt)
  ));
}

// Session load follows the common session-RPE method: session RPE x duration minutes.
function getSessionLoad(session: TrainingSession) {
  return session.durationMinutes * session.sessionRpe;
}

function getSessionExerciseName(session: TrainingSession) {
  return session.exercises[0]?.exerciseName ?? "Training session";
}

function getWorkingSets(session: TrainingSession) {
  return session.exercises.flatMap((exercise) => (
    exercise.sets.filter((set) => !set.isWarmup)
  ));
}

// Hard set is a product rule for display, not a medical or physiological diagnosis.
function isHardSet(set: SetEntry) {
  if (set.isWarmup) {
    return false;
  }

  if (set.rir !== undefined) {
    return set.rir <= 3;
  }

  if (set.rpe !== undefined) {
    return set.rpe >= 7;
  }

  return set.reps > 0;
}

function getSessionHardSetCount(session: TrainingSession) {
  return getWorkingSets(session).filter(isHardSet).length;
}

function getSessionSetCount(session: TrainingSession) {
  return getWorkingSets(session).length;
}

function getSessionVolumeLoad(session: TrainingSession) {
  return getWorkingSets(session).reduce((totalVolume, set) => (
    totalVolume + (set.reps * set.weightKg)
  ), 0);
}

function getTotalHardSetCount(trainingSessions: TrainingSession[]) {
  return trainingSessions.reduce((totalSets, session) => (
    totalSets + getSessionHardSetCount(session)
  ), 0);
}

function getTotalVolumeLoad(trainingSessions: TrainingSession[]) {
  return trainingSessions.reduce((totalVolume, session) => (
    totalVolume + getSessionVolumeLoad(session)
  ), 0);
}

function formatWholeNumber(value: number) {
  return Math.round(value).toLocaleString("en-US");
}

function formatDecimal(value: number) {
  return Number.isInteger(value) ? value.toString() : value.toFixed(1);
}

function getTopSetEffortValue(trainingSessions: TrainingSession[]) {
  const workingSets = trainingSessions.flatMap(getWorkingSets);
  const rpeValues = workingSets
    .filter((set) => set.rpe !== undefined)
    .map((set) => set.rpe ?? 0);

  if (rpeValues.length > 0) {
    return `RPE ${formatDecimal(Math.max(...rpeValues))}`;
  }

  const rirValues = workingSets
    .filter((set) => set.rir !== undefined)
    .map((set) => set.rir ?? 0);

  if (rirValues.length > 0) {
    return `${formatDecimal(Math.min(...rirValues))} RIR`;
  }

  return "No effort data";
}

function getTopSetEffortStatus(topSetEffort: string) {
  if (topSetEffort === "No effort data") {
    return MetricStatus.Neutral;
  }

  if (topSetEffort.startsWith("RPE ")) {
    const rpe = Number(topSetEffort.replace("RPE ", ""));
    return rpe >= 9 ? MetricStatus.Watch : MetricStatus.Good;
  }

  const rir = Number(topSetEffort.replace(" RIR", ""));
  return rir <= 1 ? MetricStatus.Watch : MetricStatus.Good;
}

// Converts saved sessions into the metric-card shape used by the Training page.
function buildRealTrainingMetrics(trainingSessions: TrainingSession[]): Metric[] {
  const sortedSessions = sortTrainingSessionsNewestFirst(trainingSessions);
  const latestSession = sortedSessions[0] ?? null;
  const hardSets = getTotalHardSetCount(sortedSessions);
  const volumeLoad = getTotalVolumeLoad(sortedSessions);
  const topSetEffort = getTopSetEffortValue(sortedSessions);

  return [
    {
      label: "Latest Session Load",
      labelZh: "最近训练负荷",
      value: latestSession ? `${formatWholeNumber(getSessionLoad(latestSession))} AU` : "No session",
      trend: latestSession ? TrendDirection.Up : TrendDirection.Stable,
      status: latestSession && getSessionLoad(latestSession) >= 600
        ? MetricStatus.Watch
        : MetricStatus.Neutral,
      evidenceType: EvidenceType.Established,
      explanation: "Calculated only from saved training sessions: session RPE x duration.",
      explanationZh: "只从已保存训练记录计算：session RPE x 训练时长。",
    },
    {
      label: "Latest Session Time",
      labelZh: "最近训练时长",
      value: latestSession ? `${latestSession.durationMinutes} min` : "No session",
      trend: TrendDirection.Stable,
      status: latestSession ? MetricStatus.Good : MetricStatus.Neutral,
      evidenceType: EvidenceType.SimpleArithmetic,
      explanation: "Uses the duration field from the latest saved session.",
      explanationZh: "使用最近一条已保存训练记录里的训练时长。",
    },
    {
      label: "Latest Session RPE",
      labelZh: "最近训练 RPE",
      value: latestSession ? `${latestSession.sessionRpe} / 10` : "No session",
      trend: latestSession && latestSession.sessionRpe >= 8
        ? TrendDirection.Up
        : TrendDirection.Stable,
      status: latestSession && latestSession.sessionRpe >= 8
        ? MetricStatus.Watch
        : MetricStatus.Neutral,
      evidenceType: EvidenceType.Established,
      explanation: "Uses the session RPE field from the latest saved session.",
      explanationZh: "使用最近一条已保存训练记录里的 session RPE。",
    },
    {
      label: "Saved Hard Sets",
      labelZh: "已保存 hard sets",
      value: `${hardSets}`,
      trend: hardSets > 0 ? TrendDirection.Up : TrendDirection.Stable,
      status: hardSets > 0 ? MetricStatus.Good : MetricStatus.Neutral,
      evidenceType: EvidenceType.SimpleArithmetic,
      explanation: "Counts saved non-warmup sets that are hard enough by RPE or RIR.",
      explanationZh: "统计已保存训练中按 RPE 或 RIR 判断足够接近力竭的非热身组。",
    },
    {
      label: "Saved Volume Load",
      labelZh: "已保存训练量",
      value: `${formatWholeNumber(volumeLoad)} kg`,
      trend: volumeLoad > 0 ? TrendDirection.Up : TrendDirection.Stable,
      status: volumeLoad > 0 ? MetricStatus.Good : MetricStatus.Neutral,
      evidenceType: EvidenceType.Established,
      explanation: "Sums reps x weight across saved non-warmup sets.",
      explanationZh: "汇总已保存非热身组的 次数 x 重量。",
    },
    {
      label: "Top Set Effort",
      labelZh: "顶组努力程度",
      value: topSetEffort,
      trend: topSetEffort === "No effort data" ? TrendDirection.Stable : TrendDirection.Up,
      status: getTopSetEffortStatus(topSetEffort),
      evidenceType: EvidenceType.Established,
      explanation: "Uses saved set RPE first, then saved RIR if RPE is missing.",
      explanationZh: "优先使用已保存的单组 RPE；没有 RPE 时使用 RIR。",
    },
  ];
}

// Groups saved sessions by exercise so the page can show what the user actually trained.
function getExerciseSummaries(trainingSessions: TrainingSession[]) {
  const summaryMap = new Map<string, ExerciseSummary>();

  trainingSessions.forEach((session) => {
    session.exercises.forEach((exercise) => {
      const key = `${exercise.exerciseName}-${exercise.primaryMuscleGroups.join("-")}`;
      const existingSummary = summaryMap.get(key);
      const workingSets = exercise.sets.filter((set) => !set.isWarmup);
      const volumeLoad = workingSets.reduce((totalVolume, set) => (
        totalVolume + (set.reps * set.weightKg)
      ), 0);

      if (existingSummary) {
        existingSummary.sessions += 1;
        existingSummary.sets += workingSets.length;
        existingSummary.volumeLoad += volumeLoad;
        return;
      }

      summaryMap.set(key, {
        key,
        exerciseName: exercise.exerciseName,
        muscleGroups: exercise.primaryMuscleGroups.join(", "),
        sessions: 1,
        sets: workingSets.length,
        volumeLoad,
      });
    });
  });

  return [...summaryMap.values()].sort((firstSummary, secondSummary) => (
    secondSummary.volumeLoad - firstSummary.volumeLoad
  ));
}

// Shows whether saved sets are landing on the user's configured priority muscles.
function getPriorityMuscleSummaries(
  trainingSessions: TrainingSession[],
  priorityMuscles: MuscleGroup[],
) {
  return priorityMuscles.map((muscleGroup) => {
    const summary = trainingSessions.reduce<MuscleSummary>((currentSummary, session) => {
      session.exercises.forEach((exercise) => {
        if (!exercise.primaryMuscleGroups.includes(muscleGroup)) {
          return;
        }

        const workingSets = exercise.sets.filter((set) => !set.isWarmup);
        currentSummary.hardSets += workingSets.filter(isHardSet).length;
        currentSummary.volumeLoad += workingSets.reduce((totalVolume, set) => (
          totalVolume + (set.reps * set.weightKg)
        ), 0);
      });

      return currentSummary;
    }, {
      muscleGroup,
      hardSets: 0,
      volumeLoad: 0,
    });

    return summary;
  });
}

// Charts should only use saved training sessions, not mock trend data.
function getSessionLoadTrend(trainingSessions: TrainingSession[]): TrendPoint[] {
  let sessionLoadByDates: { [key: string]: number } = {};

  sortTrainingSessionsNewestFirst(trainingSessions).forEach((session) => {
    const sessionLoad = getSessionLoad(session);
    if(sessionLoadByDates[session.date]) {
      sessionLoadByDates[session.date] += sessionLoad;
    }else {
      sessionLoadByDates[session.date] = sessionLoad;
    }
  });

  return Object.entries(sessionLoadByDates)
    .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
    .slice(-7)
    .map(([date, load]) => ({
      label: date.slice(5),
      value: load,
    }));
};

// Volume load trend is reps x weight, grouped by saved session.
function getVolumeLoadTrend(trainingSessions: TrainingSession[]): TrendPoint[] {
  let volumeLoadByDates: { [key: string]: number } = {};

  sortTrainingSessionsNewestFirst(trainingSessions).forEach((session) => {
    const volumeLoad = getSessionVolumeLoad(session);
    if(volumeLoadByDates[session.date]) {
      volumeLoadByDates[session.date] += volumeLoad;
    }else {
      volumeLoadByDates[session.date] = volumeLoad;
    }
  });

  return Object.entries(volumeLoadByDates)
    .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
    .slice(-7)
    .map(([date, load]) => ({
      label: date.slice(5),
      value: load,
    }));
}

export function TrainingPage(_props: TrainingPageProps) {
  // TrainingLogContext is the real data source for this page.
  const {
    trainingSessions,
    saveTrainingSession,
    deleteTrainingSession,
    programSettings,
  } = useTrainingLog();
  const defaultPrimaryMuscleGroup = programSettings.priorityMuscles[0] ?? "Back";
  const [trainingForm, setTrainingForm] = useState<TrainingSessionForm>(() => (
    createDefaultTrainingSessionForm(defaultPrimaryMuscleGroup)
  ));
  const [formError, setFormError] = useState("");
  // Everything below is derived from saved sessions so the page does not mix mock analysis with real logs.
  const sortedTrainingSessions = sortTrainingSessionsNewestFirst(trainingSessions);
  const latestSession = sortedTrainingSessions[0] ?? null;
  const latestTrainingSessions = sortedTrainingSessions.slice(0, 5);
  const realTrainingMetrics = buildRealTrainingMetrics(sortedTrainingSessions);
  const mainSessionLoadMetric = realTrainingMetrics[0];
  const secondaryTrainingMetrics = realTrainingMetrics.slice(1);
  const exerciseSummaries = getExerciseSummaries(sortedTrainingSessions);
  const priorityMuscleSummaries = getPriorityMuscleSummaries(
    sortedTrainingSessions,
    programSettings.priorityMuscles,
  );
  const sessionLoadTrend = getSessionLoadTrend(sortedTrainingSessions);
  const volumeLoadTrend = getVolumeLoadTrend(sortedTrainingSessions);

  function updateTrainingFormTextField(field: TrainingSessionTextField, value: string) {
    setTrainingForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  }

  function updatePrimaryMuscleGroup(value: MuscleGroup) {
    setTrainingForm((currentForm) => ({
      ...currentForm,
      primaryMuscleGroup: value,
    }));
  }

  function handlePrimaryMuscleGroupChange(value: string) {
    const selectedMuscleGroup = muscleGroupOptions.find((muscleGroup) => (
      muscleGroup === value
    ));

    if (selectedMuscleGroup) {
      updatePrimaryMuscleGroup(selectedMuscleGroup);
    }
  }

  function handleSaveTrainingSession() {
    const nextError = getTrainingFormError(trainingForm);

    if (nextError !== null) {
      setFormError(nextError);
      return;
    }

    const durationMinutes = Number(trainingForm.durationMinutes);
    const sessionRpe = Number(trainingForm.sessionRpe);
    const setsCount = Number(trainingForm.setsCount);
    const reps = Number(trainingForm.reps);
    const weightKg = Number(trainingForm.weightKg);
    const setRpe = getOptionalNumber(trainingForm.setRpe);
    const rir = getOptionalNumber(trainingForm.rir);
    const now = new Date().toISOString();
    // Keep the first real training log simple: one exercise with repeated working sets.
    const sets = Array.from({ length: setsCount }, (_item, index) => ({
      id: createId(`set-${index + 1}`),
      reps,
      weightKg,
      ...(setRpe === undefined ? {} : { rpe: setRpe }),
      ...(rir === undefined ? {} : { rir }),
      isWarmup: false,
    }));
    const session: TrainingSession = {
      id: createId("session"),
      date: trainingForm.date,
      durationMinutes,
      sessionRpe,
      exercises: [
        {
          id: createId("exercise"),
          exerciseName: trainingForm.exerciseName.trim(),
          primaryMuscleGroups: [trainingForm.primaryMuscleGroup],
          sets,
        },
      ],
      createdAt: now,
      updatedAt: now,
    };

    saveTrainingSession(session);
    setFormError("");
  }

  return (
    <div className="page page-stack">
      {/* Main output: the highest-level training signal from the latest saved session. */}
      <header className="dashboard-hero">
        <div className="dashboard-title-row">
          <div>
            <p className="landing-eyebrow">Training / 训练</p>
            <h1 className="page-title">Saved training data only.</h1>
            <p className="page-subtitle">
              Training analysis below is derived from sessions you save here. If a signal has no data source yet, it is not shown.
            </p>
          </div>
        </div>

        <div className="battery-focus-panel training-load-panel">
          <div className="battery-panel-badges">
            <StatusBadge status={mainSessionLoadMetric.status} label={mainSessionLoadMetric.evidenceType} />
            <StatusBadge status={MetricStatus.Neutral} label={`${trainingSessions.length} saved sessions`} />
          </div>

          <div className="training-load-summary">
            <p className="battery-focus-eyebrow">Latest training output / 最近训练输出</p>
            <div className="training-load-detail-row">
              <p className="training-load-exercise">
                {latestSession ? getSessionExerciseName(latestSession) : "No saved session"}
              </p>
              {latestSession && 
                 <p className="training-load-value">
                  {mainSessionLoadMetric.value}
                </p>
              }
              <div className="training-load-copy">
                <p className="battery-focus-detail">
                  {latestSession
                    ? `${latestSession.date} - RPE ${latestSession.sessionRpe} - ${latestSession.durationMinutes} min`
                    : "Save one completed session below."}
                </p>
              </div>
            </div>
          </div>

          <div className="battery-focus-meta">
            <div>
              <p className="battery-meta-label">Session RPE</p>
              <p className="battery-meta-value">
                {latestSession ? `${latestSession.sessionRpe} / 10` : "--"}
              </p>
            </div>
            <div>
              <p className="battery-meta-label">Duration</p>
              <p className="battery-meta-value">
                {latestSession ? `${latestSession.durationMinutes} min` : "--"}
              </p>
            </div>
            <div>
              <p className="battery-meta-label">Priority</p>
              <p className="battery-meta-value">{programSettings.priorityMuscles.join(", ")}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Secondary metrics: still real data, but less important than the main session-load readout. */}
      <section className="metric-grid">
        {secondaryTrainingMetrics.map((metric) => (
          <MetricCard key={metric.label} metric={metric} />
        ))}
      </section>

      {/* Input section: saves one real post-workout session into TrainingLogContext. */}
      <SectionCard title="Save training session" titleZh="保存训练记录" eyebrow="Post-workout log">
        <div className="training-session-intro">
          <p className="body-text">
            Save one completed exercise after training. This feeds session load and hard-set
            context without becoming a full workout builder yet.
          </p>
          <StatusBadge
            status={MetricStatus.Neutral}
            label={`Priority: ${programSettings.priorityMuscles.join(", ")}`}
          />
        </div>

        <div className="training-session-form">
          <label className="training-form-field">
            <span className="training-form-label">Date / 日期</span>
            <input
              className="training-input"
              type="date"
              value={trainingForm.date}
              onChange={(event) => updateTrainingFormTextField("date", event.target.value)}
            />
          </label>

          <label className="training-form-field">
            <span className="training-form-label">Duration minutes / 训练时长</span>
            <input
              className="training-input"
              type="number"
              min="1"
              value={trainingForm.durationMinutes}
              onChange={(event) => updateTrainingFormTextField("durationMinutes", event.target.value)}
            />
          </label>

          <label className="training-form-field">
            <span className="training-form-label">Session RPE / 训练难度</span>
            <input
              className="training-input"
              type="number"
              min="1"
              max="10"
              step="0.5"
              value={trainingForm.sessionRpe}
              onChange={(event) => updateTrainingFormTextField("sessionRpe", event.target.value)}
            />
          </label>

          <label className="training-form-field">
            <span className="training-form-label">Exercise / 动作</span>
            <input
              className="training-input"
              type="text"
              value={trainingForm.exerciseName}
              onChange={(event) => updateTrainingFormTextField("exerciseName", event.target.value)}
            />
          </label>

          <label className="training-form-field">
            <span className="training-form-label">Primary muscle / 主要肌群</span>
            <select
              className="training-input"
              value={trainingForm.primaryMuscleGroup}
              onChange={(event) => handlePrimaryMuscleGroupChange(event.target.value)}
            >
              {muscleGroupOptions.map((muscleGroup) => (
                <option key={muscleGroup} value={muscleGroup}>{muscleGroup}</option>
              ))}
            </select>
          </label>

          <label className="training-form-field">
            <span className="training-form-label">Sets / 组数</span>
            <input
              className="training-input"
              type="number"
              min="1"
              step="1"
              value={trainingForm.setsCount}
              onChange={(event) => updateTrainingFormTextField("setsCount", event.target.value)}
            />
          </label>

          <label className="training-form-field">
            <span className="training-form-label">Reps / 次数</span>
            <input
              className="training-input"
              type="number"
              min="1"
              value={trainingForm.reps}
              onChange={(event) => updateTrainingFormTextField("reps", event.target.value)}
            />
          </label>

          <label className="training-form-field">
            <span className="training-form-label">Weight kg / 重量</span>
            <input
              className="training-input"
              type="number"
              min="0"
              step="0.5"
              value={trainingForm.weightKg}
              onChange={(event) => updateTrainingFormTextField("weightKg", event.target.value)}
            />
          </label>

          <label className="training-form-field">
            <span className="training-form-label">Set RPE optional / 单组 RPE</span>
            <input
              className="training-input"
              type="number"
              min="1"
              max="10"
              step="0.5"
              value={trainingForm.setRpe}
              onChange={(event) => updateTrainingFormTextField("setRpe", event.target.value)}
            />
          </label>

          <label className="training-form-field">
            <span className="training-form-label">RIR optional / 剩余次数</span>
            <input
              className="training-input"
              type="number"
              min="0"
              step="0.5"
              value={trainingForm.rir}
              onChange={(event) => updateTrainingFormTextField("rir", event.target.value)}
            />
          </label>
        </div>

        <div className="training-form-actions">
          <button type="button" className="button-dark" onClick={handleSaveTrainingSession}>
            Save session
          </button>
          {formError ? <p className="form-error" role="alert">{formError}</p> : null}
        </div>

        <div className="saved-session-block">
          <p className="section-eyebrow">Latest saved sessions</p>
          <div className="compact-card-list">
            {latestTrainingSessions.length === 0 ? (
              <p className="muted-text">No saved training sessions yet.</p>
            ) : latestTrainingSessions.map((session) => (
              <article key={session.id} className="compact-signal-card saved-session-card">
                <div>
                  <p className="work-title">{getSessionExerciseName(session)}</p>
                  <p className="info-subtitle">
                    {session.date} - RPE {session.sessionRpe} - {session.durationMinutes} min
                  </p>
                </div>
                <div className="saved-session-actions">
                  <span className="signal-chip">{getSessionLoad(session)} AU</span>
                  <span className="signal-chip signal-chip--muted">
                    {getSessionSetCount(session)} sets
                  </span>
                  <button
                    type="button"
                    className="text-button"
                    onClick={() => deleteTrainingSession(session.id)}
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </SectionCard>

      {/* Analysis sections only appear after saved training data exists. */}
      {trainingSessions.length > 0 ? (
        <div className="two-column">
          <SectionCard title="Saved exercise summary" titleZh="已保存动作总结" eyebrow="Real session data">
            <div className="compact-card-list">
              {exerciseSummaries.map((summary) => (
                <article key={summary.key} className="compact-signal-card">
                  <div>
                    <p className="work-title">{summary.exerciseName}</p>
                    <p className="info-subtitle">{summary.muscleGroups}</p>
                  </div>
                  <div className="saved-session-actions">
                    <span className="signal-chip">{summary.sets} sets</span>
                    <span className="signal-chip signal-chip--muted">
                      {formatWholeNumber(summary.volumeLoad)} kg
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Priority muscle work" titleZh="重点肌群训练" eyebrow="From saved sets">
            <div className="compact-card-list">
              {priorityMuscleSummaries.map((summary) => (
                <article key={summary.muscleGroup} className="compact-signal-card">
                  <div>
                    <p className="work-title">{summary.muscleGroup}</p>
                    <p className="info-subtitle">Saved hard sets and volume load</p>
                  </div>
                  <div className="saved-session-actions">
                    <span className="signal-chip">{summary.hardSets} hard sets</span>
                    <span className="signal-chip signal-chip--muted">
                      {formatWholeNumber(summary.volumeLoad)} kg
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </SectionCard>
        </div>
      ) : (
        <SectionCard title="No training analysis yet" titleZh="暂无训练分析" eyebrow="Needs saved data">
          <p className="body-text">
            Save a session above first. This page will only show analysis that can be derived
            from saved training data.
          </p>
        </SectionCard>
      )}

      {/* Trend charts are hidden until there is at least one saved session. */}
      {sessionLoadTrend.length > 0 ? (
        <div className="two-column">
          <ChartMock
            title="Saved session load trend"
            titleZh="已保存训练负荷趋势"
            data={sessionLoadTrend}
            variant="dark"
          />
          <ChartMock
            title="Saved volume load trend"
            titleZh="已保存训练量趋势"
            data={volumeLoadTrend}
            variant="amber"
          />
        </div>
      ) : null}

      <EvidenceNote title="Training page data boundary / 训练页数据边界" evidenceType={EvidenceType.Established}>
        <p>
          Every card on this page now comes from saved training sessions. Session load uses
          session RPE x duration, hard sets use saved RPE/RIR, and volume load uses reps x weight.
        </p>
        <p>
          本页所有卡片都来自已保存训练记录。训练负荷使用 session RPE x 时长，hard sets 使用已保存 RPE/RIR，训练量使用次数 x 重量。
        </p>
      </EvidenceNote>
    </div>
  );
}
