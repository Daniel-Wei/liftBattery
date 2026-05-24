import { getLevelData, levelProfiles } from "../data/mockData";
import type { UserLevel } from "../types/appTypes";

type LandingPageProps = {
  selectedLevel: UserLevel;
  onSelectLevel: (level: UserLevel) => void;
};

export function LandingPage({ selectedLevel, onSelectLevel }: LandingPageProps) {
  const previewData = getLevelData(selectedLevel);
  const previewMetrics = previewData.overviewMetrics.slice(0, 4);

  return (
    <main className="landing-page">
      <section className="landing-layout">
        <div>
          <p className="landing-eyebrow">LiftOps</p>
          <h1 className="landing-title">
            A simple training readout for people who lift seriously.
          </h1>
          <p className="landing-copy">
            Log a few daily signals, then see whether today should be push, normal, lighter,
            or recovery-focused. The science stays behind the explanation layer.
          </p>
          <p className="landing-copy-muted">
            面向认真训练者的训练科学记录与状态视图。先记录关键输入，再看哪些输出发生变化。
          </p>

          <div className="level-picker">
            {levelProfiles.map((profile) => (
              <button
                key={profile.level}
                type="button"
                onClick={() => onSelectLevel(profile.level)}
                className={profile.level === selectedLevel ? "level-card level-card--active" : "level-card"}
              >
                <span className="level-card-kicker">{profile.label} / {profile.labelZh}</span>
                <span className="level-card-title">{profile.title}</span>
                <span className="level-card-title-zh">{profile.titleZh}</span>
                <span className="level-card-copy">{profile.description}</span>
                <span className="level-card-copy">{profile.descriptionZh}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="product-preview-shell">
          <div className="product-preview">
            <div className="preview-header">
              <div>
                <p className="preview-eyebrow">Today view</p>
                <h2 className="preview-title">{previewData.userCase.name}</h2>
              </div>
              <span className="status-badge status-badge--watch">{previewData.trainingBlock.trainingMode}</span>
            </div>

            <div className="preview-grid">
              {previewMetrics.map((metric) => (
                <div key={metric.label} className="preview-metric">
                  <p className="preview-eyebrow">{metric.label}</p>
                  <p className="preview-value">{metric.value}</p>
                </div>
              ))}
            </div>

            <div className="preview-risk">
              <p className="preview-eyebrow">Plain-language output</p>
              <p className="preview-risk-title">{previewData.riskWatches[0]?.title}</p>
              <p className="preview-risk-copy">{previewData.riskWatches[0]?.recommendation}</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
