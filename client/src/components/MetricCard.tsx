import type { Metric } from "../types/appTypes";
import { EvidenceNote } from "./EvidenceNote";
import { StatusBadge } from "./StatusBadge";
import {
  getEvidenceTypeLabel,
  getTrendDirectionLabel,
} from "../helpers/displayLabels";

type MetricCardProps = {
  metric: Metric;
  showExplanation?: boolean;
};

export function MetricCard({ metric, showExplanation = false }: MetricCardProps) {
  return (
    <article className="metric-card">
      <div className="metric-card-header">
        <div>
          <p className="metric-label">{metric.labelZh}</p>
        </div>
        <StatusBadge status={metric.status} label={getEvidenceTypeLabel(metric.evidenceType)} />
      </div>

      <div className="metric-card-bottom">
        <p className="metric-value">{metric.value}</p>
        <p className="metric-trend">{getTrendDirectionLabel(metric.trend)}</p>
      </div>

      {showExplanation ? (
        <div className="metric-note">
          <EvidenceNote title={getEvidenceTypeLabel(metric.evidenceType)} evidenceType={metric.evidenceType}>
            <p>{metric.explanationZh}</p>
          </EvidenceNote>
        </div>
      ) : null}
    </article>
  );
}
