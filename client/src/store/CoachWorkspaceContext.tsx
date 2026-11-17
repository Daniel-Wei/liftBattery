import { useEffect, useRef, useState, type ReactNode } from "react";
import type { CoachActionResult, CoachAppointment, CoachClient, CoachReview, CoachWorkspaceData, NutritionLog, NutritionTarget } from "../types/coach";
import { appointmentsOverlap, completeCoachAppointment, emptyCoachWorkspace, localDate } from "../domain/coachWorkspace";
import { createCoachDemoData } from "../data/coachDemoData";

import { WorkspaceContext } from "./coachWorkspaceState";
export { useCoachWorkspace } from "./coachWorkspaceState";
const newId = () => crypto.randomUUID();

export function CoachWorkspaceProvider({ ownerKey, isDemo, children }: { ownerKey: string; isDemo: boolean; children: ReactNode }) {
  const storageKey = `liftbattery:coach-workspace:v1:${ownerKey}`;
  const [storageError, setStorageError] = useState<string | null>(null);
  const [data, setData] = useState<CoachWorkspaceData>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved) as CoachWorkspaceData;
        if (parsed.version === 1 && [parsed.clients, parsed.appointments, parsed.credits, parsed.nutritionLogs, parsed.nutritionTargets, parsed.reviews].every(Array.isArray)) return parsed;
      }
    } catch { /* Restricted browser storage still allows an in-memory workspace. */ }
    return isDemo ? createCoachDemoData() : emptyCoachWorkspace();
  });
  const dataRef = useRef(data);
  const [selectedClientId, selectClient] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(localDate);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(data));
      setStorageError(null);
    } catch {
      setStorageError("此浏览器暂时无法保存工作区，当前修改仅保留至页面关闭。请导出备份。");
    }
  }, [data, storageKey]);

  function commit(next: CoachWorkspaceData) {
    dataRef.current = next;
    setData(next);
  }

  function saveClient(input: Omit<CoachClient, "id"> & { id?: string }) {
    const id = input.id ?? newId();
    const next = { ...input, name: input.name.trim(), id };
    const current = dataRef.current;
    commit({ ...current, clients: current.clients.some((client) => client.id === id) ? current.clients.map((client) => client.id === id ? next : client) : [...current.clients, next] });
    return id;
  }

  function saveTarget(input: Omit<NutritionTarget, "id">) {
    const current = dataRef.current;
    if (!current.clients.some((client) => client.id === input.clientId) || !input.effectiveDate || [input.protein, input.carbs, input.fat].some((value) => !Number.isFinite(value) || value < 0)) return;
    const existing = current.nutritionTargets.find((target) => target.clientId === input.clientId && target.effectiveDate === input.effectiveDate);
    const record = { ...input, id: existing?.id ?? newId() };
    commit({ ...current, nutritionTargets: [...current.nutritionTargets.filter((target) => target.id !== record.id), record] });
  }

  function saveNutrition(input: Omit<NutritionLog, "id">) {
    const current = dataRef.current;
    if (!current.clients.some((client) => client.id === input.clientId)) return;
    const existing = current.nutritionLogs.find((log) => log.clientId === input.clientId && log.date === input.date);
    const record = { ...input, id: existing?.id ?? newId() };
    commit({ ...current, nutritionLogs: [...current.nutritionLogs.filter((log) => log.id !== record.id), record] });
  }

  function saveAppointment(input: Omit<CoachAppointment, "id" | "status"> & { id?: string }): CoachActionResult {
    const current = dataRef.current;
    const client = current.clients.find((item) => item.id === input.clientId);
    if (!client || client.status !== "active") return { ok: false, message: "请选择一位服务中的学员。" };
    const existing = current.appointments.find((item) => item.id === input.id);
    if (existing && existing.status !== "scheduled") return { ok: false, message: "已完成或已取消的课程不能直接修改。" };
    if (!input.title.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(input.date) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(input.startTime) || !Number.isFinite(input.durationMinutes) || input.durationMinutes < 15 || input.durationMinutes > 240) return { ok: false, message: "请填写课程、日期、时间及 15–240 分钟的时长。" };
    const endMinute = Number(input.startTime.slice(0, 2)) * 60 + Number(input.startTime.slice(3)) + input.durationMinutes;
    if (endMinute > 1440) return { ok: false, message: "课程结束时间不能超过当天。" };
    const appointment: CoachAppointment = { ...input, title: input.title.trim(), id: input.id ?? newId(), status: "scheduled" };
    if (current.appointments.some((item) => appointmentsOverlap(appointment, item))) return { ok: false, message: "这个时段已有课程，请调整开始时间。" };
    commit({ ...current, appointments: [...current.appointments.filter((item) => item.id !== appointment.id), appointment] });
    return { ok: true, message: existing ? "预约已更新。" : "预约已创建。" };
  }

  function completeAppointment(id: string): CoachActionResult {
    const result = completeCoachAppointment(dataRef.current, id, newId());
    if (result.error) return { ok: false, message: result.error };
    commit(result.data);
    return { ok: true, message: "课程已完成，已扣减 1 课时。" };
  }

  function cancelAppointment(id: string): CoachActionResult {
    const current = dataRef.current;
    if (!current.appointments.some((item) => item.id === id && item.status === "scheduled")) return { ok: false, message: "仅待上课预约可以取消。" };
    commit({ ...current, appointments: current.appointments.map((item) => item.id === id ? { ...item, status: "cancelled" } : item) });
    return { ok: true, message: "预约已取消，未扣课时。" };
  }

  function addCredits(clientId: string, quantity: number, note: string): CoachActionResult {
    const current = dataRef.current;
    if (!current.clients.some((client) => client.id === clientId) || !Number.isInteger(quantity) || quantity <= 0 || quantity > 999) return { ok: false, message: "课包数量需为 1–999 的整数。" };
    commit({ ...current, credits: [...current.credits, { id: newId(), clientId, date: localDate(), amount: quantity, type: "purchase", note: note.trim() || "登记新课包" }] });
    return { ok: true, message: `已登记 ${quantity} 课时。` };
  }

  function saveReview(input: Omit<CoachReview, "id"> & { id?: string }) {
    const current = dataRef.current;
    if (!current.clients.some((client) => client.id === input.clientId)) return;
    const existing = current.reviews.find((item) => item.id === input.id || (item.clientId === input.clientId && item.weekOf === input.weekOf));
    const record = { ...input, id: existing?.id ?? newId() };
    commit({ ...current, reviews: [...current.reviews.filter((item) => item.id !== record.id), record] });
  }

  return <WorkspaceContext.Provider value={{ data, isDemo, storageError, selectedClientId, selectClient, selectedDate, setSelectedDate, saveClient, saveTarget, saveNutrition, saveAppointment, completeAppointment, cancelAppointment, addCredits, saveReview }}>{children}</WorkspaceContext.Provider>;
}

