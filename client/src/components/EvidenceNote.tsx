import type { ReactNode } from "react";
import type { EvidenceType } from "../types/appTypes";
import { getEvidenceTypeLabel } from "../helpers/displayLabels";

type EvidenceNoteProps = {
  title: string;
  evidenceType: EvidenceType;
  children: ReactNode;
};

export function EvidenceNote({ title, evidenceType, children }: EvidenceNoteProps) {
  return (
    <div className="evidence-note">
      <div className="evidence-note-header">
        <span className="evidence-label">{getEvidenceTypeLabel(evidenceType)}</span>
        <p className="evidence-title">{title}</p>
      </div>
      <div className="evidence-body">{children}</div>
    </div>
  );
}
