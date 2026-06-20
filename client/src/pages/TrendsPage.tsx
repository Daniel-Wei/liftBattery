import { useEffect } from "react";
import { ChartMock } from "../components/ChartMock";
import { MultiLineTrendChart } from "../components/MultiLineTrendChart";
import { SectionCard } from "../components/SectionCard";
import {
  formatTrainingTrendWeekShortLabel,
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
  const trainingTrendWeekLabels = trainingTrendWeeks.map(formatTrainingTrendWeekShortLabel);

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
        <p className="eyebrow">趋势</p>
        <h1 className="page-title">查看已保存记录带来的真实变化</h1>
        <p className="page-subtitle">
          当前趋势只使用已保存的练前检查和训练记录。
        </p>
      </header>

      <div className="two-column">
        <ChartMock
          title="练前状态分数趋势"
          data={preCheckReadinessTrend}
          variant="blue"
        />
        <ChartMock
          title="睡眠时长趋势"
          data={sleepTrend}
          variant="green"
        />
      </div>

      <div className="two-column">
        <ChartMock
          title="每周训练负荷"
          data={sessionLoadTrend}
          variant="dark"
        />
        <ChartMock
          title="每周训练量"
          data={volumeLoadTrend}
          variant="amber"
        />
      </div>

      <MultiLineTrendChart
        title="主要动作预计单次最大重量趋势"
        series={mainLiftEstimatedPrTrends.map((trend) => ({
          id: trend.id,
          label: trend.label,
          detail: trend.liftName,
          variant: trend.variant,
          data: trend.data,
        }))}
        xLabels={trainingTrendWeekLabels}
      />

      <SectionCard title="趋势数据范围" eyebrow="第一版">
        <p className="body-text">
          预计单次最大重量根据已保存正式组的重量和次数进行简单估算，
          并按周分别追踪胸部、背部和腿部主要动作。
        </p>
      </SectionCard>
    </div>
  );
}
