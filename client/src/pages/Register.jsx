import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { FieldError, invalidClass } from '../components/FormBits.jsx';

export default function Register() {
  const { auth, register, t } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '' });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [showPw, setShowPw] = useState(false);

  if (auth.ready && auth.user) return <Navigate to="/admin" replace />;
  if (auth.ready && !auth.registrationOpen) {
    return <Navigate to="/login" replace state={{ status: t('auth.register_closed') }} />;
  }

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setErrors({});
    setBusy(true);
    try {
      await register(form);
      navigate('/admin');
    } catch (err) {
      setErrors(err.errors && Object.keys(err.errors).length ? err.errors : { email: err.message });
    } finally {
      setBusy(false);
    }
  };

  const pwType = showPw ? 'text' : 'password';
  const toggle = (
    <button type="button" className="pw-toggle" onClick={() => setShowPw((s) => !s)}
      aria-label={showPw ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}>
      <i className={`bi ${showPw ? 'bi-eye-slash' : 'bi-eye'}`} />
    </button>
  );

  return (
    <>
      <h1>{t('auth.register_title')}</h1>
      <p className="sub">{t('auth.register_sub')}</p>

      <form onSubmit={submit} className="d-grid gap-3">
        <div>
          <label htmlFor="name" className="form-label">{t('auth.name')}</label>
          <input id="name" type="text" autoFocus required autoComplete="name" value={form.name} onChange={set('name')}
            className={`form-control${invalidClass(errors, 'name')}`} />
          <FieldError errors={errors} name="name" />
        </div>

        <div>
          <label htmlFor="email" className="form-label">{t('auth.email')}</label>
          <input id="email" type="email" required autoComplete="username" value={form.email} onChange={set('email')}
            className={`form-control${invalidClass(errors, 'email')}`} />
          <FieldError errors={errors} name="email" />
        </div>

        <div>
          <label htmlFor="password" className="form-label">{t('auth.password')}</label>
          <div className="pw-field">
            <input id="password" type={pwType} required autoComplete="new-password" value={form.password} onChange={set('password')}
              className={`form-control${invalidClass(errors, 'password')}`} />
            {toggle}
          </div>
          <FieldError errors={errors} name="password" />
        </div>

        <div>
          <label htmlFor="password_confirmation" className="form-label">{t('auth.password_confirm')}</label>
          <div className="pw-field">
            <input id="password_confirmation" type={pwType} required autoComplete="new-password"
              value={form.password_confirmation} onChange={set('password_confirmation')} className="form-control" />
            {toggle}
          </div>
        </div>

        <button type="submit" className="btn btn-accent btn-lg mt-1" disabled={busy}>{t('auth.submit_register')}</button>
      </form>

      <div className="auth-links">
        <Link to="/"><i className="bi bi-arrow-left me-1" />{t('auth.back_home')}</Link>
        <Link to="/login">{t('auth.to_login')}</Link>
      </div>
    </>
  );
}
