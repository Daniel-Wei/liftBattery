import {
  EvidenceType,
  MetricStatus,
  RiskSeverity,
  TrendDirection,
} from "../types/appTypes";

const evidenceTypeLabels: Record<EvidenceType, string> = {
  [EvidenceType.Established]: "通用方法",
  [EvidenceType.SimpleArithmetic]: "简单计算",
  [EvidenceType.Heuristic]: "经验判断",
  [EvidenceType.Proxy]: "参考指标",
  [EvidenceType.Watch]: "需要留意",
};

const metricStatusLabels: Record<MetricStatus, string> = {
  [MetricStatus.Good]: "良好",
  [MetricStatus.Watch]: "留意",
  [MetricStatus.Risk]: "风险",
  [MetricStatus.Neutral]: "正常",
};

const trendDirectionLabels: Record<TrendDirection, string> = {
  [TrendDirection.Up]: "上升",
  [TrendDirection.Down]: "下降",
  [TrendDirection.Stable]: "稳定",
};

const riskSeverityLabels: Record<RiskSeverity, string> = {
  [RiskSeverity.Low]: "低",
  [RiskSeverity.Medium]: "中",
  [RiskSeverity.High]: "高",
};

export function getEvidenceTypeLabel(value: EvidenceType) {
  return evidenceTypeLabels[value];
}

export function getMetricStatusLabel(value: MetricStatus) {
  return metricStatusLabels[value];
}

export function getTrendDirectionLabel(value: TrendDirection) {
  return trendDirectionLabels[value];
}

export function getRiskSeverityLabel(value: RiskSeverity) {
  return riskSeverityLabels[value];
}
