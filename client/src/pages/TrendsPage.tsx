import { ChartMock } from "../components/ChartMock";
import { bodyweightTrend, loadTrend, nutritionTrend, recoveryTrend, volumeTrend } from "../data/mockData";

export function TrendsPage() {
  return (
    <div className="page page-stack">
      <header className="page-header">
        <p className="eyebrow">Trends / 趋势</p>
        <h1 className="page-title">Compare load, recovery, volume, and nutrition trends.</h1>
      </header>

      <div className="two-column">
        <ChartMock title="Training load" titleZh="训练负荷" data={loadTrend} variant="dark" />
        <ChartMock title="Fatigue / recovery proxy" titleZh="疲劳 / 恢复 Proxy" data={recoveryTrend} variant="green" />
        <ChartMock title="Hard sets" titleZh="Hard sets" data={volumeTrend} variant="amber" />
        <ChartMock title="Bodyweight trend" titleZh="体重趋势" data={bodyweightTrend} variant="blue" />
        <ChartMock title="Calories / carbs proxy panel" titleZh="热量 / 碳水趋势面板" data={nutritionTrend} variant="purple" />
      </div>
    </div>
  );
}
