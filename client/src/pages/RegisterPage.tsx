import { useState, type FormEvent } from "react";
import { registerUser } from "../store/slices/authSlice";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { PageKey } from "../types/appTypes";

type RegisterPageProps = {
  onAuthenticated: () => void;
  onLogin: () => void;
  onNavigate: (page: PageKey) => void;
};

export function RegisterPage({ onAuthenticated, onLogin, onNavigate }: RegisterPageProps) {
  const dispatch = useAppDispatch();
  const { status, error } = useAppSelector((state) => state.auth);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [betaInviteCode, setBetaInviteCode] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = await dispatch(registerUser({
      displayName,
      email,
      password,
      confirmPassword,
      betaInviteCode,
    }));

    if (registerUser.fulfilled.match(result)) {
      onAuthenticated();
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card auth-card--wide">
        <p className="landing-eyebrow">Closed Beta</p>
        <h1 className="page-title">注册 LiftBattery</h1>
        <p className="page-subtitle">暂时只开放给拿到邀请码的朋友。</p>

        <form className="auth-form auth-form--grid" onSubmit={handleSubmit}>
          <label className="training-form-field">
            <span className="training-form-label">显示名称</span>
            <input className="training-input" value={displayName} onChange={(event) => setDisplayName(event.target.value)} required />
          </label>
          <label className="training-form-field">
            <span className="training-form-label">邮箱</span>
            <input className="training-input" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </label>
          <label className="training-form-field">
            <span className="training-form-label">密码</span>
            <input className="training-input" type="password" minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} required />
          </label>
          <label className="training-form-field">
            <span className="training-form-label">确认密码</span>
            <input className="training-input" type="password" minLength={8} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required />
          </label>
          <label className="training-form-field auth-form-span">
            <span className="training-form-label">Beta 邀请码</span>
            <input className="training-input" value={betaInviteCode} onChange={(event) => setBetaInviteCode(event.target.value)} required />
          </label>
          {error ? <p className="form-error auth-form-span" role="alert">{error}</p> : null}
          <button type="submit" className="button-primary auth-form-span" disabled={status === "submitting"}>
            {status === "submitting" ? "注册中" : "注册并登录"}
          </button>
        </form>

        <div className="auth-switch">
          <button type="button" className="text-button" onClick={onLogin}>已有账号？登录</button>
          <button type="button" className="text-button" onClick={() => onNavigate(PageKey.Landing)}>回到首页</button>
        </div>
      </section>
    </main>
  );
}
