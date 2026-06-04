import { ChartMock } from "../components/ChartMock";
import { SectionCard } from "../components/SectionCard";
import {
  getWeeklyEstimatedPrTrend,
  getWeeklySessionLoadTrend,
  getWeeklyVolumeLoadTrend,
} from "../domain/trainingTrendCharts";
import { useTrainingLog } from "../state/TrainingLogContext";
import type { DailyTrainingLog, TrendPoint } from "../types/appTypes";

function sortLogsOldestFirst(logs: DailyTrainingLog[]) {
  return [...logs].sort((firstLog, secondLog) => (
    firstLog.date.localeCompare(secondLog.date)
    || firstLog.updatedAt.localeCompare(secondLog.updatedAt)
  ));
}

function getReadinessScoreTrend(logs: DailyTrainingLog[]): TrendPoint[] {
  return sortLogsOldestFirst(logs).slice(-7).map((log) => ({
    label: log.date.slice(5),
    value: log.readiness.score,
  }));
}

function getSleepTrend(logs: DailyTrainingLog[]): TrendPoint[] {
  return sortLogsOldestFirst(logs).slice(-7).map((log) => ({
    label: log.date.slice(5),
    value: log.input.sleepHours,
  }));
}

export function TrendsPage() {
  const { logs, trainingSessions } = useTrainingLog();

  const readinessScoreTrend = getReadinessScoreTrend(logs);
  const sleepTrend = getSleepTrend(logs);
  const sessionLoadTrend = getWeeklySessionLoadTrend(trainingSessions);
  const volumeLoadTrend = getWeeklyVolumeLoadTrend(trainingSessions);
  const estimatedPrTrend = getWeeklyEstimatedPrTrend(trainingSessions);

  return (
    <div className="page page-stack">
      <header className="page-header">
        <p className="eyebrow">Trends / 趋势</p>
        <h1 className="page-title">Review what your saved records are actually changing.</h1>
        <p className="page-subtitle">
          Trends only use saved pre-workout checks and saved training sessions for now.
        </p>
      </header>

      <div className="two-column">
        <ChartMock
          title="Readiness score"
          titleZh="状态分趋势"
          data={readinessScoreTrend}
          variant="blue"
        />
        <ChartMock
          title="Sleep hours"
          titleZh="睡眠时长趋势"
          data={sleepTrend}
          variant="green"
        />
      </div>

      <div className="two-column">
        <ChartMock
          title="Weekly session load"
          titleZh="周训练负荷"
          data={sessionLoadTrend}
          variant="dark"
        />
        <ChartMock
          title="Weekly training volume"
          titleZh="周训练量"
          data={volumeLoadTrend}
          variant="amber"
        />
      </div>

      <ChartMock
        title="Estimated PR trend"
        titleZh="PR 推测趋势"
        data={estimatedPrTrend}
        variant="purple"
      />

      <SectionCard title="Trend scope" titleZh="趋势范围" eyebrow="1.0">
        <p className="body-text">
          Estimated PR uses a simple e1RM proxy from saved working sets. It is useful for direction,
          not a guaranteed max attempt number.
        </p>
      </SectionCard>
    </div>
  );
}
