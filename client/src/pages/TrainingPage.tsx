import { useEffect, useMemo, useState } from "react";
import { SectionCard } from "../components/SectionCard";
import { MuscleViewer } from "../components/MuscleViewer";
import { getExerciseMuscleContribution } from "../domain/exerciseMuscleMap";
import { getOptionalNumber } from "../helpers/GenericHelpers";
import {
  getExerciseDisplayLabel,
  getExerciseOptionsForMuscleGroup,
  getMuscleGroupDisplayLabel,
  muscleGroupOptions,
} from "../data/programValues";
import type { MuscleGroup } from "../types/appTypes";
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

export function TrainingPage() {
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

  const filteredDays = trainingDays
    .filter((day) => day.date === trainingSessionDraft.date)
    .filter((day) => day.sessions.length > 0)
    .sort((first, second) => second.date.localeCompare(first.date));
  const savedSessions = filteredDays.flatMap((day) => day.sessions);

  function handleDateChange(date: string) {
    dispatch(updateTrainingSessionDraft({ field: "date", value: date }));
  }

  function handleSave() {
    const validationError = getTrainingFormError(trainingSessionDraft);
    setFormError(validationError ?? "");
    if (!validationError) void dispatch(saveTrainingSession());
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
            const muscleContribution = getExerciseMuscleContribution(
              exercise.exerciseName,
              exercise.muscleGroup,
            );

            return (
              <article className="training-exercise-editor training-exercise-editor--with-preview" key={exercise.id}>
                <div className="training-exercise-input-panel">
                  <div className="training-editor-heading">
                    <div>
                      <p className="section-eyebrow">动作 {exerciseIndex + 1}</p>
                      <h3>{getExerciseDisplayLabel(exercise.exerciseName)}</h3>
                    </div>
                    <button type="button" className="text-button" disabled={trainingSessionDraft.exercises.length === 1} onClick={() => dispatch(removeTrainingExercise(exercise.id))}>
                      删除动作
                    </button>
                  </div>

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
                  </div>

                  <div className="training-set-table-wrap">
                    <table className="training-set-table">
                      <thead><tr><th>组</th><th>次数</th><th>重量 kg</th><th>剩余次数</th><th>类型</th><th /></tr></thead>
                      <tbody>
                        {exercise.sets.map((set, setIndex) => (
                          <tr key={set.id}>
                            <td className="training-set-number">{setIndex + 1}</td>
                            <td><input aria-label={`动作 ${exerciseIndex + 1} 第 ${setIndex + 1} 组次数`} type="number" min="1" value={getNumberInputValue(set.reps)} onChange={(event) => dispatch(updateTrainingSet({ exerciseId: exercise.id, setId: set.id, field: "reps", value: getNumberInputChangeValue(event.target.value) }))} /></td>
                            <td><input aria-label={`动作 ${exerciseIndex + 1} 第 ${setIndex + 1} 组重量`} type="number" min="0" step="0.5" value={getNumberInputValue(set.weightKg)} onChange={(event) => dispatch(updateTrainingSet({ exerciseId: exercise.id, setId: set.id, field: "weightKg", value: getNumberInputChangeValue(event.target.value) }))} /></td>
                            <td><input aria-label={`动作 ${exerciseIndex + 1} 第 ${setIndex + 1} 组剩余次数`} type="number" min="0" step="1" value={set.rir ?? ""} onChange={(event) => dispatch(updateTrainingSet({ exerciseId: exercise.id, setId: set.id, field: "rir", value: getOptionalNumber(event.target.value) }))} /></td>
                            <td>
                              <select aria-label={`动作 ${exerciseIndex + 1} 第 ${setIndex + 1} 组类型`} value={set.isWarmup ? "warmup" : "working"} onChange={(event) => dispatch(updateTrainingSet({ exerciseId: exercise.id, setId: set.id, field: "isWarmup", value: event.target.value === "warmup" }))}>
                                <option value="working">正式组</option><option value="warmup">热身组</option>
                              </select>
                            </td>
                            <td><button type="button" className="text-button" disabled={exercise.sets.length === 1} onClick={() => dispatch(removeTrainingSet({ exerciseId: exercise.id, setId: set.id }))}>删除</button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <button type="button" className="button-dark training-inline-action" onClick={() => dispatch(addTrainingSet(exercise.id))}>+ 添加一组</button>
                </div>
                <MuscleViewer
                  title={`动作肌群预览：${getExerciseDisplayLabel(exercise.exerciseName)}`}
                  activations={muscleContribution?.muscles ?? []}
                  tip={muscleContribution?.tip}
                />
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
