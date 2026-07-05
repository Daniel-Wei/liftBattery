import { useEffect, useState, type FormEvent } from "react";
import { getWeeklyReportSchedule, updateWeeklyReportSchedule } from "../api/weeklyReportScheduleApi";
import { normalizeToMonday } from "../helpers/TrendsPageHelpers";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { selectProgramSettings } from "../store/selectors/programSettingsSelector";
import { logoutUser, updateCurrentUser } from "../store/slices/authSlice";
import { updateProgramSettings } from "../store/slices/programSettingsSlice";

type ProfilePageProps = {
  onSignedOut: () => void;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getBrowserTimezone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
}

export function ProfilePage({ onSignedOut }: ProfilePageProps) {
  const dispatch = useAppDispatch();
  const { user, status, error } = useAppSelector((state) => state.auth);
  const programSettings = useAppSelector(selectProgramSettings);
  const [displayName, setDisplayName] = useState(user?.displayName ?? "");
  const [weeklyTargetTrainingDays, setWeeklyTargetTrainingDays] = useState<number | "">(user?.weeklyTargetTrainingDays ?? 4);
  const [preferredUnit, setPreferredUnit] = useState<"kg" | "lb">(user?.preferredUnit ?? "kg");
  const [cycleStartDate, setCycleStartDate] = useState(programSettings.cycleStartDate);
  const [weeksPerCycle, setWeeksPerCycle] = useState<number | "">(programSettings.weeksPerCycle);
  const [saved, setSaved] = useState(false);
  const [weeklyReportEnabled, setWeeklyReportEnabled] = useState(false);
  const [weeklyReportTime, setWeeklyReportTime] = useState("08:00");
  const [weeklyReportEmail, setWeeklyReportEmail] = useState(user?.email ?? "");
  const [weeklyReportTimezone, setWeeklyReportTimezone] = useState(getBrowserTimezone());
  const [weeklyReportLoading, setWeeklyReportLoading] = useState(false);
  const [weeklyReportSaving, setWeeklyReportSaving] = useState(false);
  const [weeklyReportSaved, setWeeklyReportSaved] = useState(false);
  const [weeklyReportError, setWeeklyReportError] = useState<string | null>(null);

  useEffect(() => {
    setDisplayName(user?.displayName ?? "");
    setWeeklyTargetTrainingDays(user?.weeklyTargetTrainingDays ?? 4);
    setPreferredUnit(user?.preferredUnit ?? "kg");
    setCycleStartDate(programSettings.cycleStartDate);
    setWeeksPerCycle(programSettings.weeksPerCycle);
  }, [programSettings.cycleStartDate, programSettings.weeksPerCycle, user]);

  useEffect(() => {
    if (!user) {
      return;
    }

    let isMounted = true;
    setWeeklyReportEmail((current) => current || user.email);
    setWeeklyReportLoading(true);
    setWeeklyReportError(null);

    getWeeklyReportSchedule()
      .then((schedule) => {
        if (!isMounted) return;
        setWeeklyReportEnabled(schedule.enabled);
        setWeeklyReportTime(schedule.scheduledTime);
        setWeeklyReportEmail(schedule.recipientEmail || user.email);
        setWeeklyReportTimezone(schedule.timezone || getBrowserTimezone());
      })
      .catch((loadError) => {
        if (!isMounted) return;
        setWeeklyReportError(loadError instanceof Error ? loadError.message : "读取每周报告设置失败。");
      })
      .finally(() => {
        if (isMounted) setWeeklyReportLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [user]);

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedWeeklyTarget = weeklyTargetTrainingDays === ""
      ? 4
      : Math.max(1, Math.min(14, Math.round(weeklyTargetTrainingDays)));
    const normalizedWeeksPerCycle = weeksPerCycle === ""
      ? programSettings.weeksPerCycle
      : Math.max(1, Math.min(12, Math.round(weeksPerCycle)));
    const result = await dispatch(updateCurrentUser({
      displayName,
      weeklyTargetTrainingDays: normalizedWeeklyTarget,
      preferredUnit,
    }));

    dispatch(updateProgramSettings({
      ...programSettings,
      cycleStartDate: normalizeToMonday(cycleStartDate),
      weeksPerCycle: normalizedWeeksPerCycle,
    }));

    setSaved(updateCurrentUser.fulfilled.match(result));
  }

  async function handleWeeklyReportSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedEmail = weeklyReportEmail.trim();
    const normalizedTimezone = weeklyReportTimezone.trim() || "UTC";

    setWeeklyReportSaved(false);
    setWeeklyReportError(null);

    if (!emailPattern.test(normalizedEmail)) {
      setWeeklyReportError("请输入有效的接收邮箱。");
      return;
    }

    try {
      setWeeklyReportSaving(true);
      const schedule = await updateWeeklyReportSchedule({
        enabled: weeklyReportEnabled,
        scheduledTime: weeklyReportTime,
        recipientEmail: normalizedEmail,
        timezone: normalizedTimezone,
      });
      setWeeklyReportEnabled(schedule.enabled);
      setWeeklyReportTime(schedule.scheduledTime);
      setWeeklyReportEmail(schedule.recipientEmail);
      setWeeklyReportTimezone(schedule.timezone);
      setWeeklyReportSaved(true);
    } catch (saveError) {
      setWeeklyReportError(saveError instanceof Error ? saveError.message : "保存每周报告设置失败。");
    } finally {
      setWeeklyReportSaving(false);
    }
  }

  async function handleLogout() {
    await dispatch(logoutUser());
    onSignedOut();
  }

  if (!user) {
    return (
      <div className="page page-stack">
        <section className="empty-card">
          <p>请先登录。</p>
          <button type="button" className="button-dark" onClick={onSignedOut}>去登录</button>
        </section>
      </div>
    );
  }

  return (
    <div className="page page-stack">
      <section className="profile-card">
        <form className="auth-form auth-form--grid" onSubmit={handleSave}>
          <label className="training-form-field">
            <span className="training-form-label">显示名称</span>
            <input className="training-input" value={displayName} onChange={(event) => setDisplayName(event.target.value)} required />
          </label>
          <label className="training-form-field">
            <span className="training-form-label">邮箱</span>
            <input className="training-input" value={user.email} readOnly />
          </label>
          <label className="training-form-field">
            <span className="training-form-label">每周目标训练次数</span>
            <input className="training-input" type="number" min="1" max="14" value={weeklyTargetTrainingDays} onChange={(event) => setWeeklyTargetTrainingDays(event.target.value === "" ? "" : Number(event.target.value))} />
          </label>
          <label className="training-form-field">
            <span className="training-form-label">偏好单位</span>
            <select className="training-input" value={preferredUnit} onChange={(event) => setPreferredUnit(event.target.value as "kg" | "lb")}>
              <option value="kg">kg</option>
              <option value="lb">lb</option>
            </select>
          </label>
          <label className="training-form-field">
            <span className="training-form-label">训练周期起始周</span>
            <input className="training-input" type="date" value={cycleStartDate} onChange={(event) => setCycleStartDate(event.target.value)} />
          </label>
          <label className="training-form-field">
            <span className="training-form-label">每个周期包含周数</span>
            <input className="training-input" type="number" min="1" max="12" value={weeksPerCycle} onChange={(event) => setWeeksPerCycle(event.target.value === "" ? "" : Number(event.target.value))} />
          </label>
          {error ? <p className="form-error auth-form-span" role="alert">{error}</p> : null}
          {saved ? <p className="success-text auth-form-span" role="status">Profile 已保存。</p> : null}
          <div className="profile-actions auth-form-span">
            <button type="submit" className="button-primary" disabled={status === "submitting"}>
              {status === "submitting" ? "保存中" : "保存"}
            </button>
            <button type="button" className="button-dark" onClick={handleLogout}>退出登录</button>
          </div>
        </form>
      </section>

      <section className="profile-card">
        <form className="auth-form auth-form--grid" onSubmit={handleWeeklyReportSave}>
          <div className="auth-form-span">
            <h2 className="section-title">每周趋势报告计划</h2>
            <p className="page-subtitle">每周一按指定时间生成上一训练周的趋势报告 PDF，并发送到指定邮箱。</p>
          </div>
          <label className="training-form-field auth-form-span">
            <span className="training-form-label">启用自动发送</span>
            <input
              type="checkbox"
              checked={weeklyReportEnabled}
              onChange={(event) => setWeeklyReportEnabled(event.target.checked)}
              disabled={weeklyReportLoading}
            />
          </label>
          <label className="training-form-field">
            <span className="training-form-label">发送时间</span>
            <input
              className="training-input"
              type="time"
              value={weeklyReportTime}
              onChange={(event) => setWeeklyReportTime(event.target.value)}
              disabled={weeklyReportLoading}
              required
            />
          </label>
          <label className="training-form-field">
            <span className="training-form-label">接收邮箱</span>
            <input
              className="training-input"
              type="email"
              value={weeklyReportEmail}
              onChange={(event) => setWeeklyReportEmail(event.target.value)}
              disabled={weeklyReportLoading}
              required
            />
          </label>
          <label className="training-form-field auth-form-span">
            <span className="training-form-label">时区</span>
            <input
              className="training-input"
              value={weeklyReportTimezone}
              onChange={(event) => setWeeklyReportTimezone(event.target.value)}
              disabled={weeklyReportLoading}
              placeholder="UTC"
            />
          </label>
          {weeklyReportError ? <p className="form-error auth-form-span" role="alert">{weeklyReportError}</p> : null}
          {weeklyReportSaved ? <p className="success-text auth-form-span" role="status">每周报告设置已保存。</p> : null}
          <div className="profile-actions auth-form-span">
            <button type="submit" className="button-primary" disabled={weeklyReportLoading || weeklyReportSaving}>
              {weeklyReportSaving ? "保存中" : "保存每周报告设置"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
