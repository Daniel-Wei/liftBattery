import { useState, type FormEvent } from "react";
import { loginUser } from "../store/slices/authSlice";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { PageKey } from "../types/appTypes";

type LoginPageProps = {
  onAuthenticated: () => void;
  onRegister: () => void;
  onNavigate: (page: PageKey) => void;
};

export function LoginPage({ onAuthenticated, onRegister, onNavigate }: LoginPageProps) {
  const dispatch = useAppDispatch();
  const { status, error } = useAppSelector((state) => state.auth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = await dispatch(loginUser({ email, password }));

    if (loginUser.fulfilled.match(result)) {
      onAuthenticated();
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <p className="landing-eyebrow">LiftBattery Beta</p>
        <h1 className="page-title">登录</h1>
        <p className="page-subtitle">用你的封闭 Beta 账号继续训练记录。</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="training-form-field">
            <span className="training-form-label">邮箱</span>
            <input className="training-input" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </label>
          <label className="training-form-field">
            <span className="training-form-label">密码</span>
            <input className="training-input" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
          </label>
          {error ? <p className="form-error" role="alert">{error}</p> : null}
          <button type="submit" className="button-primary" disabled={status === "submitting"}>
            {status === "submitting" ? "登录中" : "登录"}
          </button>
        </form>

        <div className="auth-switch">
          <button type="button" className="text-button" onClick={onRegister}>没有账号？注册 Beta</button>
          <button type="button" className="text-button" onClick={() => onNavigate(PageKey.Landing)}>回到首页</button>
        </div>
      </section>
    </main>
  );
}
