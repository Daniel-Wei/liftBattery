type LandingPageProps = {
  onStart: () => void;
};

const productModules = [
  {
    label: "Pre-check",
    labelZh: "练前检查",
    title: "Know today's training direction",
    titleZh: "先判断今天怎么练",
    description: "Sleep, soreness, motivation, resting heart-rate change, and last-session effort feed a readiness view.",
    descriptionZh: "睡眠、酸痛、动力、静息心率变化和上次训练强度，会影响今日训练建议。",
  },
  {
    label: "Training log",
    labelZh: "训练记录",
    title: "Save real session output",
    titleZh: "保存真实训练输出",
    description: "Session RPE, duration, sets, reps, load, exercise, and muscle group drive the training cards.",
    descriptionZh: "训练 RPE、时长、组数、次数、重量、动作和肌群，会驱动训练页的指标卡。",
  },
  {
    label: "Trends",
    labelZh: "趋势",
    title: "See simple weekly direction",
    titleZh: "看懂简单周趋势",
    description: "Readiness, training volume, session load, and estimated PR trends stay in one review page.",
    descriptionZh: "状态、训练量、训练负荷和估算 PR 趋势集中在一个复盘页面。",
  },
];

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

          <div className="level-picker">
            {productModules.map((module) => (
              <article key={module.label} className="level-card">
                <span className="level-card-kicker">{module.label} / {module.labelZh}</span>
                <span className="level-card-title">{module.title}</span>
                <span className="level-card-title-zh">{module.titleZh}</span>
                <span className="level-card-copy">{module.description}</span>
                <span className="level-card-copy">{module.descriptionZh}</span>
              </article>
            ))}
          </div>

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
