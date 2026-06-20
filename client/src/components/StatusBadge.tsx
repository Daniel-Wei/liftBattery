import { MetricStatus } from "../types/appTypes";
import { getMetricStatusLabel } from "../helpers/displayLabels";

type StatusBadgeProps = {
  status: MetricStatus;
  label?: string;
};

export function StatusBadge({ status, label }: StatusBadgeProps) {
  let className = "status-badge status-badge--neutral";

  if (status === MetricStatus.Good) {
    className = "status-badge status-badge--good";
  }

  if (status === MetricStatus.Watch) {
    className = "status-badge status-badge--watch";
  }

  if (status === MetricStatus.Risk) {
    className = "status-badge status-badge--risk";
  }

  return <span className={className}>{label ?? getMetricStatusLabel(status)}</span>;
}
