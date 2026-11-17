import { ArrowDownRight, ArrowRight, CalendarDays, Check, ClipboardCheck, Dumbbell, Plus, ScanLine, Trophy, Users } from "lucide-react";
import { CoachCalendar } from "../components/coach/CoachCalendar";
import { ClientAvatar, CoachCard, CoachPageHeader, StatusBadge } from "../components/coach/CoachUI";
import { clientCredits, daysUntil, isCompleteNutrition, localDate, prepPhaseLabels, shortDate } from "../domain/coachWorkspace";
import { useCoachWorkspace } from "../store/CoachWorkspaceContext";
import { PageKey } from "../types/appTypes";
import { useEffect, useState } from "react";

export function CoachOverviewPage({ onNavigate, coachName }: { onNavigate: (page: PageKey) => void; coachName: string }) {
  const { data, selectedDate, setSelectedDate, selectClient, completeAppointment } = useCoachWorkspace();
  const [notice, setNotice] = useState("");
  useEffect(() => selectClient(null), [selectClient]);
  const today = localDate();
  const activeClients = data.clients.filter((client) => client.status === "active");
  const todaysAppointments = data.appointments.filter((item) => item.date === today && item.status !== "cancelled");
  const appointments = data.appointments.filter((item) => item.date === selectedDate && item.status !== "cancelled").sort((a, b) => a.startTime.localeCompare(b.startTime));
  const pendingReviews = data.reviews.filter((item) => item.status === "pending");
  const upcomingShows = activeClients.filter((client) => { const days = daysUntil(client.showDate); return days !== undefined && days >= 0 && days <= 56; });
  const completeLogs = activeClients.filter((client) => isCompleteNutrition(data.nutritionLogs.find((log) => log.clientId === client.id && log.date === today)));
  const checkInPercent = activeClients.length ? Math.round(completeLogs.length / activeClients.length * 100) : 0;
  const lowCreditClients = activeClients.filter((client) => clientCredits(data.credits, client.id) <= 3);
  function openClient(id: string, page = PageKey.Clients) { selectClient(id); onNavigate(page); }
  function openSchedule() { selectClient(null); onNavigate(PageKey.Schedule); }

  return <div className="coach-page coach-dashboard">
    <CoachPageHeader eyebrow="COMPETITION PREP · COACHING" title={`${coachName}，欢迎回到工作台`} description="安排今天的课程，持续跟进每位学员的备赛进度。" actions={<><button type="button" className="coach-button-secondary" onClick={() => onNavigate(PageKey.Clients)}><Users size={16} /> 学员档案</button><button type="button" className="coach-button-primary" onClick={openSchedule}><Plus size={16} /> 安排课程</button></>} />
    <div className="coach-stat-grid">
      {[
        { label: "服务中学员", value: activeClients.length, unit: "位", helper: "保持连接，关注每个人", icon: Users, tone: "cyan", page: PageKey.Clients },
        { label: "今日课程", value: todaysAppointments.length, unit: "节", helper: `${todaysAppointments.filter((item) => item.status === "completed").length} 节已完成`, icon: CalendarDays, tone: "mint", page: PageKey.Schedule },
        { label: "待完成复盘", value: pendingReviews.length, unit: "份", helper: "查看反馈，记录下一步", icon: ClipboardCheck, tone: "purple", page: PageKey.Reviews },
        { label: "8 周内比赛", value: upcomingShows.length, unit: "位", helper: "按各自计划推进备赛", icon: Trophy, tone: "yellow", page: PageKey.Preparation },
      ].map((item) => <button type="button" className={`coach-stat-card coach-stat-card--${item.tone}`} key={item.label} onClick={() => { if (item.page === PageKey.Schedule) setSelectedDate(today); selectClient(null); onNavigate(item.page); }}><div className="coach-stat-top"><span>{item.label}</span><item.icon size={19} strokeWidth={1.5} /></div><div className="coach-stat-value">{item.value}<small>{item.unit}</small></div><div className="coach-stat-helper"><span>{item.helper}</span><ArrowDownRight size={15} /></div></button>)}
    </div>
    <div className="coach-dashboard-calendar-row">
      <CoachCard title="授课日历" eyebrow="YOUR CALENDAR" actions={<button type="button" className="coach-inline-button" onClick={openSchedule}>完整日历 <ArrowRight size={14} /></button>}><CoachCalendar compact onCreate={openSchedule} /></CoachCard>
      <CoachCard title={selectedDate === today ? "今日课程" : `${shortDate(selectedDate)}的课程`} eyebrow="DAILY SCHEDULE" actions={<span className="coach-count">{appointments.length} 节</span>}>
        {notice && <p className="coach-feedback" role="status">{notice}</p>}
        <div className="coach-agenda-list">{appointments.length === 0 ? <div className="coach-agenda-empty"><CalendarDays size={30} strokeWidth={1.3} /><h4>这一天还没有课程</h4><p>在左侧选择日期，为学员安排下一次训练。</p><button type="button" className="coach-inline-button" onClick={openSchedule}>安排课程 <ArrowRight size={14} /></button></div> : appointments.map((appointment) => {
          const client = data.clients.find((item) => item.id === appointment.clientId);
          if (!client) return null;
          return <div className={`coach-agenda-item coach-agenda-item--${client.tone}`} key={appointment.id}><div className="coach-agenda-time"><strong>{appointment.startTime}</strong><span>{appointment.durationMinutes} 分钟</span></div><ClientAvatar client={client} /><button type="button" className="coach-agenda-copy" onClick={() => openClient(client.id)}><strong>{client.name}<StatusBadge tone={appointment.status === "completed" ? "mint" : client.tone}>{appointment.status === "completed" ? "已完成" : "待上课"}</StatusBadge></strong><span>{appointment.title}</span><small>{appointment.location || "地点待定"}</small></button>{appointment.status === "completed" ? <span className="coach-agenda-done"><Check size={16} /> 已扣课</span> : <button type="button" className="coach-button-secondary coach-button-small" onClick={() => setNotice(completeAppointment(appointment.id).message)}>完成课程</button>}</div>;
        })}</div>
        <div className="coach-card-bottom"><span className="coach-muted">确认完成后扣减 1 课时</span><button type="button" className="coach-inline-button" onClick={openSchedule}>管理排课 <ArrowRight size={14} /></button></div>
      </CoachCard>
    </div>
    <div className="coach-dashboard-detail-row">
      <CoachCard title="学员备赛进度" eyebrow="ATHLETES IN FOCUS" actions={<button type="button" className="coach-inline-button" onClick={() => { selectClient(null); onNavigate(PageKey.Clients); }}>全部学员 <ArrowRight size={14} /></button>}>
        {activeClients.length === 0 ? <div className="coach-agenda-empty"><Users size={32} strokeWidth={1.3} /><h4>从第一位学员开始</h4><p>建立学员档案，连接备赛、营养与线下课程。</p><button type="button" className="coach-button-primary" onClick={() => onNavigate(PageKey.Clients)}><Plus size={15} /> 新建学员</button></div> : <div className="coach-table-wrap"><table className="coach-table"><thead><tr><th>学员 / 项目</th><th>阶段</th><th>距比赛</th><th>今日营养</th><th>课时</th></tr></thead><tbody>{activeClients.slice(0, 6).map((client) => {
          const days = daysUntil(client.showDate);
          const logged = isCompleteNutrition(data.nutritionLogs.find((log) => log.clientId === client.id && log.date === today));
          const credits = clientCredits(data.credits, client.id);
          return <tr key={client.id}><td><button type="button" className="coach-person-cell" onClick={() => openClient(client.id)}><ClientAvatar client={client} size="sm" /><span><strong>{client.name}</strong><small>{client.division || "项目待设置"}</small></span></button></td><td><StatusBadge tone={client.tone}>{prepPhaseLabels[client.phase]}</StatusBadge></td><td><span className="coach-countdown">{days === undefined ? "待设置" : days < 0 ? `赛后 ${-days} 天` : `${Math.ceil(days / 7)} 周`}</span></td><td><button type="button" className={`coach-checkin-link ${logged ? "is-complete" : ""}`} onClick={() => openClient(client.id, PageKey.Nutrition)}><i />{logged ? "已记录" : "待记录"}</button></td><td><span className={credits <= 3 ? "coach-text-yellow" : ""}>{credits} 节</span></td></tr>;
        })}</tbody></table></div>}
      </CoachCard>
      <div className="coach-dashboard-side-stack">
        <CoachCard title="每日执行" actions={<button type="button" className="coach-inline-button" onClick={() => onNavigate(PageKey.Nutrition)}><ArrowRight size={16} /><span className="sr-only">查看营养记录</span></button>}><div className="coach-checkin-summary"><strong>{checkInPercent}<small>%</small></strong><div><span>今日三大营养素记录</span><p>{completeLogs.length} / {activeClients.length} 位学员已登记完整</p></div></div><div className="coach-progress-track"><span style={{ width: `${checkInPercent}%` }} /></div><p className="coach-muted coach-small-copy">未登记与部分登记单独跟进，不计作零摄入。</p></CoachCard>
        <CoachCard title="需要跟进"><div className="coach-followups">{pendingReviews.length > 0 && <button type="button" onClick={() => onNavigate(PageKey.Reviews)}><span className="coach-followup-icon coach-text-purple"><ClipboardCheck size={17} /></span><span><strong>{pendingReviews.length} 份周观察待复盘</strong><small>整理授课反馈，安排下周重点</small></span><ArrowRight size={15} /></button>}{lowCreditClients.length > 0 && <button type="button" onClick={() => { selectClient(lowCreditClients[0].id); onNavigate(PageKey.Clients); }}><span className="coach-followup-icon coach-text-yellow"><CalendarDays size={17} /></span><span><strong>{lowCreditClients.length} 位学员课时不足 4 节</strong><small>查看课包，为接下来的课程留出安排</small></span><ArrowRight size={15} /></button>}{pendingReviews.length === 0 && lowCreditClients.length === 0 && <p className="coach-muted">当前没有待处理事项。</p>}</div></CoachCard>
      </div>
    </div>
    <div className="coach-tools-grid"><button type="button" className="coach-tool-link" onClick={() => onNavigate(PageKey.ExerciseGuide)}><span className="coach-tool-icon"><ScanLine size={24} strokeWidth={1.4} /></span><div><span className="coach-eyebrow">MOVEMENT LIBRARY</span><strong>3D 动作指引</strong><p>旋转肌肉模型，查看动作与参与肌群。</p></div><ArrowRight size={20} /></button><button type="button" className="coach-tool-link" onClick={() => onNavigate(PageKey.Overview)}><span className="coach-tool-icon coach-tool-icon--mint"><Dumbbell size={24} strokeWidth={1.4} /></span><div><span className="coach-eyebrow">PERSONAL TRAINING</span><strong>我的训练与报告</strong><p>保留个人总览、训练记录、练前检查与完整报告。</p></div><ArrowRight size={20} /></button></div>
  </div>;
}
