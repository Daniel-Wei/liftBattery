import { useEffect } from "react";
import { ChartMock } from "../components/ChartMock";
import { MultiLineTrendChart } from "../components/MultiLineTrendChart";
import { SectionCard } from "../components/SectionCard";
import {
  getTrainingTrendWeeks,
  getWeeklyMainLiftEstimatedPrTrends,
  getWeeklySessionLoadTrend,
  getWeeklyVolumeLoadTrend,
} from "../domain/trainingTrendCharts";
import {
  getPreCheckReadinessTrend,
  getSleepTrend,
} from "../helpers/TrendsPageHelpers";
import { useAppSelector } from "../store/hooks";
import { useAppDispatch } from "../store/hooks";
import { getPreCheckData } from "../store/selectors/preCheckSelector";
import { selectTrainingSessions } from "../store/selectors/trainingSelector";
import { fetchTrainingSessions } from "../store/slices/trainingSlice";

export function TrendsPage() {
  const dispatch = useAppDispatch();
  const { savedPreCheckLogs } = useAppSelector(getPreCheckData);
  const trainingSessions = useAppSelector(selectTrainingSessions);
  const trainingTrendWeeks = getTrainingTrendWeeks();
  const firstTrainingTrendWeek = trainingTrendWeeks[0];
  const lastTrainingTrendWeek = trainingTrendWeeks[trainingTrendWeeks.length - 1];
  const preCheckReadinessTrend = getPreCheckReadinessTrend(savedPreCheckLogs);
  const sleepTrend = getSleepTrend(savedPreCheckLogs);
  const sessionLoadTrend = getWeeklySessionLoadTrend(trainingSessions);
  const volumeLoadTrend = getWeeklyVolumeLoadTrend(trainingSessions);
  const mainLiftEstimatedPrTrends = getWeeklyMainLiftEstimatedPrTrends(trainingSessions);
  const trainingTrendWeekLabels = trainingTrendWeeks.map((week) => week.label);

  useEffect(() => {
    if (!firstTrainingTrendWeek || !lastTrainingTrendWeek) {
      return;
    }

    void dispatch(fetchTrainingSessions({
      from: firstTrainingTrendWeek.startDate,
      to: lastTrainingTrendWeek.endDate,
    }));
  }, [dispatch, firstTrainingTrendWeek, lastTrainingTrendWeek]);

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
          title="Pre-check records / 练前检查记录"
          titleZh="状态分趋势"
          data={preCheckReadinessTrend}
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

      <MultiLineTrendChart
        title="Main lift estimated PR trend"
        titleZh="三大项 PR 推测趋势"
        series={mainLiftEstimatedPrTrends.map((trend) => ({
          id: trend.id,
          label: trend.label,
          detail: trend.liftName,
          variant: trend.variant,
          data: trend.data,
        }))}
        xLabels={trainingTrendWeekLabels}
      />

      <SectionCard title="Trend scope" titleZh="趋势范围" eyebrow="1.0">
        <p className="body-text">
          Estimated PR uses a simple e1RM proxy from saved working sets. The main-lift PR chart
          tracks Chest, Back, and Leg training separately by week.
        </p>
      </SectionCard>
    </div>
  );
}
