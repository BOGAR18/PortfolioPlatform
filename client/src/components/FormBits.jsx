/** Helper validasi: menampilkan pesan error dari server di bawah kolom */
export const invalidClass = (errors, name) => (errors && errors[name] ? ' is-invalid' : '');

export function FieldError({ errors, name }) {
  const msg = errors && errors[name];
  return msg ? <div className="invalid-feedback">{msg}</div> : null;
}

export function ErrorSummary({ message, errors }) {
  if (!message) return null;
  const list = Object.values(errors || {});
  return (
    <div className="alert alert-danger">
      <strong>{message}</strong>
      {list.length > 0 && (
        <ul className="mb-0 ps-3">
          {list.map((m) => <li key={m}>{m}</li>)}
        </ul>
      )}
    </div>
  );
}
