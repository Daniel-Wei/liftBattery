import { useState } from "react";
import { ChartMock } from "../components/ChartMock";
import { MetricCard } from "../components/MetricCard";
import { SectionCard } from "../components/SectionCard";
import { StatusBadge } from "../components/StatusBadge";
import {
  formatTrainingTrendWeekLabel,
  getCurrentTrainingTrendWeek,
  getTrainingTrendWeeks,
  getWeeklyEstimatedPrTrend,
  getWeeklyVolumeLoadTrend,
  isSessionInTrainingTrendWeek,
} from "../domain/trainingTrendCharts";
import { useLiftBattery } from "../state/LiftBatteryContext";
import {
  MetricStatus,
  type MuscleGroup,
  type TrainingSession,
  type TrainingSessionForm,
  type MuscleGroupFilter,
} from "../types/appTypes";
import {
    createDefaultTrainingSessionForm,
    getSessionExerciseName,
    getSessionLoad,
    getSessionSetCount,
    getTrainingFormError,
    doesSessionMatchMuscleGroup,
    sortTrainingSessionsNewestFirst,
    buildRealTrainingMetrics,
    getExerciseSummaries,
    getPriorityMuscleSummaries,
} from "../helpers/TrainingPageHelpers";
import { 
  formatWholeNumber, 
  getOptionalNumber, 
  createId } 
  from "../helpers/GenericHelpers";
import { 
  muscleGroupOptions, 
  savedSessionPageSizeOptions 
} from "../data/programValues";

import { TrainingSessionTextField } from "../types/appTypes";

export function TrainingPage() {
  const {
    trainingSessions,
    saveTrainingSession,
    deleteTrainingSession,
    programSettings,
  } = useLiftBattery();

  // #region: states

  // #region: training session form states
  const defaultPrimaryMuscleGroup = programSettings.priorityMuscles[0] ?? "Back";

  const [trainingForm, setTrainingForm] = useState<TrainingSessionForm>(() => (
    createDefaultTrainingSessionForm(defaultPrimaryMuscleGroup)
  ));
  const [formError, setFormError] = useState("");
  // #endregion

  // #region: saved session filter states
  const [selectedMuscleGroupFilter, setSelectedMuscleGroupFilter] = useState<MuscleGroupFilter>("All");

  const trainingTrendWeeks = getTrainingTrendWeeks();
  const [selectedWeekLabel, setSelectedWeekLabel] = useState(() => (
    getCurrentTrainingTrendWeek().label
  ));
  const selectedWeek = trainingTrendWeeks.find((week) => week.label === selectedWeekLabel)
    ?? getCurrentTrainingTrendWeek();

  const [savedSessionPageSize, setSavedSessionPageSize] = useState(5);
  const [savedSessionPage, setSavedSessionPage] = useState(1);
  // #endregion

  // #endregion

  // #region: sorted and filtered saved training sessions: for current training week and muscle group filter
  const weekTrainingSessions = trainingSessions.filter((session) => (
    isSessionInTrainingTrendWeek(session, selectedWeek)
  ));
  const filteredTrainingSessions = weekTrainingSessions.filter((session) => (
    doesSessionMatchMuscleGroup(session, selectedMuscleGroupFilter)
  ));
  const sortedFilteredTrainingSessions = sortTrainingSessionsNewestFirst(filteredTrainingSessions);
  const selectedWeekDisplayLabel = formatTrainingTrendWeekLabel(selectedWeek);
  const latestSession = sortedFilteredTrainingSessions[0] ?? null;

  // #endregion

  // #region: pagination for saved sessions: calculate total pages and slice the filtered sessions to only show the current page
  
  const totalSavedSessionPages = Math.max(
    1,
    Math.ceil(sortedFilteredTrainingSessions.length / savedSessionPageSize),
  );

  const visibleSavedSessionPage = Math.min(savedSessionPage, totalSavedSessionPages);
  const savedSessionStartIndex = (visibleSavedSessionPage - 1) * savedSessionPageSize;

  const latestTrainingSessions = sortedFilteredTrainingSessions.slice(
    savedSessionStartIndex,
    savedSessionStartIndex + savedSessionPageSize,
  );

  // #endregion

  // #region: derive training metrics and summaries from the filtered sessions for the current training week and muscle group filter
  
  const realTrainingMetrics = buildRealTrainingMetrics(sortedFilteredTrainingSessions);
  const mainSessionLoadMetric = realTrainingMetrics[0];
  const secondaryTrainingMetrics = realTrainingMetrics.slice(1);

  const exerciseSummaries = getExerciseSummaries(sortedFilteredTrainingSessions);
  const priorityMuscleSummaries = getPriorityMuscleSummaries(
    sortedFilteredTrainingSessions,
    programSettings.priorityMuscles,
  );

  const volumeLoadTrend = getWeeklyVolumeLoadTrend(sortedFilteredTrainingSessions);
  const estimatedPrTrend = getWeeklyEstimatedPrTrend(sortedFilteredTrainingSessions);

  // #endregion

  // #region: event handlers

  function handleTrainingWeekChange(value: string) {
    const selectedWeekOption = trainingTrendWeeks.find((week) => week.label === value);

    if (selectedWeekOption) {
      setSelectedWeekLabel(selectedWeekOption.label);
      setSavedSessionPage(1);
    }
  }

  function handleMuscleGroupFilterChange(value: MuscleGroup) {
    if (value === "All") {
      setSelectedMuscleGroupFilter("All");
      setSavedSessionPage(1);
      return;
    }

    const selectedMuscleGroup = muscleGroupOptions.find((muscleGroup) => (
      muscleGroup === value
    ));

    if (selectedMuscleGroup) {
      setSelectedMuscleGroupFilter(selectedMuscleGroup);
      setSavedSessionPage(1);
    }
  }

  function handleSavedSessionPageSizeChange(value: number) {
    const nextPageSize = Number(value);
    
    if (savedSessionPageSizeOptions.includes(nextPageSize)) {
      setSavedSessionPageSize(nextPageSize);
      setSavedSessionPage(1);
    }
  }

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

  function handlePrimaryMuscleGroupChange(value: MuscleGroup) {
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
      exerciseName: trainingForm.exerciseName.trim(),
      primaryMuscleGroup: trainingForm.primaryMuscleGroup,
      sets,
      createdAt: now,
      updatedAt: now,
    };

    saveTrainingSession(session);
    setFormError("");
  }

  // #endregion

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
            <StatusBadge status={MetricStatus.Neutral} label={selectedWeekDisplayLabel} />
            <StatusBadge status={MetricStatus.Neutral} label={`${filteredTrainingSessions.length} saved sessions`} />
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
              onChange={(event) => handlePrimaryMuscleGroupChange(event.target.value as MuscleGroup)}
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
          <div className="saved-session-header">
            <div>
              <p className="section-eyebrow">Saved sessions</p>
              <p className="muted-text">
                Filtered by training week and muscle group so the page does not grow forever.
              </p>
            </div>

            <div className="saved-session-controls">
              <label className="training-form-field training-form-field--compact">
                <span className="training-form-label">Training week</span>
                <select
                  className="training-input training-input--compact"
                  value={selectedWeekLabel}
                  onChange={(event) => handleTrainingWeekChange(event.target.value)}
                >
                  {trainingTrendWeeks.map((week) => (
                    <option key={week.label} value={week.label}>
                      {formatTrainingTrendWeekLabel(week)}
                    </option>
                  ))}
                </select>
              </label>

              <label className="training-form-field training-form-field--compact">
                <span className="training-form-label">Muscle</span>
                <select
                  className="training-input training-input--compact"
                  value={selectedMuscleGroupFilter}
                  onChange={(event) => handleMuscleGroupFilterChange(event.target.value as MuscleGroup)}
                >
                  <option value="All">All</option>
                  {muscleGroupOptions.map((muscleGroup) => (
                    <option key={muscleGroup} value={muscleGroup}>{muscleGroup}</option>
                  ))}
                </select>
              </label>

              <label className="training-form-field training-form-field--compact">
                <span className="training-form-label">Page size</span>
                <select
                  className="training-input training-input--compact"
                  value={savedSessionPageSize}
                  onChange={(event) => handleSavedSessionPageSizeChange(Number(event.target.value))}
                >
                  {savedSessionPageSizeOptions.map((pageSize) => (
                    <option key={pageSize} value={pageSize}>{pageSize}</option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <div className="compact-card-list">
            {latestTrainingSessions.length === 0 ? (
              <p className="muted-text">No matching saved training sessions in this week.</p>
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

          <div className="saved-session-pagination">
            <button
              type="button"
              className="text-button"
              disabled={visibleSavedSessionPage === 1}
              onClick={() => setSavedSessionPage(visibleSavedSessionPage - 1)}
            >
              Previous
            </button>
            <span className="pagination-label">
              Page {visibleSavedSessionPage} / {totalSavedSessionPages}
            </span>
            <button
              type="button"
              className="text-button"
              disabled={visibleSavedSessionPage === totalSavedSessionPages}
              onClick={() => setSavedSessionPage(visibleSavedSessionPage + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </SectionCard>

      {/* Analysis sections only appear after saved training data exists. */}
      {filteredTrainingSessions.length > 0 ? (
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
      ) : (
        <SectionCard title="No training analysis yet" titleZh="暂无训练分析" eyebrow="Needs saved data">
          <p className="body-text">
            Save a session above first. This page will only show analysis that can be derived
            from saved training data.
          </p>
        </SectionCard>
      )}

    </div>
  );
}
