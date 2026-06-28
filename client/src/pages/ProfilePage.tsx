import { useEffect, useState, type FormEvent } from "react";
import { logoutUser, updateCurrentUser } from "../store/slices/authSlice";
import { useAppDispatch, useAppSelector } from "../store/hooks";

type ProfilePageProps = {
  onSignedOut: () => void;
};

export function ProfilePage({ onSignedOut }: ProfilePageProps) {
  const dispatch = useAppDispatch();
  const { user, status, error } = useAppSelector((state) => state.auth);
  const [displayName, setDisplayName] = useState(user?.displayName ?? "");
  const [trainingGoal, setTrainingGoal] = useState(user?.trainingGoal ?? "");
  const [weeklyTargetTrainingDays, setWeeklyTargetTrainingDays] = useState(user?.weeklyTargetTrainingDays ?? 4);
  const [preferredUnit, setPreferredUnit] = useState<"kg" | "lb">(user?.preferredUnit ?? "kg");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setDisplayName(user?.displayName ?? "");
    setTrainingGoal(user?.trainingGoal ?? "");
    setWeeklyTargetTrainingDays(user?.weeklyTargetTrainingDays ?? 4);
    setPreferredUnit(user?.preferredUnit ?? "kg");
  }, [user]);

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = await dispatch(updateCurrentUser({
      displayName,
      trainingGoal,
      weeklyTargetTrainingDays,
      preferredUnit,
    }));

    setSaved(updateCurrentUser.fulfilled.match(result));
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
      <header className="page-header">
        <p className="eyebrow">Profile</p>
        <h1 className="page-title">用户 Profile</h1>
        <p className="page-subtitle">管理你的封闭 Beta 账号和训练偏好。</p>
      </header>

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
          <label className="training-form-field auth-form-span">
            <span className="training-form-label">训练目标</span>
            <input className="training-input" value={trainingGoal} onChange={(event) => setTrainingGoal(event.target.value)} placeholder="例如：减脂保力量 / 增肌 / 回归训练" />
          </label>
          <label className="training-form-field">
            <span className="training-form-label">每周目标训练次数</span>
            <input className="training-input" type="number" min="1" max="14" value={weeklyTargetTrainingDays} onChange={(event) => setWeeklyTargetTrainingDays(Number(event.target.value))} />
          </label>
          <label className="training-form-field">
            <span className="training-form-label">偏好单位</span>
            <select className="training-input" value={preferredUnit} onChange={(event) => setPreferredUnit(event.target.value as "kg" | "lb")}>
              <option value="kg">kg</option>
              <option value="lb">lb</option>
            </select>
          </label>
          <p className="muted-text auth-form-span">注册日期：{new Date(user.createdAtUtc).toLocaleDateString()}</p>
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
    </div>
  );
}
