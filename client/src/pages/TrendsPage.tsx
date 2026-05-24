import { ChartMock } from "../components/ChartMock";
import { getLevelData } from "../data/mockData";
import type { UserLevel } from "../types/appTypes";

type TrendsPageProps = {
  selectedLevel: UserLevel;
};

export function TrendsPage({ selectedLevel }: TrendsPageProps) {
  const data = getLevelData(selectedLevel);

  return (
    <div className="page page-stack">
      <header className="page-header">
        <p className="eyebrow">Trends / 趋势</p>
        <h1 className="page-title">Find the pattern before it becomes obvious in the gym.</h1>
        <p className="page-subtitle">
          The goal is not more charts. It is noticing when training pressure, recovery, and bodyweight start pulling in different directions.
        </p>
      </header>

      <div className="two-column">
        <ChartMock title="Training pressure" titleZh="训练压力" data={data.loadTrend} variant="dark" />
        <ChartMock title="Recovery" titleZh="恢复" data={data.recoveryTrend} variant="green" />
        <ChartMock title="Training volume" titleZh="训练量" data={data.volumeTrend} variant="amber" />
        <ChartMock title="Bodyweight trend" titleZh="体重趋势" data={data.bodyweightTrend} variant="blue" />
        <ChartMock title="Calories context" titleZh="热量语境" data={data.nutritionTrend} variant="purple" />
      </div>
    </div>
  );
}
