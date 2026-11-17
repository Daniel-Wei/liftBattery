import { useState, type FormEvent } from "react";
import { ClientAvatar, ClientPicker, CoachCard, CoachModal, CoachPageHeader, EmptyCoachState, StatusBadge } from "../components/coach/CoachUI";
import { daysUntil, estimatedCalories, localDate, prepPhaseLabels, targetForDate } from "../domain/coachWorkspace";
import { useCoachWorkspace } from "../store/CoachWorkspaceContext";
import { PageKey } from "../types/appTypes";
import type { NutritionTarget, PrepPhase } from "../types/coach";
import { ClientProfileForm } from "./ClientsPage";
import "./clients-preparation.css";

type PageProps = { onNavigate?: (page: PageKey) => void };
const phases = Object.entries(prepPhaseLabels) as [PrepPhase, string][];
const phaseDescriptions: Record<PrepPhase, string> = { building: "建立训练与饮食基础", prep: "跟进执行，复盘变化", peak: "记录教练的赛前安排", recovery: "跟踪赛后恢复与反馈" };

export function PreparationPage({ onNavigate }: PageProps) {
  const { data, selectedClientId, selectClient, saveClient, saveTarget } = useCoachWorkspace();
  const [editingProfile, setEditingProfile] = useState(false);
  const [targetOpen, setTargetOpen] = useState(false);
  const [targetDraft, setTargetDraft] = useState({ effectiveDate: localDate(), protein: "", carbs: "", fat: "" });
  const selected = data.clients.find((client) => client.id === selectedClientId) ?? data.clients[0];
  const target = selected ? targetForDate(data.nutritionTargets, selected.id, localDate()) : undefined;
  const history = selected ? data.nutritionTargets.filter((item) => item.clientId === selected.id).sort((a, b) => b.effectiveDate.localeCompare(a.effectiveDate)) : [];
  const days = selected ? daysUntil(selected.showDate) : undefined;
  const totalDays = selected?.prepStartDate && selected.showDate ? daysUntil(selected.showDate, selected.prepStartDate) : undefined;
  const elapsed = totalDays !== undefined && totalDays > 0 && days !== undefined ? Math.min(totalDays, Math.max(0, totalDays - days)) : undefined;
  const progress = elapsed !== undefined && totalDays ? Math.round(elapsed / totalDays * 100) : undefined;
  const phaseIndex = selected ? phases.findIndex(([phase]) => phase === selected.phase) : 0;

  const openTarget = () => {
    const previous = target ?? history[0];
    setTargetDraft({ effectiveDate: localDate(), protein: previous ? String(previous.protein) : "", carbs: previous ? String(previous.carbs) : "", fat: previous ? String(previous.fat) : "" });
    setTargetOpen(true);
  };
  const submitTarget = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selected) return;
    const values = { protein: Number(targetDraft.protein), carbs: Number(targetDraft.carbs), fat: Number(targetDraft.fat) };
    if (!targetDraft.effectiveDate || Object.values(values).some((value) => !Number.isFinite(value) || value < 0) || [targetDraft.protein, targetDraft.carbs, targetDraft.fat].some((value) => value.trim() === "")) return;
    saveTarget({ ...values, clientId: selected.id, effectiveDate: targetDraft.effectiveDate });
    setTargetOpen(false);
  };
  const describeTarget = (item: NutritionTarget) => item.id === target?.id ? "当前执行" : item.effectiveDate > localDate() ? "待生效" : "历史目标";

  return <div className="cp-page cp-preparation-page">
    <CoachPageHeader eyebrow="CONTEST PREPARATION" title="让每一个阶段，都有清晰的方向" description="围绕比赛目标，连接训练执行、营养目标和阶段复盘。" actions={data.clients.length ? <ClientPicker value={selected?.id ?? null} onChange={selectClient} /> : undefined} />
    {!selected ? <EmptyCoachState title="先选择要一起备赛的学员" description="建立学员档案、设置目标赛事后，即可查看备赛时间线并制定营养目标。" action={<button className="coach-button-primary" onClick={() => onNavigate?.(PageKey.Clients)}>前往学员管理</button>} /> : <>
      <section className="cp-prep-hero" aria-label={`${selected.name} 的备赛概览`}>
        <div className="cp-prep-hero-content"><div className="cp-prep-person"><ClientAvatar client={selected} size="md" /><span><strong>{selected.name}</strong><small>{selected.division || "比赛项目待设置"}</small></span><StatusBadge tone={selected.tone}>{prepPhaseLabels[selected.phase]}</StatusBadge></div><span className="cp-section-eyebrow">THE NEXT STAGE</span><h2>{selected.showName || "下一个目标，由你们一起定义"}</h2><p>{selected.showDate ? `${selected.showDate} · ${selected.division || "组别待设置"}` : "设置比赛信息，让备赛安排有一个共同的终点。"}</p><button className="coach-inline-button" onClick={() => setEditingProfile(true)}>编辑比赛与阶段信息 ↗</button></div>
        <div className="cp-countdown"><span className="cp-countdown-label">{days !== undefined && days < 0 ? "比赛已结束" : "距离登台"}</span><div><strong>{days === undefined ? "—" : Math.abs(days)}</strong><span>天</span></div><p>{days === undefined ? "等待确定比赛日期" : days === 0 ? "今天，就是登台的日子" : days < 0 ? "继续关注赛后的恢复与状态" : `还有 ${Math.floor(days / 7)} 周 ${days % 7} 天`}</p></div>
      </section>
      <CoachCard eyebrow="PREPARATION TIMELINE" title="备赛时间线" actions={<span className="coach-muted">阶段由教练确认</span>}>
        <ol className="cp-prep-timeline">{phases.map(([phase, label], index) => <li key={phase} className={`${index < phaseIndex ? "is-complete" : ""} ${index === phaseIndex ? "is-current" : ""}`} aria-current={index === phaseIndex ? "step" : undefined}><span className="cp-phase-node" aria-hidden="true">{index < phaseIndex ? "✓" : String(index + 1).padStart(2, "0")}</span><div><span className="cp-phase-number">PHASE {String(index + 1).padStart(2, "0")}</span><strong>{label}</strong><p>{phaseDescriptions[phase]}</p>{index === phaseIndex && <span className="cp-current-phase">当前阶段</span>}</div></li>)}</ol>
        {progress !== undefined ? <div className="cp-prep-duration"><div><span>{selected.prepStartDate} 开始</span><strong>{progress}%</strong><span>{selected.showDate} 比赛</span></div><div className="cp-prep-progress" role="progressbar" aria-label="按日期计算的备赛进度" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${progress}%` }} /></div><p>根据开始日期与比赛日期计算，仅用于日程参考。</p></div> : <div className="cp-prep-date-empty">设置备赛开始日期和比赛日期后，显示时间进度。<button className="coach-inline-button" onClick={() => setEditingProfile(true)}>设置日期 ↗</button></div>}
      </CoachCard>
      <div className="cp-prep-columns"><CoachCard eyebrow="DAILY NUTRITION TARGET" title="三大营养素目标" actions={<button className="coach-inline-button" onClick={openTarget}>{target ? "调整目标 ＋" : "设置目标 ＋"}</button>}>
        {target ? <><div className="cp-target-date"><StatusBadge tone="mint">当前执行</StatusBadge><span>{target.effectiveDate} 起生效</span></div><div className="cp-target-macros">{[{ label: "蛋白质", en: "PROTEIN", value: target.protein, color: "cyan" }, { label: "碳水化合物", en: "CARBS", value: target.carbs, color: "mint" }, { label: "脂肪", en: "FAT", value: target.fat, color: "purple" }].map((macro) => <div key={macro.en} className={`cp-macro-${macro.color}`}><span>{macro.en}</span><strong>{macro.value}<small>g</small></strong><p>{macro.label} / 天</p></div>)}</div><div className="cp-energy-total"><span>营养素折算热量</span><strong>{estimatedCalories(target)} <small>kcal / 天</small></strong></div></> : <div className="cp-target-empty"><span className="cp-empty-symbol" aria-hidden="true">◎</span><h3>{history.some((item) => item.effectiveDate > localDate()) ? "新目标还未生效" : "为这个阶段设置营养目标"}</h3><p>{history.some((item) => item.effectiveDate > localDate()) ? "可以在下方查看计划生效日期，或添加从今天开始的目标。" : "由教练填写每日蛋白质、碳水和脂肪克数，再结合实际摄入复盘。"}</p><button className="coach-button-secondary" onClick={openTarget}>设置每日目标</button></div>}
        <button className="cp-nutrition-link" onClick={() => { selectClient(selected.id); onNavigate?.(PageKey.Nutrition); }}><span>查看实际摄入与目标差额</span><span aria-hidden="true">↗</span></button>
      </CoachCard><CoachCard eyebrow="COACH'S FOCUS" title="这一阶段，重点关注什么" actions={<button className="coach-inline-button" onClick={() => setEditingProfile(true)}>编辑 ↗</button>}><div className="cp-focus-phase"><span className="cp-focus-icon" aria-hidden="true">↗</span><span>{prepPhaseLabels[selected.phase]}</span></div><p className="cp-focus-goal">{selected.goal || "暂未设置阶段目标。与学员确认本阶段的重点，并记录下一次复盘要关注的变化。"}</p>{selected.notes && <div className="cp-focus-notes"><span className="cp-section-eyebrow">教练备注</span><p>{selected.notes}</p></div>}<div className="cp-focus-actions"><button className="coach-button-secondary" onClick={() => { selectClient(selected.id); onNavigate?.(PageKey.Schedule); }}>安排下一堂课 ↗</button></div></CoachCard></div>
      <CoachCard eyebrow="TARGET HISTORY" title="每一次调整，都有迹可循" actions={<span className="coach-muted">{history.length} 个目标版本</span>}>
        {history.length ? <div className="coach-table-wrap"><table className="coach-table cp-history-table"><thead><tr><th>生效日期</th><th>蛋白质</th><th>碳水</th><th>脂肪</th><th>折算热量</th><th>状态</th></tr></thead><tbody>{history.map((item) => <tr key={item.id} className={item.id === target?.id ? "is-current" : ""}><td>{item.effectiveDate}</td><td>{item.protein} <span>g</span></td><td>{item.carbs} <span>g</span></td><td>{item.fat} <span>g</span></td><td>{estimatedCalories(item)} <span>kcal</span></td><td><StatusBadge tone={item.id === target?.id ? "mint" : item.effectiveDate > localDate() ? "cyan" : "neutral"}>{describeTarget(item)}</StatusBadge></td></tr>)}</tbody></table></div> : <div className="cp-history-empty"><p>设置第一个目标后，每次调整都会按生效日期保留记录。</p><span>历史营养记录会对应当日生效的目标。</span></div>}
      </CoachCard>
    </>}
    {editingProfile && selected && <CoachModal title={`调整 ${selected.name} 的备赛信息`} onClose={() => setEditingProfile(false)}><ClientProfileForm initial={{ ...selected }} onSave={(draft) => { saveClient(draft); setEditingProfile(false); }} onClose={() => setEditingProfile(false)} /></CoachModal>}
    {targetOpen && selected && <CoachModal title={`设置 ${selected.name} 的营养目标`} onClose={() => setTargetOpen(false)}><form className="cp-profile-form" onSubmit={submitTarget}><p className="coach-muted">填写由教练确认的每日摄入目标。目标按生效日期保留，历史营养记录继续使用当时的目标。</p><label className="coach-field">生效日期<input autoFocus type="date" className="coach-input" required value={targetDraft.effectiveDate} onChange={(event) => setTargetDraft((current) => ({ ...current, effectiveDate: event.target.value }))} /></label><div className="cp-target-form-grid">{([{ key: "protein", label: "蛋白质" }, { key: "carbs", label: "碳水化合物" }, { key: "fat", label: "脂肪" }] as const).map((macro) => <label key={macro.key} className="coach-field">{macro.label}（g / 天）<input className="coach-input" type="number" required min="0" step="0.1" value={targetDraft[macro.key]} onChange={(event) => setTargetDraft((current) => ({ ...current, [macro.key]: event.target.value }))} placeholder="0" /></label>)}</div>{[targetDraft.protein, targetDraft.carbs, targetDraft.fat].every((value) => value.trim() !== "" && Number.isFinite(Number(value)) && Number(value) >= 0) && <div className="cp-target-preview"><span>营养素折算热量</span><strong>{estimatedCalories({ protein: Number(targetDraft.protein), carbs: Number(targetDraft.carbs), fat: Number(targetDraft.fat) })} kcal / 天</strong></div>}<p className="cp-form-hint">同一生效日期再次保存会更新该版本；选择新的生效日期可保留此前目标。</p><div className="cp-form-actions"><button className="coach-button-secondary" type="button" onClick={() => setTargetOpen(false)}>取消</button><button className="coach-button-primary" type="submit">保存营养目标</button></div></form></CoachModal>}
  </div>;
}
