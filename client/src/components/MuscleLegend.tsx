export function MuscleLegend() {
  return (
    <div className="muscle-legend" aria-label="肌群高亮图例">
      <span><i className="is-primary" />主肌群</span>
      <span><i className="is-secondary" />次要肌群</span>
      <span><i className="is-supporting" />辅助肌群</span>
      <span><i className="is-inactive" />未激活</span>
    </div>
  );
}

