import { useMemo, useState } from "react";
import { MuscleLegend } from "./MuscleLegend";
import { MuscleModelViewer } from "./MuscleModelViewer";
import type { MuscleStimulationReportDto } from "../api/dtos";
import {
  getMuscleGroupDisplayLabel,
  muscleGroupOptions,
} from "../data/programValues";
import type { MuscleSvgActivation, MuscleVisualRole } from "../domain/muscleAssetTypes";
import type { MuscleGroup, MuscleMapKey } from "../types/appTypes";

type MuscleStimulationReportProps = {
  report: MuscleStimulationReportDto;
  hasComparison?: boolean;
};

const muscleGroupToFigureMuscles: Record<Exclude<MuscleGroup, "All">, MuscleMapKey[]> = {
  Chest: ["pecClavicular", "pecSternocostal", "pecAbdominal", "pectoralisMinor"],
  Back: [
    "latissimusDorsi",
    "teresMajor",
    "teresMinor",
    "infraspinatus",
    "rhomboidMajor",
    "rhomboidMinor",
    "upperTrapezius",
    "midTrapezius",
    "lowerTrapezius",
    "erectorSpinae",
  ],
  Shoulders: ["frontDeltoid", "sideDeltoid", "rearDeltoid"],
  Biceps: ["bicepsLongHead", "bicepsShortHead", "brachialis", "brachioradialis"],
  Triceps: ["tricepsLongHead", "tricepsLateralHead", "tricepsMedialHead"],
  Quads: ["rectusFemoris", "vastusLateralis", "vastusMedialis", "vastusIntermedius"],
  Hamstrings: ["bicepsFemorisLongHead", "bicepsFemorisShortHead", "semitendinosus", "semimembranosus"],
  Glutes: ["gluteMaximus", "gluteMedius", "gluteMinimus"],
  Calves: ["gastrocnemiusMedial", "gastrocnemiusLateral", "soleus"],
  Abs: ["rectusAbdominis", "externalOblique", "internalOblique", "transversusAbdominis"],
};

function toVisualRole(level: "high" | "medium" | "low" | "none"): MuscleVisualRole {
  if (level === "high") return "primary";
  if (level === "medium") return "secondary";
  if (level === "low") return "supporting";
  return "inactive";
}

function getFigureActivations(report: MuscleStimulationReportDto): MuscleSvgActivation[] {
  return report.muscles.flatMap((item) => {
    if (item.muscle === "All") return [];

    return muscleGroupToFigureMuscles[item.muscle].map((muscle) => ({
      muscle,
      role: toVisualRole(item.level),
      contribution: item.percentage,
    }));
  });
}

export function MuscleStimulationReport({ report, hasComparison = false }: MuscleStimulationReportProps) {
  const [selectedMuscleId, setSelectedMuscleId] = useState<MuscleMapKey | null>(null);
  const hasData = report.totalScore > 0;
  const figureActivations = useMemo(() => getFigureActivations(report), [report]);

  return (
    <section className="muscle-stimulation-report">
      <div className="muscle-stimulation-header">
        <div>
          <p className="section-eyebrow">肌群报告</p>
          <h2 className="section-title">所选周期肌群刺激分布</h2>
        </div>
        <MuscleLegend />
      </div>

      <div className="muscle-stimulation-grid">
        <div className="stimulation-figure-panel muscle-figure-panel--dual">
          <MuscleModelViewer
            view="front"
            activations={figureActivations}
            selectedMuscleId={selectedMuscleId}
            onMuscleSelect={setSelectedMuscleId}
          />
          <MuscleModelViewer
            view="back"
            activations={figureActivations}
            selectedMuscleId={selectedMuscleId}
            onMuscleSelect={setSelectedMuscleId}
          />
          {!hasData ? (
            <p className="stimulation-empty-note">当前周期暂无可计算训练数据，肌肉图保持灰色。</p>
          ) : null}
        </div>

        <div className="stimulation-ranking">
          {report.muscles
            .filter((item) => muscleGroupOptions.includes(item.muscle))
            .map((item) => (
              <div className="stimulation-ranking-row" key={item.muscle}>
                <span>{getMuscleGroupDisplayLabel(item.muscle)}</span>
                <strong>{item.score}</strong>
                <small>
                  {item.percentage}%
                  {hasComparison ? ` · 较对比周期 ${item.change >= 0 ? "+" : ""}${item.change}%` : ""}
                </small>
                <i style={{ width: `${Math.min(100, item.percentage * 3)}%` }} />
              </div>
            ))}
        </div>

        <div className="stimulation-summary">
          <div>
            <span>总刺激得分</span>
            <strong>{report.totalScore}</strong>
          </div>
          {hasComparison ? (
            <div>
              <span>较对比周期</span>
              <strong>{report.changeFromPreviousPeriod >= 0 ? "+" : ""}{report.changeFromPreviousPeriod}%</strong>
            </div>
          ) : null}
          <div>
            <span>高刺激肌群</span>
            <strong>{report.highStimulusMuscleCount}</strong>
          </div>
          <div>
            <span>低刺激肌群</span>
            <strong>{report.lowStimulusMuscleCount}</strong>
          </div>
        </div>
      </div>

      <p className="muscle-stimulation-note">
        肌群刺激得分由训练组数、动作肌群贡献、训练强度和 RIR 等因素估算，仅用于训练参考。
      </p>
    </section>
  );
}
