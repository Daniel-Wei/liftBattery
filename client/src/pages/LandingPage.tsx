type LandingPageProps = {
  onStart: () => void;
};

export function LandingPage({ onStart }: LandingPageProps) {
  return (
    <main className="landing-page">
      <section className="landing-layout">
        <div>
          <p className="landing-eyebrow">训练电量</p>
          <h1 className="landing-title">
            不用表格，也能看懂自己的训练状态。
          </h1>
          <p className="landing-copy">
            面向认真健身用户的第一版：记录练前状态和训练内容，并用一个总览查看变化。
          </p>
          <p className="landing-copy-muted">
            先把必要流程做好：检查今天的状态、保存训练、回看趋势。
          </p>

          <button type="button" className="button-dark landing-cta" onClick={onStart}>
            打开训练总览
          </button>
        </div>

        <div className="product-preview-shell">
          <div className="preview-header">
            <div>
              <p className="preview-eyebrow">第一版总览</p>
              <h2 className="preview-title">简单清楚的训练状态</h2>
            </div>
            <span className="status-badge status-badge--good">核心功能</span>
          </div>

          <div className="preview-grid">
            <div className="preview-metric">
              <p className="preview-eyebrow">练前检查</p>
              <p className="preview-value">实时</p>
            </div>
            <div className="preview-metric">
              <p className="preview-eyebrow">训练记录</p>
              <p className="preview-value">已保存</p>
            </div>
            <div className="preview-metric">
              <p className="preview-eyebrow">训练趋势</p>
              <p className="preview-value">按周查看</p>
            </div>
            <div className="preview-metric">
              <p className="preview-eyebrow">训练总览</p>
              <p className="preview-value">一目了然</p>
            </div>
          </div>

          <div className="preview-risk">
            <p className="preview-eyebrow">清楚直接的建议</p>
            <p className="preview-risk-title">按计划训练、适当减量，或优先恢复。</p>
            <p className="preview-risk-copy">
              第一版只保留最实用的流程：检查状态、保存训练、查看趋势。
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
