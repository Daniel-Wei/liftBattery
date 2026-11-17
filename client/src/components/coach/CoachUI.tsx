import { useEffect, useRef, type ReactNode } from "react";
import { Inbox, X } from "lucide-react";
import type { CoachClient, CoachTone } from "../../types/coach";
import { useCoachWorkspace } from "../../store/CoachWorkspaceContext";

export function CoachPageHeader({ eyebrow = "COACH WORKSPACE", title, description, actions }: { eyebrow?: string; title: string; description?: string; actions?: ReactNode }) {
  return <div className="coach-page-heading"><div><p className="coach-eyebrow">{eyebrow}</p><h2>{title}</h2>{description && <p className="coach-muted">{description}</p>}</div>{actions && <div className="coach-heading-actions">{actions}</div>}</div>;
}

export function CoachCard({ title, eyebrow, actions, className = "", children }: { title?: string; eyebrow?: string; actions?: ReactNode; className?: string; children: ReactNode }) {
  return <section className={`coach-card ${className}`}>{(title || actions || eyebrow) && <div className="coach-card-heading"><div>{eyebrow && <p className="coach-eyebrow">{eyebrow}</p>}{title && <h3>{title}</h3>}</div>{actions}</div>}{children}</section>;
}

export function ClientAvatar({ client, size = "md" }: { client: Pick<CoachClient, "name" | "tone">; size?: "sm" | "md" | "lg" }) {
  return <span aria-hidden="true" className={`coach-avatar coach-avatar--${client.tone} coach-avatar--${size}`}>{client.name.slice(-2)}</span>;
}

export function StatusBadge({ tone = "neutral", children }: { tone?: CoachTone | "neutral" | "danger"; children: ReactNode }) {
  return <span className={`coach-badge coach-badge--${tone}`}>{children}</span>;
}

export function ClientPicker({ allowAll = false, value, onChange }: { allowAll?: boolean; value?: string | null; onChange?: (id: string | null) => void }) {
  const { data, selectedClientId, selectClient } = useCoachWorkspace();
  const effective = value === undefined ? selectedClientId : value;
  return <label className="coach-client-picker"><span className="sr-only">选择学员</span><select aria-label="选择学员" className="coach-input" value={effective ?? (allowAll ? "" : data.clients[0]?.id ?? "")} onChange={(event) => (onChange ?? selectClient)(event.target.value || null)}>{allowAll && <option value="">全部学员</option>}{data.clients.length === 0 && !allowAll && <option value="">暂无学员</option>}{data.clients.map((client) => <option key={client.id} value={client.id}>{client.name}{client.status === "paused" ? " · 已暂停" : ""}</option>)}</select></label>;
}

export function EmptyCoachState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return <div className="coach-empty"><span className="coach-empty-icon"><Inbox size={27} strokeWidth={1.4} /></span><h3>{title}</h3><p>{description}</p>{action}</div>;
}

export function CoachModal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") closeRef.current();
      if (event.key !== "Tab") return;
      const elements = panelRef.current?.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href], [tabindex="0"]');
      if (!elements?.length) return;
      const first = elements[0];
      const last = elements[elements.length - 1];
      if (event.shiftKey && (document.activeElement === first || document.activeElement === panelRef.current)) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
    document.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = previousOverflow; document.removeEventListener("keydown", onKey); previousFocus?.focus(); };
  }, []);
  return <div className="coach-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><div className="coach-modal" role="dialog" aria-modal="true" aria-label={title} tabIndex={-1} ref={panelRef}><div className="coach-card-heading"><h3>{title}</h3><button type="button" className="coach-icon-button" onClick={onClose} aria-label="关闭对话框"><X size={19} /></button></div>{children}</div></div>;
}
