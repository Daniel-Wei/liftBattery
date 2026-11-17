import type { CoachWorkspaceData } from "../types/coach";
import { localDate, shiftDate } from "../domain/coachWorkspace";

// Demonstration records are kept in a separate workspace, never in the user's API data.
export function createCoachDemoData(): CoachWorkspaceData {
  const today = localDate();
  const clients: CoachWorkspaceData["clients"] = [
    { id: "demo-jing", name: "周婧", division: "女子比基尼", showName: "城市健美公开赛", showDate: shiftDate(today, 42), prepStartDate: shiftDate(today, -56), phase: "prep", status: "active", goal: "保持训练表现，按周观察备赛进度", notes: "每周二、周五线下训练；周日提交周反馈。", tone: "mint" },
    { id: "demo-zeyu", name: "陈泽宇", division: "男子健体", showName: "秋季健体邀请赛", showDate: shiftDate(today, 24), prepStartDate: shiftDate(today, -70), phase: "prep", status: "active", goal: "完成当前训练周期，复盘动作表现", notes: "本周重点跟进饮食记录完整度。", tone: "cyan" },
    { id: "demo-anran", name: "许安然", division: "女子形体", showName: "年度形体锦标赛", showDate: shiftDate(today, 6), prepStartDate: shiftDate(today, -98), phase: "peak", status: "active", goal: "按教练计划完成赛前周安排", notes: "本周增加形体展示练习，目标由教练逐日确认。", tone: "purple" },
    { id: "demo-yichen", name: "林奕辰", division: "古典健美", showName: "春季健美公开赛", showDate: shiftDate(today, 126), prepStartDate: shiftDate(today, -14), phase: "building", status: "active", goal: "完成准备期训练与每日记录", notes: "每周三次线下课；训练日与休息日分别安排。", tone: "yellow" },
    { id: "demo-kexin", name: "苏可欣", division: "女子比基尼", showName: "夏季健美公开赛", showDate: shiftDate(today, -14), prepStartDate: shiftDate(today, -126), phase: "recovery", status: "active", goal: "赛后持续记录，和教练确认恢复阶段安排", notes: "下一次周复盘检查执行情况与主观反馈。", tone: "cyan" },
  ];
  const appointments: CoachWorkspaceData["appointments"] = [
    { id: "demo-apt-1", clientId: clients[0].id, title: "下肢训练 · 臀腿", date: today, startTime: "09:00", durationMinutes: 60, location: "力量区 A", status: "completed", notes: "已完成本次授课。" },
    { id: "demo-apt-2", clientId: clients[2].id, title: "赛前展示与动作检查", date: today, startTime: "14:00", durationMinutes: 60, location: "形体教室", status: "scheduled", notes: "带上本周反馈。" },
    { id: "demo-apt-3", clientId: clients[1].id, title: "上肢训练 · 胸背", date: today, startTime: "17:30", durationMinutes: 60, location: "力量区 B", status: "scheduled", notes: "查看上次训练记录。" },
    { id: "demo-apt-4", clientId: clients[3].id, title: "基础力量训练", date: shiftDate(today, 1), startTime: "10:00", durationMinutes: 60, location: "力量区 A", status: "scheduled", notes: "" },
    { id: "demo-apt-5", clientId: clients[4].id, title: "赛后训练与反馈", date: shiftDate(today, 2), startTime: "15:00", durationMinutes: 60, location: "力量区 A", status: "scheduled", notes: "" },
    { id: "demo-apt-6", clientId: clients[0].id, title: "上肢训练", date: shiftDate(today, 3), startTime: "09:00", durationMinutes: 60, location: "力量区 B", status: "scheduled", notes: "" },
    { id: "demo-apt-7", clientId: clients[1].id, title: "下肢训练", date: shiftDate(today, -2), startTime: "16:00", durationMinutes: 60, location: "力量区 A", status: "completed", notes: "" },
    { id: "demo-apt-8", clientId: clients[2].id, title: "形体展示练习", date: shiftDate(today, 5), startTime: "14:00", durationMinutes: 45, location: "形体教室", status: "scheduled", notes: "" },
  ];
  const macros = [ { protein: 130, carbs: 180, fat: 45 }, { protein: 170, carbs: 230, fat: 60 }, { protein: 140, carbs: 190, fat: 50 }, { protein: 180, carbs: 320, fat: 75 }, { protein: 125, carbs: 220, fat: 55 } ];
  return {
    version: 1, clients, appointments,
    credits: [
      ...clients.map((client, index) => ({ id: `demo-credit-${index}`, clientId: client.id, date: shiftDate(today, -21), amount: [9, 4, 3, 12, 6][index], type: "purchase" as const, note: "示例课包登记" })),
      ...appointments.filter((item) => item.status === "completed").map((item) => ({ id: `demo-debit-${item.id}`, clientId: item.clientId, date: item.date, amount: -1, type: "deduction" as const, appointmentId: item.id, note: item.title })),
    ],
    nutritionTargets: clients.map((client, index) => ({ id: `demo-target-${index}`, clientId: client.id, effectiveDate: shiftDate(today, -14), ...macros[index] })),
    nutritionLogs: clients.flatMap((client, index) => Array.from({ length: index === 1 ? 5 : 7 }, (_, offset) => {
      const date = shiftDate(today, offset - 6);
      return { id: `demo-log-${index}-${offset}`, clientId: client.id, date, protein: macros[index].protein + (offset % 3 - 1) * 5, carbs: macros[index].carbs + (offset % 3 - 1) * 10, fat: macros[index].fat + (offset % 2) * 3, weightKg: Number(([54.8, 77.2, 58.1, 84.5, 56.9][index] - offset * 0.08 + (offset % 2) * 0.12).toFixed(1)), notes: offset === 6 ? "今日已完成记录。" : "" };
    })),
    reviews: clients.map((client, index) => ({ id: `demo-review-${index}`, clientId: client.id, weekOf: shiftDate(today, -6), status: index < 2 ? "pending" : "reviewed", checkIn: index === 0 ? "本周授课训练完成，最后两组较吃力。营养情况已按天登记，下次课继续检查动作。" : "教练已整理本周训练与饮食执行情况，待完成阶段复盘。", feedback: index < 2 ? "" : "已复盘本周记录，下次授课时继续检查动作与执行情况。", nextFocus: index < 2 ? "" : "继续登记执行情况，在下次课程前整理本周观察。" })),
  };
}
