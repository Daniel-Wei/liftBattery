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
  getExerciseDisplayLabel,
  getExerciseOptionsForMuscleGroup,
  getMuscleGroupDisplayLabel,
  muscleGroupOptions,
} from "../data/programValues";
import { getEvidenceTypeLabel } from "../helpers/displayLabels";
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
    return "暂无动作";
  }

  return exerciseNames.length === 1
    ? getExerciseDisplayLabel(exerciseNames[0])
    : `${exerciseNames.length} 个动作`;
}

export function TrainingPage() {
  const dispatch = useAppDispatch();
  const programSettings = useAppSelector(selectProgramSettings);
  const trainingSessions = useAppSelector(selectTrainingSessions);
  const {
    trainingSessionDraft,
    error,
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
  // #endregion

  // #region: useEffect -> clear success, error msgs on timeout
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
            <p className="landing-eyebrow">训练记录</p>
            <h1 className="page-title">只分析已经保存的训练数据</h1>
            <p className="page-subtitle">
              下方分析只使用这里保存的训练记录；没有可靠数据来源的指标不会显示。
            </p>
          </div>
        </div>

        <div className="battery-focus-panel training-load-panel">
          <div className="battery-panel-badges">
            <StatusBadge status={mainSessionLoadMetric.status} label={getEvidenceTypeLabel(mainSessionLoadMetric.evidenceType)} />
            <StatusBadge status={MetricStatus.Neutral} label={selectedWeekDisplayLabel} />
            <StatusBadge status={MetricStatus.Neutral} label={`${trainingDayGroups.length} 个训练日`} />
          </div>

          <div className="training-load-summary">
            <p className="battery-focus-eyebrow">最近训练结果</p>
            <div className="training-load-detail-row">
              <p className="training-load-exercise">
                {latestTrainingDay ? getTrainingDayExerciseLabel(latestTrainingDay) : "暂无已保存训练"}
              </p>
              {latestTrainingDay ? (
                <p className="training-load-value">
                  {mainSessionLoadMetric.value}
                </p>
              ) : null}
              <div className="training-load-copy">
                <p className="battery-focus-detail">
                  {latestTrainingDay
                    ? `${formatDisplayDate(latestTrainingDay.date)} · 总体难度 ${latestTrainingDay.sessionRpe} · 共 ${latestTrainingDay.setCount} 组（${latestTrainingDay.workingSetCount} 组正式组）`
                    : "请在下方保存已完成的训练动作。"}
                </p>
              </div>
            </div>
          </div>

          <div className="battery-focus-meta">
            <div>
              <p className="battery-meta-label">训练总体难度</p>
              <p className="battery-meta-value">
                {latestTrainingDay ? `${latestTrainingDay.sessionRpe} / 10` : "--"}
              </p>
            </div>
            <div>
              <p className="battery-meta-label">正式组</p>
              <p className="battery-meta-value">
                {latestTrainingDay ? `${latestTrainingDay.workingSetCount}` : "--"}
              </p>
            </div>
            <div>
              <p className="battery-meta-label">重点肌群</p>
              <p className="battery-meta-value">
                {programSettings.priorityMuscles.map(getMuscleGroupDisplayLabel).join("、")}
              </p>
            </div>
          </div>
        </div>
      </header>

      <section className="metric-grid">
        {secondaryTrainingMetrics.map((metric) => (
          <MetricCard key={metric.label} metric={metric} />
        ))}
      </section>

      <SectionCard title="保存训练动作" eyebrow="训练后记录">
        <div className="training-session-intro">
          <p className="body-text">
            添加已完成的动作组。训练总时长只在练前检查中记录。
          </p>
          <StatusBadge
            status={MetricStatus.Neutral}
            label={`重点肌群：${programSettings.priorityMuscles.map(getMuscleGroupDisplayLabel).join("、")}`}
          />
        </div>

        <div className="training-session-form">
          <label className="training-form-field">
            <span className="training-form-label">日期</span>
            <input
              className="training-input"
              type="date"
              value={trainingSessionDraft.date}
              onChange={(event) => handleTrainingDateDraftChange(event.target.value)}
            />
          </label>

          <label className="training-form-field">
            <span className="training-form-label">组类型</span>
            <select
              className="training-input"
              value={trainingSessionDraft.isWarmup ? "warmup" : "working"}
              onChange={(event) => dispatch(updateTrainingSessionDraft({
                field: "isWarmup",
                value: event.target.value === "warmup",
              }))}
            >
              <option value="working">正式组</option>
              <option value="warmup">热身组</option>
            </select>
          </label>

          <label className="training-form-field">
            <span className="training-form-label">训练总体难度</span>
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
            <span className="training-form-label">主要肌群</span>
            <select
              className="training-input"
              value={trainingSessionDraft.primaryMuscleGroup}
              onChange={(event) => handlePrimaryMuscleGroupDraftChange(event.target.value as MuscleGroup)}
            >
              {muscleGroupOptions.map((muscleGroup) => (
                <option key={muscleGroup} value={muscleGroup}>
                  {getMuscleGroupDisplayLabel(muscleGroup)}
                </option>
              ))}
            </select>
          </label>

          <label className="training-form-field">
            <span className="training-form-label">动作</span>
            <select
              className="training-input"
              value={trainingSessionDraft.exerciseName}
              onChange={(event) => dispatch(updateTrainingSessionDraft({ field: "exerciseName", value: event.target.value }))}
            >
              {selectedExerciseOptions.map((exerciseName) => (
                <option key={exerciseName} value={exerciseName}>
                  {getExerciseDisplayLabel(exerciseName)}
                </option>
              ))}
            </select>
          </label>

          <label className="training-form-field">
            <span className="training-form-label">组数</span>
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
            <span className="training-form-label">每组次数</span>
            <input
              className="training-input"
              type="number"
              min="1"
              value={trainingSessionDraft.reps}
              onChange={(event) => dispatch(updateTrainingSessionDraft({ field: "reps", value: Number(event.target.value) }))}
            />
          </label>

          <label className="training-form-field">
            <span className="training-form-label">重量（千克）</span>
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
            <span className="training-form-label">单组难度（选填）</span>
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
            <span className="training-form-label">力竭前剩余次数（选填）</span>
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
          <button type="button" className="button-dark" onClick={handleSaveTrainingSession}>
            保存动作
          </button>
          {formError ? <p className="form-error" role="alert">{formError}</p> : null}
          {error ? <p className="form-error" role="alert">{error}</p> : null}
        </div>

        <div className="saved-session-block">
          <div className="saved-session-header">
            <div>
              <p className="section-eyebrow">已保存的训练日</p>
              <p className="muted-text">
                同一天保存的训练组会合并为一个训练日，再按肌群和动作分组。
              </p>
            </div>

            <div className="saved-session-controls">
              <label className="training-form-field training-form-field--compact">
                <span className="training-form-label">训练周</span>
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
                <span className="training-form-label">肌群</span>
                <select
                  className="training-input training-input--compact"
                  value={selectedMuscleGroupFilter}
                  onChange={(event) => handleMuscleGroupFilterChange(event.target.value as MuscleGroup)}
                >
                  <option value="All">全部</option>
                  {muscleGroupOptions.map((muscleGroup) => (
                    <option key={muscleGroup} value={muscleGroup}>
                      {getMuscleGroupDisplayLabel(muscleGroup)}
                    </option>
                  ))}
                </select>
              </label>

            </div>
          </div>

          <div className="training-group-table-wrap">
            {trainingDayGroups.length === 0 ? (
              <p className="muted-text">本周暂无符合筛选条件的训练记录。</p>
            ) : (
              <table className="training-group-table">
                <thead>
                  <tr>
                    <th scope="col">动作</th>
                    <th scope="col">总组数</th>
                    <th scope="col">正式组</th>
                    <th scope="col">高强度组</th>
                    <th scope="col">总训练量</th>
                    <th scope="col">正式组训练量</th>
                    <th scope="col">操作</th>
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
                              <span className="training-group-title">日期：{formatDisplayDate(dayGroup.date)}</span>
                            </button>
                            <span className="training-group-summary">
                              总体难度 {dayGroup.sessionRpe} · 共 {dayGroup.setCount} 组 · {dayGroup.workingSetCount} 组正式组 · {dayGroup.hardSetCount} 组高强度组 · 总训练量 {formatWholeNumber(dayGroup.volumeLoad)} 千克 · 正式组训练量 {formatWholeNumber(dayGroup.workingVolumeLoad)} 千克
                            </span>
                            <span className="signal-chip">{dayGroup.workingSetCount} 组正式组</span>
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
                                    <span className="training-group-title">肌群：{getMuscleGroupDisplayLabel(muscleGroup.muscleGroup)}</span>
                                  </button>
                                  <span className="training-group-summary">
                                    共 {muscleGroup.setCount} 组 · {muscleGroup.workingSetCount} 组正式组 · {muscleGroup.hardSetCount} 组高强度组 · 总训练量 {formatWholeNumber(muscleGroup.volumeLoad)} 千克 · 正式组训练量 {formatWholeNumber(muscleGroup.workingVolumeLoad)} 千克
                                  </span>
                                </div>
                              </th>
                            </tr>

                            {!isMuscleCollapsed ? muscleGroup.exercises.map((exercise) => (
                              <tr key={exercise.key} className="training-group-row training-group-row--exercise">
                                <td>
                                  <span className="training-exercise-name">{getExerciseDisplayLabel(exercise.exerciseName)}</span>
                                </td>
                                <td>{exercise.setCount}</td>
                                <td>{exercise.workingSetCount}</td>
                                <td>{exercise.hardSetCount}</td>
                                <td>{formatWholeNumber(exercise.volumeLoad)} 千克</td>
                                <td>{formatWholeNumber(exercise.workingVolumeLoad)} 千克</td>
                                <td>
                                  <button
                                    type="button"
                                    className="text-button"
                                    onClick={() => handleDeleteSessionIds(exercise.sessionIds)}
                                  >
                                    删除
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
        <SectionCard title="重点肌群训练" eyebrow="来自已保存训练组">
          <div className="compact-card-list">
            {priorityMuscleSummaries.map((summary) => (
              <article key={summary.muscleGroup} className="compact-signal-card">
                <div>
                  <p className="work-title">{getMuscleGroupDisplayLabel(summary.muscleGroup)}</p>
                  <p className="info-subtitle">已保存的高强度组与训练量</p>
                </div>
                <div className="saved-session-actions">
                  <span className="signal-chip">{summary.hardSets} 组高强度组</span>
                  <span className="signal-chip signal-chip--muted">
                    {formatWholeNumber(summary.volumeLoad)} 千克
                  </span>
                </div>
              </article>
            ))}
          </div>
        </SectionCard>
      ) : (
        <SectionCard title="暂无训练分析" eyebrow="需要先保存训练数据">
          <p className="body-text">
            请先在上方保存训练动作。本页面只展示能够从已保存训练数据中得出的分析。
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
