import { useEffect, useMemo, useState } from "react";
import { MuscleStimulationReport } from "../components/MuscleStimulationReport";
import type { CreateTrendReportRequestDto, TrendReportSummaryCardDto } from "../api/dtos";
import { TREND_REPORT_JOB_ID_STORAGE_KEY } from "../data/localStorageKeys";
import { getTrainingCycles } from "../domain/trainingTrendCharts";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  createTrendReport,
  fetchTrendReportJob,
} from "../store/slices/trendReportSlice";
import { getJobStatusLabel } from "../helpers/TrendsPageHelpers";
import { selectProgramSettings } from "../store/selectors/programSettingsSelector";

function formatSummaryValue(card: TrendReportSummaryCardDto, value: number | undefined) {
  if (value === undefined || !Number.isFinite(value)) {
    return "—";
  }

  if (card.type === "readiness") {
    return `${Math.round(value)} / 100`;
  }

  if (card.type === "sleep") {
    return `${Number(value.toFixed(1))} 小时`;
  }

  if (card.unit === "kg") {
    return `${Math.round(value).toLocaleString("zh-CN")} 公斤`;
  }

  return Math.round(value).toLocaleString("zh-CN");
}

function getSummaryTitle(title: string) {
  if (title === "Readiness") return "恢复状态";
  if (title === "Sleep") return "睡眠";
  if (title === "Training Load") return "训练负荷";
  if (title === "Training Volume") return "训练容量";
  return title;
}

function TrendSummarySparkline({ points }: { points?: number[] }) {
  const chartPoints = (points ?? []).filter(Number.isFinite);

  if (chartPoints.length < 2 || chartPoints.every((point) => point === chartPoints[0])) {
    return <span className="trend-summary-empty-line" />;
  }

  const min = Math.min(...chartPoints);
  const max = Math.max(...chartPoints);
  const range = Math.max(max - min, 1);
  const path = chartPoints
    .map((point, index) => {
      const x = chartPoints.length === 1 ? 0 : (index / (chartPoints.length - 1)) * 100;
      const y = 34 - ((point - min) / range) * 28;
      return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");

  return (
    <svg className="trend-summary-sparkline" viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden="true">
      <path d={path} />
    </svg>
  );
}

function TrendSummaryCardView({ card }: { card: TrendReportSummaryCardDto }) {
  const isNegativeChange = typeof card.changePercent === "number" && card.changePercent < 0;
  const changeClassName = isNegativeChange
    ? "metric-change metric-change--negative"
    : "metric-change";
  const variant = card.variant ?? "cyan";

  return (
    <article className={`metric-card metric-card--${variant} trend-summary-card`}>
      <span className="metric-accent-bar" />
      <p className="metric-label">{getSummaryTitle(card.title)}</p>
      <div className="metric-value-row">
        <strong className="metric-value">{formatSummaryValue(card, card.value)}</strong>
        {typeof card.changePercent === "number" ? (
          <span className={changeClassName}>
            {isNegativeChange ? "↓" : "↑"} {Number(Math.abs(card.changePercent).toFixed(1))}%
          </span>
        ) : null}
      </div>
      {card.comparisonValue !== undefined ? (
        <p className="trend-summary-comparison">对比周期 {formatSummaryValue(card, card.comparisonValue)}</p>
      ) : null}
      <p className="metric-helper">{card.comparisonValue === undefined ? "所选周期" : "对比周期变化"}</p>
      <TrendSummarySparkline points={card.sparklineValues} />
    </article>
  );
}

export function TrendsPage() {
  const dispatch = useAppDispatch();
  const { job, status, error } = useAppSelector((state) => state.trendReport);
  const programSettings = useAppSelector(selectProgramSettings);

  const trainingCycles = useMemo(() => getTrainingCycles(programSettings), [programSettings]);
  const [selectedCycleNumber, setSelectedCycleNumber] = useState<number | "">("");
  const [comparisonCycleNumber, setComparisonCycleNumber] = useState<number | "">("");
  const selectedCycle = trainingCycles.find((cycle) => cycle.cycleNumber === selectedCycleNumber);
  const comparisonCycle = comparisonCycleNumber === ""
    ? null
    : trainingCycles.find((cycle) => cycle.cycleNumber === comparisonCycleNumber) ?? null;

  const currentReportRequest = useMemo<CreateTrendReportRequestDto | null>(() => {
    if (!selectedCycle) {
      return null;
    }

    const nextRequest: CreateTrendReportRequestDto = {
      startWeek: selectedCycle.startDate,
      endWeek: selectedCycle.endWeekStartDate,
    };

    if (comparisonCycle) {
      nextRequest.comparisonStartWeek = comparisonCycle.startDate;
      nextRequest.comparisonEndWeek = comparisonCycle.endWeekStartDate;
    }

    return nextRequest;
  }, [comparisonCycle, selectedCycle]);

  const activeJobIsGenerating = job?.status === "Queued" || job?.status === "Processing";
  const progressPercent = Math.max(0, Math.min(100, job?.progressPercent ?? 0));
  const completedResult = job?.status === "Completed" ? job.result : undefined;
  const summaryCards = completedResult?.summaryCards ?? [];
  const currentReportNeedsRegeneration = job?.status === "Outdated"
    || job?.status === "Superseded"
    || job?.status === "CancelRequested";
  const canGenerate = currentReportRequest !== null && status !== "submitting";
  const generateButtonText = status === "submitting"
    ? "正在提交"
    : activeJobIsGenerating || currentReportNeedsRegeneration
      ? "重新生成报告"
      : "生成报告";

  // execute any remaining jobs
  useEffect(() => {
    const savedJobId = Number(localStorage.getItem(TREND_REPORT_JOB_ID_STORAGE_KEY));

    if (savedJobId > 0) {
      void dispatch(fetchTrendReportJob(savedJobId));
    }
  }, [dispatch]);

  useEffect(() => {
    if (!job) {
      return;
    }

    localStorage.setItem(TREND_REPORT_JOB_ID_STORAGE_KEY, job.id.toString());

    if (job.status !== "Queued" && job.status !== "Processing") {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      void dispatch(fetchTrendReportJob(job.id));
    }, 1200);

    return () => window.clearTimeout(timeoutId);
  }, [dispatch, job]);

  function handleGenerateReport() {
    if (!canGenerate || currentReportRequest === null) {
      return;
    }

    void dispatch(createTrendReport(currentReportRequest));
  }

  return (
    <div className="page page-stack">
      <section className="trend-report-builder">
        <div className="trend-report-week-row trend-report-week-row--compact">
          <label className="trend-report-field">
            <span className="trend-report-label">目标训练周期</span>
            <select
              className="trend-report-date-input"
              value={selectedCycleNumber}
              onChange={(event) =>
                setSelectedCycleNumber(
                  event.target.value === "" ? "" : Number(event.target.value)
                )
              }
            >
              <option value="">请选择目标训练周期</option>

              {trainingCycles.map((cycle) => (
                <option key={cycle.cycleNumber} value={cycle.cycleNumber}>
                  {cycle.label}
                </option>
              ))}
            </select>
            <small className="trend-report-period-meta">
              {selectedCycle ? `${selectedCycle.startDate} 至 ${selectedCycle.endDate}` : ""}
            </small>
          </label>

          <label className="trend-report-field">
            <span className="trend-report-label">对比周期（可选）</span>
            <select
              className="trend-report-date-input"
              value={comparisonCycleNumber}
              onChange={(event) => setComparisonCycleNumber(event.target.value === "" ? "" : Number(event.target.value))}
            >
              <option value="">不对比，只看目标周期</option>
              {trainingCycles
                .filter((cycle) => cycle.cycleNumber !== selectedCycle?.cycleNumber)
                .map((cycle) => (
                  <option key={cycle.cycleNumber} value={cycle.cycleNumber}>
                    {cycle.label}
                  </option>
                ))}
            </select>
            <small className="trend-report-period-meta">
              {comparisonCycle ? `${comparisonCycle.startDate} 至 ${comparisonCycle.endDate}` : ""}
            </small>
          </label>

          <button
            type="button"
            className="button-primary trend-report-generate-button"
            disabled={!canGenerate}
            onClick={handleGenerateReport}
          >
            {generateButtonText}
          </button>
        </div>
      </section>

      {error ? <p className="form-error" role="alert">{error}</p> : null}

      {job && job.status !== "Completed" ? (
        <section className="trend-report-job-status" aria-live="polite">
          <div className="trend-report-job-heading">
            <div>
              <p className="section-eyebrow">报告任务</p>
              <h2 className="section-title">{getJobStatusLabel(job.status)}</h2>
            </div>
            <strong>{progressPercent}%</strong>
          </div>
          <div className="trend-report-progress-track">
            <span style={{ width: `${progressPercent}%` }} />
          </div>
          <p className="muted-text">{job.currentStage}</p>
          {job.errorMessage ? <p className="form-error">{job.errorMessage}</p> : null}
        </section>
      ) : null}

      {completedResult ? (
        <div className="trend-report-results">
          {summaryCards.length > 0 ? (
            <section className="trend-summary-card-grid" aria-label="趋势报告摘要">
              {summaryCards.map((card) => (
                <TrendSummaryCardView key={card.title} card={card} />
              ))}
            </section>
          ) : (
            <section className="empty-card">
              <p className="muted-text">本周期暂无足够数据生成趋势摘要。</p>
            </section>
          )}

          {completedResult.muscleStimulation ? (
            <MuscleStimulationReport
              report={completedResult.muscleStimulation}
              hasComparison={Boolean(completedResult.comparisonStartWeek)}
            />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
