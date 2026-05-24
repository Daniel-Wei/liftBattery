import { EvidenceNote } from "../components/EvidenceNote";
import { SectionCard } from "../components/SectionCard";
import { weeklyReview } from "../data/mockData";

export function WeeklyReviewPage() {
  return (
    <div className="page page--narrow page-stack">
      <header className="page-header">
        <p className="eyebrow">Weekly Review / 每周复盘</p>
        <h1 className="page-title">Review the training operations week.</h1>
      </header>

      <SectionCard title="Weekly summary" titleZh="每周总结" eyebrow="Static review">
        <p className="body-text body-text--strong">{weeklyReview.summary}</p>
        <p className="body-text">{weeklyReview.summaryZh}</p>

        <div className="three-column">
          <div className="info-card">
            <p className="info-label">Weekly load</p>
            <p className="review-value">{weeklyReview.weeklyLoad}</p>
          </div>
          <div className="info-card">
            <p className="info-label">Monotony</p>
            <p className="review-value">{weeklyReview.monotony}</p>
          </div>
          <div className="info-card">
            <p className="info-label">Bodyweight rate</p>
            <p className="review-value">{weeklyReview.bodyweightRate}</p>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Risk watch changes" titleZh="风险观察变化">
        <ul className="card-list">
          {weeklyReview.riskChanges.map((change) => (
            <li key={change} className="review-item">
              {change}
            </li>
          ))}
        </ul>
      </SectionCard>

      <EvidenceNote title="Next week review / 下周复盘重点" evidenceType="watch">
        <p>{weeklyReview.nextWeek}</p>
        <p>{weeklyReview.nextWeekZh}</p>
      </EvidenceNote>
    </div>
  );
}
