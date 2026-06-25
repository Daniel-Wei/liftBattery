import { useEffect, useState } from "react";
import { CheckboxDropdown } from "../components/CheckboxDropdown";
import { TrendsReportChart } from "../components/TrendsReportChart";
import type { CreateTrendReportRequestDto } from "../api/dtos";
import {
  exerciseOptionsByMuscleGroup,
  getExerciseDisplayLabel,
  getMuscleGroupDisplayLabel,
  muscleGroupOptions,
} from "../data/programValues";
import { TREND_REPORT_JOB_ID_STORAGE_KEY } from "../data/localStorageKeys";
import { getTrainingTrendWeeks } from "../domain/trainingTrendCharts";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  createTrendReport,
  fetchTrendReportJob,
} from "../store/slices/trendReportSlice";
import type { TrainableMuscleGroup, TrendReportType } from "../types/appTypes";
import { defaultReportTypeOptions } from "../data/defaultValues";
import { normalizeToMonday, getJobStatusLabel } from "../helpers/TrendsPageHelpers";

export function TrendsPage() {
  const dispatch = useAppDispatch();
  const { job, status, error } = useAppSelector((state) => state.trendReport);

  // #region: internal states

  // #region: weeks
  const defaultWeeks = getTrainingTrendWeeks();
  const defaultStartWeek = defaultWeeks[0]?.startDate ?? "2026-04-27";
  const defaultEndWeek = defaultWeeks[defaultWeeks.length - 1]?.startDate ?? defaultStartWeek;
  const dateStepAnchorMonday = "2020-01-06";
  const [startWeek, setStartWeek] = useState(defaultStartWeek);
  const [endWeek, setEndWeek] = useState(defaultEndWeek);
  const reportWeeks = getTrainingTrendWeeks(startWeek, endWeek);

  function handleStartWeekChange(value: string) {
    const monday = normalizeToMonday(value);
    setStartWeek(monday);

    if (monday > endWeek) {
      setEndWeek(monday);
    }
  }

  function handleEndWeekChange(value: string) {
    const monday = normalizeToMonday(value);
    setEndWeek(monday);

    if (monday < startWeek) {
      setStartWeek(monday);
    }
  }
  // #endregion

  // #region: muscle selections
  const trainableMuscleGroups = muscleGroupOptions.filter(
    (muscleGroup): muscleGroup is TrainableMuscleGroup => muscleGroup !== "All",
  );

  const allMuscleSelectionOptions = trainableMuscleGroups.flatMap((muscleGroup) => (
    exerciseOptionsByMuscleGroup[muscleGroup].map((exerciseName) => ({
      key: `${muscleGroup}::${exerciseName}`,
      muscleGroup,
      exerciseName,
    }))
  ));

  const [selectedMuscleSelectionKeys, setSelectedMuscleSelectionKeys] = useState<Set<string> | null>(null);

  const selectedMuscleSelections = selectedMuscleSelectionKeys === null
    ? allMuscleSelectionOptions
    : allMuscleSelectionOptions.filter((option) => selectedMuscleSelectionKeys.has(option.key));

  const muscleSelectionSummary = selectedMuscleSelectionKeys === null
    ? "全部肌群与动作"
    : selectedMuscleSelectionKeys.size === 0
      ? "未选择肌群与动作"
      : `已选 ${selectedMuscleSelectionKeys.size} 个动作`;

  const muscleSelectionGroups = trainableMuscleGroups.map((muscleGroup) => {
    const groupOptions = allMuscleSelectionOptions.filter((option) => option.muscleGroup === muscleGroup);

    return {
      id: muscleGroup,
      label: `肌群：${getMuscleGroupDisplayLabel(muscleGroup)}`,
      selected: groupOptions.every((option) => (
            selectedMuscleSelectionKeys === null || selectedMuscleSelectionKeys.has(option.key)
          )),
          options: groupOptions.map((option) => ({
            value: option.key,
            label: getExerciseDisplayLabel(option.exerciseName),
          })),
        };
    });

  function handleMuscleSelectionToggle(selectionKey: string) {
    setSelectedMuscleSelectionKeys((currentKeys) => {
      const nextKeys = currentKeys === null
        ? new Set(allMuscleSelectionOptions.map((option) => option.key))
        : new Set(currentKeys);

      if (nextKeys.has(selectionKey)) {
        nextKeys.delete(selectionKey);
      } else {
        nextKeys.add(selectionKey);
      }

      return nextKeys.size === allMuscleSelectionOptions.length ? null : nextKeys;
    });
  }

  function handleMuscleGroupToggle(groupId: string) {
    const groupKeys = allMuscleSelectionOptions
      .filter((option) => option.muscleGroup === groupId)
      .map((option) => option.key);

    setSelectedMuscleSelectionKeys((currentKeys) => {
      const nextKeys = currentKeys === null
        ? new Set(allMuscleSelectionOptions.map((option) => option.key))
        : new Set(currentKeys);
      const groupIsSelected = groupKeys.every((key) => nextKeys.has(key));

      groupKeys.forEach((key) => {
        if (groupIsSelected) {
          nextKeys.delete(key);
        } else {
          nextKeys.add(key);
        }
      });

      return nextKeys.size === allMuscleSelectionOptions.length ? null : nextKeys;
    });
  }
  // #endregion

  // #region: reports
  const [selectedReportTypes, setSelectedReportTypes] = useState<Set<TrendReportType> | null>(null);

  const selectedReports = selectedReportTypes === null
    ? defaultReportTypeOptions
    : defaultReportTypeOptions.filter((option) => selectedReportTypes.has(option.value));

  const reportSummary = selectedReportTypes === null
    ? "全部报告"
    : selectedReportTypes.size === 0
      ? "未选择报告"
      : `已选 ${selectedReportTypes.size} 个报告`;

  function handleReportTypeToggle(value: string) {
    const reportType = value as TrendReportType;

    setSelectedReportTypes((currentTypes) => {
      const nextTypes = currentTypes === null
        ? new Set(defaultReportTypeOptions.map((option) => option.value))
        : new Set(currentTypes);

      if (nextTypes.has(reportType)) {
        nextTypes.delete(reportType);
      } else {
        nextTypes.add(reportType);
      }

      return nextTypes.size === defaultReportTypeOptions.length ? null : nextTypes;
    });
  }
  // #endregion

  // #endregion

  const canGenerate = reportWeeks.length > 0
    && selectedMuscleSelections.length > 0
    && selectedReports.length > 0
    && status !== "submitting";

  // execute any remaining job
  useEffect(() => {
    const savedJobId = Number(localStorage.getItem(TREND_REPORT_JOB_ID_STORAGE_KEY));

    if (savedJobId > 0) {
      void dispatch(fetchTrendReportJob(savedJobId));
    }
  }, [dispatch]);

  // save job id to local storage + add 1.2s delay for job execution
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
    if (!canGenerate) {
      return;
    }

    const request: CreateTrendReportRequestDto = {
      startWeek,
      endWeek,
      selections: selectedMuscleSelections.map((selection) => ({
        muscleGroup: selection.muscleGroup,
        exerciseName: selection.exerciseName,
      })),
      reportTypes: selectedReports.map((report) => report.value),
    };

    void dispatch(createTrendReport(request));
  }

  return (
    <div className="page page-stack">
      <header className="page-header">
        <p className="eyebrow">趋势报告</p>
        <h1 className="page-title">按训练周生成异步趋势报告</h1>
        <p className="page-subtitle">
          选择周范围、肌群与动作以及报告内容，提交后可离开页面，后台仍会继续生成。
        </p>
      </header>

      <section className="trend-report-builder">
        <div className="trend-report-week-row">
          <label className="trend-report-field">
            <span className="trend-report-label">起始周</span>
            <input
              className="trend-report-date-input"
              type="date"
              min={dateStepAnchorMonday}
              step="7"
              value={startWeek}
              onChange={(event) => handleStartWeekChange(event.target.value)}
            />
          </label>

          <label className="trend-report-field">
            <span className="trend-report-label">结束周</span>
            <input
              className="trend-report-date-input"
              type="date"
              min={dateStepAnchorMonday}
              step="7"
              value={endWeek}
              onChange={(event) => handleEndWeekChange(event.target.value)}
            />
          </label>

          <p className="trend-report-week-count">共 {reportWeeks.length} 周</p>
        </div>

        <div className="trend-report-filter-row">
          <div className="trend-report-selection-filter">
            <CheckboxDropdown
              label="肌群与动作"
              summary={muscleSelectionSummary}
              allLabel="全部肌群与动作"
              allSelected={selectedMuscleSelectionKeys === null}
              selectedValues={selectedMuscleSelectionKeys ?? new Set<string>()}
              groups={muscleSelectionGroups}
              onSelectAll={() => setSelectedMuscleSelectionKeys((currentKeys) => (
                currentKeys === null ? new Set() : null
              ))}
              onToggleGroup={handleMuscleGroupToggle}
              onToggleOption={handleMuscleSelectionToggle}
            />
          </div>

          <div className="trend-report-type-filter">
            <CheckboxDropdown
              label="报告内容"
              summary={reportSummary}
              allLabel="全部报告"
              allSelected={selectedReportTypes === null}
              selectedValues={selectedReportTypes ?? new Set<string>()}
              groups={[{ id: "reports", options: defaultReportTypeOptions }]}
              onSelectAll={() => setSelectedReportTypes((currentTypes) => (
                currentTypes === null ? new Set() : null
              ))}
              onToggleOption={handleReportTypeToggle}
            />
          </div>

          <button
            type="button"
            className="button-dark trend-report-generate-button"
            disabled={!canGenerate}
            onClick={handleGenerateReport}
          >
            {status === "submitting" ? "正在提交" : "生成报告"}
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
            <strong>{job.progressPercent}%</strong>
          </div>
          <div className="trend-report-progress-track">
            <span style={{ width: `${job.progressPercent}%` }} />
          </div>
          <p className="muted-text">{job.currentStage}</p>
          {job.errorMessage ? <p className="form-error">{job.errorMessage}</p> : null}
        </section>
      ) : null}

      {job?.status === "Completed" && job.result ? (
        <div className="trend-report-results">
          {job.result.charts.map((chart) => (
            <TrendsReportChart
              key={chart.type}
              chart={chart}
              weekLabels={job.result?.weekLabels ?? []}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
