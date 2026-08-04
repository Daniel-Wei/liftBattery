import { useEffect, useMemo, useState } from "react";
import { SectionCard } from "../components/SectionCard";
import { formatBenchAngle, getExerciseDisplayLabel } from "../data/programValues";
import { buildDailyTrainingReport, flattenDatedSessions, sortSessionsNewestFirst } from "../domain/dailyTrainingReport";
import { getLocalDateString } from "../helpers/GenericHelpers";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { selectTrainingDays } from "../store/selectors/trainingSelector";
import { fetchTrainingDays } from "../store/slices/trainingSlice";

function formatChange(value?: number) {
  if (value === undefined) return "暂无可比数据";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

function formatWeight(value?: number) {
  return value === undefined ? "—" : `${Math.round(value)} kg`;
}

export function DailyReportPage() {
  const dispatch = useAppDispatch();
  const trainingDays = useAppSelector(selectTrainingDays);
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
  const sessions = useMemo(
    () => sortSessionsNewestFirst(flattenDatedSessions(trainingDays)),
    [trainingDays],
  );

  useEffect(() => {
    void dispatch(fetchTrainingDays({ from: "2000-01-01", to: getLocalDateString() }));
  }, [dispatch]);

  useEffect(() => {
    if (sessions.length > 0 && !sessions.some((session) => session.id === selectedSessionId)) {
      setSelectedSessionId(sessions[0].id);
    }
  }, [selectedSessionId, sessions]);

  const selected = sessions.find((session) => session.id === selectedSessionId);
  const report = selected ? buildDailyTrainingReport(selected, sessions) : undefined;

  return (
    <div className="page page-stack">
      <SectionCard title="每日训练报告">
        {sessions.length === 0 ? <p className="muted-text">保存一次训练后，这里会生成与上一次同样训练的对比报告。</p> : (
          <>
            <label className="training-form-field daily-report-session-picker">
              <span className="training-form-label">选择已保存训练</span>
              <select className="training-input" value={selectedSessionId ?? ""} onChange={(event) => setSelectedSessionId(Number(event.target.value))}>
                {sessions.map((session) => <option key={session.id} value={session.id}>{session.date} · {session.startTime} · {session.exercises.map((exercise) => getExerciseDisplayLabel(exercise.exerciseName)).join(" / ")}</option>)}
              </select>
            </label>
            {report ? (
              <>
                <div className="daily-report-summary-grid">
                  <div className="daily-report-metric"><span>本次总容量</span><strong>{Math.round(report.currentVolume).toLocaleString("zh-CN")} kg</strong><small>{formatChange(report.volumeChangePercent)}</small></div>
                  <div className="daily-report-metric"><span>正式组</span><strong>{report.workingSets}</strong><small>{report.previousWorkingSets === undefined ? "暂无上次记录" : `上次 ${report.previousWorkingSets} 组`}</small></div>
                  <div className="daily-report-metric"><span>训练时长</span><strong>{report.selected.durationMinutes} 分钟</strong><small>{report.previous ? `上次 ${report.previous.durationMinutes} 分钟` : "首次同结构训练"}</small></div>
                  <div className="daily-report-metric"><span>Session RPE</span><strong>{report.selected.sessionRpe}</strong><small>{report.previous ? `上次 ${report.previous.sessionRpe}` : "暂无上次记录"}</small></div>
                </div>
                <p className="muted-text daily-report-comparison-note">{report.previous ? `对比 ${report.previous.date} ${report.previous.startTime} 的同样训练（动作与卧推角度一致）。` : "没有找到动作与角度都一致的上一次训练，本次将作为基线。"}</p>
                <div className="daily-report-exercise-list">
                  {report.exercises.map((exercise) => (
                    <article className="daily-report-exercise" key={exercise.key}>
                      <div><h3>{getExerciseDisplayLabel(exercise.exerciseName)}</h3>{exercise.benchAngleDegrees !== undefined ? <span>{formatBenchAngle(exercise.benchAngleDegrees)}</span> : null}</div>
                      <dl>
                        <div><dt>容量</dt><dd>{Math.round(exercise.currentVolume).toLocaleString("zh-CN")} kg <small>{formatChange(exercise.volumeChangePercent)}</small></dd></div>
                        <div><dt>估算 1RM</dt><dd>{formatWeight(exercise.currentBestEstimatedOneRepMax)} <small>{exercise.previousBestEstimatedOneRepMax === undefined ? "暂无上次" : `上次 ${formatWeight(exercise.previousBestEstimatedOneRepMax)}`}</small></dd></div>
                        <div><dt>正式组</dt><dd>{exercise.workingSets} 组</dd></div>
                      </dl>
                    </article>
                  ))}
                </div>
              </>
            ) : null}
          </>
        )}
      </SectionCard>
    </div>
  );
}
