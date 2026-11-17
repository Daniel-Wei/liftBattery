import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { localDate, shiftDate } from "../../domain/coachWorkspace";
import { useCoachWorkspace } from "../../store/CoachWorkspaceContext";

export function CoachCalendar({ compact = false, onCreate }: { compact?: boolean; onCreate?: (date: string) => void }) {
  const { data, selectedClientId, selectedDate, setSelectedDate } = useCoachWorkspace();
  const [month, setMonth] = useState(() => selectedDate.slice(0, 7));
  useEffect(() => setMonth(selectedDate.slice(0, 7)), [selectedDate]);
  const today = localDate();
  const first = `${month}-01`;
  const mondayOffset = (new Date(`${first}T12:00:00`).getDay() + 6) % 7;
  const dates = Array.from({ length: 42 }, (_, index) => shiftDate(first, index - mondayOffset));
  const appointments = useMemo(() => data.appointments.filter((item) => item.status !== "cancelled" && (!selectedClientId || item.clientId === selectedClientId)).sort((a, b) => a.startTime.localeCompare(b.startTime)), [data.appointments, selectedClientId]);
  function moveMonth(offset: number) {
    const date = new Date(`${first}T12:00:00`);
    date.setMonth(date.getMonth() + offset);
    setMonth(localDate(date).slice(0, 7));
  }
  return <div className={compact ? "coach-calendar coach-calendar--compact" : "coach-calendar"}>
    <div className="coach-calendar-toolbar"><strong>{Number(month.slice(0, 4))} 年 {Number(month.slice(5))} 月</strong><div className="coach-calendar-tools"><button className="coach-inline-button" type="button" onClick={() => { setSelectedDate(today); setMonth(today.slice(0, 7)); }}>今天</button><button className="coach-icon-button" type="button" onClick={() => moveMonth(-1)} aria-label="上个月"><ChevronLeft size={17} /></button><button className="coach-icon-button" type="button" onClick={() => moveMonth(1)} aria-label="下个月"><ChevronRight size={17} /></button></div></div>
    <div className="coach-calendar-weekdays">{["一", "二", "三", "四", "五", "六", "日"].map((day) => <span key={day}>{day}</span>)}</div>
    <div className="coach-calendar-grid">{dates.map((date) => {
      const sessions = appointments.filter((item) => item.date === date);
      return <button type="button" key={date} className={`coach-calendar-day ${date.slice(0, 7) !== month ? "is-outside" : ""} ${date === selectedDate ? "is-selected" : ""} ${date === today ? "is-today" : ""}`} onClick={() => setSelectedDate(date)} aria-pressed={date === selectedDate} aria-label={`${date}，${sessions.length} 节课程`}><span className="coach-calendar-day-number">{Number(date.slice(8))}</span>{compact ? <span className="coach-calendar-dots">{sessions.slice(0, 3).map((session) => <i key={session.id} className={`coach-dot coach-dot--${data.clients.find((client) => client.id === session.clientId)?.tone ?? "cyan"}`} />)}</span> : <div className="coach-calendar-events">{sessions.slice(0, 2).map((session) => <span key={session.id} className={`coach-calendar-event coach-calendar-event--${data.clients.find((client) => client.id === session.clientId)?.tone ?? "cyan"}`}><b>{session.startTime}</b> {data.clients.find((client) => client.id === session.clientId)?.name ?? "学员"}</span>)}{sessions.length > 2 && <small>+ {sessions.length - 2} 节课程</small>}</div>}</button>;
    })}</div>
    <div className="coach-calendar-footer"><span><i className="coach-dot coach-dot--cyan" /> 已安排课程</span>{onCreate && <button type="button" className="coach-inline-button" onClick={() => onCreate(selectedDate)}><Plus size={14} /> 添加预约</button>}</div>
  </div>;
}
