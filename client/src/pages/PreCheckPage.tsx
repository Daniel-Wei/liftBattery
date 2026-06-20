import { useEffect, type CSSProperties } from "react";
import { PRE_CHECK_LOGS_STORAGE_KEY } from "../data/localStorageKeys";
import { SectionCard } from "../components/SectionCard";
import { StatusBadge } from "../components/StatusBadge";
import { MetricStatus } from "../types/appTypes";
import { readinessControls } from "../data/programValues";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  getPreCheckData,
  selectCurrentReadiness,
} from "../store/selectors/preCheckSelector";
import { 
  fetchTodayPreCheck,
  resetPreCheckDraft, 
  savePreCheck,
  updatePreCheckDraft 
} from "../store/slices/preCheckSlice";
import { calculateReadiness } from "../domain/readiness";

function getRangeProgress(value: number, min: number, max: number) {
  return `${Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100))}%`;
}

function formatInputValue(value: number, unit: string) {
  if (unit === "bpm" && value > 0) {
    return `+${value} ${unit}`;
  }

  return `${value} ${unit}`;
}

export function PreCheckPage() {
  const dispatch = useAppDispatch();
  const readiness = useAppSelector(selectCurrentReadiness);
  const {
    preCheckDraft,
    preCheckDraftUpdated,
    savedPreCheckLogs,
    latest7Logs,
    status,
    error,
  } = useAppSelector(getPreCheckData);

  useEffect(() => {
    void dispatch(fetchTodayPreCheck());
  }, [dispatch]);

  useEffect(() => {
    try {
      localStorage.setItem(
        PRE_CHECK_LOGS_STORAGE_KEY,
        JSON.stringify(savedPreCheckLogs),
      );
    } catch {
      // Keep UI usable if localStorage is unavailable.
    }
  }, [savedPreCheckLogs]);

  const batteryRingStyle = {
    "--battery-score": `${readiness.score}%`,
  } as CSSProperties;
  const isSaving = status === "saving";
  const isLoading = status === "loading";
  const hasBackendError = status === "error";
  const backendBadgeStatus = hasBackendError
    ? MetricStatus.Risk
    : status === "success"
      ? MetricStatus.Good
      : isLoading || isSaving
        ? MetricStatus.Watch
        : MetricStatus.Neutral;
  const backendStatusLabel = isLoading
    ? "正在读取记录"
    : isSaving
      ? "正在保存"
      : hasBackendError
        ? "同步失败"
        : status === "success"
          ? "已同步"
          : "本地草稿";

  return (
    <div className="page page-stack">
      <header className="dashboard-hero today-dashboard-hero">
        <div className="dashboard-title-row">
          <div>
            <p className="landing-eyebrow">今天</p>
            <h1 className="page-title">练前状态检查</h1>
            <p className="page-subtitle">
              训练前记录睡眠、酸痛、动力、静息心率变化和上次训练负荷，生成今天的训练建议。
            </p>
          </div>
          
        </div>

        <div className="battery-focus-panel">
          <div className="battery-panel-badges">
            <StatusBadge
              status={readiness.badgeStatus}
              label={readiness.statusLabelZh}
            />
            <StatusBadge
              status={preCheckDraftUpdated ? MetricStatus.Watch : MetricStatus.Good}
              label={preCheckDraftUpdated ? "草稿有修改" : "草稿已保存"}
            />
            <StatusBadge
              status={backendBadgeStatus}
              label={backendStatusLabel}
            />
          </div>

          <div className="battery-ring" style={batteryRingStyle}>
            <div className="battery-ring-core">
              <span className="battery-score">{readiness.score}</span>
              <span className="battery-ring-label">今日状态</span>
            </div>
          </div>
          

          <div className="battery-focus-copy">
           
            <p className="battery-focus-eyebrow">练前建议</p>
            <h2 className="battery-focus-title">{readiness.recommendationZh}</h2>
          </div>

        </div>
      </header>

      <section className="quick-log-shell">
        <div className="quick-log-header">
          <div>
            <p className="section-eyebrow">状态输入</p>
            <h2 className="section-title">训练前状态</h2>
          </div>
          <div className="quick-log-actions">
            <StatusBadge status={MetricStatus.Good} label="实时计算" />
            <button type="button" 
              className="button-dark" 
              onClick={() => {
                void dispatch(savePreCheck());
              }} 
              disabled={!preCheckDraftUpdated || isSaving}
            >
              {isSaving ? "正在保存" : "保存练前检查"}
            </button>
            <button type="button" className="button-dark" onClick={() => dispatch(resetPreCheckDraft())}>
              重置输入
            </button>
          </div>
        </div>

        {error ? <p className="form-error" role="alert">{error}</p> : null}

        <div className="quick-control-grid">
          {readinessControls.map((control) => {
            const value = preCheckDraft[control.field];
            const progress = getRangeProgress(value, control.min, control.max);

            return (
              <article key={control.field} className="quick-control-card">
                <div className="quick-control-top">
                  <div>
                    <p className="quick-control-label">{control.labelZh}</p>
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
                    dispatch(updatePreCheckDraft({ field: control.field, value: Number(event.target.value) }))
                  )}
                  className="range-input range-input--modern"
                  style={{ "--range-progress": progress } as CSSProperties}
                />
              </article>
            );
          })}
        </div>
      </section>

      <SectionCard title="主要影响因素">
        <div className="compact-card-list">
          {readiness.mainDrivers.map((mainDriver) => (
            <article key={mainDriver.id} className="compact-signal-card">
              <div>
                <p className="work-title">{mainDriver.message}</p>
              </div>
              <span className="signal-chip">{mainDriver.reason}</span>
            </article>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="已保存的练前检查">
        <div className="compact-card-list">
          {latest7Logs.length === 0 ? (
            <p className="muted-text">
              暂无已保存记录。保存今天的练前检查后，可在趋势页查看变化。
            </p>
          ) : latest7Logs.map((log) => {
            const savedReadiness = calculateReadiness(log.input);

            return (
              <article key={log.id} className="compact-signal-card">
                <div>
                  <p className="work-title">{log.date}</p>
                  <p className="info-subtitle">{savedReadiness.recommendationZh}</p>
                </div>
                <span className="signal-chip">{savedReadiness.score} / 100</span>
              </article>
            );
          })}
        </div>
      </SectionCard>

    </div>
  );
}
