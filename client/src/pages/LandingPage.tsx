type LandingPageProps = {
  onStart: () => void;
};

export function LandingPage({ onStart }: LandingPageProps) {
  return (
    <main className="landing-page">
      <section className="landing-layout">
        <div>
          <p className="landing-eyebrow">Lift Battery</p>
          <h1 className="landing-title">
            Your training battery, without the spreadsheet.
          </h1>
          <p className="landing-copy">
            A focused 1.0 for serious recreational lifters: pre-workout readiness,
            post-workout training records, recovery context, and one overview.
          </p>
          <p className="landing-copy-muted">
            面向认真健身用户的 1.0：练前检查、训练记录、恢复记录，以及一个总览页面。
          </p>

          <button type="button" className="button-dark landing-cta" onClick={onStart}>
            Open dashboard
          </button>
        </div>

        <div className="product-preview-shell">
          <div className="preview-header">
            <div>
              <p className="preview-eyebrow">1.0 overview</p>
              <h2 className="preview-title">Simple training state</h2>
            </div>
            <span className="status-badge status-badge--good">Focused build</span>
          </div>

          <div className="preview-grid">
            <div className="preview-metric">
              <p className="preview-eyebrow">Pre-check</p>
              <p className="preview-value">Live</p>
            </div>
            <div className="preview-metric">
              <p className="preview-eyebrow">Training</p>
              <p className="preview-value">Saved</p>
            </div>
            <div className="preview-metric">
              <p className="preview-eyebrow">Trends</p>
              <p className="preview-value">Weekly</p>
            </div>
            <div className="preview-metric">
              <p className="preview-eyebrow">Overview</p>
              <p className="preview-value">Readable</p>
            </div>
          </div>

          <div className="preview-risk">
            <p className="preview-eyebrow">Plain-language output</p>
            <p className="preview-risk-title">Train as planned, lighter, or recovery-focused.</p>
            <p className="preview-risk-copy">
              The first version keeps the flow small: check readiness, save training, review trends.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
