type LandingPageProps = {
  onOpenOverview: () => void;
};

export function LandingPage({ onOpenOverview }: LandingPageProps) {
  return (
    <main className="landing-page">
      <section className="landing-layout">
        <div>
          <p className="landing-eyebrow">LiftOps</p>
          <h1 className="landing-title">
            Training science log for serious lifters.
          </h1>
          <p className="landing-copy">
            Record session load, RIR/RPE, hard sets, volume load, wellness, bodyweight trend,
            and nutrition pressure without pretending every proxy is exact physiology.
          </p>
          <p className="landing-copy-muted">
            面向认真训练者的训练科学记录与状态视图。先记录关键输入，再看哪些输出发生变化。
          </p>

          <div className="landing-actions">
            <button
              type="button"
              onClick={onOpenOverview}
              className="button-primary"
            >
              Open overview
            </button>
            <span className="button-secondary">
              Phase 1 static UI
            </span>
          </div>
        </div>

        <div className="product-preview-shell">
          <div className="product-preview">
            <div className="preview-header">
              <div>
              <p className="preview-eyebrow">Training view</p>
                <h2 className="preview-title">Cut Block 03</h2>
              </div>
              <span className="status-badge status-badge--good">Maintain</span>
            </div>

            <div className="preview-grid">
              {["Session Load", "Hard Sets", "Top Set RPE", "Wellness"].map((label) => (
                <div key={label} className="preview-metric">
                  <p className="preview-eyebrow">{label}</p>
                  <p className="preview-value">{label === "Top Set RPE" ? "9" : label === "Session Load" ? "610" : "68"}</p>
                </div>
              ))}
            </div>

            <div className="preview-risk">
              <p className="preview-eyebrow">Watch state</p>
              <p className="preview-risk-title">Load is rising while wellness is drifting down.</p>
              <p className="preview-risk-copy">A training-monitoring signal, not a diagnosis or automatic deload command.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
