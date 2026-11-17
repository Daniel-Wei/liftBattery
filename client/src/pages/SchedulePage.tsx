import { useState, type FormEvent } from "react";
import { CalendarDays, Check, Clock3, MapPin, Plus, Ticket, X } from "lucide-react";
import { CoachCalendar } from "../components/coach/CoachCalendar";
import { ClientAvatar, ClientPicker, CoachCard, CoachModal, CoachPageHeader, EmptyCoachState, StatusBadge } from "../components/coach/CoachUI";
import { clientCredits, localDate, shortDate } from "../domain/coachWorkspace";
import { useCoachWorkspace } from "../store/CoachWorkspaceContext";
import type { PageKey } from "../types/appTypes";
import type { CoachAppointment } from "../types/coach";
import "./schedule-reviews.css";

type AppointmentDraft = Omit<CoachAppointment, "id" | "status"> & { id?: string };
const statusLabels: Record<CoachAppointment["status"], string> = {
  scheduled: "待上课", completed: "已完成", cancelled: "已取消",
};

function endTime(start: string, duration: number) {
  const minutes = Number(start.slice(0, 2)) * 60 + Number(start.slice(3, 5)) + duration;
  if (minutes === 1440) return "24:00";
  return `${String(Math.floor(minutes / 60) % 24).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
}

export function SchedulePage(_props: { onNavigate?: (page: PageKey) => void }) {
  const { data, selectedClientId, selectClient, selectedDate, setSelectedDate, saveAppointment, completeAppointment, cancelAppointment, addCredits } = useCoachWorkspace();
  const [draft, setDraft] = useState<AppointmentDraft | null>(null);
  const [creditClient, setCreditClient] = useState<string | null>(null);
  const [creditQuantity, setCreditQuantity] = useState("10");
  const [creditNote, setCreditNote] = useState("");
  const [formError, setFormError] = useState("");
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | CoachAppointment["status"]>("all");
  const [cancelTarget, setCancelTarget] = useState<CoachAppointment | null>(null);

  const scoped = data.appointments.filter((item) => !selectedClientId || item.clientId === selectedClientId);
  const dayAppointments = scoped.filter((item) => item.date === selectedDate && (statusFilter === "all" || item.status === statusFilter))
    .sort((a, b) => a.startTime.localeCompare(b.startTime));
  const scheduledCount = scoped.filter((item) => item.status === "scheduled" && item.date >= localDate()).length;
  const completedCount = scoped.filter((item) => item.status === "completed").length;
  const dayCount = scoped.filter((item) => item.date === selectedDate && item.status !== "cancelled").length;

  function openNew(date = selectedDate) {
    setFormError("");
    setDraft({ clientId: data.clients.find((client) => client.id === selectedClientId && client.status === "active")?.id ?? data.clients.find((client) => client.status === "active")?.id ?? "", title: "私教训练", date, startTime: "10:00", durationMinutes: 60, location: "", notes: "" });
  }

  function save(event: FormEvent) {
    event.preventDefault();
    if (!draft) return;
    const result = saveAppointment(draft);
    if (!result.ok) { setFormError(result.message); return; }
    setSelectedDate(draft.date);
    if (selectedClientId && selectedClientId !== draft.clientId) selectClient(draft.clientId);
    setDraft(null);
    setNotice({ ok: true, text: result.message || "预约已保存。" });
  }

  function saveCredits(event: FormEvent) {
    event.preventDefault();
    if (!creditClient) return;
    const result = addCredits(creditClient, Number(creditQuantity), creditNote.trim());
    if (!result.ok) { setFormError(result.message); return; }
    setCreditClient(null);
    setNotice({ ok: true, text: result.message || "课包已登记。" });
  }

  return <div className="schedule-page">
    <CoachPageHeader eyebrow="SCHEDULE & SESSIONS" title="把每一节课，安排妥当。" description="日历掌握授课节奏，完成课程后自动记入课时流水。" actions={<button className="button-primary" onClick={() => openNew()} disabled={!data.clients.length}><Plus size={17} /> 新建预约</button>} />
    <div className="sr-toolbar"><ClientPicker allowAll /><div className="sr-toolbar-right"><button className="button-secondary" onClick={() => { setFormError(""); setCreditQuantity("10"); setCreditNote(""); setCreditClient(selectedClientId ?? data.clients[0]?.id ?? ""); }} disabled={!data.clients.length}><Ticket size={16} /> 登记课包</button></div></div>
    {notice && <div role="status" className={`sr-notice ${notice.ok ? "success" : "error"}`}><span>{notice.text}</span><button aria-label="关闭提示" className="inline-button" onClick={() => setNotice(null)}><X size={15} /></button></div>}
    <div className="sr-metric-grid">
      <div className="sr-metric"><span>即将授课</span><strong>{scheduledCount}<small>节</small></strong><p>今天及之后的待上课预约</p></div>
      <div className="sr-metric"><span>已完成课程</span><strong>{completedCount}<small>节</small></strong><p>每节完成课程扣除 1 课时</p></div>
      <div className="sr-metric"><span>{shortDate(selectedDate)} · 日程</span><strong>{dayCount}<small>节</small></strong><p>待上课与已完成课程合计</p></div>
    </div>
    {!data.clients.length && <EmptyCoachState title="先添加第一位学员" description="建立学员档案后，即可创建预约并登记课包。" />}
    <div className="schedule-calendar-layout">
      <CoachCard title="课程日历" eyebrow="YOUR CALENDAR"><CoachCalendar onCreate={(date) => openNew(date)} /></CoachCard>
      <CoachCard title={`${shortDate(selectedDate)}的安排`} eyebrow="DAILY AGENDA" actions={<span className="sr-count">{dayAppointments.length} 节</span>}>
        <div className="sr-day-toolbar"><label className="sr-filter-label">显示<select aria-label="课程状态筛选" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}><option value="all">全部状态</option><option value="scheduled">待上课</option><option value="completed">已完成</option><option value="cancelled">已取消</option></select></label><button className="inline-button" onClick={() => setSelectedDate(localDate())}>回到今天</button></div>
        <div className="schedule-agenda-list">
          {dayAppointments.length === 0 && <div className="sr-quiet-empty"><CalendarDays size={27} /><h3>这一天还很从容</h3><p>{statusFilter === "all" ? "选中日暂无预约，安排下一节训练吧。" : "没有符合当前状态的预约。"}</p>{data.clients.length > 0 && <button className="button-secondary" onClick={() => openNew(selectedDate)}><Plus size={15} /> 安排课程</button>}</div>}
          {dayAppointments.map((appointment) => {
            const client = data.clients.find((item) => item.id === appointment.clientId);
            const balance = clientCredits(data.credits, appointment.clientId);
            const debited = data.credits.some((entry) => entry.appointmentId === appointment.id && entry.type === "deduction");
            return <article key={appointment.id} className={`schedule-agenda-item is-${appointment.status}`}>
              <div className="sr-between"><span className="schedule-time">{appointment.startTime}<span> — {endTime(appointment.startTime, appointment.durationMinutes)}</span></span><StatusBadge tone={appointment.status === "completed" ? "mint" : appointment.status === "cancelled" ? "neutral" : "cyan"}>{statusLabels[appointment.status]}</StatusBadge></div>
              <h3>{appointment.title}</h3>
              <div className="schedule-person">{client && <ClientAvatar client={client} size="sm" />}<div><strong>{client?.name ?? "已移除学员"}</strong><span>{appointment.durationMinutes} 分钟 · 剩余 {balance} 课时</span></div></div>
              {appointment.location && <p className="schedule-detail"><MapPin size={14} /> {appointment.location}</p>}
              {appointment.notes && <p className="schedule-note">{appointment.notes}</p>}
              <div className="schedule-credit-line"><Ticket size={14} />{debited ? "已扣除 1 课时 · 可在学员课时流水查看" : appointment.status === "cancelled" ? "预约已取消 · 未扣课" : appointment.status === "completed" ? "未找到扣课流水，请核对学员课时记录" : "确认完成后扣除 1 课时"}</div>
              {appointment.status === "scheduled" && <div className="schedule-actions"><button className="button-primary" onClick={() => { const result = completeAppointment(appointment.id); setNotice({ ok: result.ok, text: result.message }); }}><Check size={15} /> 确认完成</button><button className="inline-button" onClick={() => { setFormError(""); const { status: _status, ...value } = appointment; setDraft(value); }}>编辑</button><button className="inline-button sr-text-danger" onClick={() => setCancelTarget(appointment)}>取消预约</button></div>}
            </article>;
          })}
        </div>
      </CoachCard>
    </div>
    <p className="sr-footnote"><Clock3 size={14} /> 日历时间以设备本地时间记录。已完成课程保留扣课流水，取消待上课预约不扣课。</p>
    {draft && <CoachModal title={draft.id ? "编辑预约" : "新建预约"} onClose={() => setDraft(null)}><form onSubmit={save} className="sr-modal-form">
      <label className="coach-field">学员<select required value={draft.clientId} onChange={(event) => setDraft({ ...draft, clientId: event.target.value })}><option value="" disabled>选择学员</option>{data.clients.map((client) => <option key={client.id} value={client.id} disabled={client.status === "paused"}>{client.name}{client.status === "paused" ? "（暂停服务）" : ""}</option>)}</select></label>
      <label className="coach-field">课程名称<input required maxLength={100} value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} /></label>
      <div className="form-grid"><label className="coach-field">日期<input type="date" required value={draft.date} onChange={(event) => setDraft({ ...draft, date: event.target.value })} /></label><label className="coach-field">开始时间<input type="time" required value={draft.startTime} onChange={(event) => setDraft({ ...draft, startTime: event.target.value })} /></label></div>
      <div className="form-grid"><label className="coach-field">时长（分钟）<input type="number" min={15} max={240} step={5} required value={draft.durationMinutes} onChange={(event) => setDraft({ ...draft, durationMinutes: Number(event.target.value) })} /></label><label className="coach-field">地点<input maxLength={120} value={draft.location} placeholder="例如：力量区 / 训练工作室" onChange={(event) => setDraft({ ...draft, location: event.target.value })} /></label></div>
      <label className="coach-field">备注<textarea rows={3} maxLength={2000} value={draft.notes} placeholder="训练重点、器械或课前准备" onChange={(event) => setDraft({ ...draft, notes: event.target.value })} /></label>
      <p className="muted">同一教练的预约时间不可重叠。创建预约暂不扣课，确认完成后扣除 1 课时。</p>
      {formError && <p className="sr-form-error" role="alert">{formError}</p>}<div className="sr-form-actions"><button type="button" className="button-secondary" onClick={() => setDraft(null)}>取消</button><button type="submit" className="button-primary">保存预约</button></div>
    </form></CoachModal>}
    {creditClient !== null && <CoachModal title="登记学员课包" onClose={() => setCreditClient(null)}><form onSubmit={saveCredits} className="sr-modal-form"><label className="coach-field">学员<select value={creditClient} required onChange={(event) => setCreditClient(event.target.value)}><option value="" disabled>选择学员</option>{data.clients.map((client) => <option key={client.id} value={client.id}>{client.name} · 剩余 {clientCredits(data.credits, client.id)} 课时</option>)}</select></label><label className="coach-field">新增课时<input type="number" min={1} max={500} step={1} required value={creditQuantity} onChange={(event) => setCreditQuantity(event.target.value)} /></label><label className="coach-field">登记说明<input value={creditNote} maxLength={200} onChange={(event) => setCreditNote(event.target.value)} placeholder="例如：续购 10 节力量训练课" /></label><p className="muted">此操作仅登记课时，不会发起支付或扣款。</p>{formError && <p role="alert" className="sr-form-error">{formError}</p>}<div className="sr-form-actions"><button className="button-secondary" type="button" onClick={() => setCreditClient(null)}>取消</button><button className="button-primary" type="submit">确认登记</button></div></form></CoachModal>}
    {cancelTarget && <CoachModal title="取消这节预约？" onClose={() => setCancelTarget(null)}><div className="sr-modal-form"><p>{shortDate(cancelTarget.date)} {cancelTarget.startTime} · {cancelTarget.title}</p><p className="muted">预约将保留为“已取消”，不会扣除课时。</p><div className="sr-form-actions"><button className="button-secondary" onClick={() => setCancelTarget(null)}>保留预约</button><button className="button-primary" onClick={() => { const result = cancelAppointment(cancelTarget.id); setNotice({ ok: result.ok, text: result.message }); setCancelTarget(null); }}>确认取消预约</button></div></div></CoachModal>}
  </div>;
}
