import { useEffect, useRef, useState } from 'react';
import { api } from '../api.js';
import { useApp } from '../context/AppContext.jsx';

/** Asisten portofolio: menjawab hanya berdasarkan data portofolio di database. */
export default function Chatbot() {
  const { lang } = useApp();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const endRef = useRef(null);

  useEffect(() => {
    if (open && messages.length === 0) {
      api('/chat', { method: 'POST', body: { message: '', lang } })
        .then((d) => { setMessages([{ from: 'bot', text: d.reply }]); setSuggestions(d.suggestions || []); })
        .catch(() => {});
    }
  }, [open]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, busy, open]);

  const send = async (text) => {
    const msg = text.trim();
    if (!msg || busy) return;
    setMessages((m) => [...m, { from: 'user', text: msg }]);
    setInput('');
    setBusy(true);
    try {
      const d = await api('/chat', { method: 'POST', body: { message: msg, lang } });
      setMessages((m) => [...m, { from: 'bot', text: d.reply }]);
      setSuggestions(d.suggestions || []);
    } catch (e) {
      setMessages((m) => [...m, { from: 'bot', text: e.message }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button type="button" className="chat-fab" onClick={() => setOpen((o) => !o)} aria-label="Buka asisten portofolio">
        <i className={`bi ${open ? 'bi-x-lg' : 'bi-chat-dots'}`} />
      </button>

      {open && (
        <div className="chat-panel" role="dialog" aria-label="Asisten portofolio">
          <div className="chat-head">
            <div className="chat-title">Asisten portofolio</div>
            <div className="chat-sub">Menjawab berdasarkan data portofolio ini</div>
          </div>

          <div className="chat-body">
            {messages.map((m, i) => (
              <div key={i} className={`chat-msg ${m.from}`}>{m.text}</div>
            ))}
            {busy && <div className="chat-msg bot"><span className="typing"><span /><span /><span /></span></div>}
            <div ref={endRef} />
          </div>

          {suggestions.length > 0 && (
            <div className="chat-sugg">
              {suggestions.map((s) => (
                <button key={s} type="button" onClick={() => send(s)}>{s}</button>
              ))}
            </div>
          )}

          <form className="chat-form" onSubmit={(e) => { e.preventDefault(); send(input); }}>
            <input value={input} onChange={(e) => setInput(e.target.value)} maxLength={500}
              placeholder={lang === 'en' ? 'Type a question...' : 'Tulis pertanyaan...'} />
            <button type="submit" disabled={busy || !input.trim()} aria-label="Kirim">
              <i className="bi bi-send" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
