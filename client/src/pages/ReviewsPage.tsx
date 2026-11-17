import { useEffect, useState, type FormEvent } from "react";
import { ArrowDownRight, ArrowUpRight, Check, ClipboardCheck, ImageOff, Plus } from "lucide-react";
import { ClientAvatar, ClientPicker, CoachCard, CoachModal, CoachPageHeader, EmptyCoachState, StatusBadge } from "../components/coach/CoachUI";
import { isCompleteNutrition, localDate, shiftDate, shortDate } from "../domain/coachWorkspace";
import { useCoachWorkspace } from "../store/CoachWorkspaceContext";
import type { PageKey } from "../types/appTypes";
import type { CoachReview, CoachWorkspaceData, NutritionLog } from "../types/coach";
import "./schedule-reviews.css";

function weekStart(date = localDate()) {
  const weekday = new Date(`${date}T12:00:00`).getDay();
  return shiftDate(date, -(weekday === 0 ? 6 : weekday - 1));
}

function average(values: (number | undefined)[]) {
  const present = values.filter((value): value is number => typeof value === "number" && Number.isFinite(value) && value >= 0);
  return present.length ? Math.round(present.reduce((sum, value) => sum + value, 0) / present.length * 10) / 10 : undefined;
}

function WeekSummary({ data, review }: { data: CoachWorkspaceData; review: CoachReview }) {
  const end = shiftDate(review.weekOf, 6);
  const logs = data.nutritionLogs.filter((log) => log.clientId === review.clientId && log.date >= review.weekOf && log.date <= end).sort((a, b) => a.date.localeCompare(b.date));
  const weights = logs.filter((log): log is NutritionLog & { weightKg: number } => typeof log.weightKg === "number" && Number.isFinite(log.weightKg) && log.weightKg > 0);
  const first = weights[0];
  const last = weights[weights.length - 1];
  const change = weights.length > 1 ? Math.round((last.weightKg - first.weightKg) * 10) / 10 : undefined;
  const completeDays = new Set(logs.filter(isCompleteNutrition).map((log) => log.date)).size;
  const macros = [{ label: "蛋白质", value: average(logs.map((log) => log.protein)) }, { label: "碳水", value: average(logs.map((log) => log.carbs)) }, { label: "脂肪", value: average(logs.map((log) => log.fat)) }];
  const weightSummary = first ? `体重：${shortDate(first.date)} ${first.weightKg} kg${weights.length > 1 ? ` → ${shortDate(last.date)} ${last.weightKg} kg` : ""}。` : "本周暂无体重记录。";
  return <div className="review-week-summary"><div className="sr-between"><h3>本周记录摘要</h3><span className="muted">{shortDate(review.weekOf)} — {shortDate(end)}</span></div><div className="review-summary-metrics"><div><span>三大营养素完整记录</span><strong>{completeDays}<small> / 7 天</small></strong></div><div><span>体重记录</span><strong>{new Set(weights.map((log) => log.date)).size}<small> 天</small></strong></div><div><span>首末体重变化</span><strong className="review-weight-change">{change === undefined ? "—" : <>{change > 0 ? <ArrowUpRight size={18} /> : change < 0 ? <ArrowDownRight size={18} /> : null}{change > 0 ? "+" : ""}{change}<small> kg</small></>}</strong></div></div><div className="review-macro-row">{macros.map((macro) => <div key={macro.label}><span>日均{macro.label}</span><strong>{macro.value ?? "—"}<small>{macro.value === undefined ? "" : " g"}</small></strong></div>)}</div><p className="sr-footnote">日均值仅按已填写数据计算。{weightSummary}</p></div>;
}

function ReviewEditor({ review }: { review: CoachReview }) {
  const { data, saveReview } = useCoachWorkspace();
  const [checkIn, setCheckIn] = useState(review.checkIn);
  const [feedback, setFeedback] = useState(review.feedback);
  const [nextFocus, setNextFocus] = useState(review.nextFocus);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const client = data.clients.find((item) => item.id === review.clientId);
  function save(status: CoachReview["status"]) {
    if (status === "reviewed" && !feedback.trim()) { setError("请先填写教练反馈，再标记完成复盘。"); setMessage(""); return; }
    saveReview({ ...review, checkIn: checkIn.trim(), feedback: feedback.trim(), nextFocus: nextFocus.trim(), status });
    setError("");
    setMessage(status === "reviewed" ? "教练反馈已保存，本周已完成复盘。" : "反馈草稿已保存，仍保留为待复盘。");
  }
  return <CoachCard eyebrow="WEEKLY REVIEW" title="训练有记录，进度有回应。" actions={<StatusBadge tone={review.status === "reviewed" ? "mint" : "yellow"}>{review.status === "reviewed" ? "已复盘" : "待复盘"}</StatusBadge>}>
    <div className="review-editor-person">{client && <ClientAvatar client={client} size="md" />}<div><h3>{client?.name ?? "已移除学员"}</h3><p>{shortDate(review.weekOf)}起的一周 · {client?.division || "未设置项目"}</p></div></div>
    <WeekSummary data={data} review={review} />
    <div className="review-checkin"><label className="coach-field">本周授课与观察<textarea rows={3} value={checkIn} maxLength={8000} onChange={(event) => { setCheckIn(event.target.value); setMessage(""); }} placeholder="由教练记录本周授课情况、执行观察及沟通结论。" /></label></div>
    <div className="review-photos-empty"><ImageOff size={19} /><div><strong>暂无进度照片</strong><span>当前工作区暂不支持上传照片。</span></div></div>
    <div className="sr-modal-form"><label className="coach-field">授课反馈与复盘<textarea rows={5} value={feedback} onChange={(event) => { setFeedback(event.target.value); setMessage(""); }} placeholder="结合教练维护的训练、营养和体重记录，写下本周判断及需要跟进的问题。" maxLength={8000} /></label><label className="coach-field">下周重点<textarea rows={3} value={nextFocus} onChange={(event) => { setNextFocus(event.target.value); setMessage(""); }} placeholder="记录下周授课安排、训练与营养管理重点。" maxLength={4000} /></label><p className="muted">本页由教练填写并维护，保存后保留为该学员的周复盘。</p>{error && <p role="alert" className="sr-form-error">{error}</p>}{message && <p role="status" className="sr-form-success">{message}</p>}<div className="review-save-actions">{review.status === "pending" && <button className="button-secondary" onClick={() => save("pending")}>保存草稿</button>}<button className="button-primary" onClick={() => save("reviewed")}><Check size={16} />{review.status === "reviewed" ? "保存复盘" : "完成复盘"}</button></div></div>
  </CoachCard>;
}

export function ReviewsPage(_props: { onNavigate?: (page: PageKey) => void }) {
  const { data, selectedClientId, selectClient, selectedDate, saveReview } = useCoachWorkspace();
  const [filter, setFilter] = useState<"all" | CoachReview["status"]>("all");
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);
  const [newReview, setNewReview] = useState<{ clientId: string; weekOf: string; checkIn: string } | null>(null);
  const [formError, setFormError] = useState("");
  const scoped = data.reviews.filter((review) => !selectedClientId || review.clientId === selectedClientId);
  const visible = scoped.filter((review) => filter === "all" || review.status === filter).sort((a, b) => b.weekOf.localeCompare(a.weekOf) || a.id.localeCompare(b.id));
  const selected = visible.find((review) => review.id === selectedReviewId || `${review.clientId}:${review.weekOf}` === selectedReviewId) ?? visible[0];
  const pending = scoped.filter((review) => review.status === "pending").length;
  useEffect(() => { if (selected && selected.id !== selectedReviewId) setSelectedReviewId(selected.id); }, [selected, selectedReviewId]);

  function openNew() {
    setFormError("");
    setNewReview({ clientId: selectedClientId ?? data.clients[0]?.id ?? "", weekOf: weekStart(selectedDate), checkIn: "" });
  }
  function create(event: FormEvent) {
    event.preventDefault();
    if (!newReview || !data.clients.some((client) => client.id === newReview.clientId) || !newReview.weekOf) { setFormError("请选择学员并填写周起始日。"); return; }
    const existing = data.reviews.find((review) => review.clientId === newReview.clientId && review.weekOf === newReview.weekOf);
    if (existing) { setFormError("该学员在这个周起始日已有复盘，请打开已有记录。"); return; }
    saveReview({ ...newReview, checkIn: newReview.checkIn.trim(), status: "pending", feedback: "", nextFocus: "" });
    selectClient(newReview.clientId);
    setFilter("all"); setSelectedReviewId(`${newReview.clientId}:${newReview.weekOf}`); setNewReview(null);
  }

  return <div className="reviews-page"><CoachPageHeader eyebrow="COACH REVIEW & FEEDBACK" title="每一周，都向目标靠近一点。" description="由教练整理授课观察、营养与体重变化，记录本周复盘和下周安排。" actions={<button className="button-primary" onClick={openNew} disabled={!data.clients.length}><Plus size={17} /> 新建周复盘</button>} />
    <div className="sr-toolbar"><ClientPicker allowAll /><div className="review-overview-pill"><span className="review-pending-dot" />{pending} 份待复盘<span className="muted"> / {scoped.length} 份记录</span></div></div>
    <div className="review-layout"><CoachCard title="教练周复盘" eyebrow="REVIEW WORKLIST" actions={<ClipboardCheck size={19} />}><div className="review-filter-tabs" role="group" aria-label="复盘状态筛选">{([{ key: "all", label: "全部" }, { key: "pending", label: "待复盘" }, { key: "reviewed", label: "已复盘" }] as const).map((item) => <button key={item.key} aria-pressed={filter === item.key} className={filter === item.key ? "active" : ""} onClick={() => setFilter(item.key)}>{item.label}</button>)}</div><div className="review-inbox-list">{visible.map((review) => { const client = data.clients.find((item) => item.id === review.clientId); return <button key={review.id} aria-pressed={selected?.id === review.id} className={`review-inbox-item ${selected?.id === review.id ? "selected" : ""}`} onClick={() => setSelectedReviewId(review.id)}><div className="review-inbox-person">{client && <ClientAvatar client={client} size="sm" />}<div><strong>{client?.name ?? "已移除学员"}</strong><span>{shortDate(review.weekOf)} — {shortDate(shiftDate(review.weekOf, 6))}</span></div><span aria-hidden="true" className={`review-status-dot ${review.status}`} /></div><p>{review.status === "reviewed" ? review.feedback || "已完成本周复盘" : review.checkIn || "待教练整理本周授课反馈"}</p><span className="review-inbox-status">{review.status === "reviewed" ? "已复盘" : "待复盘"} <span aria-hidden="true">→</span></span></button>; })}{visible.length === 0 && <div className="sr-quiet-empty"><ClipboardCheck size={27} /><h3>{filter === "pending" ? "待复盘已清空" : "暂无复盘记录"}</h3><p>{filter === "pending" ? "可为下一周建立教练观察与复盘记录。" : "为学员建立第一份周复盘，留下这周的授课观察。"}</p>{data.clients.length > 0 && <button className="button-secondary" onClick={openNew}>新建周复盘</button>}</div>}</div></CoachCard>{selected ? <ReviewEditor key={selected.id} review={selected} /> : <EmptyCoachState title="留意变化，也留下反馈。" description={data.clients.length ? "选择或新建一份周复盘，整理教练维护的营养、体重与授课观察。" : "添加学员后，即可开始维护授课观察与每周复盘。"} />}</div>
    {newReview && <CoachModal title="新建周复盘" onClose={() => setNewReview(null)}>
      <form className="sr-modal-form" onSubmit={create}>
        <label className="coach-field">学员<select required value={newReview.clientId} onChange={(event) => setNewReview({ ...newReview, clientId: event.target.value })}><option disabled value="">选择学员</option>{data.clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}</select></label>
        <label className="coach-field">周起始日<input type="date" required value={newReview.weekOf} onChange={(event) => setNewReview({ ...newReview, weekOf: event.target.value })} /></label>
        <p className="muted">{newReview.weekOf ? `统计范围：${shortDate(newReview.weekOf)}至${shortDate(shiftDate(newReview.weekOf, 6))}，共 7 天。` : "请选择要复盘的周起始日。"}</p>
        <label className="coach-field">本周授课与观察<textarea rows={5} value={newReview.checkIn} onChange={(event) => setNewReview({ ...newReview, checkIn: event.target.value })} maxLength={8000} placeholder="由教练记录本周授课情况、执行观察及沟通结论。" /></label>
        {formError && <p role="alert" className="sr-form-error">{formError}</p>}
        <div className="sr-form-actions"><button type="button" className="button-secondary" onClick={() => setNewReview(null)}>取消</button><button className="button-primary" type="submit">创建待复盘记录</button></div>
      </form>
    </CoachModal>}
  </div>;
}
