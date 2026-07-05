import { useEffect } from "react";
import {
  ActivityList,
  ChartLegend,
  DashboardCard,
  DashboardMetricCard,
  DonutMetric,
  InsightList,
  ProgressMetric,
  TrendLineChart,
  type ChartPoint,
  type TrendChartPoint,
} from "../components/dashboard/DashboardComponents";
import {
  getDerivedOverviewMetrics,
  getLatestTrainingSession,
  getSessionLoad,
} from "../domain/overviewMetrics";
import { calculateReadiness } from "../domain/readiness";
import { getCurrentTrainingCycle } from "../domain/trainingTrendCharts";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { getPreCheckData, selectCurrentReadiness } from "../store/selectors/preCheckSelector";
import { selectProgramSettings } from "../store/selectors/programSettingsSelector";
import { selectTrainingSessions } from "../store/selectors/trainingSelector";
import { fetchTodayPreCheck } from "../store/slices/preCheckSlice";
import { fetchTrainingDays } from "../store/slices/trainingSlice";
import {
  MetricStatus,
  ReadinessStatus,
  type Metric,
  type MuscleGroup,
  type TrainingSessionRecord,
} from "../types/appTypes";

type OverviewPageProps = {
  onOpenPreCheck?: () => void;
  onRecordTraining?: () => void;
};

const muscleGroupLabels: Record<MuscleGroup, string> = {
  Chest: "胸部",
  Back: "背部",
  Shoulders: "肩部",
  Biceps: "肱二头肌",
  Triceps: "肱三头肌",
  Quads: "股四头肌",
  Hamstrings: "腘绳肌",
  Glutes: "臀部",
  Calves: "小腿",
  Abs: "腹部",
  All: "全身",
};

function getTodayIso() {
  const now = new Date();
  const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(0, 10);
}

function addDays(date: string, days: number) {
  const nextDate = new Date(`${date}T00:00:00Z`);
  nextDate.setUTCDate(nextDate.getUTCDate() + days);
  return nextDate.toISOString().slice(0, 10);
}

function getDayDiff(from: string, to: string) {
  const fromTime = Date.parse(`${from}T00:00:00Z`);
  const toTime = Date.parse(`${to}T00:00:00Z`);

  if (Number.isNaN(fromTime) || Number.isNaN(toTime)) {
    return 0;
  }

  return Math.round((toTime - fromTime) / 86_400_000);
}

function formatNumber(value: number) {
  return Math.round(value).toLocaleString("zh-CN");
}

function formatDateShort(date: string) {
  const parsedDate = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
  }).format(parsedDate);
}

function formatRelativeDate(date: string) {
  const days = getDayDiff(date, getTodayIso());

  if (days <= 0) {
    return "today";
  }

  if (days === 1) {
    return "1d";
  }

  return `${days}d`;
}

function getSessionVolume(session: TrainingSessionRecord) {
  return session.sets.reduce((total, set) => total + set.reps * set.weightKg, 0);
}

function getHardSetCount(session: TrainingSessionRecord) {
  return session.sets.filter((set) => !set.isWarmup && (set.rir === undefined || set.rir <= 3)).length;
}

function getUniqueTrainingDates(sessions: TrainingSessionRecord[]) {
  return new Set(sessions.map((session) => session.date)).size;
}

function sortSessionsAscending(sessions: TrainingSessionRecord[]) {
  return [...sessions].sort((firstSession, secondSession) => (
    firstSession.date.localeCompare(secondSession.date)
    || firstSession.updatedAtUtc.localeCompare(secondSession.updatedAtUtc)
  ));
}

function sortSessionsNewestFirst(sessions: TrainingSessionRecord[]) {
  return [...sessions].sort((firstSession, secondSession) => (
    secondSession.date.localeCompare(firstSession.date)
    || secondSession.updatedAtUtc.localeCompare(firstSession.updatedAtUtc)
  ));
}

function getSessionsInRange(sessions: TrainingSessionRecord[], startDate: string, endDate: string) {
  return sessions.filter((session) => session.date >= startDate && session.date <= endDate);
}

function getTotalVolume(sessions: TrainingSessionRecord[]) {
  return sessions.reduce((total, session) => total + getSessionVolume(session), 0);
}

function getTotalLoad(sessions: TrainingSessionRecord[]) {
  return sessions.reduce((total, session) => total + getSessionLoad(session), 0);
}

function getPercentChange(current: number, previous: number) {
  if (previous <= 0) {
    return undefined;
  }

  const change = ((current - previous) / previous) * 100;
  return `${change >= 0 ? "" : "-"}${Math.abs(change).toFixed(1)}%`;
}

function getLatestExerciseName(session: TrainingSessionRecord | null) {
  if (!session || session.exercises.length === 0) {
    return "暂无训练";
  }

  return session.exercises[0].exerciseName;
}

function getPrimaryMuscles(session: TrainingSessionRecord | null) {
  if (!session) {
    return "等待训练记录";
  }

  const muscleGroups = [...new Set(session.exercises.map((exercise) => exercise.muscleGroup))]
    .slice(0, 3)
    .map((muscleGroup) => muscleGroupLabels[muscleGroup]);

  return muscleGroups.length > 0 ? muscleGroups.join(" / ") : "暂无肌群";
}

function getSparklineData(
  sessions: TrainingSessionRecord[],
  getValue: (session: TrainingSessionRecord) => number,
): ChartPoint[] {
  return sortSessionsAscending(sessions)
    .slice(-8)
    .map((session) => ({
      label: formatDateShort(session.date),
      value: Math.round(getValue(session)),
    }));
}

function getRecoverySparkline(logs: ReturnType<typeof getPreCheckData>["latest7Logs"]): ChartPoint[] {
  return [...logs]
    .reverse()
    .map((log) => ({
      label: formatDateShort(log.date),
      value: calculateReadiness(log.input).score,
    }));
}

function getConsistencySparkline(sessions: TrainingSessionRecord[]): ChartPoint[] {
  const today = getTodayIso();
  const dateSet = new Set(sessions.map((session) => session.date));

  return Array.from({ length: 7 }, (_, index) => {
    const date = addDays(today, index - 6);

    return {
      label: formatDateShort(date),
      value: dateSet.has(date) ? 1 : 0,
    };
  });
}

function getTrendData(sessions: TrainingSessionRecord[]): TrendChartPoint[] {
  const byDate = new Map<string, TrendChartPoint>();

  sortSessionsAscending(sessions).forEach((session) => {
    const existing = byDate.get(session.date) ?? {
      label: formatDateShort(session.date),
      load: 0,
      volume: 0,
    };

    existing.load += Math.round(getSessionLoad(session));
    existing.volume += Math.round(getSessionVolume(session));
    byDate.set(session.date, existing);
  });

  return [...byDate.values()];
}

function getOverviewWatchCards(metrics: Metric[]): Metric[] {
  const watchCards = metrics.filter((metric) => (
    metric.status === MetricStatus.Watch || metric.status === MetricStatus.Risk
  ));

  if (watchCards.length > 0) {
    return watchCards;
  }

  return [{
    label: "Stable State",
    labelZh: "当前状态稳定",
    value: "正常",
    trend: "stable",
    status: MetricStatus.Good,
    evidenceType: "watch",
    explanation: "No current derived overview metric is in watch or risk state.",
    explanationZh: "当前训练记录和练前状态里没有明显需要警惕的信号。",
  } as Metric];
}

function getMetricStatusText(status: ReadinessStatus) {
  if (status === ReadinessStatus.Ready) {
    return "Ready";
  }

  if (status === ReadinessStatus.Steady) {
    return "Steady";
  }

  if (status === ReadinessStatus.Caution) {
    return "Caution";
  }

  return "Recovery";
}

export function OverviewPage({ onOpenPreCheck, onRecordTraining }: OverviewPageProps) {
  const dispatch = useAppDispatch();
  const currentReadiness = useAppSelector(selectCurrentReadiness);
  const { latest7Logs } = useAppSelector(getPreCheckData);
  const trainingSessions = useAppSelector(selectTrainingSessions);
  const programSettings = useAppSelector(selectProgramSettings);
  const currentTrainingCycle = getCurrentTrainingCycle(programSettings);
  const latestSession = getLatestTrainingSession(trainingSessions);

  const currentCycleSessions = getSessionsInRange(
    trainingSessions,
    currentTrainingCycle.startDate,
    currentTrainingCycle.endDate,
  );
  const previousCycleStartDate = addDays(
    currentTrainingCycle.startDate,
    -(programSettings.weeksPerCycle * 7),
  );
  const previousCycleEndDate = addDays(currentTrainingCycle.startDate, -1);

  useEffect(() => {
    void dispatch(fetchTodayPreCheck());
    void dispatch(fetchTrainingDays({
      from: previousCycleStartDate,
      to: currentTrainingCycle.endDate,
    }));
  }, [currentTrainingCycle.endDate, dispatch, previousCycleStartDate]);
  const previousCycleSessions = getSessionsInRange(trainingSessions, previousCycleStartDate, previousCycleEndDate);

  const currentVolume = getTotalVolume(currentCycleSessions);
  const previousVolume = getTotalVolume(previousCycleSessions);
  const currentLoad = getTotalLoad(currentCycleSessions);
  const previousLoad = getTotalLoad(previousCycleSessions);
  const currentHardSets = currentCycleSessions.reduce((total, session) => total + getHardSetCount(session), 0);
  const consistencyDays = getUniqueTrainingDates(currentCycleSessions);
  const totalCycleDays = Math.max(1, programSettings.weeksPerCycle * 7);
  const elapsedDays = Math.max(0, getDayDiff(currentTrainingCycle.startDate, getTodayIso()) + 1);
  const currentWeek = Math.min(programSettings.weeksPerCycle, Math.max(1, Math.ceil(elapsedDays / 7)));
  const cycleProgress = Math.min(100, Math.round((elapsedDays / totalCycleDays) * 100));
  const daysRemaining = Math.max(0, getDayDiff(getTodayIso(), currentTrainingCycle.endDate));

  const derivedOverviewMetrics = getDerivedOverviewMetrics({
    trainingSessions,
    programSettings,
    currentReadiness,
  });
  const overviewWatchCards = getOverviewWatchCards(derivedOverviewMetrics);

  const recentSessions = sortSessionsNewestFirst(trainingSessions).slice(0, 4);
  const activityItems = recentSessions.map((session, index) => ({
    title: `${getLatestExerciseName(session)} completed`,
    detail: `${session.durationMinutes} min · ${formatNumber(getSessionVolume(session))} kg · ${getPrimaryMuscles(session)}`,
    meta: formatRelativeDate(session.date),
    tone: index === 0 ? "mint" as const : "cyan" as const,
  }));

  const insightItems = overviewWatchCards.slice(0, 4).map((metric) => ({
    title: metric.labelZh,
    detail: metric.explanationZh,
    action: metric.status === MetricStatus.Good ? "Keep going →" : "Review →",
    tone: metric.status === MetricStatus.Good ? "mint" as const : "yellow" as const,
  }));

  const trendData = getTrendData(currentCycleSessions.length > 0 ? currentCycleSessions : trainingSessions);
  const latestLog = latest7Logs[0] ?? null;

  return (
    <div className="overview-page">
      <section className="overview-grid overview-grid--top">
        <DashboardCard
          title="Readiness Summary"
          action={<span className="status-pill status-pill--mint">{getMetricStatusText(currentReadiness.status)}</span>}
          className="readiness-summary-card"
        >
          <div className="readiness-summary-layout">
            <DonutMetric
              value={currentReadiness.score}
              label="Readiness"
              helper={latestLog ? `Updated ${formatDateShort(latestLog.date)}` : "Live estimate"}
            />
            <div className="readiness-summary-copy">
              <h2>{currentReadiness.recommendationZh}</h2>
              <div className="readiness-factor-grid">
                <span>睡眠 <strong>{latestLog?.input.sleepHours ?? "—"}h</strong></span>
                <span>酸痛 <strong>{latestLog?.input.soreness ?? "—"} / 10</strong></span>
                <span>动力 <strong>{latestLog?.input.motivation ?? "—"} / 10</strong></span>
                <span>心率 <strong>{latestLog?.input.restingHeartRateBpm ?? "—"} bpm</strong></span>
              </div>
              <button type="button" className="inline-link" onClick={onOpenPreCheck}>
                查看练前检查 →
              </button>
            </div>
          </div>
        </DashboardCard>

        <DashboardCard title="Training Cycle">
          <div className="cycle-summary">
            <div className="cycle-summary-top">
              <strong>第 {currentWeek} 周 / 共 {programSettings.weeksPerCycle} 周</strong>
              <span>{cycleProgress}%</span>
            </div>
            <ProgressMetric
              label="Cycle progress"
              value={`${daysRemaining} days left`}
              percent={cycleProgress}
              helper={`${currentTrainingCycle.startDate} → ${currentTrainingCycle.endDate}`}
            />
            <div className="cycle-summary-stats">
              <div>
                <span>最近训练</span>
                <strong>{latestSession ? formatDateShort(latestSession.date) : "暂无"}</strong>
              </div>
              <div>
                <span>训练量</span>
                <strong>{formatNumber(currentVolume)} kg</strong>
              </div>
              <div>
                <span>连续记录</span>
                <strong>{consistencyDays} 天</strong>
              </div>
            </div>
          </div>
        </DashboardCard>
      </section>

      <section className="overview-metric-grid">
        <DashboardMetricCard
          label="Training Load"
          value={currentLoad > 0 ? formatNumber(currentLoad) : "0"}
          change={getPercentChange(currentLoad, previousLoad)}
          helper="vs previous cycle"
          data={getSparklineData(currentCycleSessions, getSessionLoad)}
          accent="cyan"
        />
        <DashboardMetricCard
          label="Training Volume"
          value={`${formatNumber(currentVolume)} kg`}
          change={getPercentChange(currentVolume, previousVolume)}
          helper="current cycle"
          data={getSparklineData(currentCycleSessions, getSessionVolume)}
          accent="mint"
        />
        <DashboardMetricCard
          label="Recovery Trend"
          value={`${currentReadiness.score} / 100`}
          change={latest7Logs.length > 1 ? `${Math.abs(currentReadiness.score - calculateReadiness(latest7Logs[1].input).score)} pts` : undefined}
          helper="latest readiness"
          data={getRecoverySparkline(latest7Logs)}
          accent="purple"
        />
        <DashboardMetricCard
          label="Consistency"
          value={`${consistencyDays} 天`}
          helper="current cycle"
          data={getConsistencySparkline(currentCycleSessions)}
          accent="yellow"
        />
      </section>

      <section>
        <DashboardCard
          title="Current Cycle Performance"
          action={<span className="chart-range-pill">Current cycle</span>}
          className="cycle-performance-card"
        >
          <ChartLegend
            items={[
              { label: "Training Load", tone: "cyan" },
              { label: "Volume", tone: "purple" },
            ]}
          />
          <TrendLineChart data={trendData} />
        </DashboardCard>
      </section>
    </div>
  );
}
