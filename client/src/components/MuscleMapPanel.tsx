import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { MuscleLegend } from "./MuscleLegend";
import { MuscleModelViewer, type MuscleScreenAnchorMap } from "./MuscleModelViewer";
import type { MuscleSvgActivation, MuscleView, MuscleVisualRole } from "../domain/muscleAssetTypes";
import type { MuscleMapKey } from "../types/appTypes";

export type MuscleDistributionItem = {
  id: string;
  label: string;
  contribution: number;
  role: MuscleVisualRole;
  selectedMuscleId?: MuscleMapKey;
  selectedMuscleIds?: MuscleMapKey[];
};

type MuscleMapPanelProps = {
  view: MuscleView;
  activations: MuscleSvgActivation[];
  distributionItems: MuscleDistributionItem[];
  selectedMuscleId: MuscleMapKey | null;
  onMuscleSelect: (muscleId: MuscleMapKey | null) => void;
  emptyNote?: string;
};

type ScreenPoint = {
  x: number;
  y: number;
};

type CalloutAnchor = {
  inner: ScreenPoint;
  exit: ScreenPoint;
};

type CalloutSegment = {
  id: string;
  role: MuscleVisualRole;
  d: string;
};

type OverlayBounds = {
  width: number;
  height: number;
};

function getRoleLabel(role: MuscleVisualRole) {
  if (role === "primary") return "主肌群";
  if (role === "secondary") return "次要肌群";
  if (role === "supporting") return "辅助参与";
  return "未激活";
}

function getRoleClassName(role: MuscleVisualRole) {
  if (role === "primary") return "is-primary";
  if (role === "secondary") return "is-secondary";
  if (role === "supporting") return "is-supporting";
  return "is-inactive";
}

function getItemMuscleIds(item: MuscleDistributionItem) {
  return item.selectedMuscleIds ?? (item.selectedMuscleId ? [item.selectedMuscleId] : []);
}

function getVisibleItemMuscleIds(
  item: MuscleDistributionItem,
  hiddenMuscleIds: Set<MuscleMapKey>,
) {
  return getItemMuscleIds(item).filter((muscleId) => !hiddenMuscleIds.has(muscleId));
}

function dedupeAnchors(anchors: CalloutAnchor[]) {
  return anchors.reduce<CalloutAnchor[]>((uniqueAnchors, anchor) => {
    const duplicate = uniqueAnchors.some((uniqueAnchor) => (
      Math.abs(uniqueAnchor.inner.x - anchor.inner.x) < 10
      && Math.abs(uniqueAnchor.inner.y - anchor.inner.y) < 10
    ));

    return duplicate ? uniqueAnchors : [...uniqueAnchors, anchor];
  }, []);
}

function selectCalloutAnchors(anchors: CalloutAnchor[]) {
  const uniqueAnchors = dedupeAnchors(anchors).sort((first, second) => first.inner.x - second.inner.x);
  if (uniqueAnchors.length <= 1) return uniqueAnchors;

  const leftAnchor = uniqueAnchors[0];
  const rightAnchor = uniqueAnchors[uniqueAnchors.length - 1];
  if (!leftAnchor || !rightAnchor) return [];

  if (rightAnchor.inner.x - leftAnchor.inner.x < 34) {
    return [rightAnchor];
  }

  return [leftAnchor, rightAnchor];
}

function getCurveCommand(start: ScreenPoint, end: ScreenPoint, tight = false) {
  const horizontalDistance = Math.abs(end.x - start.x);
  const controlDistance = tight
    ? Math.max(12, horizontalDistance * 0.32)
    : Math.max(34, horizontalDistance * 0.42);
  const firstControl = {
    x: start.x > end.x ? start.x - controlDistance : start.x + controlDistance,
    y: start.y,
  };
  const secondControl = {
    x: end.x > start.x ? end.x - controlDistance * 0.55 : end.x + controlDistance * 0.55,
    y: end.y,
  };

  return [
    `C ${firstControl.x.toFixed(2)} ${firstControl.y.toFixed(2)},`,
    `${secondControl.x.toFixed(2)} ${secondControl.y.toFixed(2)},`,
    `${end.x.toFixed(2)} ${end.y.toFixed(2)}`,
  ].join(" ");
}

function getTrunkPath(start: ScreenPoint, end: ScreenPoint) {
  return [
    `M ${start.x.toFixed(2)} ${start.y.toFixed(2)}`,
    getCurveCommand(start, end),
  ].join(" ");
}

function getSingleCalloutPath(anchor: CalloutAnchor, cardPoint: ScreenPoint) {
  return [
    `M ${anchor.inner.x.toFixed(2)} ${anchor.inner.y.toFixed(2)}`,
    `L ${anchor.exit.x.toFixed(2)} ${anchor.exit.y.toFixed(2)}`,
    getCurveCommand(anchor.exit, cardPoint),
  ].join(" ");
}

function getBranchCalloutPath(branchPoint: ScreenPoint, anchor: CalloutAnchor) {
  return [
    `M ${branchPoint.x.toFixed(2)} ${branchPoint.y.toFixed(2)}`,
    getCurveCommand(branchPoint, anchor.exit, true),
    `L ${anchor.inner.x.toFixed(2)} ${anchor.inner.y.toFixed(2)}`,
  ].join(" ");
}

export function MuscleMapPanel({
  view,
  activations,
  distributionItems,
  selectedMuscleId,
  onMuscleSelect,
  emptyNote,
}: MuscleMapPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const visibleItems = useMemo(() => distributionItems.slice(0, 7), [distributionItems]);
  const [hiddenMuscleIds, setHiddenMuscleIds] = useState<Set<MuscleMapKey>>(() => new Set());
  const selectableMuscleIds = useMemo(() => (
    new Set(distributionItems.flatMap((item) => (
      item.selectedMuscleIds ?? (item.selectedMuscleId ? [item.selectedMuscleId] : [])
    )))
  ), [distributionItems]);
  const filteredActivations = useMemo(() => (
    activations.filter((activation) => !hiddenMuscleIds.has(activation.muscle))
  ), [activations, hiddenMuscleIds]);
  const effectiveSelectedMuscleId = selectedMuscleId && !hiddenMuscleIds.has(selectedMuscleId)
    ? selectedMuscleId
    : null;
  const anchorMuscleIds = useMemo(() => (
    [...new Set(visibleItems.flatMap((item) => (
      getVisibleItemMuscleIds(item, hiddenMuscleIds)
    )))]
  ), [hiddenMuscleIds, visibleItems]);
  const [modelAnchors, setModelAnchors] = useState<MuscleScreenAnchorMap>({});
  const [overlayBounds, setOverlayBounds] = useState<OverlayBounds>({ width: 0, height: 0 });
  const [calloutSegments, setCalloutSegments] = useState<CalloutSegment[]>([]);

  useEffect(() => {
    setHiddenMuscleIds((currentHiddenIds) => {
      const nextHiddenIds = new Set(
        [...currentHiddenIds].filter((muscleId) => selectableMuscleIds.has(muscleId)),
      );

      return nextHiddenIds.size === currentHiddenIds.size ? currentHiddenIds : nextHiddenIds;
    });
  }, [selectableMuscleIds]);

  useLayoutEffect(() => {
    const panel = panelRef.current;

    if (!panel) return undefined;
    const panelElement = panel;

    function updateSegments() {
      const panelRect = panelElement.getBoundingClientRect();
      const nextSegments: CalloutSegment[] = visibleItems.flatMap((item, index): CalloutSegment[] => {
        const itemMuscleIds = getVisibleItemMuscleIds(item, hiddenMuscleIds);
        const anchors = selectCalloutAnchors(itemMuscleIds.flatMap((muscleId) => (
          (modelAnchors[muscleId] ?? [])
            .filter((anchor) => anchor.visible)
            .map((anchor) => ({
              inner: {
                x: anchor.inner.clientX - panelRect.left,
                y: anchor.inner.clientY - panelRect.top,
              },
              exit: {
                x: anchor.exit.clientX - panelRect.left,
                y: anchor.exit.clientY - panelRect.top,
              },
            }))
        )));
        const card = cardRefs.current[index];

        if (anchors.length === 0 || !card) return [];

        const cardRect = card.getBoundingClientRect();
        const cardPoint = {
          x: cardRect.left - panelRect.left,
          y: cardRect.top - panelRect.top + cardRect.height / 2,
        };

        if (anchors.length === 1) {
          return [{
            id: `${item.id}:single`,
            role: item.role,
            d: getSingleCalloutPath(anchors[0], cardPoint),
          }];
        }

        const [leftAnchor, rightAnchor] = anchors;
        if (!leftAnchor || !rightAnchor) return [];

        const bodySideX = Math.max(leftAnchor.exit.x, rightAnchor.exit.x);
        const gapToCard = Math.max(0, cardPoint.x - bodySideX);
        const branchOffset = Math.min(48, Math.max(22, gapToCard * 0.18));
        const branchPoint = {
          x: Math.min(cardPoint.x - 30, bodySideX + branchOffset),
          y: (leftAnchor.exit.y + rightAnchor.exit.y) / 2,
        };

        return [
          {
            id: `${item.id}:trunk`,
            role: item.role,
            d: getTrunkPath(cardPoint, branchPoint),
          },
          {
            id: `${item.id}:left`,
            role: item.role,
            d: getBranchCalloutPath(branchPoint, leftAnchor),
          },
          {
            id: `${item.id}:right`,
            role: item.role,
            d: getBranchCalloutPath(branchPoint, rightAnchor),
          },
        ];
      });

      setOverlayBounds({
        width: panelRect.width,
        height: panelRect.height,
      });
      setCalloutSegments(nextSegments);
    }

    updateSegments();

    const resizeObserver = new ResizeObserver(updateSegments);
    resizeObserver.observe(panelElement);
    cardRefs.current.forEach((card) => {
      if (card) resizeObserver.observe(card);
    });
    window.addEventListener("resize", updateSegments);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateSegments);
    };
  }, [hiddenMuscleIds, modelAnchors, visibleItems]);

  function toggleMuscleIds(muscleIds: MuscleMapKey[]) {
    if (muscleIds.length === 0) return;
    const allHiddenBeforeToggle = muscleIds.every((muscleId) => hiddenMuscleIds.has(muscleId));

    setHiddenMuscleIds((currentHiddenIds) => {
      const nextHiddenIds = new Set(currentHiddenIds);
      const allHidden = muscleIds.every((muscleId) => nextHiddenIds.has(muscleId));

      muscleIds.forEach((muscleId) => {
        if (allHidden) nextHiddenIds.delete(muscleId);
        else nextHiddenIds.add(muscleId);
      });

      return nextHiddenIds;
    });

    onMuscleSelect(allHiddenBeforeToggle ? (muscleIds[0] ?? null) : null);
  }

  function handleModelMuscleSelect(muscleId: MuscleMapKey) {
    toggleMuscleIds([muscleId]);
  }

  return (
    <div className="muscle-map-panel" ref={panelRef}>
      <svg
        className="muscle-callout-lines"
        viewBox={`0 0 ${Math.max(1, overlayBounds.width)} ${Math.max(1, overlayBounds.height)}`}
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {calloutSegments.map((segment) => (
          <path
            className={getRoleClassName(segment.role)}
            d={segment.d}
            key={segment.id}
          />
        ))}
      </svg>

      <div className="muscle-model-zone">
        <MuscleModelViewer
          view={view}
          activations={filteredActivations}
          selectedMuscleId={effectiveSelectedMuscleId}
          onMuscleSelect={handleModelMuscleSelect}
          className="muscle-model-viewer--map"
          anchorMuscleIds={anchorMuscleIds}
          onAnchorPositionsChange={setModelAnchors}
        />
        <MuscleLegend />
        {emptyNote ? <p className="stimulation-empty-note">{emptyNote}</p> : null}
      </div>

      <div className="muscle-distribution-panel">
        <div className="muscle-distribution-heading">
          <span>肌群分布</span>
          <strong>{distributionItems.length} 项</strong>
        </div>
        <div className="muscle-distribution-list">
          {visibleItems.map((item, index) => {
            const itemMuscleIds = getItemMuscleIds(item);
            const itemHidden = itemMuscleIds.length > 0
              && itemMuscleIds.every((muscleId) => hiddenMuscleIds.has(muscleId));
            const itemSelected = itemMuscleIds.some((muscleId) => muscleId === effectiveSelectedMuscleId);

            return (
              <button
                type="button"
                className={[
                  "muscle-distribution-row",
                  getRoleClassName(item.role),
                  itemSelected ? "is-selected" : "",
                  itemHidden ? "is-muted" : "",
                ].filter(Boolean).join(" ")}
                key={item.id}
                ref={(node) => {
                  cardRefs.current[index] = node;
                }}
                style={{ "--muscle-share": `${item.contribution}%` } as CSSProperties}
                aria-pressed={!itemHidden}
                onClick={() => toggleMuscleIds(itemMuscleIds)}
              >
                <span>{item.label}</span>
                <strong>{item.contribution}%</strong>
                <small>{getRoleLabel(item.role)}</small>
                <i />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
