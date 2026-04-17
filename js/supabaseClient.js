// ===== SUPABASE CLIENT =====
// Credentials — from Supabase dashboard → Settings → API
const SUPA_URL = 'https://czwqaobdonovvdpfgkjd.supabase.co';
const SUPA_KEY = 'sb_publishable_1mG5_Wo2FmOBFiIM7kKJCw_S1RQl6xO';

let supabase = null;
let supaRealtimeCh = null;
let supaEnabled = false;
let currentUserId = null;

// Initialize Supabase client — createClient is passed in from dynamic import in main.js
function initSupabase(createClientFn) {
  try {
    supabase = createClientFn(SUPA_URL, SUPA_KEY);
    supaEnabled = true;
    return true;
  } catch(e) { _supaErr('Error inisialisasi: ' + e.message); return false; }
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
  if (error) {
    console.error(`[supa] upsert ${table}:`, error.message);
    toast(`⚠️ Gagal simpan ke cloud (${table}): ${error.message}`);
  }
}
async function sbDelete(table, id) {
  if (!supaEnabled || !supabase) return;
  const { error } = await supabase.from(table).delete().eq('id', id).eq('user_id', currentUserId);
  if (error) console.error(`[supa] delete ${table}:`, error.message);
}
async function sbFetch(table) {
  if (!supaEnabled || !supabase) return null;
  const { data, error } = await supabase.from(table).select('*');
  if (error) {
    console.error(`[supa] fetch ${table}:`, error.message);
    toast(`⚠️ Gagal muat tabel "${table}": ${error.message}`);
    return null;
  }
  return data;
}

// --- Email / Password Auth ---
// currentAuthMode is toggled by authTab() in the UI
let currentAuthMode = 'signin';
let currentUserEmail = null;

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
  resetAuthForm();
  authTab('signin');
  showScr('scr-google');
  toast('👋 Berhasil keluar');
}

// --- Returning user UI (shown when session is restored on page load) ---
function showReturningUser(email) {
  // Hide the normal sign-in/sign-up form, show a "continue as" prompt
  const tabs = g('tab-signin')?.parentElement;
  const emailRow = g('auth-email')?.parentElement;
  const pwdRow = g('auth-pwd')?.parentElement;
  const errEl = g('auth-err');
  const btn = g('auth-btn');
  if (tabs) tabs.style.display = 'none';
  if (emailRow) emailRow.style.display = 'none';
  if (pwdRow) pwdRow.style.display = 'none';
  if (errEl) {
    errEl.style.color = 'var(--p)'; errEl.style.background = 'var(--pl)';
    errEl.innerHTML = '✅ Masuk sebagai <strong>' + email + '</strong><br><a style="color:var(--t2);font-size:12px;cursor:pointer" onclick="authLogout()">Bukan kamu? Ganti akun</a>';
    errEl.style.display = 'block';
  }
  if (btn) { btn.textContent = 'Lanjutkan →'; btn.onclick = () => showScr('scr-login'); }
}
function resetAuthForm() {
  const tabs = g('tab-signin')?.parentElement;
  const emailRow = g('auth-email')?.parentElement;
  const pwdRow = g('auth-pwd')?.parentElement;
  const errEl = g('auth-err');
  const btn = g('auth-btn');
  if (tabs) tabs.style.display = '';
  if (emailRow) emailRow.style.display = '';
  if (pwdRow) pwdRow.style.display = '';
  if (errEl) errEl.style.display = 'none';
  if (btn) { btn.textContent = 'Masuk'; btn.onclick = doEmailAuth; }
}

// --- Forgot account password ---
function showForgotPwdView() {
  const tabs = g('tab-signin')?.parentElement;
  const emailRow = g('auth-email')?.parentElement;
  const pwdRow = g('auth-pwd')?.parentElement;
  const btn = g('auth-btn'), errEl = g('auth-err');
  if (tabs) tabs.style.display = 'none';
  if (emailRow) emailRow.style.display = 'none';
  if (pwdRow) pwdRow.style.display = 'none';
  if (btn) btn.style.display = 'none';
  if (errEl) errEl.style.display = 'none';
  const fv = g('forgot-pwd-view'); if (fv) fv.style.display = 'block';
  const fe = g('forgot-email'); if (fe) { fe.value = g('auth-email')?.value || ''; fe.focus(); }
}
function hideForgotPwdView() {
  const tabs = g('tab-signin')?.parentElement;
  const emailRow = g('auth-email')?.parentElement;
  const pwdRow = g('auth-pwd')?.parentElement;
  const btn = g('auth-btn');
  if (tabs) tabs.style.display = '';
  if (emailRow) emailRow.style.display = '';
  if (pwdRow) pwdRow.style.display = '';
  if (btn) { btn.style.display = ''; }
  const fv = g('forgot-pwd-view'); if (fv) fv.style.display = 'none';
  const fe = g('forgot-err'); if (fe) fe.style.display = 'none';
}
async function doForgotAccountPwd() {
  if (!supaEnabled || !supabase) { toast('⚠️ Supabase belum aktif'); return; }
  const email = (g('forgot-email')?.value || '').trim();
  const errEl = g('forgot-err'), btn = g('forgot-btn');
  if (!email) { if (errEl) { errEl.textContent = 'Masukkan email kamu.'; errEl.style.color='var(--re)'; errEl.style.background='var(--reb)'; errEl.style.display='block'; } return; }
  if (btn) { btn.disabled = true; btn.textContent = '...'; }
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + '/' });
  if (btn) { btn.disabled = false; btn.textContent = 'Kirim Link Reset'; }
  if (error) {
    if (errEl) { errEl.textContent = error.message; errEl.style.color='var(--re)'; errEl.style.background='var(--reb)'; errEl.style.display='block'; }
  } else {
    if (errEl) { errEl.textContent = '✅ Link reset dikirim ke ' + email + '. Cek inbox (dan folder spam).'; errEl.style.color='var(--p)'; errEl.style.background='var(--pl)'; errEl.style.display='block'; }
  }
}

// --- Reset owner password (gated by Supabase account password re-auth) ---
function showResetOwnerPwdModal() {
  if (!supaEnabled || !currentUserEmail) { toast('⚠️ Harus login akun cloud dulu'); return; }
  const step1 = g('rop-step1'), step2 = g('rop-step2');
  if (step1) step1.style.display = 'block';
  if (step2) step2.style.display = 'none';
  const verifyBtn = g('rop-verify-btn'), setBtn = g('rop-set-btn');
  if (verifyBtn) verifyBtn.style.display = '';
  if (setBtn) setBtn.style.display = 'none';
  ['rop-err','rop-err2'].forEach(id => { const el = g(id); if (el) el.style.display='none'; });
  ['rop-supa-pwd','rop-new-pwd','rop-confirm-pwd'].forEach(id => { const el = g(id); if (el) el.value=''; });
  g('m-reset-owner-pwd').className = 'mbg on';
  setTimeout(() => { g('rop-supa-pwd')?.focus(); }, 100);
}
async function verifySupaPwdForOwnerReset() {
  if (!supaEnabled || !supabase || !currentUserEmail) return;
  const pwd = g('rop-supa-pwd')?.value || '';
  const errEl = g('rop-err'), btn = g('rop-verify-btn');
  if (!pwd) { if (errEl) { errEl.textContent = '⚠️ Masukkan password akun cloud.'; errEl.style.display='block'; } return; }
  if (btn) { btn.disabled = true; btn.textContent = '...'; }
  const { error } = await supabase.auth.signInWithPassword({ email: currentUserEmail, password: pwd });
  if (btn) { btn.disabled = false; btn.textContent = 'Verifikasi'; }
  if (error) {
    if (errEl) { errEl.textContent = '⚠️ Password salah. Coba lagi.'; errEl.style.display='block'; }
  } else {
    const step1 = g('rop-step1'), step2 = g('rop-step2');
    if (step1) step1.style.display = 'none';
    if (step2) step2.style.display = 'block';
    g('rop-verify-btn').style.display = 'none';
    g('rop-set-btn').style.display = '';
    g('rop-new-pwd')?.focus();
  }
}
function doSetNewOwnerPwd() {
  const newPwd = g('rop-new-pwd')?.value || '';
  const confirmPwd = g('rop-confirm-pwd')?.value || '';
  const errEl = g('rop-err2');
  if (newPwd.length < 4) { if (errEl) { errEl.textContent = 'Password minimal 4 karakter.'; errEl.style.display='block'; } return; }
  if (newPwd !== confirmPwd) { if (errEl) { errEl.textContent = 'Password tidak cocok.'; errEl.style.display='block'; } return; }
  ownerPwd = newPwd;
  syncSettings();
  cm('m-reset-owner-pwd');
  toast('✅ Password owner berhasil diubah!');
}

// --- Set new account password (called after user clicks reset link in email) ---
async function doSetNewAccountPwd() {
  if (!supaEnabled || !supabase) return;
  const pwd = g('nap-pwd')?.value || '';
  const confirm = g('nap-confirm')?.value || '';
  const errEl = g('nap-err');
  if (pwd.length < 6) { if (errEl) { errEl.textContent = 'Password minimal 6 karakter.'; errEl.style.display='block'; } return; }
  if (pwd !== confirm) { if (errEl) { errEl.textContent = 'Password tidak cocok.'; errEl.style.display='block'; } return; }
  const { error } = await supabase.auth.updateUser({ password: pwd });
  if (error) {
    if (errEl) { errEl.textContent = error.message; errEl.style.display='block'; }
  } else {
    cm('m-new-account-pwd');
    toast('✅ Password akun berhasil diubah!');
    showScr('scr-login');
  }
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
