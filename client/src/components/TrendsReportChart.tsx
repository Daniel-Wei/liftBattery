import type { TrendReportChartDto } from "../api/dtos";
import {
  getExerciseDisplayLabel,
  getMuscleGroupDisplayLabel,
} from "../data/programValues";
import type { MuscleGroup } from "../types/appTypes";
import { ChartMock } from "./ChartMock";
import { MultiLineTrendChart } from "./MultiLineTrendChart";

type TrendsReportChartProps = {
  chart: TrendReportChartDto;
  weekLabels: string[];
};

function toCycleLabel(label: string, index: number) {
  const weekNumber = /^W(\d+)$/i.exec(label)?.[1];
  return weekNumber ? `周期 ${weekNumber}` : label || `周期 ${index + 1}`;
}

export function TrendsReportChart({ chart, weekLabels }: TrendsReportChartProps) {
  const cycleLabels = weekLabels.map(toCycleLabel);

  if (chart.type === "estimatedPr") {
    return (
      <MultiLineTrendChart
        title={chart.title}
        series={chart.series.map((series) => ({
          ...series,
          label: getExerciseDisplayLabel(series.label),
          detail: series.detail
            ? getMuscleGroupDisplayLabel(series.detail as MuscleGroup)
            : undefined,
          data: series.data.map((point, index) => ({
            ...point,
            label: toCycleLabel(point.label, index),
          })),
        }))}
        xLabels={cycleLabels}
      />
    );
  }

  const series = chart.series[0];

  return (
    <ChartMock
      title={chart.title}
      data={(series?.data ?? []).map((point, index) => ({
        ...point,
        label: toCycleLabel(point.label, index),
      }))}
      variant={series?.variant ?? "blue"}
    />
  );
}
