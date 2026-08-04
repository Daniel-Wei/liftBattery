import { useEffect, useRef, useState } from "react";
import { SectionCard } from "../components/SectionCard";
import { getOptionalNumber } from "../helpers/GenericHelpers";
import {
  formatBenchAngle,
  getBenchAngleOptions,
  getExerciseDisplayLabel,
  getExerciseOptionsForMuscleGroup,
  getMuscleGroupDisplayLabel,
  muscleGroupOptions,
} from "../data/programValues";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  addTrainingExercise,
  addTrainingSet,
  clearTrainingErrorMessage,
  clearTrainingSuccessMessage,
  deleteTrainingSession,
  fetchTrainingDays,
  removeTrainingExercise,
  removeTrainingSet,
  saveTrainingSession,
  updateTrainingExercise,
  updateTrainingSessionDraft,
  updateTrainingSet,
} from "../store/slices/trainingSlice";
import { getTrainingData, selectTrainingDays } from "../store/selectors/trainingSelector";
import { getTrainingFormError } from "../helpers/TrainingPageHelpers";

function getNumberInputValue(value: number) {
  return Number.isFinite(value) ? value : "";
}

function getNumberInputChangeValue(value: string) {
  return value === "" ? "" : Number(value);
}

type TrainingPageProps = {
  onSaved?: () => void;
};

export function TrainingPage({ onSaved }: TrainingPageProps) {
  const dispatch = useAppDispatch();
  const trainingDays = useAppSelector(selectTrainingDays);
  const {
    trainingSessionDraft,
    error,
    pendingMessage,
    successMessage,
    operationErrorMessage,
  } = useAppSelector(getTrainingData);
  const [formError, setFormError] = useState("");

  const [expandedExerciseId, setExpandedExerciseId] = useState<number | null>(
    trainingSessionDraft.exercises[0]?.id ?? null,
  );
  const previousExerciseCount = useRef(trainingSessionDraft.exercises.length);
  useEffect(() => {
    void dispatch(fetchTrainingDays({
      from: trainingSessionDraft.date,
      to: trainingSessionDraft.date,
    }));
  }, [dispatch, trainingSessionDraft.date]);

  useEffect(() => {
    if (!successMessage) return;
    const timeout = window.setTimeout(() => dispatch(clearTrainingSuccessMessage()), 2200);
    return () => window.clearTimeout(timeout);
  }, [dispatch, successMessage]);

  useEffect(() => {
    if (!operationErrorMessage) return;
    const timeout = window.setTimeout(() => dispatch(clearTrainingErrorMessage()), 4200);
    return () => window.clearTimeout(timeout);
  }, [dispatch, operationErrorMessage]);

  useEffect(() => {
    if (trainingSessionDraft.exercises.length > previousExerciseCount.current) {
      setExpandedExerciseId(trainingSessionDraft.exercises[trainingSessionDraft.exercises.length - 1]?.id ?? null);
    } else if (!trainingSessionDraft.exercises.some((exercise) => exercise.id === expandedExerciseId)) {
      setExpandedExerciseId(trainingSessionDraft.exercises[0]?.id ?? null);
    }
    previousExerciseCount.current = trainingSessionDraft.exercises.length;
  }, [expandedExerciseId, trainingSessionDraft.exercises]);

  const filteredDays = trainingDays
    .filter((day) => day.date === trainingSessionDraft.date)
    .filter((day) => day.sessions.length > 0)
    .sort((first, second) => second.date.localeCompare(first.date));
  const savedSessions = filteredDays.flatMap((day) => day.sessions);

  function handleDateChange(date: string) {
    dispatch(updateTrainingSessionDraft({ field: "date", value: date }));
  }

  async function handleSave() {
    const validationError = getTrainingFormError(trainingSessionDraft);
    setFormError(validationError ?? "");
    if (validationError) return;

    try {
      await dispatch(saveTrainingSession()).unwrap();
      onSaved?.();
    } catch {
      // The slice already exposes the localized request error.
    }
  }

  return (
    <div className="page page-stack">
      <SectionCard title="记录训练" className="training-record-card">
        <div className="training-session-form training-session-form--header">
          <label className="training-form-field">
            <span className="training-form-label">训练日期</span>
            <input className="training-input" type="date" value={trainingSessionDraft.date} onChange={(event) => handleDateChange(event.target.value)} />
          </label>
          <label className="training-form-field">
            <span className="training-form-label">开始时间</span>
            <input className="training-input" type="time" value={trainingSessionDraft.startTime} onChange={(event) => dispatch(updateTrainingSessionDraft({ field: "startTime", value: event.target.value }))} />
          </label>
          <label className="training-form-field">
            <span className="training-form-label">训练时长（分钟）</span>
            <input className="training-input" type="number" min="1" value={getNumberInputValue(trainingSessionDraft.durationMinutes)} onChange={(event) => dispatch(updateTrainingSessionDraft({ field: "durationMinutes", value: getNumberInputChangeValue(event.target.value) }))} />
          </label>
          <label className="training-form-field">
            <span className="training-form-label">总体难度</span>
            <input className="training-input" type="number" min="1" max="10" step="0.5" value={getNumberInputValue(trainingSessionDraft.sessionRpe)} onChange={(event) => dispatch(updateTrainingSessionDraft({ field: "sessionRpe", value: getNumberInputChangeValue(event.target.value) }))} />
          </label>
          <div className="training-form-field training-save-field">
            <button type="button" className="button-primary training-save-button" onClick={handleSave}>保存</button>
          </div>
        </div>

        <div className="training-exercise-stack training-exercise-stack--friendly">
          {trainingSessionDraft.exercises.map((exercise, exerciseIndex) => {
            const exerciseOptions = getExerciseOptionsForMuscleGroup(exercise.muscleGroup);
            const angleOptions = getBenchAngleOptions(exercise.exerciseName);
            const isExpanded = expandedExerciseId === exercise.id;

            return (
              <article className={`training-exercise-editor${isExpanded ? "" : " training-exercise-editor--collapsed"}`} key={exercise.id}>
                <div className="training-exercise-input-panel">
                  <div className="training-editor-heading">
                    <button type="button" className="training-editor-toggle" aria-expanded={isExpanded} onClick={() => setExpandedExerciseId(isExpanded ? null : exercise.id)}>
                      <p className="section-eyebrow">动作 {exerciseIndex + 1}</p>
                      <h3>{getExerciseDisplayLabel(exercise.exerciseName)}</h3>
                      <span>{isExpanded ? "收起" : "展开"}</span>
                    </button>
                    <button type="button" className="text-button" disabled={trainingSessionDraft.exercises.length === 1} onClick={() => dispatch(removeTrainingExercise(exercise.id))}>
                      删除动作
                    </button>
                  </div>
                  {isExpanded ? (
                  <>

                  <div className="training-session-form training-session-form--exercise">
                    <label className="training-form-field">
                      <span className="training-form-label">主要肌群</span>
                      <select className="training-input" value={exercise.muscleGroup} onChange={(event) => dispatch(updateTrainingExercise({ exerciseId: exercise.id, field: "muscleGroup", value: event.target.value }))}>
                        {muscleGroupOptions.map((muscleGroup) => <option key={muscleGroup} value={muscleGroup}>{getMuscleGroupDisplayLabel(muscleGroup)}</option>)}
                      </select>
                    </label>
                    <label className="training-form-field">
                      <span className="training-form-label">动作</span>
                      <select className="training-input" value={exercise.exerciseName} onChange={(event) => dispatch(updateTrainingExercise({ exerciseId: exercise.id, field: "exerciseName", value: event.target.value }))}>
                        {exerciseOptions.map((exerciseName) => <option key={exerciseName} value={exerciseName}>{getExerciseDisplayLabel(exerciseName)}</option>)}
                      </select>
                    </label>
                    {angleOptions.length > 0 ? (
                      <label className="training-form-field">
                        <span className="training-form-label">卧推角度</span>
                        <select className="training-input" value={exercise.benchAngleDegrees ?? angleOptions[0]} onChange={(event) => dispatch(updateTrainingExercise({ exerciseId: exercise.id, field: "benchAngleDegrees", value: Number(event.target.value) }))}>
                          {angleOptions.map((angle) => <option key={angle} value={angle}>{formatBenchAngle(angle)}</option>)}
                        </select>
                      </label>
                    ) : null}
                  </div>

                  <div className="training-set-table-wrap">
                    <table className="training-set-table">
                      <thead><tr><th>组</th><th>次数</th><th>重量（公斤）</th><th>剩余次数</th><th>类型</th><th /></tr></thead>
                      <tbody>
                        {exercise.sets.map((set, setIndex) => (
                          <tr key={`${set.id}-${setIndex}`}>
                            <td className="training-set-number">{setIndex + 1}</td>
                            <td><input aria-label={`动作 ${exerciseIndex + 1} 第 ${setIndex + 1} 组次数`} type="number" min="1" value={getNumberInputValue(set.reps)} onChange={(event) => dispatch(updateTrainingSet({ exerciseId: exercise.id, setId: set.id, setIndex, field: "reps", value: getNumberInputChangeValue(event.target.value) }))} /></td>
                            <td><input aria-label={`动作 ${exerciseIndex + 1} 第 ${setIndex + 1} 组重量`} type="number" min="0" step="0.5" value={getNumberInputValue(set.weightKg)} onChange={(event) => dispatch(updateTrainingSet({ exerciseId: exercise.id, setId: set.id, setIndex, field: "weightKg", value: getNumberInputChangeValue(event.target.value) }))} /></td>
                            <td><input aria-label={`动作 ${exerciseIndex + 1} 第 ${setIndex + 1} 组剩余次数`} type="number" min="0" max="10" step="0.5" inputMode="decimal" value={set.rir ?? ""} onChange={(event) => dispatch(updateTrainingSet({ exerciseId: exercise.id, setId: set.id, setIndex, field: "rir", value: getOptionalNumber(event.target.value) }))} /></td>
                            <td>
                              <select aria-label={`动作 ${exerciseIndex + 1} 第 ${setIndex + 1} 组类型`} value={set.isWarmup ? "warmup" : "working"} onChange={(event) => dispatch(updateTrainingSet({ exerciseId: exercise.id, setId: set.id, setIndex, field: "isWarmup", value: event.target.value === "warmup" }))}>
                                <option value="working">正式组</option><option value="warmup">热身组</option>
                              </select>
                            </td>
                            <td><button type="button" className="text-button" disabled={exercise.sets.length === 1} onClick={() => dispatch(removeTrainingSet({ exerciseId: exercise.id, setId: set.id, setIndex }))}>删除</button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <button type="button" className="button-dark training-inline-action" onClick={() => dispatch(addTrainingSet(exercise.id))}>+ 添加一组</button>
                  </>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>

        <div className="training-form-actions training-form-actions--split">
          <button type="button" className="button-primary" onClick={() => dispatch(addTrainingExercise())}>+ 添加动作</button>
        </div>
        {formError ? <p className="form-error" role="alert">{formError}</p> : null}
        {error ? <p className="form-error" role="alert">{error}</p> : null}
      </SectionCard>

      <SectionCard title="已保存训练">
        {savedSessions.length === 0 ? (
          <p className="muted-text saved-session-empty">当前训练日期暂无保存记录。</p>
        ) : (
          <div className="training-day-session-list">
            {savedSessions.map((session) => (
              <div className="saved-training-session saved-training-session--stacked" key={session.id}>
                <div className="saved-session-summary-row">
                  <div className="saved-session-meta">
                    <div>
                      <strong>{session.startTime}</strong>
                      <span>{session.durationMinutes} 分钟</span>
                    </div>
                    <div>
                      <span>总体难度</span>
                      <strong>{session.sessionRpe}</strong>
                    </div>
                  </div>
                  <button type="button" className="text-button saved-session-delete-button" onClick={() => void dispatch(deleteTrainingSession(session.id))}>删除</button>
                </div>
                <div className="saved-training-exercise-list">
                  {session.exercises.map((exercise) => (
                    <div className="saved-training-exercise" key={exercise.id}>
                      <div className="saved-training-exercise-heading">
                        <strong>{getExerciseDisplayLabel(exercise.exerciseName)}</strong>
                        {exercise.benchAngleDegrees !== undefined ? <span>{formatBenchAngle(exercise.benchAngleDegrees)}</span> : null}
                        <span>{getMuscleGroupDisplayLabel(exercise.muscleGroup)}</span>
                      </div>
                      <div className="saved-set-chips">
                        {exercise.sets.map((set) => <span className="signal-chip signal-chip--muted" key={set.id}>{set.setOrder} · {set.weightKg}kg × {set.reps}{set.rir !== undefined ? ` · RIR ${set.rir}` : ""}{set.isWarmup ? " · 热身" : ""}</span>)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      {pendingMessage ? <div className="operation-loading-overlay" role="status"><div className="operation-loading-panel"><span className="operation-spinner" />{pendingMessage}</div></div> : null}
      {successMessage ? <div className="floating-operation-badge floating-operation-badge--success" role="status">{successMessage}</div> : null}
      {operationErrorMessage ? <div className="floating-operation-badge floating-operation-badge--error" role="alert">{operationErrorMessage}</div> : null}
    </div>
  );
}
