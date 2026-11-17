import { useMemo, useState, type FormEvent } from "react";
import { ClientAvatar, CoachCard, CoachModal, CoachPageHeader, EmptyCoachState, StatusBadge } from "../components/coach/CoachUI";
import { clientCredits, daysUntil, estimatedCalories, isCompleteNutrition, localDate, prepPhaseLabels, shortDate, targetForDate } from "../domain/coachWorkspace";
import { useCoachWorkspace } from "../store/CoachWorkspaceContext";
import { PageKey } from "../types/appTypes";
import type { CoachClient, CoachTone, PrepPhase } from "../types/coach";
import "./clients-preparation.css";

type PageProps = { onNavigate?: (page: PageKey) => void };
type ClientDraft = Omit<CoachClient, "id"> & { id?: string };

const phaseOptions = Object.entries(prepPhaseLabels) as [PrepPhase, string][];
const tones: CoachTone[] = ["cyan", "mint", "purple", "yellow"];

function newClientDraft(): ClientDraft {
  return { name: "", division: "", showName: "", showDate: "", prepStartDate: localDate(), phase: "building", status: "active", goal: "", notes: "", tone: "cyan" };
}

function countdownLabel(client: CoachClient) {
  const days = daysUntil(client.showDate);
  if (days === undefined) return "尚未设置比赛日期";
  if (days < 0) return `比赛已结束 ${Math.abs(days)} 天`;
  return days === 0 ? "比赛就在今天" : `距离比赛 ${days} 天`;
}

export function ClientProfileForm({ initial, onSave, onClose }: { initial: ClientDraft; onSave: (draft: ClientDraft) => void; onClose: () => void }) {
  const [draft, setDraft] = useState(initial);
  const [error, setError] = useState("");
  const change = <K extends keyof ClientDraft,>(key: K, value: ClientDraft[K]) => setDraft((current) => ({ ...current, [key]: value }));
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!draft.name.trim()) { setError("请填写学员姓名。"); return; }
    if (draft.prepStartDate && draft.showDate && draft.prepStartDate > draft.showDate) { setError("备赛开始日期不能晚于比赛日期。"); return; }
    onSave({ ...draft, name: draft.name.trim(), division: draft.division.trim(), showName: draft.showName.trim(), goal: draft.goal.trim(), notes: draft.notes.trim() });
  };

  return <form onSubmit={submit} className="cp-profile-form">
    <div className="coach-form-grid">
      <label className="coach-field">学员姓名 <span aria-hidden="true">*</span><input className="coach-input" autoFocus required maxLength={50} value={draft.name} onChange={(event) => change("name", event.target.value)} placeholder="如何称呼这位学员" /></label>
      <label className="coach-field">比赛项目 / 组别<input className="coach-input" maxLength={100} value={draft.division} onChange={(event) => change("division", event.target.value)} placeholder="例如：男子健体 / 比基尼" /></label>
      <label className="coach-field">目标赛事<input className="coach-input" maxLength={120} value={draft.showName} onChange={(event) => change("showName", event.target.value)} placeholder="赛事名称，未确定可暂留空" /></label>
      <label className="coach-field">比赛日期<input type="date" className="coach-input" value={draft.showDate} onChange={(event) => change("showDate", event.target.value)} /></label>
      <label className="coach-field">备赛开始日期<input type="date" className="coach-input" value={draft.prepStartDate} onChange={(event) => change("prepStartDate", event.target.value)} /></label>
      <label className="coach-field">当前阶段<select className="coach-input" value={draft.phase} onChange={(event) => change("phase", event.target.value as PrepPhase)}>{phaseOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      <label className="coach-field">服务状态<select className="coach-input" value={draft.status} onChange={(event) => change("status", event.target.value as CoachClient["status"])}><option value="active">服务中</option><option value="paused">已暂停</option></select></label>
      <fieldset className="cp-tone-field"><legend>档案标识色</legend><div className="cp-tone-options">{tones.map((tone, index) => <label key={tone} className={`cp-tone-option cp-tone-${tone}`}><input type="radio" name="client-tone" value={tone} checked={draft.tone === tone} onChange={() => change("tone", tone)} /><span aria-hidden="true" /><span className="cp-sr-only">{["青色", "薄荷色", "紫色", "黄色"][index]}</span></label>)}</div></fieldset>
    </div>
    <label className="coach-field">阶段目标<textarea className="coach-input" rows={2} maxLength={600} value={draft.goal} onChange={(event) => change("goal", event.target.value)} placeholder="写下希望与学员共同达成的目标" /></label>
    <label className="coach-field">教练备注<textarea className="coach-input" rows={3} maxLength={1500} value={draft.notes} onChange={(event) => change("notes", event.target.value)} placeholder="训练偏好、沟通重点、需要留意的情况" /></label>
    {error && <p role="alert" className="cp-form-error">{error}</p>}
    <div className="cp-form-actions"><button type="button" className="coach-button-secondary" onClick={onClose}>取消</button><button type="submit" className="coach-button-primary">保存学员档案</button></div>
  </form>;
}

export function ClientsPage({ onNavigate }: PageProps) {
  const { data, selectedClientId, selectClient, saveClient, addCredits } = useCoachWorkspace();
  const [search, setSearch] = useState("");
  const [phase, setPhase] = useState<"all" | PrepPhase>("all");
  const [editing, setEditing] = useState<ClientDraft | null>(null);
  const [creditOpen, setCreditOpen] = useState(false);
  const [creditQuantity, setCreditQuantity] = useState("12");
  const [creditNote, setCreditNote] = useState("");
  const [creditError, setCreditError] = useState("");
  const selected = data.clients.find((client) => client.id === selectedClientId) ?? data.clients[0];
  const filtered = useMemo(() => data.clients.filter((client) => (phase === "all" || client.phase === phase) && `${client.name} ${client.division} ${client.showName}`.toLowerCase().includes(search.trim().toLowerCase())), [data.clients, phase, search]);
  const activeCount = data.clients.filter((client) => client.status === "active").length;
  const preparingCount = data.clients.filter((client) => client.status === "active" && (client.phase === "prep" || client.phase === "peak")).length;
  const credits = selected ? data.credits.filter((entry) => entry.clientId === selected.id).sort((a, b) => b.date.localeCompare(a.date)) : [];
  const latestLog = selected ? data.nutritionLogs.filter((log) => log.clientId === selected.id).sort((a, b) => b.date.localeCompare(a.date))[0] : undefined;
  const nutritionTarget = selected ? targetForDate(data.nutritionTargets, selected.id, localDate()) : undefined;

  const saveProfile = (draft: ClientDraft) => { const id = saveClient(draft); selectClient(id); setEditing(null); };
  const openCredits = () => { setCreditQuantity("12"); setCreditNote(""); setCreditError(""); setCreditOpen(true); };
  const submitCredits = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selected) return;
    const result = addCredits(selected.id, Number(creditQuantity), creditNote.trim() || "登记课包");
    if (result.ok) setCreditOpen(false); else setCreditError(result.message);
  };

  return <div className="cp-page">
    <CoachPageHeader eyebrow="CLIENT ROSTER" title="每位学员，都有自己的节奏" description="从第一堂课到登台那天，把档案、备赛进度和每次陪伴放在一起。" actions={<button className="coach-button-primary" onClick={() => setEditing(newClientDraft())}><span aria-hidden="true">＋</span> 新建学员</button>} />
    <div className="cp-roster-summary"><span><strong>{data.clients.length}</strong> 位学员</span><span><i className="cp-status-dot" /><strong>{activeCount}</strong> 位服务中</span><span><i className="cp-status-dot cp-status-mint" /><strong>{preparingCount}</strong> 位正在备赛</span></div>
    {data.clients.length === 0 ? <EmptyCoachState title="从第一位学员开始" description="建立档案后，教练可安排课程、登记课包，并维护学员的备赛与营养数据。" action={<button className="coach-button-primary" onClick={() => setEditing(newClientDraft())}>建立学员档案</button>} /> : <div className="cp-clients-layout">
      <section className="cp-client-directory" aria-label="学员列表">
        <div className="cp-directory-tools"><label className="cp-search-field"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 4.5 4.5" /></svg><input className="coach-input" aria-label="搜索学员、项目或赛事" type="search" placeholder="搜索学员、项目或赛事" value={search} onChange={(event) => setSearch(event.target.value)} /></label><label className="cp-phase-filter"><span className="cp-sr-only">筛选备赛阶段</span><select className="coach-input" value={phase} onChange={(event) => setPhase(event.target.value as typeof phase)}><option value="all">全部阶段</option>{phaseOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label></div>
        <div className="cp-directory-label"><span>学员 / 当前阶段</span><span>{filtered.length} 位</span></div>
        <div className="cp-client-list">{filtered.map((client) => <button key={client.id} className={`cp-client-row ${selected?.id === client.id ? "is-selected" : ""}`} aria-pressed={selected?.id === client.id} onClick={() => selectClient(client.id)}><ClientAvatar client={client} size="md" /><span className="cp-client-row-main"><span className="cp-client-row-name">{client.name}{client.status === "paused" && <span className="cp-paused">已暂停</span>}</span><span className="cp-client-row-description">{client.division || "项目待设置"} <span aria-hidden="true">·</span> {prepPhaseLabels[client.phase]}</span><span className="cp-client-row-countdown">{countdownLabel(client)}</span></span><span className="cp-client-row-arrow" aria-hidden="true">↗</span></button>)}</div>
        {filtered.length === 0 && <div className="cp-no-results"><strong>没有匹配的学员</strong><p className="coach-muted">试试其他姓名，或切换备赛阶段。</p><button className="coach-inline-button" onClick={() => { setSearch(""); setPhase("all"); }}>清除筛选</button></div>}
      </section>
      {selected && <div className="cp-client-detail">
        <CoachCard className="cp-profile-card"><div className="cp-profile-topline"><span className="cp-section-eyebrow">CLIENT PROFILE</span><button className="coach-inline-button" onClick={() => setEditing({ ...selected })}>编辑档案 ↗</button></div><div className="cp-profile-identity"><ClientAvatar client={selected} size="lg" /><div><div className="cp-profile-title"><h2>{selected.name}</h2><StatusBadge tone={selected.status === "active" ? "mint" : "neutral"}>{selected.status === "active" ? "服务中" : "已暂停"}</StatusBadge></div><p>{selected.division || "比赛项目待设置"}</p></div></div>
          <div className="cp-profile-facts"><div><span>当前阶段</span><strong>{prepPhaseLabels[selected.phase]}</strong></div><div><span>目标赛事</span><strong>{selected.showName || "尚未确定"}</strong></div><div><span>比赛日期</span><strong>{selected.showDate || "待设置"}</strong></div></div>
          <div className="cp-profile-goal"><span className="cp-section-eyebrow">阶段目标</span><p>{selected.goal || "还没有阶段目标。与学员聊聊接下来希望达成什么，再记录在这里。"}</p></div>
          {selected.notes && <p className="cp-profile-note"><span>教练备注</span>{selected.notes}</p>}
          <div className="cp-profile-links"><button className="coach-button-secondary" onClick={() => { selectClient(selected.id); onNavigate?.(PageKey.Preparation); }}>查看备赛计划 <span aria-hidden="true">↗</span></button><button className="coach-button-secondary" onClick={() => { selectClient(selected.id); onNavigate?.(PageKey.Schedule); }}>为 TA 排课 <span aria-hidden="true">↗</span></button></div>
        </CoachCard>
        <div className="cp-detail-grid"><CoachCard eyebrow="NUTRITION LOG" title="最近备赛营养记录" actions={<button className="coach-inline-button" onClick={() => { selectClient(selected.id); onNavigate?.(PageKey.Nutrition); }}>查看全部 ↗</button>}>
          {latestLog ? <><div className="cp-log-date"><span>{shortDate(latestLog.date)}</span><StatusBadge tone={isCompleteNutrition(latestLog) ? "mint" : "yellow"}>{isCompleteNutrition(latestLog) ? "已记录三大营养素" : "记录待补全"}</StatusBadge></div><div className="cp-mini-macros">{[{ label: "蛋白质", value: latestLog.protein }, { label: "碳水", value: latestLog.carbs }, { label: "脂肪", value: latestLog.fat }].map((macro) => <div key={macro.label}><span>{macro.label}</span><strong>{macro.value ?? "—"}<small>g</small></strong></div>)}</div><p className="cp-log-caption">{isCompleteNutrition(latestLog) ? `营养素折算 ${estimatedCalories(latestLog)} kcal` : "未填写的数据暂不计入热量"}{latestLog.weightKg !== undefined ? ` · 体重 ${latestLog.weightKg} kg` : ""}</p></> : <div className="cp-small-empty"><span className="cp-empty-symbol" aria-hidden="true">◎</span><p>还没有教练营养记录</p><span className="coach-muted">由教练录入每日三大营养素摄入。</span></div>}
          {nutritionTarget && <div className="cp-target-caption">当前目标 P {nutritionTarget.protein} / C {nutritionTarget.carbs} / F {nutritionTarget.fat} g</div>}
        </CoachCard><CoachCard eyebrow="SESSION CREDITS" title="课时账户" actions={<button className="coach-inline-button" onClick={openCredits}>登记课包 ＋</button>}><div className="cp-credit-balance"><strong>{clientCredits(data.credits, selected.id)}</strong><span>节剩余课时</span></div><p className="cp-credit-help">课程确认完成后扣除 1 节，流水可追溯。</p><div className="cp-credit-entries">{credits.length ? credits.slice(0, 4).map((entry) => <div className="cp-credit-entry" key={entry.id}><span><strong>{entry.note || ({ purchase: "登记课包", deduction: "课程扣课", refund: "课时返还" }[entry.type])}</strong><small>{entry.date}</small></span><b className={entry.amount > 0 ? "is-positive" : ""}>{entry.amount > 0 ? "+" : ""}{entry.amount}</b></div>) : <p className="coach-muted">尚无课时流水，登记课包后可开始扣课。</p>}</div>{credits.length > 4 && <details className="cp-credit-history"><summary>查看更早的 {credits.length - 4} 条流水</summary><div className="cp-credit-entries">{credits.slice(4).map((entry) => <div className="cp-credit-entry" key={entry.id}><span><strong>{entry.note || ({ purchase: "登记课包", deduction: "课程扣课", refund: "课时返还" }[entry.type])}</strong><small>{entry.date}</small></span><b className={entry.amount > 0 ? "is-positive" : ""}>{entry.amount > 0 ? "+" : ""}{entry.amount}</b></div>)}</div></details>}</CoachCard></div>
      </div>}
    </div>}
    {editing && <CoachModal title={editing.id ? "编辑学员档案" : "建立新的学员档案"} onClose={() => setEditing(null)}><ClientProfileForm initial={editing} onSave={saveProfile} onClose={() => setEditing(null)} /></CoachModal>}
    {creditOpen && selected && <CoachModal title={`为 ${selected.name} 登记课包`} onClose={() => setCreditOpen(false)}><form onSubmit={submitCredits} className="cp-profile-form"><p className="coach-muted">登记本次购买的课时数量。每次登记都会保留一条课时流水。</p><label className="coach-field">新增课时（节）<input autoFocus className="coach-input" type="number" required min="1" max="999" step="1" value={creditQuantity} onChange={(event) => setCreditQuantity(event.target.value)} /></label><label className="coach-field">登记备注<input className="coach-input" maxLength={200} value={creditNote} onChange={(event) => setCreditNote(event.target.value)} placeholder="例如：12 节私教课包 / 续课" /></label>{creditError && <p role="alert" className="cp-form-error">{creditError}</p>}<div className="cp-form-actions"><button className="coach-button-secondary" type="button" onClick={() => setCreditOpen(false)}>取消</button><button className="coach-button-primary" type="submit">确认登记</button></div></form></CoachModal>}
  </div>;
}
