import { ChartMock } from "../components/ChartMock";
import { EvidenceNote } from "../components/EvidenceNote";
import { MetricCard } from "../components/MetricCard";
import { bodyweightTrend, nutritionMetrics, nutritionTrend } from "../data/mockData";

export function NutritionPage() {
  return (
    <div className="page page-stack">
      <header className="page-header">
        <p className="eyebrow">Nutrition / 饮食压力</p>
        <h1 className="page-title">Connect bodyweight rate, hunger, and training context.</h1>
      </header>

      <section className="metric-grid">
        {nutritionMetrics.map((metric) => (
          <MetricCard key={metric.label} metric={metric} showExplanation />
        ))}
      </section>

      <div className="two-column">
        <ChartMock title="Bodyweight trend" titleZh="体重趋势" data={bodyweightTrend} variant="blue" />
        <ChartMock title="Calories trend" titleZh="热量趋势" data={nutritionTrend} variant="purple" />
      </div>

      <EvidenceNote title="Cut-pressure boundary / 减脂压力边界" evidenceType="watch">
        <p>Bodyweight and nutrition trends help explain training state during a cut. They are not extreme dieting instructions.</p>
        <p>体重和饮食趋势帮助解释减脂期训练状态，但不是极端节食指令。</p>
      </EvidenceNote>
    </div>
  );
}
