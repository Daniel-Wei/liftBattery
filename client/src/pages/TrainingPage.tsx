import { Fragment, useEffect, useState } from "react";
import { MetricCard } from "../components/MetricCard";
import { SectionCard } from "../components/SectionCard";
import { StatusBadge } from "../components/StatusBadge";
import {
  formatTrainingTrendWeekLabel,
  getCurrentTrainingTrendWeek,
  getTrainingTrendWeeks,
  isSessionInTrainingTrendWeek
} from "../domain/trainingTrendCharts";
import {
  MetricStatus,
  type MuscleGroup,
  type MuscleGroupFilter,
} from "../types/appTypes";
import {
  buildRealTrainingMetrics,
  doesSessionMatchMuscleGroup,
  getTrainingDayGroups,
  getTrainingFormError,
  getPriorityMuscleSummaries,
  sortTrainingSessionsNewestFirst,
  type TrainingDayGroup,
} from "../helpers/TrainingPageHelpers";
import {
  formatWholeNumber,
  getOptionalNumber,
} from "../helpers/GenericHelpers";
import {
  getDefaultExerciseForMuscleGroup,
  getExerciseOptionsForMuscleGroup,
  muscleGroupOptions,
} from "../data/programValues";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  clearTrainingErrorMessage,
  clearTrainingSuccessMessage,
  deleteTrainingSession,
  fetchTrainingSessions,
  saveTrainingSession,
  updateTrainingSessionDraft,
} from "../store/slices/trainingSlice";
import { selectProgramSettings } from "../store/selectors/programSettingsSelector";
import { getTrainingData, selectTrainingSessions } from "../store/selectors/trainingSelector";
import { TRAINING_SESSIONS_STORAGE_KEY } from "../data/localStorageKeys";

function formatDisplayDate(date: string) {
  const [year, month, day] = date.split("-");

  if (!year || !month || !day) {
    return date;
  }

  return `${day}/${month}/${year}`;
}

function getTrainingDayExerciseLabel(dayGroup: TrainingDayGroup) {
  const exerciseNames = dayGroup.muscles.flatMap((muscleGroup) => (
    muscleGroup.exercises.map((exercise) => exercise.exerciseName)
  ));

  if (exerciseNames.length === 0) {
    return "No exercise";
  }

  return exerciseNames.length === 1 ? exerciseNames[0] : `${exerciseNames.length} exercises`;
}

export function TrainingPage() {
  const dispatch = useAppDispatch();
  const programSettings = useAppSelector(selectProgramSettings);
  const trainingSessions = useAppSelector(selectTrainingSessions);
  const {
    trainingSessionDraft,
    error,
    pendingOperation,
    pendingMessage,
    successMessage,
    operationErrorMessage,
  } = useAppSelector(getTrainingData);

  // #region local states
  const [formError, setFormError] = useState("");
  const [selectedMuscleGroupFilter, setSelectedMuscleGroupFilter] = useState<MuscleGroupFilter>("All");
  const trainingTrendWeeks = getTrainingTrendWeeks();
  const [selectedWeekLabel, setSelectedWeekLabel] = useState(() => (
    getCurrentTrainingTrendWeek().label
  ));
  const selectedWeek = trainingTrendWeeks.find((week) => week.label === selectedWeekLabel)
    ?? getCurrentTrainingTrendWeek();

  const [collapsedTrainingGroupKeys, setCollapsedTrainingGroupKeys] = useState<Set<string>>(() => new Set());
  // #endregion

  // #region: useEffect -> get saved training sessions in range + update localstorage when sessions updated
  useEffect(() => {
    void dispatch(fetchTrainingSessions({
      from: selectedWeek.startDate,
      to: selectedWeek.endDate,
    }));
  }, [dispatch, selectedWeek.startDate, selectedWeek.endDate]);

  useEffect(() => {
    try {
      localStorage.setItem(
        TRAINING_SESSIONS_STORAGE_KEY,
        JSON.stringify(trainingSessions),
      );
    } catch {
      // Keep UI usable if localStorage is unavailable.
    }
  }, [trainingSessions]);

  useEffect(() => {
    if (!successMessage) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      dispatch(clearTrainingSuccessMessage());
    }, 1800);

    return () => window.clearTimeout(timeoutId);
  }, [dispatch, successMessage]);

  useEffect(() => {
    if (!operationErrorMessage) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      dispatch(clearTrainingErrorMessage());
    }, 4200);

    return () => window.clearTimeout(timeoutId);
  }, [dispatch, operationErrorMessage]);
  // #endregion
  
  // #region: filtered sessions setup
  const weekTrainingSessions = trainingSessions.filter((session) => (
    isSessionInTrainingTrendWeek(session, selectedWeek)
  ));

  const filteredTrainingSessions = weekTrainingSessions.filter((session) => (
    doesSessionMatchMuscleGroup(session, selectedMuscleGroupFilter)
  ));
  const sortedFilteredTrainingSessions = sortTrainingSessionsNewestFirst(filteredTrainingSessions);
  const selectedWeekDisplayLabel = formatTrainingTrendWeekLabel(selectedWeek);
  const trainingDayGroups = getTrainingDayGroups(sortedFilteredTrainingSessions);
  const latestTrainingDay = trainingDayGroups[0] ?? null;
  // #endregion

  // #region: training metrics setup
  const realTrainingMetrics = buildRealTrainingMetrics(sortedFilteredTrainingSessions);
  const mainSessionLoadMetric = realTrainingMetrics[0];
  const secondaryTrainingMetrics = realTrainingMetrics.slice(1);
  const priorityMuscleSummaries = getPriorityMuscleSummaries(
    sortedFilteredTrainingSessions,
    programSettings.priorityMuscles,
  );
  const selectedExerciseOptions = getExerciseOptionsForMuscleGroup(trainingSessionDraft.primaryMuscleGroup);
  const isSavingTrainingSession = pendingOperation === "save";
  // #endregion

  // #region: helpers
  function getTrainingWeekForDate(date: string) {
    return trainingTrendWeeks.find((week) => (
      date >= week.startDate && date <= week.endDate
    ));
  }

  function handleTrainingDateDraftChange(value: string) {
    dispatch(updateTrainingSessionDraft({ field: "date", value }));

    const dateWeek = getTrainingWeekForDate(value);

    if (dateWeek) {
      setSelectedWeekLabel(dateWeek.label);
    }
  }

  function handleTrainingWeekChange(value: string) {
    const selectedWeekOption = trainingTrendWeeks.find((week) => week.label === value);

    if (selectedWeekOption) {
      setSelectedWeekLabel(selectedWeekOption.label);
      dispatch(updateTrainingSessionDraft({ field: "date", value: selectedWeekOption.startDate }));
    }
  }

  function handleMuscleGroupFilterChange(value: MuscleGroup) {
    if (value === "All") {
      setSelectedMuscleGroupFilter("All");
      return;
    }

    const selectedMuscleGroup = muscleGroupOptions.find((muscleGroup) => (
      muscleGroup === value
    ));

    if (selectedMuscleGroup) {
      setSelectedMuscleGroupFilter(selectedMuscleGroup);
    }
  }

  function handlePrimaryMuscleGroupDraftChange(value: MuscleGroup) {
    const selectedMuscleGroup = muscleGroupOptions.find((muscleGroup) => muscleGroup === value);

    if (!selectedMuscleGroup) {
      return;
    }

    dispatch(updateTrainingSessionDraft({ field: "primaryMuscleGroup", value: selectedMuscleGroup }));
    dispatch(updateTrainingSessionDraft({
      field: "exerciseName",
      value: getDefaultExerciseForMuscleGroup(selectedMuscleGroup),
    }));
  }

  function handleSaveTrainingSession() {
    const nextError = getTrainingFormError(trainingSessionDraft);

    if (nextError !== null) {
      setFormError(nextError);
      return;
    }

    setFormError("");
    void dispatch(saveTrainingSession());
  }

  function handleDeleteSessionIds(sessionIds: string[]) {
    sessionIds.forEach((sessionId) => {
      void dispatch(deleteTrainingSession(sessionId));
    });
  }

  function isTrainingGroupCollapsed(groupKey: string) {
    return collapsedTrainingGroupKeys.has(groupKey);
  }

  function toggleTrainingGroup(groupKey: string) {
    setCollapsedTrainingGroupKeys((currentKeys) => {
      const nextKeys = new Set(currentKeys);

      if (nextKeys.has(groupKey)) {
        nextKeys.delete(groupKey);
      } else {
        nextKeys.add(groupKey);
      }

      return nextKeys;
    });
  }
  //#endregion

  return (
    <div className="page page-stack">
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
            <StatusBadge status={MetricStatus.Neutral} label={`${trainingDayGroups.length} training days`} />
          </div>

          <div className="training-load-summary">
            <p className="battery-focus-eyebrow">Latest training output / 最近训练输出</p>
            <div className="training-load-detail-row">
              <p className="training-load-exercise">
                {latestTrainingDay ? getTrainingDayExerciseLabel(latestTrainingDay) : "No saved session"}
              </p>
              {latestTrainingDay ? (
                <p className="training-load-value">
                  {mainSessionLoadMetric.value}
                </p>
              ) : null}
              <div className="training-load-copy">
                <p className="battery-focus-detail">
                  {latestTrainingDay
                    ? `${formatDisplayDate(latestTrainingDay.date)} - RPE ${latestTrainingDay.sessionRpe} - ${latestTrainingDay.setCount} sets (${latestTrainingDay.workingSetCount} working)`
                    : "Save one completed session below."}
                </p>
              </div>
            </div>
          </div>

          <div className="battery-focus-meta">
            <div>
              <p className="battery-meta-label">Session RPE</p>
              <p className="battery-meta-value">
                {latestTrainingDay ? `${latestTrainingDay.sessionRpe} / 10` : "--"}
              </p>
            </div>
            <div>
              <p className="battery-meta-label">Working sets</p>
              <p className="battery-meta-value">
                {latestTrainingDay ? `${latestTrainingDay.workingSetCount}` : "--"}
              </p>
            </div>
            <div>
              <p className="battery-meta-label">Priority</p>
              <p className="battery-meta-value">{programSettings.priorityMuscles.join(", ")}</p>
            </div>
          </div>
        </div>
      </header>

      <section className="metric-grid">
        {secondaryTrainingMetrics.map((metric) => (
          <MetricCard key={metric.label} metric={metric} />
        ))}
      </section>

      <SectionCard title="Save training exercise" titleZh="保存训练动作" eyebrow="Post-workout log">
        <div className="training-session-intro">
          <p className="body-text">
            Add completed exercise sets. Total training duration is recorded only in Pre-check.
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
              value={trainingSessionDraft.date}
              onChange={(event) => handleTrainingDateDraftChange(event.target.value)}
            />
          </label>

          <label className="training-form-field">
            <span className="training-form-label">Set type / 组类型</span>
            <select
              className="training-input"
              value={trainingSessionDraft.isWarmup ? "warmup" : "working"}
              onChange={(event) => dispatch(updateTrainingSessionDraft({
                field: "isWarmup",
                value: event.target.value === "warmup",
              }))}
            >
              <option value="working">Working set</option>
              <option value="warmup">Warm-up</option>
            </select>
          </label>

          <label className="training-form-field">
            <span className="training-form-label">Training day RPE / 训练总体难度</span>
            <input
              className="training-input"
              type="number"
              min="1"
              max="10"
              step="0.5"
              value={trainingSessionDraft.sessionRpe}
              onChange={(event) => dispatch(updateTrainingSessionDraft({ field: "sessionRpe", value: Number(event.target.value) }))}
            />
          </label>

          <label className="training-form-field">
            <span className="training-form-label">Primary muscle / 主要肌群</span>
            <select
              className="training-input"
              value={trainingSessionDraft.primaryMuscleGroup}
              onChange={(event) => handlePrimaryMuscleGroupDraftChange(event.target.value as MuscleGroup)}
            >
              {muscleGroupOptions.map((muscleGroup) => (
                <option key={muscleGroup} value={muscleGroup}>{muscleGroup}</option>
              ))}
            </select>
          </label>

          <label className="training-form-field">
            <span className="training-form-label">Exercise / 动作</span>
            <select
              className="training-input"
              value={trainingSessionDraft.exerciseName}
              onChange={(event) => dispatch(updateTrainingSessionDraft({ field: "exerciseName", value: event.target.value }))}
            >
              {selectedExerciseOptions.map((exerciseName) => (
                <option key={exerciseName} value={exerciseName}>{exerciseName}</option>
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
              value={trainingSessionDraft.sets}
              onChange={(event) => dispatch(updateTrainingSessionDraft({ field: "sets", value: Number(event.target.value) }))}
            />
          </label>

          <label className="training-form-field">
            <span className="training-form-label">Reps / 次数</span>
            <input
              className="training-input"
              type="number"
              min="1"
              value={trainingSessionDraft.reps}
              onChange={(event) => dispatch(updateTrainingSessionDraft({ field: "reps", value: Number(event.target.value) }))}
            />
          </label>

          <label className="training-form-field">
            <span className="training-form-label">Weight kg / 重量</span>
            <input
              className="training-input"
              type="number"
              min="0"
              step="0.5"
              value={trainingSessionDraft.weightKg}
              onChange={(event) => dispatch(updateTrainingSessionDraft({ field: "weightKg", value: Number(event.target.value) }))}
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
              value={trainingSessionDraft.rpe ?? ""}
              onChange={(event) => dispatch(updateTrainingSessionDraft({ field: "rpe", value: getOptionalNumber(event.target.value) }))}
            />
          </label>

          <label className="training-form-field">
            <span className="training-form-label">RIR optional / 剩余次数</span>
            <input
              className="training-input"
              type="number"
              min="0"
              step="0.5"
              value={trainingSessionDraft.rir ?? ""}
              onChange={(event) => dispatch(updateTrainingSessionDraft({ field: "rir", value: getOptionalNumber(event.target.value) }))}
            />
          </label>
        </div>

        <div className="training-form-actions">
          <button type="button" className="button-dark" onClick={handleSaveTrainingSession} disabled={isSavingTrainingSession}>
            {isSavingTrainingSession ? "Saving..." : "Save exercise"}
          </button>
          {formError ? <p className="form-error" role="alert">{formError}</p> : null}
          {error ? <p className="form-error" role="alert">{error}</p> : null}
        </div>

        <div className="saved-session-block">
          <div className="saved-session-header">
            <div>
              <p className="section-eyebrow">Saved training days</p>
              <p className="muted-text">
                Sets saved on the same date are grouped into one training day, then grouped by muscle and exercise.
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

            </div>
          </div>

          <div className="training-group-table-wrap">
            {trainingDayGroups.length === 0 ? (
              <p className="muted-text">No matching saved training days in this week.</p>
            ) : (
              <table className="training-group-table">
                <thead>
                  <tr>
                    <th scope="col">Exercise</th>
                    <th scope="col">Sets</th>
                    <th scope="col">Working sets</th>
                    <th scope="col">Hard sets</th>
                    <th scope="col">Total volume</th>
                    <th scope="col">Working volume</th>
                    <th scope="col">Action</th>
                  </tr>
                </thead>
                {trainingDayGroups.map((dayGroup) => {
                  const dayGroupKey = `day:${dayGroup.date}`;
                  const isDayCollapsed = isTrainingGroupCollapsed(dayGroupKey);

                  return (
                    <tbody key={dayGroup.date}>
                      <tr className="training-group-row training-group-row--day">
                        <th scope="rowgroup" colSpan={7}>
                          <div className="training-group-heading">
                            <button
                              type="button"
                              className="training-group-toggle-button"
                              aria-expanded={!isDayCollapsed}
                              onClick={() => toggleTrainingGroup(dayGroupKey)}
                            >
                              <span className="training-group-toggle" aria-hidden="true">
                                {isDayCollapsed ? "▸" : "▾"}
                              </span>
                              <span className="training-group-title">Date: {formatDisplayDate(dayGroup.date)}</span>
                            </button>
                            <span className="training-group-summary">
                              RPE {dayGroup.sessionRpe} - {dayGroup.setCount} sets - {dayGroup.workingSetCount} working - {dayGroup.hardSetCount} hard - {formatWholeNumber(dayGroup.volumeLoad)} kg total - {formatWholeNumber(dayGroup.workingVolumeLoad)} kg working
                            </span>
                            <span className="signal-chip">{dayGroup.workingSetCount} working</span>
                          </div>
                        </th>
                      </tr>

                      {!isDayCollapsed ? dayGroup.muscles.map((muscleGroup) => {
                        const muscleGroupKey = `muscle:${dayGroup.date}:${muscleGroup.muscleGroup}`;
                        const isMuscleCollapsed = isTrainingGroupCollapsed(muscleGroupKey);

                        return (
                          <Fragment key={muscleGroupKey}>
                            <tr className="training-group-row training-group-row--muscle">
                              <th scope="rowgroup" colSpan={7}>
                                <div className="training-group-heading">
                                  <button
                                    type="button"
                                    className="training-group-toggle-button"
                                    aria-expanded={!isMuscleCollapsed}
                                    onClick={() => toggleTrainingGroup(muscleGroupKey)}
                                  >
                                    <span className="training-group-toggle" aria-hidden="true">
                                      {isMuscleCollapsed ? "▸" : "▾"}
                                    </span>
                                    <span className="training-group-title">Muscle: {muscleGroup.muscleGroup}</span>
                                  </button>
                                  <span className="training-group-summary">
                                    {muscleGroup.setCount} sets - {muscleGroup.workingSetCount} working - {muscleGroup.hardSetCount} hard - {formatWholeNumber(muscleGroup.volumeLoad)} kg total - {formatWholeNumber(muscleGroup.workingVolumeLoad)} kg working
                                  </span>
                                </div>
                              </th>
                            </tr>

                            {!isMuscleCollapsed ? muscleGroup.exercises.map((exercise) => (
                              <tr key={exercise.key} className="training-group-row training-group-row--exercise">
                                <td>
                                  <span className="training-exercise-name">{exercise.exerciseName}</span>
                                </td>
                                <td>{exercise.setCount}</td>
                                <td>{exercise.workingSetCount}</td>
                                <td>{exercise.hardSetCount}</td>
                                <td>{formatWholeNumber(exercise.volumeLoad)} kg</td>
                                <td>{formatWholeNumber(exercise.workingVolumeLoad)} kg</td>
                                <td>
                                  <button
                                    type="button"
                                    className="text-button"
                                    onClick={() => handleDeleteSessionIds(exercise.sessionIds)}
                                  >
                                    Delete
                                  </button>
                                </td>
                              </tr>
                            )) : null}
                          </Fragment>
                        );
                      }) : null}
                    </tbody>
                  );
                })}
              </table>
            )}
          </div>
        </div>
      </SectionCard>

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

      {pendingMessage ? (
        <div className="operation-loading-overlay" role="status" aria-live="polite">
          <div className="operation-loading-panel">
            <span className="operation-spinner" aria-hidden="true" />
            <span>{pendingMessage}</span>
          </div>
        </div>
      ) : null}

      {successMessage ? (
        <div
          className="floating-operation-badge floating-operation-badge--success"
          role="status"
          aria-live="polite"
        >
          <span className="operation-success-mark" aria-hidden="true" />
          <span>{successMessage}</span>
        </div>
      ) : null}

      {operationErrorMessage ? (
        <div
          className="floating-operation-badge floating-operation-badge--error"
          role="alert"
          aria-live="assertive"
        >
          <span className="operation-error-mark" aria-hidden="true" />
          <span>{operationErrorMessage}</span>
        </div>
      ) : null}
    </div>
  );
}
