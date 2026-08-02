import { useMemo, useState } from "react";
import { MuscleMapPanel } from "./MuscleMapPanel";
import { muscleDisplayLabels } from "../domain/exerciseMuscleMap";
import type { MuscleActivation, MuscleMapKey } from "../types/appTypes";

type MuscleViewerProps = {
  title: string;
  activations: MuscleActivation[];
  tip?: string;
  compact?: boolean;
};

export function MuscleViewer({ title, activations, tip, compact = true }: MuscleViewerProps) {
  const [selectedMuscleId, setSelectedMuscleId] = useState<MuscleMapKey | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);

  const sortedActivations = useMemo(() => (
    activations.slice().sort((first, second) => second.contribution - first.contribution)
  ), [activations]);
  const summaryActivations = sortedActivations.slice(0, 3);
  const distributionItems = sortedActivations.map((activation) => ({
    id: activation.muscle,
    label: muscleDisplayLabels[activation.muscle],
    contribution: activation.contribution,
    role: activation.role,
    selectedMuscleId: activation.muscle,
  }));

  return (
    <aside className={compact ? "muscle-viewer muscle-viewer--compact" : "muscle-viewer"}>
      <div className="muscle-viewer-header">
        <div>
          <p className="section-eyebrow">肌肉展示</p>
          <h3>{title}</h3>
        </div>
        <button
          type="button"
          className="button-dark muscle-viewer-collapse-button"
          aria-expanded={viewerOpen}
          onClick={() => setViewerOpen((isOpen) => !isOpen)}
        >
          {viewerOpen ? "收起" : "展开"}
        </button>
      </div>

      {activations.length === 0 ? (
        <p className="muted-text">选择动作后会显示主要和次要参与肌群。</p>
      ) : viewerOpen ? (
        <div className="muscle-viewer-body">
          <MuscleMapPanel
            view="front"
            activations={activations}
            distributionItems={distributionItems}
            selectedMuscleId={selectedMuscleId}
            onMuscleSelect={setSelectedMuscleId}
          />
        </div>
      ) : (
        <div className="muscle-details-summary muscle-details-summary--collapsed">
          {summaryActivations.map((activation) => (
            <span key={activation.muscle}>
              {muscleDisplayLabels[activation.muscle]} {activation.contribution}%
            </span>
          ))}
        </div>
      )}

      {tip && viewerOpen ? <p className="muscle-tip">{tip}</p> : null}
    </aside>
  );
}
