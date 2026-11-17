import { useEffect, useMemo, useState, type CSSProperties, type FormEvent } from "react";
import { ArrowDown, ArrowUp, Check, ChevronLeft, ChevronRight, ClipboardList, Pencil, Plus, Utensils } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ClientAvatar, ClientPicker, CoachCard, CoachModal, CoachPageHeader, EmptyCoachState, StatusBadge } from "../components/coach/CoachUI";
import { estimatedCalories, isCompleteNutrition, localDate, shiftDate, shortDate, targetForDate } from "../domain/coachWorkspace";
import { useCoachWorkspace } from "../store/CoachWorkspaceContext";
import { PageKey } from "../types/appTypes";
import type { NutritionLog } from "../types/coach";
import "./nutrition.css";

const macros = [
  { key: "protein", label: "蛋白质", english: "PROTEIN", color: "#50c6d8", calories: 4 },
  { key: "carbs", label: "碳水化合物", english: "CARBOHYDRATES", color: "#b3a1e6", calories: 4 },
  { key: "fat", label: "脂肪", english: "FAT", color: "#e2c478", calories: 9 },
] as const;

type Draft = { protein: string; carbs: string; fat: string; weightKg: string; notes: string };
type TargetDraft = { effectiveDate: string; protein: string; carbs: string; fat: string };

function logDraft(log?: NutritionLog): Draft {
  return { protein: log?.protein?.toString() ?? "", carbs: log?.carbs?.toString() ?? "", fat: log?.fat?.toString() ?? "", weightKg: log?.weightKg?.toString() ?? "", notes: log?.notes ?? "" };
}

function parseOptional(value: string) {
  if (!value.trim()) return undefined;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) throw new Error("请输入大于或等于 0 的有效数字。");
  return parsed;
}

function displayNumber(value?: number) {
  return value === undefined ? "—" : new Intl.NumberFormat("zh-CN", { maximumFractionDigits: 1 }).format(value);
}

export function NutritionPage({ onNavigate }: { onNavigate?: (page: PageKey) => void }) {
  const { data, selectedClientId, selectClient, selectedDate, setSelectedDate, saveNutrition, saveTarget } = useCoachWorkspace();
  const client = data.clients.find((item) => item.id === selectedClientId) ?? data.clients[0];
  const log = data.nutritionLogs.find((item) => item.clientId === client?.id && item.date === selectedDate);
  const target = client ? targetForDate(data.nutritionTargets, client.id, selectedDate) : undefined;
  const [draft, setDraft] = useState<Draft>(() => logDraft(log));
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [showTarget, setShowTarget] = useState(false);
  const [targetError, setTargetError] = useState("");
  const [targetDraft, setTargetDraft] = useState<TargetDraft>({ effectiveDate: selectedDate, protein: "", carbs: "", fat: "" });

  useEffect(() => {
    setDraft(logDraft(log));
    setError("");
  }, [client?.id, selectedDate, log]);

  useEffect(() => {
    setSaved(false);
    setShowTarget(false);
  }, [client?.id, selectedDate]);

  const week = useMemo(() => Array.from({ length: 7 }, (_, index) => {
    const date = shiftDate(selectedDate, index - 6);
    const record = data.nutritionLogs.find((item) => item.clientId === client?.id && item.date === date);
    const dayTarget = client ? targetForDate(data.nutritionTargets, client.id, date) : undefined;
    return { date, label: shortDate(date), record, target: dayTarget, protein: record?.protein ?? null, carbs: record?.carbs ?? null, fat: record?.fat ?? null, weightKg: record?.weightKg ?? null };
  }), [selectedDate, client, data.nutritionLogs, data.nutritionTargets]);

  const completeDays = week.filter((day) => isCompleteNutrition(day.record)).length;
  const recordedDays = week.filter((day) => day.record !== undefined).length;
  const weightRecords = week.filter((day) => day.weightKg !== null);
  const weightChange = weightRecords.length > 1 ? weightRecords[weightRecords.length - 1].weightKg! - weightRecords[0].weightKg! : undefined;
  const hasMacroData = week.some((day) => day.record && [day.record.protein, day.record.carbs, day.record.fat].some((value) => value !== undefined));
  const allComplete = isCompleteNutrition(log);

  function updateDraft(field: keyof Draft, value: string) {
    setDraft((current) => ({ ...current, [field]: value }));
    setSaved(false);
  }

  function handleSave(event: FormEvent) {
    event.preventDefault();
    if (!client) return;
    setError("");
    try {
      const protein = parseOptional(draft.protein);
      const carbs = parseOptional(draft.carbs);
      const fat = parseOptional(draft.fat);
      const weightKg = parseOptional(draft.weightKg);
      if (weightKg !== undefined && weightKg <= 0) throw new Error("体重必须大于 0 kg。");
      if ([protein, carbs, fat, weightKg].every((value) => value === undefined) && !draft.notes.trim()) throw new Error("请至少填写一项摄入、体重或备注后保存。");
      saveNutrition({ clientId: client.id, date: selectedDate, protein, carbs, fat, weightKg, notes: draft.notes.trim() });
      setSaved(true);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "保存失败，请检查填写内容。"); }
  }

  function openTarget() {
    setTargetDraft({ effectiveDate: selectedDate, protein: target?.protein.toString() ?? "", carbs: target?.carbs.toString() ?? "", fat: target?.fat.toString() ?? "" });
    setTargetError("");
    setShowTarget(true);
  }

  function handleTargetSave(event: FormEvent) {
    event.preventDefault();
    if (!client) return;
    setTargetError("");
    try {
      const protein = parseOptional(targetDraft.protein);
      const carbs = parseOptional(targetDraft.carbs);
      const fat = parseOptional(targetDraft.fat);
      if (!targetDraft.effectiveDate || [protein, carbs, fat].some((value) => value === undefined)) throw new Error("请填写生效日期和全部三项营养目标。");
      saveTarget({ clientId: client.id, effectiveDate: targetDraft.effectiveDate, protein: protein!, carbs: carbs!, fat: fat! });
      setShowTarget(false);
    } catch (reason) { setTargetError(reason instanceof Error ? reason.message : "目标保存失败，请检查填写内容。"); }
  }

  if (!client) return (
    <div className="page page-stack coach-page nutrition-page">
      <CoachPageHeader eyebrow="NUTRITION & PREPARATION" title="营养记录" description="由教练统一录入摄入与体重，对照备赛目标查看执行变化。" />
      <EmptyCoachState title="先添加第一位学员" description="建立学员档案后，教练即可设置三大营养素目标，录入每日摄入与体重。" action={onNavigate ? <button className="button-primary" onClick={() => onNavigate(PageKey.Clients)}><Plus size={17} /> 添加学员</button> : undefined} />
    </div>
  );

  return (
    <div className="page page-stack coach-page nutrition-page">
      <CoachPageHeader eyebrow="NUTRITION & PREPARATION" title="营养记录" description="由教练录入学员的摄入与体重，让每一次备赛调整都能回看。" actions={<button className="button-secondary" onClick={openTarget}><Pencil size={16} /> 调整营养目标</button>} />

      <div className="nutrition-toolbar">
        <div className="nutrition-client-select"><ClientAvatar client={client} /><ClientPicker value={client.id} onChange={(id) => selectClient(id)} /></div>
        <div className="nutrition-date-select">
          <button className="inline-button nutrition-date-arrow" aria-label="前一天" onClick={() => setSelectedDate(shiftDate(selectedDate, -1))}><ChevronLeft size={18} /></button>
          <label className="coach-field"><span className="nutrition-sr-only">记录日期</span><input className="coach-input" type="date" value={selectedDate} onChange={(event) => { if (event.target.value) setSelectedDate(event.target.value); }} /></label>
          <button className="inline-button nutrition-date-arrow" aria-label="后一天" onClick={() => setSelectedDate(shiftDate(selectedDate, 1))}><ChevronRight size={18} /></button>
          <button className="inline-button nutrition-today" onClick={() => setSelectedDate(localDate())}>今天</button>
        </div>
      </div>

      <div className="nutrition-macro-grid">
        {macros.map((macro) => {
          const actual = log?.[macro.key];
          const goal = target?.[macro.key];
          const difference = actual !== undefined && goal !== undefined ? goal - actual : undefined;
          const progress = actual === undefined || goal === undefined ? 0 : goal === 0 ? 100 : Math.min(100, actual / goal * 100);
          return <article className="nutrition-macro-card" key={macro.key} style={{ "--macro-color": macro.color } as CSSProperties}>
            <div className="nutrition-macro-heading"><span>{macro.label}</span><small>{macro.english}</small></div>
            <div className="nutrition-macro-value">{displayNumber(actual)}<span> / {goal === undefined ? "未设目标" : `${displayNumber(goal)} g`}</span></div>
            <div className="nutrition-macro-progress" role="progressbar" aria-label={`${macro.label}目标完成进度`} aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${progress}%` }} /></div>
            <small className="nutrition-macro-note">{actual === undefined ? "尚未填写实际摄入" : difference === undefined ? `已记录 ${displayNumber(actual)} g` : difference === 0 ? "已达到当日目标" : difference > 0 ? `距目标还差 ${displayNumber(difference)} g` : `高于目标 ${displayNumber(-difference)} g`}</small>
          </article>;
        })}
        <article className="nutrition-energy-card">
          <div className="nutrition-macro-heading"><span>估算热量</span><Utensils size={17} /></div>
          <div className="nutrition-macro-value">{allComplete ? estimatedCalories(log).toLocaleString("zh-CN") : "—"}<span> kcal</span></div>
          <small>{target ? `目标 ${estimatedCalories(target).toLocaleString("zh-CN")} kcal` : "尚未设置营养目标"}</small>
          <p>按蛋白质 / 碳水 4、脂肪 9 kcal/g 估算。{log && !allComplete ? "补齐三项后显示当日热量。" : ""}</p>
        </article>
      </div>

      <div className="nutrition-main-grid">
        <CoachCard eyebrow="COACH DAILY LOG" title="每日摄入录入" actions={<StatusBadge tone={allComplete ? "mint" : log ? "yellow" : "neutral"}>{allComplete ? "三项已填齐" : log ? "部分记录" : "尚未记录"}</StatusBadge>}>
          <form onSubmit={handleSave} className="nutrition-log-form">
            <p className="muted nutrition-form-intro">为 {client.name} 录入 {shortDate(selectedDate)} 全天实际摄入。未填项目保留为空，0 表示当日未摄入。</p>
            <div className="nutrition-form-macros">
              {macros.map((macro) => <label className="coach-field" key={macro.key}><span><i style={{ background: macro.color }} />{macro.label}</span><div className="nutrition-unit-input"><input className="coach-input" type="number" inputMode="decimal" min="0" step="0.1" value={draft[macro.key]} placeholder="未填写" onChange={(event) => updateDraft(macro.key, event.target.value)} /><span>g</span></div></label>)}
            </div>
            <label className="coach-field"><span>当日体重 <small className="muted">可选</small></span><div className="nutrition-unit-input"><input className="coach-input" type="number" inputMode="decimal" min="0.1" step="0.1" value={draft.weightKg} placeholder="例如 72.5" onChange={(event) => updateDraft("weightKg", event.target.value)} /><span>kg</span></div></label>
            <label className="coach-field"><span>教练备注 <small className="muted">可选</small></span><textarea className="coach-input" rows={3} maxLength={2000} value={draft.notes} placeholder="记录学员的饥饿感、饮食执行情况及本次复盘需要关注的变化…" onChange={(event) => updateDraft("notes", event.target.value)} /></label>
            {error && <p className="nutrition-error" role="alert">{error}</p>}
            <div className="nutrition-form-footer"><span className={saved ? "nutrition-save-success" : "muted"} role="status">{saved ? <><Check size={15} /> 已保存到当前工作区</> : "支持先保存，稍后补齐"}</span><button className="button-primary" type="submit"><ClipboardList size={16} />{log ? "保存修改" : "保存记录"}</button></div>
          </form>
        </CoachCard>

        <CoachCard eyebrow="CURRENT PLAN" title="当日营养方案" actions={<button className="inline-button" onClick={openTarget}>{target ? "调整" : "设置目标"}<ChevronRight size={15} /></button>}>
          {target ? <>
            <div className="nutrition-target-calories"><span>{estimatedCalories(target).toLocaleString("zh-CN")}</span><small>kcal / 天</small></div>
            <div className="nutrition-target-distribution">{macros.map((macro) => { const energy = estimatedCalories(target); return <span key={macro.key} title={macro.label} style={{ background: macro.color, flex: energy > 0 ? target[macro.key] * macro.calories / energy : 1 }} />; })}</div>
            <dl className="nutrition-target-list">{macros.map((macro) => <div key={macro.key}><dt><i style={{ background: macro.color }} />{macro.label}</dt><dd>{displayNumber(target[macro.key])}<small>g / 天</small></dd></div>)}</dl>
            <div className="nutrition-target-effective"><span>方案生效日</span><strong>{target.effectiveDate}</strong></div>
            <p className="muted nutrition-target-note">目标按生效日期应用。调整后，早于生效日的记录仍按原方案对比。</p>
          </> : <div className="nutrition-empty-target"><Utensils size={27} /><h3>设置 {client.name} 的营养目标</h3><p className="muted">分别设定蛋白质、碳水和脂肪的每日克数，再与实际摄入对比。</p><button className="button-secondary" onClick={openTarget}><Plus size={16} /> 设置营养目标</button></div>}
          <div className="nutrition-week-summary"><div><span>近 7 日完整记录</span><strong>{completeDays}<small> / 7 天</small></strong></div><div><span>体重变化</span><strong className="nutrition-weight-change">{weightChange === undefined ? "—" : <>{weightChange > 0 ? <ArrowUp size={16} /> : weightChange < 0 ? <ArrowDown size={16} /> : null}{displayNumber(Math.abs(weightChange))}<small> kg</small></>}</strong></div></div>
          <p className="muted nutrition-summary-note">完整记录表示三项摄入均已填写；体重变化对比这 7 日内首末两次记录。</p>
        </CoachCard>
      </div>

      <div className="nutrition-chart-grid">
        <CoachCard eyebrow="LAST 7 DAYS" title="摄入趋势" actions={<span className="muted nutrition-chart-unit">g / 天</span>}>
          {hasMacroData ? <div className="nutrition-chart"><ResponsiveContainer width="100%" height="100%"><BarChart data={week} margin={{ left: -24, right: 4, top: 12, bottom: 0 }} barSize={22}><CartesianGrid stroke="#25364b" vertical={false} /><XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "#91a4b9", fontSize: 11 }} /><YAxis axisLine={false} tickLine={false} tick={{ fill: "#91a4b9", fontSize: 11 }} /><Tooltip contentStyle={{ background: "#101f30", border: "1px solid #2c455d", borderRadius: 12 }} labelStyle={{ color: "#d9e4ee" }} formatter={(value, name) => [`${value} g`, name]} /><Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />{macros.map((macro) => <Bar key={macro.key} dataKey={macro.key} name={macro.label} stackId="macros" fill={macro.color} radius={macro.key === "fat" ? [4, 4, 0, 0] : undefined} />)}</BarChart></ResponsiveContainer></div> : <div className="nutrition-chart-empty"><Utensils size={25} /><p>记录摄入后查看近 7 日变化</p><small>未填写的日期不会按 0 计算。</small></div>}
        </CoachCard>
        <CoachCard eyebrow="BODY WEIGHT" title="体重趋势" actions={<span className="muted nutrition-chart-unit">kg</span>}>
          {weightRecords.length > 0 ? <div className="nutrition-chart"><ResponsiveContainer width="100%" height="100%"><LineChart data={week} margin={{ left: -16, right: 14, top: 18, bottom: 28 }}><CartesianGrid stroke="#25364b" vertical={false} /><XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "#91a4b9", fontSize: 11 }} /><YAxis domain={["dataMin - 0.5", "dataMax + 0.5"]} axisLine={false} tickLine={false} tick={{ fill: "#91a4b9", fontSize: 11 }} tickFormatter={(value: number) => value.toFixed(1)} /><Tooltip contentStyle={{ background: "#101f30", border: "1px solid #2c455d", borderRadius: 12 }} labelStyle={{ color: "#d9e4ee" }} formatter={(value) => [`${value} kg`, "体重"]} /><Line type="monotone" dataKey="weightKg" stroke="#72d1ae" strokeWidth={2.5} dot={{ r: 4, fill: "#102637", strokeWidth: 2 }} activeDot={{ r: 6 }} connectNulls={false} /></LineChart></ResponsiveContainer></div> : <div className="nutrition-chart-empty"><span className="nutrition-weight-empty">kg</span><p>添加体重记录，观察备赛进度</p><small>教练可在每日记录中补充学员体重。</small></div>}
        </CoachCard>
      </div>

      <CoachCard eyebrow="PREPARATION HISTORY" title="近 7 日备赛记录" actions={<span className="nutrition-history-total">{completeDays} 天完整 · {recordedDays - completeDays} 天部分记录</span>}>
        <div className="table-wrap"><table className="coach-table nutrition-history-table"><thead><tr><th>日期</th><th>蛋白质</th><th>碳水</th><th>脂肪</th><th>估算热量</th><th>体重</th><th>记录状态</th><th><span className="nutrition-sr-only">操作</span></th></tr></thead><tbody>{[...week].reverse().map((day) => <tr key={day.date} className={day.date === selectedDate ? "nutrition-selected-row" : ""}><td>{shortDate(day.date)}{day.date === localDate() && <span className="nutrition-date-today">今天</span>}</td>{macros.map((macro) => <td key={macro.key}><span>{displayNumber(day.record?.[macro.key])}{day.record?.[macro.key] !== undefined && " g"}</span>{day.target && <small className="nutrition-history-target">目标 {day.target[macro.key]} g</small>}</td>)}<td>{isCompleteNutrition(day.record) ? `${estimatedCalories(day.record).toLocaleString("zh-CN")} kcal` : "—"}</td><td>{day.weightKg === null ? "—" : `${displayNumber(day.weightKg)} kg`}</td><td><StatusBadge tone={isCompleteNutrition(day.record) ? "mint" : day.record ? "yellow" : "neutral"}>{isCompleteNutrition(day.record) ? "已填齐" : day.record ? "部分记录" : "未记录"}</StatusBadge></td><td><button className="inline-button" onClick={() => { setSelectedDate(day.date); document.querySelector(".nutrition-log-form")?.scrollIntoView({ behavior: "smooth", block: "center" }); }}>{day.record ? "编辑" : "录入"}</button></td></tr>)}</tbody></table></div>
      </CoachCard>

      {showTarget && <CoachModal title={`调整 ${client.name} 的营养目标`} onClose={() => setShowTarget(false)}><form className="nutrition-target-form" onSubmit={handleTargetSave}><p className="muted">设定每日三大营养素目标。新方案从生效日起应用；相同生效日会更新该日方案，其他日期的方案保留。</p><label className="coach-field"><span>生效日期</span><input className="coach-input" type="date" required value={targetDraft.effectiveDate} onChange={(event) => setTargetDraft((current) => ({ ...current, effectiveDate: event.target.value }))} /></label><div className="nutrition-form-macros">{macros.map((macro) => <label className="coach-field" key={macro.key}><span>{macro.label}</span><div className="nutrition-unit-input"><input className="coach-input" type="number" inputMode="decimal" required min="0" step="0.1" value={targetDraft[macro.key]} placeholder="每日目标" onChange={(event) => setTargetDraft((current) => ({ ...current, [macro.key]: event.target.value }))} /><span>g</span></div></label>)}</div>{targetError && <p className="nutrition-error" role="alert">{targetError}</p>}<div className="nutrition-modal-actions"><button className="button-secondary" type="button" onClick={() => setShowTarget(false)}>取消</button><button className="button-primary" type="submit">保存目标方案</button></div></form></CoachModal>}
    </div>
  );
}
