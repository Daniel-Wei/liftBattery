import { useMemo, useState } from "react";
import { MuscleLegend } from "./MuscleLegend";
import { MuscleModelViewer } from "./MuscleModelViewer";
import { muscleDisplayLabels } from "../domain/exerciseMuscleMap";
import type { MuscleView } from "../domain/muscleAssetTypes";
import type { MuscleActivation, MuscleMapKey } from "../types/appTypes";

type MuscleViewerProps = {
  title: string;
  activations: MuscleActivation[];
  tip?: string;
  compact?: boolean;
};

function getRoleLabel(role: MuscleActivation["role"]) {
  if (role === "primary") return "主肌群";
  if (role === "secondary") return "次要肌群";
  return "辅助参与";
}

export function MuscleViewer({ title, activations, tip, compact = false }: MuscleViewerProps) {
  const [view, setView] = useState<MuscleView>("front");
  const [selectedMuscleId, setSelectedMuscleId] = useState<MuscleMapKey | null>(null);

  const sortedActivations = useMemo(() => (
    activations.slice().sort((first, second) => second.contribution - first.contribution)
  ), [activations]);

  return (
    <aside className={compact ? "muscle-viewer muscle-viewer--compact" : "muscle-viewer"}>
      <div className="muscle-viewer-header">
        <div>
          <p className="section-eyebrow">肌肉展示</p>
          <h3>{title}</h3>
        </div>
        <div className="muscle-view-toggle" aria-label="肌肉视图切换">
          <button
            type="button"
            className={view === "front" ? "active" : ""}
            aria-pressed={view === "front"}
            onClick={() => setView("front")}
          >
            前视图
          </button>
          <button
            type="button"
            className={view === "back" ? "active" : ""}
            aria-pressed={view === "back"}
            onClick={() => setView("back")}
          >
            后视图
          </button>
        </div>
      </div>

      {activations.length === 0 ? (
        <p className="muted-text">选择动作后会显示主要和次要参与肌群。</p>
      ) : (
        <div className="muscle-viewer-body">
          <div className="muscle-figure-panel">
            <MuscleModelViewer
              view={view}
              activations={activations}
              selectedMuscleId={selectedMuscleId}
              onMuscleSelect={setSelectedMuscleId}
            />
            <MuscleLegend />
          </div>

          <div className="muscle-activation-list">
            {sortedActivations.map((activation) => (
              <button
                type="button"
                className={
                  selectedMuscleId === activation.muscle
                    ? "muscle-activation-row is-selected"
                    : "muscle-activation-row"
                }
                key={activation.muscle}
                onClick={() => setSelectedMuscleId(activation.muscle)}
              >
                <span>{muscleDisplayLabels[activation.muscle]}</span>
                <strong>{activation.contribution}%</strong>
                <small>{getRoleLabel(activation.role)}</small>
                <i style={{ width: `${activation.contribution}%` }} />
              </button>
            ))}
          </div>
        </div>
      )}

      {tip ? <p className="muscle-tip">{tip}</p> : null}
    </aside>
  );
}
