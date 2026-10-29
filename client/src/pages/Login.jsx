import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { FieldError, invalidClass } from '../components/FormBits.jsx';
import { useNotify } from '../context/NotifyContext.jsx';

export default function Login() {
  const { auth, login, t } = useApp();
  const navigate = useNavigate();
  const notify = useNotify();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '', remember: false });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [showPw, setShowPw] = useState(false);

  if (auth.ready && auth.user) return <Navigate to="/admin" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setErrors({});
    setBusy(true);
    try {
      await login(form.email, form.password, form.remember);
      navigate('/admin');
    } catch (err) {
      notify.error(err.message);
      setErrors(err.errors && Object.keys(err.errors).length ? err.errors : { email: err.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <h1>{t('auth.login_title')}</h1>
      <p className="sub">{t('auth.login_sub')}</p>

      {location.state?.status && <div className="alert alert-info" role="alert">{location.state.status}</div>}

      <form onSubmit={submit} className="d-grid gap-3">
        <div>
          <label htmlFor="email" className="form-label">{t('auth.email')}</label>
          <input
            type="email" id="email" name="email" autoFocus autoComplete="username" required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className={`form-control${invalidClass(errors, 'email')}`}
          />
          <FieldError errors={errors} name="email" />
        </div>

        <div>
          <label htmlFor="password" className="form-label">{t('auth.password')}</label>
          <div className="pw-field">
            <input
              type={showPw ? 'text' : 'password'} id="password" name="password" required autoComplete="current-password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className={`form-control${invalidClass(errors, 'password')}`}
            />
            <button
              type="button"
              className="pw-toggle"
              onClick={() => setShowPw((s) => !s)}
              aria-label={showPw ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
            >
              <i className={`bi ${showPw ? 'bi-eye-slash' : 'bi-eye'}`} />
            </button>
          </div>
          <FieldError errors={errors} name="password" />
        </div>

        <div className="form-check">
          <input
            type="checkbox" className="form-check-input" id="remember"
            checked={form.remember}
            onChange={(e) => setForm({ ...form, remember: e.target.checked })}
          />
          <label className="form-check-label small" htmlFor="remember">{t('auth.remember')}</label>
        </div>

        <button type="submit" className="btn btn-accent btn-lg mt-1" disabled={busy}>{t('auth.submit_login')}</button>
      </form>

      <div className="auth-links">
        <Link to="/"><i className="bi bi-arrow-left me-1" />{t('auth.back_home')}</Link>
        {auth.registrationOpen && <Link to="/register">{t('auth.to_register')}</Link>}
      </div>
    </>
  );
}
