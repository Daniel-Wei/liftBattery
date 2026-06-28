import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { MuscleMapKey } from "../types/appTypes";
import { getRequiredPathIdsByView } from "../domain/musclePathMap";
import type { MuscleSvgActivation, MuscleView } from "../domain/muscleAssetTypes";
import {
  applyMuscleSvgStyles,
  findMuscleIdFromEventTarget,
  getAvailableMusclePathIds,
  getMissingPathIds,
  getMuscleAssetPath,
  getUnmappedMuscleIds,
} from "../domain/muscleSvgUtils";

type MuscleSvgViewerProps = {
  view: MuscleView;
  activations: MuscleSvgActivation[];
  selectedMuscleId?: MuscleMapKey | null;
  onMuscleSelect?: (muscleId: MuscleMapKey) => void;
  className?: string;
};

type LoadState =
  | { status: "loading" }
  | { status: "ready"; svgText: string }
  | { status: "missing" }
  | { status: "error" };

function AssetEmptyState({ view }: { view: MuscleView }) {
  return (
    <div className="muscle-svg-empty" role="status">
      <span className="muscle-svg-empty-icon" aria-hidden="true">⌁</span>
      <strong>人体肌肉图资产待添加</strong>
      <small>需要添加：{view === "front" ? "muscle-front.svg" : "muscle-back.svg"}</small>
      <p>添加标准解剖 SVG 后，将根据当前动作自动高亮参与肌群。</p>
    </div>
  );
}

export function MuscleSvgViewer({
  view,
  activations,
  selectedMuscleId,
  onMuscleSelect,
  className,
}: MuscleSvgViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loadState, setLoadState] = useState<LoadState>({ status: "loading" });
  const [availableMusclePathIds, setAvailableMusclePathIds] = useState<string[]>([]);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    const abortController = new AbortController();

    setLoadState({ status: "loading" });

    fetch(getMuscleAssetPath(view), { signal: abortController.signal })
      .then(async (response) => {
        if (response.status === 404) {
          setLoadState({ status: "missing" });
          return;
        }

        if (!response.ok) {
          setLoadState({ status: "error" });
          return;
        }

        const svgText = await response.text();
        if (!svgText.includes("<svg")) {
          setLoadState({ status: "missing" });
          return;
        }

        setLoadState({ status: "ready", svgText });
      })
      .catch((error: unknown) => {
        if (abortController.signal.aborted) return;

        if (import.meta.env.DEV) {
          console.warn(`Failed to load anatomy SVG for ${view}.`, error);
        }

        setLoadState({ status: "error" });
      });

    return () => {
      abortController.abort();
    };
  }, [view]);

  useEffect(() => {
    if (loadState.status !== "ready") return;

    const svg = containerRef.current?.querySelector<SVGSVGElement>("svg");
    if (!svg) return;

    const currentAvailableMusclePathIds = getAvailableMusclePathIds(svg);
    setAvailableMusclePathIds(currentAvailableMusclePathIds);
    applyMuscleSvgStyles(svg, view, activations, selectedMuscleId);

    if (import.meta.env.DEV) {
      const unmappedMuscleIds = getUnmappedMuscleIds(view, activations);
      const missingPathIds = getMissingPathIds(svg, view, activations);
      const configuredMissingIds = getRequiredPathIdsByView(view).filter((pathId) => (
        !svg.querySelector(`.muscle#${CSS.escape(pathId)}`)
      ));

      console.warn(`Anatomy SVG diagnostics for ${view}`, {
        unmappedMuscleIds,
        missingPathIds: [...new Set([...missingPathIds, ...configuredMissingIds])],
        availableMusclePathIds: currentAvailableMusclePathIds,
      });
    }
  }, [activations, loadState, selectedMuscleId, view]);

  function selectFromTarget(target: EventTarget | null) {
    const muscleId = findMuscleIdFromEventTarget(target);
    if (muscleId) {
      onMuscleSelect?.(muscleId);
    }
  }

  const rootClassName = className ? `muscle-svg-viewer ${className}` : "muscle-svg-viewer";

  function zoomOut() {
    setZoom((currentZoom) => Math.max(0.75, Number((currentZoom - 0.15).toFixed(2))));
  }

  function zoomIn() {
    setZoom((currentZoom) => Math.min(1.9, Number((currentZoom + 0.15).toFixed(2))));
  }

  function resetZoom() {
    setZoom(1);
  }

  if (loadState.status === "loading") {
    return (
      <div className={rootClassName} role="status">
        <div className="muscle-svg-loading">正在加载人体肌肉图…</div>
      </div>
    );
  }

  if (loadState.status === "missing" || loadState.status === "error") {
    return (
      <div className={rootClassName}>
        <AssetEmptyState view={view} />
      </div>
    );
  }

  return (
    <div className={rootClassName}>
      <div className="muscle-svg-toolbar" aria-label="人体肌肉图缩放">
        <button type="button" onClick={zoomOut} aria-label="缩小人体肌肉图">−</button>
        <button type="button" onClick={resetZoom} aria-label="重置人体肌肉图缩放">
          {Math.round(zoom * 100)}%
        </button>
        <button type="button" onClick={zoomIn} aria-label="放大人体肌肉图">＋</button>
      </div>
      <div
        className="muscle-svg-canvas"
        ref={containerRef}
        style={{ "--muscle-zoom": zoom } as CSSProperties}
        onClick={(event) => selectFromTarget(event.target)}
        onKeyDown={(event) => {
          if (event.key !== "Enter" && event.key !== " ") return;
          event.preventDefault();
          selectFromTarget(event.target);
        }}
        // Local trusted static assets only. Do not pass user-provided SVG URLs here.
        dangerouslySetInnerHTML={{ __html: loadState.svgText }}
      />
      {import.meta.env.DEV && availableMusclePathIds.length === 0 ? (
        <p className="muscle-svg-dev-note">当前人体资产缺少可交互肌肉 Path。</p>
      ) : null}
    </div>
  );
}
