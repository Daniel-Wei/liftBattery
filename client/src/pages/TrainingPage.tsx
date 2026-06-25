import { useEffect, useMemo, useState } from "react";
import { SectionCard } from "../components/SectionCard";
import { StatusBadge } from "../components/StatusBadge";
import { getOptionalNumber } from "../helpers/GenericHelpers";
import {
  getExerciseDisplayLabel,
  getExerciseOptionsForMuscleGroup,
  getMuscleGroupDisplayLabel,
  muscleGroupOptions,
} from "../data/programValues";
import {
  formatTrainingTrendWeekLabel,
  getCurrentTrainingTrendWeek,
  getTrainingTrendWeeks,
} from "../domain/trainingTrendCharts";
import { MetricStatus, type MuscleGroup } from "../types/appTypes";
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

type SavedExercise = {
  muscleGroup: MuscleGroup;
  exerciseName: string;
};

function getWeekForDate(date: string, weeks: ReturnType<typeof getTrainingTrendWeeks>) {
  return weeks.find((week) => date >= week.startDate && date <= week.endDate);
}

function formatDate(date: string) {
  const [year, month, day] = date.split("-");
  return year && month && day ? `${day}/${month}/${year}` : date;
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
  const weeks = useMemo(() => getTrainingTrendWeeks(), []);
  const initialWeek = getWeekForDate(trainingSessionDraft.date, weeks) ?? getCurrentTrainingTrendWeek();
  const [selectedWeekLabel, setSelectedWeekLabel] = useState(initialWeek.label);
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<MuscleGroup>("All");
  const [selectedExercise, setSelectedExercise] = useState("All");
  const selectedWeek = weeks.find((week) => week.label === selectedWeekLabel) ?? initialWeek;

  useEffect(() => {
    void dispatch(fetchTrainingDays({
      from: selectedWeek.startDate,
      to: selectedWeek.endDate,
    }));
  }, [dispatch, selectedWeek.endDate, selectedWeek.startDate]);

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

  const savedExercises = useMemo(() => {
    const values = new Map<string, SavedExercise>();

    trainingDays.forEach((day) => day.sessions.forEach((session) => (
      session.exercises.forEach((exercise) => {
        values.set(`${exercise.muscleGroup}::${exercise.exerciseName}`, {
          muscleGroup: exercise.muscleGroup,
          exerciseName: exercise.exerciseName,
        });
      })
    )));

    return [...values.values()];
  }, [trainingDays]);

  const exerciseFilterOptions = savedExercises
    .filter((exercise) => selectedMuscleGroup === "All" || exercise.muscleGroup === selectedMuscleGroup)
    .map((exercise) => exercise.exerciseName)
    .filter((exerciseName, index, values) => values.indexOf(exerciseName) === index)
    .sort();

  useEffect(() => {
    if (selectedExercise !== "All" && !exerciseFilterOptions.includes(selectedExercise)) {
      setSelectedExercise("All");
    }
  }, [exerciseFilterOptions, selectedExercise]);

  const filteredDays = trainingDays
    .map((day) => ({
      ...day,
      sessions: day.sessions
        .map((session) => ({
          ...session,
          exercises: session.exercises.filter((exercise) => (
            (selectedMuscleGroup === "All" || exercise.muscleGroup === selectedMuscleGroup)
            && (selectedExercise === "All" || exercise.exerciseName === selectedExercise)
          )),
        }))
        .filter((session) => session.exercises.length > 0),
    }))
    .filter((day) => day.sessions.length > 0)
    .sort((first, second) => second.date.localeCompare(first.date));

  function handleDateChange(date: string) {
    dispatch(updateTrainingSessionDraft({ field: "date", value: date }));
    const week = getWeekForDate(date, weeks);
    if (week) setSelectedWeekLabel(week.label);
  }

  function handleWeekChange(label: string) {
    const week = weeks.find((candidate) => candidate.label === label);
    if (!week) return;

    setSelectedWeekLabel(label);
    if (trainingSessionDraft.date < week.startDate || trainingSessionDraft.date > week.endDate) {
      dispatch(updateTrainingSessionDraft({ field: "date", value: week.startDate }));
    }
  }

  function handleSave() {
    const validationError = getTrainingFormError(trainingSessionDraft);
    setFormError(validationError ?? "");
    if (!validationError) void dispatch(saveTrainingSession());
  }

  return (
    <div className="page page-stack">
      <header className="dashboard-hero">
        <p className="landing-eyebrow">训练记录</p>
        <h1 className="page-title">记录今天完成的训练</h1>
      </header>

      <SectionCard title="记录训练" eyebrow="训练后填写">
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
            <input className="training-input" type="number" min="1" value={trainingSessionDraft.durationMinutes} onChange={(event) => dispatch(updateTrainingSessionDraft({ field: "durationMinutes", value: Number(event.target.value) }))} />
          </label>
          <label className="training-form-field">
            <span className="training-form-label">总体难度</span>
            <input className="training-input" type="number" min="1" max="10" step="0.5" value={trainingSessionDraft.sessionRpe} onChange={(event) => dispatch(updateTrainingSessionDraft({ field: "sessionRpe", value: Number(event.target.value) }))} />
          </label>
        </div>

        <div className="training-exercise-stack training-exercise-stack--friendly">
          {trainingSessionDraft.exercises.map((exercise, exerciseIndex) => {
            const exerciseOptions = getExerciseOptionsForMuscleGroup(exercise.muscleGroup);

            return (
              <article className="training-exercise-editor" key={exercise.id}>
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
                    <thead><tr><th>组</th><th>次数</th><th>重量 kg</th><th>单组难度</th><th>剩余次数</th><th>类型</th><th /></tr></thead>
                    <tbody>
                      {exercise.sets.map((set, setIndex) => (
                        <tr key={set.id}>
                          <td className="training-set-number">{setIndex + 1}</td>
                          <td><input aria-label={`动作 ${exerciseIndex + 1} 第 ${setIndex + 1} 组次数`} type="number" min="1" value={set.reps} onChange={(event) => dispatch(updateTrainingSet({ exerciseId: exercise.id, setId: set.id, field: "reps", value: Number(event.target.value) }))} /></td>
                          <td><input aria-label={`动作 ${exerciseIndex + 1} 第 ${setIndex + 1} 组重量`} type="number" min="0" step="0.5" value={set.weightKg} onChange={(event) => dispatch(updateTrainingSet({ exerciseId: exercise.id, setId: set.id, field: "weightKg", value: Number(event.target.value) }))} /></td>
                          <td><input aria-label={`动作 ${exerciseIndex + 1} 第 ${setIndex + 1} 组难度`} type="number" min="1" max="10" step="0.5" value={set.rpe ?? ""} onChange={(event) => dispatch(updateTrainingSet({ exerciseId: exercise.id, setId: set.id, field: "rpe", value: getOptionalNumber(event.target.value) }))} /></td>
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
                <button type="button" className="button-secondary training-inline-action" onClick={() => dispatch(addTrainingSet(exercise.id))}>+ 添加一组</button>
              </article>
            );
          })}
        </div>

        <div className="training-form-actions training-form-actions--split">
          <button type="button" className="button-dark" onClick={() => dispatch(addTrainingExercise())}>+ 添加动作</button>
          <button type="button" className="button-primary" onClick={handleSave}>保存本次训练</button>
        </div>
        {formError ? <p className="form-error" role="alert">{formError}</p> : null}
        {error ? <p className="form-error" role="alert">{error}</p> : null}
      </SectionCard>

      <SectionCard title="已保存训练">
        <div className="saved-session-header">
          <div className="saved-session-controls saved-session-controls--three">
            <label className="training-form-field training-form-field--compact">
              <span className="training-form-label">训练周</span>
              <select className="training-input training-input--compact" value={selectedWeekLabel} onChange={(event) => handleWeekChange(event.target.value)}>
                {weeks.map((week) => <option key={week.label} value={week.label}>{formatTrainingTrendWeekLabel(week)}</option>)}
              </select>
            </label>
            <label className="training-form-field training-form-field--compact">
              <span className="training-form-label">肌群</span>
              <select className="training-input training-input--compact" value={selectedMuscleGroup} onChange={(event) => setSelectedMuscleGroup(event.target.value as MuscleGroup)}>
                <option value="All">全部肌群</option>
                {muscleGroupOptions.map((muscleGroup) => <option key={muscleGroup} value={muscleGroup}>{getMuscleGroupDisplayLabel(muscleGroup)}</option>)}
              </select>
            </label>
            <label className="training-form-field training-form-field--compact">
              <span className="training-form-label">动作</span>
              <select className="training-input training-input--compact" value={selectedExercise} onChange={(event) => setSelectedExercise(event.target.value)}>
                <option value="All">全部动作</option>
                {exerciseFilterOptions.map((exerciseName) => <option key={exerciseName} value={exerciseName}>{getExerciseDisplayLabel(exerciseName)}</option>)}
              </select>
            </label>
          </div>
        </div>

        <div className="saved-week-summary">
          <StatusBadge status={MetricStatus.Neutral} label={`${filteredDays.length} 个训练日`} />
          <StatusBadge status={MetricStatus.Neutral} label={`${filteredDays.reduce((total, day) => total + day.sessions.length, 0)} 次训练`} />
        </div>

        {filteredDays.length === 0 ? (
          <p className="muted-text saved-session-empty">本周暂无符合筛选条件的训练记录。</p>
        ) : (
          <div className="training-day-list training-day-list--calendar">
            {filteredDays.map((day) => (
              <article className="training-day-card" key={day.id}>
                <div className="training-day-calendar-heading">
                  <div className="training-calendar-date"><strong>{formatDate(day.date)}</strong><span>{day.sessions.length} 次训练</span></div>
                </div>
                {day.sessions.map((session) => (
                  <div className="saved-training-session saved-training-session--stacked" key={session.id}>
                    <div className="saved-session-summary-row">
                      <div><strong>{session.startTime}</strong><span>{session.durationMinutes} 分钟</span></div>
                      <div><span>总体难度 {session.sessionRpe}</span></div>
                      <button type="button" className="text-button" onClick={() => void dispatch(deleteTrainingSession(session.id))}>删除</button>
                    </div>
                    <div className="saved-training-exercise-list">
                      {session.exercises.map((exercise) => (
                        <div className="saved-training-exercise" key={exercise.id}>
                          <div><strong>{getExerciseDisplayLabel(exercise.exerciseName)}</strong><span>{getMuscleGroupDisplayLabel(exercise.muscleGroup)}</span></div>
                          <div className="saved-set-chips">
                            {exercise.sets.map((set) => <span className="signal-chip signal-chip--muted" key={set.id}>{set.setOrder} · {set.weightKg}kg × {set.reps}{set.isWarmup ? " · 热身" : ""}</span>)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </article>
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
