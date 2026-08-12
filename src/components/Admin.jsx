import { useState, useEffect, useCallback } from 'react';
import { withBase } from '../paths';

const TOKEN_KEY = 'hh-admin-token';

const CATS = ['building', 'foundation', 'students', 'meals', 'school', 'prayer', 'events'];
const CAT_LABELS = {
  building: 'Building',
  foundation: 'Foundation',
  students: 'Students',
  meals: 'Meals',
  school: 'Study & School',
  prayer: 'Prayer',
  events: 'Events',
};
const CAT_ICONS = {
  building: '🏠',
  foundation: '📋',
  students: '👨‍👩‍👧‍👦',
  meals: '🍽️',
  school: '📚',
  prayer: '🕌',
  events: '🎉',
};

const IMAGE_SLOTS = [
  { key: 'heroBuilding', label: 'Hero Building Photo', hint: 'Big building photo at the top of the home page' },
  { key: 'aboutBuilding', label: 'About Section Building', hint: 'Main photo in the About section' },
  { key: 'constructionBegin', label: 'Construction — Beginning', hint: 'First photo in the Building section (starting stage)' },
  { key: 'constructionToday', label: 'Construction — Today', hint: 'Second photo in the Building section (current stage)' },
  { key: 'constructionPoster', label: 'Construction Journey Poster', hint: 'Full-width premium poster in the Building section' },
  { key: 'logo', label: 'Logo', hint: 'Logo shown in navbar, footer & preloader' },
];

const ROLE_OPTIONS = [
  { key: 'chairman', label: 'Chairman' },
  { key: 'viceChairman', label: 'Vice Chairman' },
  { key: 'generalSecretary', label: 'General Secretary' },
  { key: 'financeSecretary', label: 'Finance Secretary' },
  { key: 'informationSecretary', label: 'Information Secretary' },
  { key: 'broadcastingSecretary', label: 'Broadcasting Secretary' },
  { key: 'counselor', label: 'Counselor' },
];

const COMMITTEE_OPTIONS = [
  { key: 'education', label: 'Education Committee' },
  { key: 'accountability', label: 'Accountability Committee' },
  { key: 'health', label: 'Health Committee' },
  { key: 'audit', label: 'Audit Committee' },
];

const EMPTY_FORM = { cat: 'building', enTitle: '', urTitle: '', enDetail: '', urDetail: '', span: false, file: null, uploadedSrc: null };

function mimeFromExt(ext) {
  if (ext === 'png') return 'image/png';
  if (ext === 'webp') return 'image/webp';
  if (ext === 'gif') return 'image/gif';
  return 'image/jpeg';
}

function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve({
      data: fr.result.split(',')[1],
      ext: (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg',
    });
    fr.onerror = reject;
    fr.readAsDataURL(file);
  });
}

export default function Admin() {
  const [token, setToken] = useState(() => sessionStorage.getItem(TOKEN_KEY) || '');
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState('gallery');
  const [site, setSite] = useState({ gallery: { items: [] }, images: {} });
  const [team, setTeam] = useState({ officials: [], committees: [] });
  const [content, setContent] = useState({
    stats: { children: 31, yearsActive: 7, foundedYear: 2018 },
    donate: {
      bank: { bankName: 'Bank Al Habib – Parachinar Branch', accountTitle: 'Hussaini Homes Foundation', iban: 'PK05BAHL2018007800509701' },
      mobilePay: [
        { label: 'JazzCash',  number: '0307 5905907', name: 'Sayed Ijaz' },
        { label: 'EasyPaisa', number: '0303 4030009', name: 'Iftikhar' },
        { label: 'JazzCash',  number: '0303 8189466', name: 'Talat Hussain' },
      ],
    },
    contact: { whatsapp: '923034030009', phone: '+92 303 4030009', email: 'hussainihomesfoundation@gmail.com', address: 'Parachinar, Kurram, KPK, Pakistan' },
    footer: { facebook: 'https://www.facebook.com/Hussainihome', whatsapp: 'https://wa.me/923034030009', youtube: '#', instagram: '#' },
  });
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [editor, setEditor] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);
  const [pw, setPw] = useState({ current: '', new: '', confirm: '' });

  const showMsg = (type, text) => {
    setMsg({ type, text });
    window.setTimeout(() => setMsg(null), 3500);
  };

  const api = useCallback(async (path, body, method = 'GET') => {
    const headers = {};
    if (body) headers['Content-Type'] = 'application/json';
    const tok = sessionStorage.getItem(TOKEN_KEY);
    if (tok) headers['Authorization'] = `Bearer ${tok}`;
    const r = await fetch(path, { method, headers, body: body ? JSON.stringify(body) : undefined });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) {
      if (r.status === 401 && path !== '/api/admin/login') {
        sessionStorage.removeItem(TOKEN_KEY);
        setToken('');
      }
      throw new Error(data.error || 'Request failed');
    }
    return data;
  }, []);

  const loadSite = useCallback(async () => {
    const data = await api('/api/admin/site');
    setSite({ gallery: data.gallery || { items: [] }, images: data.images || {} });
    setTeam(data.team || { officials: [], committees: [] });
    if (data.content && typeof data.content === 'object') {
      setContent(prev => ({ ...prev, ...data.content,
        stats: { ...prev.stats, ...(data.content.stats || {}) },
        donate: { ...prev.donate, ...(data.content.donate || {}),
          bank: { ...prev.donate.bank, ...(data.content.donate?.bank || {}) },
          mobilePay: data.content.donate?.mobilePay || prev.donate.mobilePay,
        },
        contact: { ...prev.contact, ...(data.content.contact || {}) },
        footer: { ...prev.footer, ...(data.content.footer || {}) },
      }));
    }
  }, [api]);

  useEffect(() => {
    if (!token) { setReady(true); return; }
    loadSite().then(() => setReady(true)).catch(() => setReady(true));
  }, [token, loadSite]);

  const items = (site.gallery && site.gallery.items) || [];

  if (!ready) {
    return <div className="adm-page adm-center"><div className="adm-spinner" /></div>;
  }

  if (!token) {
    return (
      <div className="adm-page">
        <div className="adm-login">
          <img src={withBase('/images/LOGO.png')} alt="Hussaini Homes logo" className="adm-login-logo" />
          <h1 className="adm-login-title">Hussaini Homes — Admin</h1>
          <p className="adm-login-sub">Enter the admin password to manage photos</p>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              className="adm-input"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoFocus
            />
            {loginError && <div className="adm-error">{loginError}</div>}
            <button className="adm-btn adm-btn-primary" disabled={busy}>
              {busy ? 'Checking…' : 'Login'}
            </button>
          </form>
          <a href="/" className="adm-back-link">← View Website</a>
        </div>
      </div>
    );
  }

  return (
    <div className="adm-page">
      {msg && <div className={`adm-toast adm-toast-${msg.type}`}>{msg.text}</div>}

      <header className="adm-header">
        <div className="adm-header-left">
          <img src={withBase(site.images.logo) || withBase('/images/LOGO.png')} alt="logo" className="adm-header-logo" />
          <span className="adm-header-title">Photo Manager</span>
        </div>
        <nav className="adm-tabs">
          <button className={`adm-tab${tab === 'gallery' ? ' active' : ''}`} onClick={() => setTab('gallery')}>📷 Gallery</button>
          <button className={`adm-tab${tab === 'team' ? ' active' : ''}`} onClick={() => setTab('team')}>👥 Team</button>
          <button className={`adm-tab${tab === 'photos' ? ' active' : ''}`} onClick={() => setTab('photos')}>🖼️ Photos</button>
          <button className={`adm-tab${tab === 'content' ? ' active' : ''}`} onClick={() => setTab('content')}>✏️ Content</button>
          <button className={`adm-tab${tab === 'settings' ? ' active' : ''}`} onClick={() => setTab('settings')}>⚙️ Settings</button>
        </nav>
        <div className="adm-header-right">
          <a href="/" className="adm-btn adm-btn-ghost">← Website</a>
          <button className="adm-btn adm-btn-ghost" onClick={logout}>Logout</button>
        </div>
      </header>

      <main className="adm-main">
        {tab === 'gallery' && (
          <>
            {editor && (
              <GalleryEditor
                form={form}
                setForm={setForm}
                busy={busy}
                onCancel={() => { setEditor(null); setForm(EMPTY_FORM); }}
                onSave={saveEditor}
              />
            )}

            <div className="adm-toolbar">
              <h2 className="adm-section-title">Gallery Photos ({items.length})</h2>
              <button
                className="adm-btn adm-btn-primary"
                disabled={busy}
                onClick={() => { setForm(EMPTY_FORM); setEditor({ mode: 'add' }); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              >
                + Add Photo
              </button>
            </div>

            {items.length === 0 ? (
              <p className="adm-empty">No photos yet. Click "+ Add Photo" to add the first one.</p>
            ) : (
              <div className="adm-grid">
                {items.map((it, idx) => (
                  <div className="adm-card" key={it.id || idx}>
                    {it.src ? (
                      <img className="adm-card-img" src={it.src} alt={it.label?.en || ''} loading="lazy" />
                    ) : (
                      <div className="adm-card-img adm-card-img-empty">{it.icon || '📷'}</div>
                    )}
                    <div className="adm-card-body">
                      <div className="adm-card-labels">
                        <span className="adm-card-en">{it.label?.en || '—'}</span>
                        <span className="adm-card-ur" dir="rtl">{it.label?.ur || ''}</span>
                      </div>
                      <span className="adm-card-cat">{CAT_LABELS[it.cat] || it.cat}</span>
                    </div>
                    <div className="adm-card-actions">
                      <button className="adm-icon-btn" title="Move up" disabled={idx === 0} onClick={() => move(idx, -1)}>↑</button>
                      <button className="adm-icon-btn" title="Move down" disabled={idx === items.length - 1} onClick={() => move(idx, 1)}>↓</button>
                      <button
                        className="adm-icon-btn"
                        title="Edit"
                        onClick={() => {
                          setForm({
                            cat: it.cat || 'building',
                            enTitle: it.label?.en || '',
                            urTitle: it.label?.ur || '',
                            enDetail: it.detail?.en || '',
                            urDetail: it.detail?.ur || '',
                            span: !!it.span,
                            file: null,
                            uploadedSrc: null,
                          });
                          setEditor({ mode: 'edit', idx });
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                      >✎</button>
                      <button className="adm-icon-btn adm-icon-danger" title="Delete" disabled={busy} onClick={() => remove(idx)}>✕</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {tab === 'photos' && (
          <>
            <h2 className="adm-section-title">Replace Website Photos</h2>
            <p className="adm-sub">Upload a new photo to instantly replace it on the website.</p>
            <div className="adm-photo-grid">
              {IMAGE_SLOTS.map(slot => (
                <div className="adm-photo-card" key={slot.key}>
                  <div className="adm-photo-preview">
                    <img src={site.images[slot.key]} alt={slot.label} onError={e => { e.currentTarget.style.opacity = '0.25'; }} />
                  </div>
                  <div className="adm-photo-body">
                    <span className="adm-photo-label">{slot.label}</span>
                    <span className="adm-photo-hint">{slot.hint}</span>
                  </div>
                  <label className="adm-btn adm-btn-outline adm-upload-label">
                    {busy ? 'Uploading…' : 'Replace Photo'}
                    <input
                      type="file"
                      accept="image/*"
                      disabled={busy}
                      onChange={e => {
                        const f = e.target.files && e.target.files[0];
                        if (f) replaceSiteImage(slot.key, f);
                        e.target.value = '';
                      }}
                    />
                  </label>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === 'team' && (
          <TeamEditor
            team={team}
            setTeam={setTeam}
            busy={busy}
            api={api}
            onSave={saveTeam}
          />
        )}

        {tab === 'content' && (
          <ContentEditor content={content} setContent={setContent} busy={busy} onSave={saveContent} />
        )}

        {tab === 'settings' && (
          <div className="adm-settings">
            <h2 className="adm-section-title">Change Admin Password</h2>
            <form onSubmit={changePassword} className="adm-settings-form">
              <input type="password" className="adm-input" placeholder="Current password" value={pw.current} onChange={e => setPw(p => ({ ...p, current: e.target.value }))} />
              <input type="password" className="adm-input" placeholder="New password (min 6 characters)" value={pw.new} onChange={e => setPw(p => ({ ...p, new: e.target.value }))} />
              <input type="password" className="adm-input" placeholder="Repeat new password" value={pw.confirm} onChange={e => setPw(p => ({ ...p, confirm: e.target.value }))} />
              <button className="adm-btn adm-btn-primary" disabled={busy}>Change Password</button>
            </form>
            <p className="adm-sub">Tip: pick a password the client can remember — they will use it to log in here.</p>
          </div>
        )}
      </main>
    </div>
  );

  async function handleLogin(e) {
    e.preventDefault();
    setBusy(true);
    setLoginError('');
    try {
      const data = await api('/api/admin/login', { password }, 'POST');
      sessionStorage.setItem(TOKEN_KEY, data.token);
      setToken(data.token);
    } catch (err) {
      setLoginError(err.message);
    }
    setBusy(false);
  }

  function logout() {
    sessionStorage.removeItem(TOKEN_KEY);
    setToken('');
    setEditor(null);
    setForm(EMPTY_FORM);
  }

  async function saveGallery(nextItems) {
    await api('/api/admin/gallery', { items: nextItems }, 'POST');
    setSite(s => ({ ...s, gallery: { items: nextItems } }));
  }

  async function saveTeam() {
    setBusy(true);
    try {
      await api('/api/admin/team', { officials: team.officials, committees: team.committees }, 'POST');
      showMsg('ok', 'Team saved ✓');
    } catch (err) { showMsg('err', err.message); }
    setBusy(false);
  }

  function move(idx, dir) {
    const copy = [...items];
    const j = idx + dir;
    if (j < 0 || j >= copy.length) return;
    [copy[idx], copy[j]] = [copy[j], copy[idx]];
    saveGallery(copy).then(() => showMsg('ok', 'Order saved ✓')).catch(err => showMsg('err', err.message));
  }

  async function remove(idx) {
    const it = items[idx];
    if (!window.confirm(`Delete "${it.label?.en || 'this photo'}"?`)) return;
    setBusy(true);
    try {
      if (it.src && it.src.startsWith('/images/gallery/')) {
        await api('/api/admin/delete-image', { src: it.src }, 'POST').catch(() => {});
      }
      const copy = items.filter((_, i) => i !== idx);
      await saveGallery(copy);
      showMsg('ok', 'Photo deleted ✓');
    } catch (err) { showMsg('err', err.message); }
    setBusy(false);
  }

  async function saveEditor() {
    setBusy(true);
    try {
      let uploadedSrc = form.uploadedSrc;
      if (form.file) {
        const up = await api('/api/admin/upload', { folder: 'gallery', filename: `gallery-${Date.now()}.${form.file.ext}`, ext: form.file.ext, data: form.file.data }, 'POST');
        uploadedSrc = up.src;
      }

      const item = editor.mode === 'edit' ? { ...items[editor.idx] } : {};
      item.id = item.id || `gallery-${Date.now()}`;
      item.cat = form.cat;
      item.icon = item.icon || CAT_ICONS[form.cat];
      item.span = !!form.span;
      item.label = { en: form.enTitle.trim() || 'Untitled', ur: form.urTitle.trim() };
      item.detail = { en: form.enDetail.trim(), ur: form.urDetail.trim() };
      if (uploadedSrc) {
        if (item.src && item.src.startsWith('/images/gallery/') && item.src !== uploadedSrc) {
          await api('/api/admin/delete-image', { src: item.src }, 'POST').catch(() => {});
        }
        item.src = uploadedSrc;
      } else if (!item.src) {
        throw new Error('Please choose a photo');
      }

      const copy = [...items];
      if (editor.mode === 'edit') copy[editor.idx] = item;
      else copy.push(item);
      await saveGallery(copy);
      setEditor(null);
      setForm(EMPTY_FORM);
      showMsg('ok', editor.mode === 'edit' ? 'Photo updated ✓' : 'Photo added ✓');
    } catch (err) { showMsg('err', err.message); }
    setBusy(false);
  }

  async function replaceSiteImage(key, file) {
    setBusy(true);
    try {
      const { data, ext } = await readFileAsBase64(file);
      const up = await api('/api/admin/upload', { folder: 'site-images', filename: `${key}-${Date.now()}.${ext}`, ext, data }, 'POST');
      const images = { ...site.images, [key]: up.src };
      await api('/api/admin/images', { images }, 'POST');
      setSite(s => ({ ...s, images }));
      showMsg('ok', 'Photo replaced ✓');
    } catch (err) { showMsg('err', err.message); }
    setBusy(false);
  }

  async function saveContent() {
    setBusy(true);
    try {
      await api('/api/admin/content', { content }, 'POST');
      showMsg('ok', 'Content saved ✓ — refresh site to see changes');
    } catch (err) { showMsg('err', err.message); }
    setBusy(false);
  }

  async function changePassword(e) {
    e.preventDefault();
    if (pw.new.length < 6) { showMsg('err', 'New password must be at least 6 characters'); return; }
    if (pw.new !== pw.confirm) { showMsg('err', 'New passwords do not match'); return; }
    setBusy(true);
    try {
      await api('/api/admin/password', { password: pw.current, newPassword: pw.new }, 'POST');
      setPw({ current: '', new: '', confirm: '' });
      showMsg('ok', 'Password changed ✓');
    } catch (err) { showMsg('err', err.message); }
    setBusy(false);
  }
}

function GalleryEditor({ form, setForm, busy, onCancel, onSave }) {
  const pickFile = async e => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const file = await readFileAsBase64(f);
    setForm(prev => ({ ...prev, file }));
    e.target.value = '';
  };

  const previewSrc = form.file
    ? `data:${mimeFromExt(form.file.ext)};base64,${form.file.data}`
    : (form.uploadedSrc || null);

  return (
    <div className="adm-editor">
      <h3 className="adm-editor-title">{form.uploadedSrc || form.file ? 'Edit Photo Details' : 'Add New Photo'}</h3>

      <div className="adm-editor-row">
        <div className="adm-editor-media">
          {previewSrc ? (
            <img src={previewSrc} alt="Preview" className="adm-editor-preview" />
          ) : (
            <div className="adm-editor-drop">
              <span className="adm-editor-drop-icon">📷</span>
              <span>Choose a photo</span>
            </div>
          )}
          <label className="adm-btn adm-btn-outline adm-upload-label">
            {form.file ? 'Change Photo' : 'Choose Photo'}
            <input type="file" accept="image/*" disabled={busy} onChange={pickFile} />
          </label>
        </div>

        <div className="adm-editor-fields">
          <label className="adm-field">
            <span>Category</span>
            <select className="adm-input" value={form.cat} onChange={e => setForm(p => ({ ...p, cat: e.target.value }))}>
              {CATS.map(c => <option key={c} value={c}>{CAT_LABELS[c]}</option>)}
            </select>
          </label>

          <label className="adm-field">
            <span>Title — English <em>(زبان انگریزی)</em></span>
            <input className="adm-input" value={form.enTitle} onChange={e => setForm(p => ({ ...p, enTitle: e.target.value }))} placeholder="e.g. Meal Time" />
          </label>

          <label className="adm-field">
            <span>Title — Urdu <em>(اردو)</em></span>
            <input className="adm-input" dir="rtl" value={form.urTitle} onChange={e => setForm(p => ({ ...p, urTitle: e.target.value }))} placeholder="کھانے کا وقت" />
          </label>

          <label className="adm-field">
            <span>Description — English</span>
            <textarea className="adm-input adm-textarea" rows={2} value={form.enDetail} onChange={e => setForm(p => ({ ...p, enDetail: e.target.value }))} placeholder="Short description shown under the photo" />
          </label>

          <label className="adm-field">
            <span>Description — Urdu <em>(اردو)</em></span>
            <textarea className="adm-input adm-textarea" dir="rtl" rows={2} value={form.urDetail} onChange={e => setForm(p => ({ ...p, urDetail: e.target.value }))} placeholder="تصویر کے نیچے مختصر تفصیل" />
          </label>

          <label className="adm-check">
            <input type="checkbox" checked={form.span} onChange={e => setForm(p => ({ ...p, span: e.target.checked }))} />
            <span>Large card (use for important photos)</span>
          </label>
        </div>
      </div>

      <div className="adm-editor-actions">
        <button className="adm-btn adm-btn-primary" disabled={busy} onClick={onSave}>{busy ? 'Saving…' : 'Save Photo'}</button>
        <button className="adm-btn adm-btn-ghost" disabled={busy} onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

function TeamEditor({ team, setTeam, busy, api, onSave }) {
  const officials = team.officials || [];
  const committees = team.committees || [];

  const patchOfficial = (i, patch) => {
    setTeam(s => ({
      ...s,
      officials: s.officials.map((o, idx) => (idx === i ? { ...o, ...patch } : o)),
    }));
  };

  const moveOfficial = (i, dir) => {
    setTeam(s => {
      const arr = [...s.officials];
      const j = i + dir;
      if (j < 0 || j >= arr.length) return s;
      [arr[i], arr[j]] = [arr[j], arr[i]];
      return { ...s, officials: arr };
    });
  };

  const addOfficial = () => {
    setTeam(s => ({
      ...s,
      officials: [...s.officials, { id: `member-${Date.now()}`, roleKey: 'counselor', name: '', phone: '', photo: '' }],
    }));
  };

  const removeOfficial = i => {
    setTeam(s => ({ ...s, officials: s.officials.filter((_, idx) => idx !== i) }));
  };

  const pickOfficialPhoto = async (i, e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const file = await readFileAsBase64(f);
    const member = officials[i];
    try {
      const up = await api('/api/admin/upload', {
        folder: 'team',
        filename: `${member.id}-${Date.now()}.${file.ext}`,
        ext: file.ext,
        data: file.data,
      }, 'POST');
      patchOfficial(i, { photo: up.src });
    } catch (err) { alert(err.message); }
    e.target.value = '';
  };

  const patchCommittee = (ci, patch) => {
    setTeam(s => ({
      ...s,
      committees: s.committees.map((c, idx) => (idx === ci ? { ...c, ...patch } : c)),
    }));
  };

  const patchMember = (ci, mi, patch) => {
    setTeam(s => ({
      ...s,
      committees: s.committees.map((c, idx) => {
        if (idx !== ci) return c;
        return { ...c, members: c.members.map((m, midx) => (midx === mi ? { ...m, ...patch } : m)) };
      }),
    }));
  };

  const addMember = ci => {
    setTeam(s => ({
      ...s,
      committees: s.committees.map((c, idx) =>
        idx === ci ? { ...c, members: [...c.members, { id: `cm-${Date.now()}`, name: '', phone: '' }] } : c
      ),
    }));
  };

  const removeMember = (ci, mi) => {
    setTeam(s => ({
      ...s,
      committees: s.committees.map((c, idx) =>
        idx === ci ? { ...c, members: c.members.filter((_, midx) => midx !== mi) } : c
      ),
    }));
  };

  return (
    <div className="adm-team">
      <div className="adm-toolbar">
        <div>
          <h2 className="adm-section-title">Team Members</h2>
          <p className="adm-sub">Edit names, phone numbers, roles and photos — changes appear on the site after saving.</p>
        </div>
        <button className="adm-btn adm-btn-primary" disabled={busy} onClick={onSave}>{busy ? 'Saving…' : 'Save Team'}</button>
      </div>

      <h3 className="adm-team-heading">Office Bearers</h3>
      <div className="adm-team-list">
        {officials.length === 0 && <p className="adm-empty">No office bearers yet.</p>}
        {officials.map((o, i) => (
          <div className="adm-member" key={o.id || i}>
            <div className="adm-member-photo">
              {o.photo ? (
                <img src={o.photo} alt={o.name || 'member'} onError={e => { e.currentTarget.style.opacity = '0.2'; }} />
              ) : (
                <span className="adm-member-placeholder">{o.name ? o.name.charAt(0).toUpperCase() : '📷'}</span>
              )}
              <label className="adm-btn adm-btn-outline adm-upload-label adm-member-upload">
                Photo
                <input type="file" accept="image/*" disabled={busy} onChange={e => pickOfficialPhoto(i, e)} />
              </label>
            </div>
            <div className="adm-member-fields">
              <input className="adm-input" placeholder="Full name" value={o.name} onChange={e => patchOfficial(i, { name: e.target.value })} />
              <input className="adm-input" placeholder="Phone e.g. 0300 1234567" value={o.phone} onChange={e => patchOfficial(i, { phone: e.target.value })} />
              <select className="adm-input" value={o.roleKey} onChange={e => patchOfficial(i, { roleKey: e.target.value })}>
                {ROLE_OPTIONS.map(r => <option key={r.key} value={r.key}>{r.label}</option>)}
              </select>
            </div>
            <div className="adm-member-actions">
              <button className="adm-icon-btn" title="Move up" disabled={i === 0} onClick={() => moveOfficial(i, -1)}>↑</button>
              <button className="adm-icon-btn" title="Move down" disabled={i === officials.length - 1} onClick={() => moveOfficial(i, 1)}>↓</button>
              <button className="adm-icon-btn adm-icon-danger" title="Remove" onClick={() => removeOfficial(i)}>✕</button>
            </div>
          </div>
        ))}
      </div>
      <button className="adm-btn adm-btn-outline" disabled={busy} onClick={addOfficial}>+ Add Office Bearer</button>

      <h3 className="adm-team-heading">Committees</h3>
      <div className="adm-team-list">
        {committees.map((c, ci) => (
          <div className="adm-committee" key={ci}>
            <div className="adm-committee-head">
              <select className="adm-input" value={c.nameKey} onChange={e => patchCommittee(ci, { nameKey: e.target.value })}>
                {COMMITTEE_OPTIONS.map(r => <option key={r.key} value={r.key}>{r.label}</option>)}
              </select>
              <button className="adm-icon-btn adm-icon-danger" title="Remove committee" onClick={() =>
                setTeam(s => ({ ...s, committees: s.committees.filter((_, idx) => idx !== ci) }))
              }>✕</button>
            </div>
            {c.members.map((m, mi) => (
              <div className="adm-member adm-member-committee" key={m.id || mi}>
                <div className="adm-member-fields">
                  <input className="adm-input" placeholder="Full name" value={m.name} onChange={e => patchMember(ci, mi, { name: e.target.value })} />
                  <input className="adm-input" placeholder="Phone" value={m.phone} onChange={e => patchMember(ci, mi, { phone: e.target.value })} />
                </div>
                <button className="adm-icon-btn adm-icon-danger" title="Remove member" onClick={() => removeMember(ci, mi)}>✕</button>
              </div>
            ))}
            <button className="adm-btn adm-btn-ghost" disabled={busy} onClick={() => addMember(ci)}>+ Add Member</button>
          </div>
        ))}
      </div>
      <button
        className="adm-btn adm-btn-outline"
        disabled={busy}
        onClick={() => setTeam(s => ({ ...s, committees: [...s.committees, { nameKey: 'education', members: [] }] }))}
      >
        + Add Committee
      </button>

      <div className="adm-team-save">
        <button className="adm-btn adm-btn-primary" disabled={busy} onClick={onSave}>{busy ? 'Saving…' : 'Save Team'}</button>
      </div>
    </div>
  );
}

/* ============================================================
   CONTENT EDITOR — Full control over website text/data
   ============================================================ */
function ContentEditor({ content, setContent, busy, onSave }) {
  const patch = (path, value) => {
    setContent(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      const keys = path.split('.');
      let obj = next;
      for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]];
      obj[keys[keys.length - 1]] = value;
      return next;
    });
  };

  const patchMobile = (i, field, value) => {
    setContent(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      next.donate.mobilePay[i][field] = value;
      return next;
    });
  };

  const addMobilePay = () => {
    setContent(prev => ({
      ...prev,
      donate: {
        ...prev.donate,
        mobilePay: [...prev.donate.mobilePay, { label: 'JazzCash', number: '', name: '' }],
      },
    }));
  };

  const removeMobilePay = i => {
    setContent(prev => ({
      ...prev,
      donate: {
        ...prev.donate,
        mobilePay: prev.donate.mobilePay.filter((_, idx) => idx !== i),
      },
    }));
  };

  return (
    <div className="adm-content-editor">
      <div className="adm-toolbar">
        <div>
          <h2 className="adm-section-title">✏️ Website Content Editor</h2>
          <p className="adm-sub">Edit stats, bank details, phone numbers &amp; contact info. Changes appear on the website after saving.</p>
        </div>
        <button className="adm-btn adm-btn-primary" disabled={busy} onClick={onSave}>
          {busy ? 'Saving…' : '💾 Save All Changes'}
        </button>
      </div>

      {/* ── STATS ── */}
      <div className="adm-content-section">
        <h3 className="adm-content-section-title">📊 Hero Stats</h3>
        <div className="adm-content-grid">
          <label className="adm-field">
            <span>Number of Children 👧</span>
            <input className="adm-input" type="number" min="1"
              value={content.stats.children}
              onChange={e => patch('stats.children', Number(e.target.value))} />
          </label>
          <label className="adm-field">
            <span>Years Active ⏳</span>
            <input className="adm-input" type="number" min="1"
              value={content.stats.yearsActive}
              onChange={e => patch('stats.yearsActive', Number(e.target.value))} />
          </label>
          <label className="adm-field">
            <span>Founded Year 📅</span>
            <input className="adm-input" type="number" min="2000"
              value={content.stats.foundedYear}
              onChange={e => patch('stats.foundedYear', Number(e.target.value))} />
          </label>
        </div>
      </div>

      {/* ── BANK DETAILS ── */}
      <div className="adm-content-section">
        <h3 className="adm-content-section-title">🏦 Bank Details (Donate Section)</h3>
        <div className="adm-content-grid">
          <label className="adm-field">
            <span>Bank Name</span>
            <input className="adm-input" value={content.donate.bank.bankName}
              onChange={e => patch('donate.bank.bankName', e.target.value)} />
          </label>
          <label className="adm-field">
            <span>Account Title</span>
            <input className="adm-input" value={content.donate.bank.accountTitle}
              onChange={e => patch('donate.bank.accountTitle', e.target.value)} />
          </label>
          <label className="adm-field" style={{ gridColumn: '1/-1' }}>
            <span>IBAN Number</span>
            <input className="adm-input adm-input-mono" value={content.donate.bank.iban}
              onChange={e => patch('donate.bank.iban', e.target.value)} />
          </label>
        </div>
      </div>

      {/* ── MOBILE PAY ── */}
      <div className="adm-content-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 className="adm-content-section-title" style={{ marginBottom: 0 }}>📱 Mobile Pay Numbers</h3>
          <button className="adm-btn adm-btn-outline" onClick={addMobilePay}>+ Add Number</button>
        </div>
        {content.donate.mobilePay.map((entry, i) => (
          <div className="adm-mobile-pay-row" key={i}>
            <select className="adm-input adm-select-sm" value={entry.label}
              onChange={e => patchMobile(i, 'label', e.target.value)}>
              <option>JazzCash</option>
              <option>EasyPaisa</option>
              <option>Bank Transfer</option>
              <option>Other</option>
            </select>
            <input className="adm-input" placeholder="Name (e.g. Sayed Ijaz)" value={entry.name}
              onChange={e => patchMobile(i, 'name', e.target.value)} />
            <input className="adm-input adm-input-mono" placeholder="Number e.g. 0307 5905907" value={entry.number}
              onChange={e => patchMobile(i, 'number', e.target.value)} />
            <button className="adm-icon-btn adm-icon-danger" title="Remove" onClick={() => removeMobilePay(i)}>✕</button>
          </div>
        ))}
      </div>

      {/* ── CONTACT INFO ── */}
      <div className="adm-content-section">
        <h3 className="adm-content-section-title">📞 Contact Information</h3>
        <div className="adm-content-grid">
          <label className="adm-field">
            <span>WhatsApp Number (with country code, no +)</span>
            <input className="adm-input adm-input-mono" value={content.contact.whatsapp}
              onChange={e => patch('contact.whatsapp', e.target.value)} />
          </label>
          <label className="adm-field">
            <span>Display Phone Number</span>
            <input className="adm-input" value={content.contact.phone}
              onChange={e => patch('contact.phone', e.target.value)} />
          </label>
          <label className="adm-field">
            <span>Email Address</span>
            <input className="adm-input" type="email" value={content.contact.email}
              onChange={e => patch('contact.email', e.target.value)} />
          </label>
          <label className="adm-field">
            <span>Physical Address</span>
            <input className="adm-input" value={content.contact.address}
              onChange={e => patch('contact.address', e.target.value)} />
          </label>
        </div>
      </div>

      {/* ── SOCIAL LINKS ── */}
      <div className="adm-content-section">
        <h3 className="adm-content-section-title">🔗 Social Media Links</h3>
        <div className="adm-content-grid">
          <label className="adm-field">
            <span>📘 Facebook URL</span>
            <input className="adm-input" value={content.footer.facebook}
              onChange={e => patch('footer.facebook', e.target.value)} />
          </label>
          <label className="adm-field">
            <span>💬 WhatsApp URL</span>
            <input className="adm-input" value={content.footer.whatsapp}
              onChange={e => patch('footer.whatsapp', e.target.value)} />
          </label>
          <label className="adm-field">
            <span>▶️ YouTube URL</span>
            <input className="adm-input" value={content.footer.youtube}
              onChange={e => patch('footer.youtube', e.target.value)} />
          </label>
          <label className="adm-field">
            <span>📸 Instagram URL</span>
            <input className="adm-input" value={content.footer.instagram}
              onChange={e => patch('footer.instagram', e.target.value)} />
          </label>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: 16 }}>
        <button className="adm-btn adm-btn-primary" style={{ padding: '14px 48px', fontSize: '1rem' }} disabled={busy} onClick={onSave}>
          {busy ? 'Saving…' : '💾 Save All Changes'}
        </button>
      </div>
    </div>
  );
}
