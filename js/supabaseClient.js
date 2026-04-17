// ===== SUPABASE CLIENT =====
// Credentials — from Supabase dashboard → Settings → API
const SUPA_URL = 'https://czwqaobdonovvdpfgkjd.supabase.co';
const SUPA_KEY = 'sb_publishable_1mG5_Wo2FmOBFiIM7kKJCw_S1RQl6xO';

let supabase = null;
let supaRealtimeCh = null;
let supaEnabled = false;
let currentUserId = null;

// Initialize Supabase client (called from main.js bootstrap after CDN loads)
function initSupabase(url, key) {
  if (!url || !key) { _supaErr('URL atau Key kosong'); return false; }
  if (!window.supabase) { _supaErr('CDN Supabase gagal dimuat'); return false; }
  try {
    supabase = window.supabase.createClient(url, key);
    supaEnabled = true;
    return true;
  } catch(e) { _supaErr('createClient error: ' + e.message); return false; }
}
function _supaErr(msg) {
  console.error('[supa]', msg);
  // Show on screen so we don't need DevTools
  const el = document.getElementById('auth-err');
  if (el) { el.style.color = 'var(--re)'; el.style.background = 'var(--reb)'; el.textContent = '❌ ' + msg; el.style.display = 'block'; }
}

// --- Base CRUD helpers ---
// All tables use composite unique key (user_id, id) — see SQL migration
async function sbUpsert(table, data, onConflict = 'user_id,id') {
  if (!supaEnabled || !supabase) return;
  const { error } = await supabase.from(table).upsert(data, { onConflict });
  if (error) console.error(`[supa] upsert ${table}:`, error.message);
}
async function sbDelete(table, id) {
  if (!supaEnabled || !supabase) return;
  const { error } = await supabase.from(table).delete().eq('id', id).eq('user_id', currentUserId);
  if (error) console.error(`[supa] delete ${table}:`, error.message);
}
async function sbFetch(table) {
  if (!supaEnabled || !supabase) return null;
  // RLS automatically filters rows to only the current user's data
  const { data, error } = await supabase.from(table).select('*');
  if (error) { console.error(`[supa] fetch ${table}:`, error.message); return null; }
  return data;
}

// --- Email / Password Auth ---
// currentAuthMode is toggled by authTab() in the UI
let currentAuthMode = 'signin';

function authTab(mode) {
  currentAuthMode = mode;
  const isSignup = mode === 'signup';
  const si = g('tab-signin'), su = g('tab-signup'), btn = g('auth-btn');
  if (si) { si.style.background = isSignup ? 'transparent' : 'var(--ca)'; si.style.color = isSignup ? 'var(--t2)' : 'var(--t1)'; si.style.boxShadow = isSignup ? 'none' : 'var(--sh)'; si.style.fontWeight = isSignup ? '600' : '700'; }
  if (su) { su.style.background = isSignup ? 'var(--ca)' : 'transparent'; su.style.color = isSignup ? 'var(--t1)' : 'var(--t2)'; su.style.boxShadow = isSignup ? 'var(--sh)' : 'none'; su.style.fontWeight = isSignup ? '700' : '600'; }
  if (btn) btn.textContent = isSignup ? 'Buat Akun' : 'Masuk';
  const err = g('auth-err'); if (err) err.style.display = 'none';
}

async function doEmailAuth() {
  if (!supaEnabled || !supabase) { toast('⚠️ Supabase belum dikonfigurasi'); return; }
  const email = (g('auth-email')?.value || '').trim();
  const pwd = g('auth-pwd')?.value || '';
  const errEl = g('auth-err');
  if (!email || !pwd) { if (errEl) { errEl.textContent = 'Email dan password wajib diisi.'; errEl.style.display = 'block'; } return; }
  if (errEl) errEl.style.display = 'none';
  const btn = g('auth-btn'); if (btn) { btn.disabled = true; btn.textContent = '...'; }

  let error;
  if (currentAuthMode === 'signup') {
    ({ error } = await supabase.auth.signUp({ email, password: pwd }));
    if (!error) { if (errEl) { errEl.style.color = 'var(--p)'; errEl.textContent = '✅ Akun dibuat! Cek email untuk verifikasi, lalu masuk.'; errEl.style.display = 'block'; } }
  } else {
    ({ error } = await supabase.auth.signInWithPassword({ email, password: pwd }));
  }

  if (btn) { btn.disabled = false; btn.textContent = currentAuthMode === 'signup' ? 'Buat Akun' : 'Masuk'; }
  if (error) { if (errEl) { errEl.style.color = 'var(--re)'; errEl.textContent = error.message; errEl.style.display = 'block'; } }
  // On success, onAuthStateChange in main.js handles the transition
}

async function authLogout() {
  if (!supaEnabled || !supabase) return;
  await supabase.auth.signOut();
  currentUserId = null;
  orders = []; customers = {}; kasLog = []; expenses = [];
  if (g('auth-email')) g('auth-email').value = '';
  if (g('auth-pwd')) g('auth-pwd').value = '';
  authTab('signin');
  showScr('scr-google');
  toast('👋 Berhasil keluar');
}

// --- Account card (shown in Settings) ---
function renderSupaCard() {
  const card = g('supa-card');
  if (!card) return;
  if (!supaEnabled || !supabase) { card.innerHTML = ''; return; }
  supabase.auth.getUser().then(({ data: { user } }) => {
    if (!user) { card.innerHTML = ''; return; }
    const email = user.email || '';
    const initial = email[0]?.toUpperCase() || '?';
    card.innerHTML = `
      <div class="ct">☁️ Akun</div>
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px;padding:12px;background:var(--pl);border-radius:10px">
        <div style="width:42px;height:42px;border-radius:50%;background:var(--p);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:18px;flex-shrink:0">${initial}</div>
        <div style="flex:1;min-width:0">
          <div style="font-size:13px;color:var(--t2)">Login sebagai</div>
          <div style="font-weight:700;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${email}</div>
        </div>
        <span style="width:9px;height:9px;border-radius:50%;background:var(--p);flex-shrink:0" title="Terhubung"></span>
      </div>
      <button class="btn bre bpill bfull" onclick="authLogout()">Keluar</button>`;
  });
}
