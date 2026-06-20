// ============================================================
//  MetaForge – Auth System + EmailJS
//  EmailJS Config: fill in YOUR details from emailjs.com
// ============================================================

// ── EmailJS Configuration ─────────────────────────────────
// Sign up free at https://emailjs.com
// 1. Create an Email Service (Gmail recommended)
// 2. Create an Email Template with variables: {{otp}}, {{user_name}}, {{to_email}}
// 3. Copy your Public Key, Service ID, and Template ID below
const EMAILJS_CONFIG = {
  publicKey:  'YOUR_EMAILJS_PUBLIC_KEY',   // e.g. 'abc123xyz'
  serviceId:  'YOUR_SERVICE_ID',            // e.g. 'service_xxxxxx'
  otpTemplateId: 'YOUR_OTP_TEMPLATE_ID',   // e.g. 'template_xxxxxx'
  tagsTemplateId: 'YOUR_TAGS_TEMPLATE_ID', // e.g. 'template_yyyyyy'
};

// ── OTP Store (in-memory + localStorage backup) ───────────
const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes

// ── User Storage Helpers ──────────────────────────────────
function getUsers() {
  return JSON.parse(localStorage.getItem('mf_users') || '{}');
}
function saveUsers(users) {
  localStorage.setItem('mf_users', JSON.stringify(users));
}
function getCurrentUser() {
  const key = sessionStorage.getItem('mf_session');
  if (!key) return null;
  const users = getUsers();
  return users[key] || null;
}
function setSession(email) {
  sessionStorage.setItem('mf_session', email);
}
function clearSession() {
  sessionStorage.removeItem('mf_session');
}

// ── OTP Helpers ───────────────────────────────────────────
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
function storeOTP(email, otp) {
  localStorage.setItem('mf_otp', JSON.stringify({
    email,
    otp,
    expiry: Date.now() + OTP_EXPIRY_MS
  }));
}
function verifyOTP(email, otp) {
  const data = JSON.parse(localStorage.getItem('mf_otp') || 'null');
  if (!data) return { ok: false, msg: 'No OTP found. Please request a new one.' };
  if (data.email !== email) return { ok: false, msg: 'OTP was sent to a different email.' };
  if (Date.now() > data.expiry) return { ok: false, msg: 'OTP expired. Please request a new one.' };
  if (data.otp !== otp.trim()) return { ok: false, msg: 'Incorrect OTP. Try again.' };
  return { ok: true };
}
function clearOTP() {
  localStorage.removeItem('mf_otp');
}

// ── UI Helpers ────────────────────────────────────────────
function showPanel(id) {
  ['panel-signin', 'panel-signup', 'panel-forgot', 'panel-success'].forEach(p => {
    const el = document.getElementById(p);
    if (el) el.hidden = (p !== id);
  });
}
function showAuthModal(panel = 'panel-signin') {
  const modal = document.getElementById('auth-modal');
  if (modal) { modal.hidden = false; showPanel(panel); }
}
function hideAuthModal() {
  const modal = document.getElementById('auth-modal');
  if (modal) modal.hidden = true;
  clearErrors();
}
function setError(id, msg) {
  const el = document.getElementById(id);
  if (el) { el.textContent = msg; el.style.display = msg ? 'block' : 'none'; }
}
function clearErrors() {
  ['si-error', 'su-error', 'fp-error', 'fp-otp-error', 'email-error'].forEach(id => setError(id, ''));
}
function setButtonLoading(btn, loading) {
  if (!btn) return;
  btn.disabled = loading;
  btn.style.opacity = loading ? '0.7' : '1';
  if (loading) btn.dataset.origText = btn.textContent;
  btn.textContent = loading ? 'Please wait...' : (btn.dataset.origText || btn.textContent);
}

function updateHeaderUI() {
  const user = getCurrentUser();
  const authBtns = document.getElementById('auth-buttons');
  const userMenu = document.getElementById('user-menu');
  const userNameDisplay = document.getElementById('user-name-display');
  const userAvatar = document.getElementById('user-avatar');

  if (user) {
    if (authBtns) authBtns.hidden = true;
    if (userMenu) userMenu.hidden = false;
    const firstName = (user.name || user.email).split(' ')[0];
    if (userNameDisplay) userNameDisplay.textContent = firstName;
    if (userAvatar) userAvatar.textContent = (user.name || user.email)[0].toUpperCase();
  } else {
    if (authBtns) authBtns.hidden = false;
    if (userMenu) userMenu.hidden = true;
  }
}

function showToast(msg) {
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toast-msg');
  if (!toast || !toastMsg) return;
  toastMsg.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2800);
}

// ── EmailJS Init ──────────────────────────────────────────
function initEmailJS() {
  if (typeof emailjs !== 'undefined' && EMAILJS_CONFIG.publicKey !== 'YOUR_EMAILJS_PUBLIC_KEY') {
    emailjs.init({ publicKey: EMAILJS_CONFIG.publicKey });
    console.log('✅ EmailJS initialized');
  } else {
    console.warn('⚠️ EmailJS not configured — fill in EMAILJS_CONFIG in auth.js');
  }
}

// ── Send OTP Email ────────────────────────────────────────
async function sendOTPEmail(toEmail, userName, otp) {
  if (EMAILJS_CONFIG.publicKey === 'YOUR_EMAILJS_PUBLIC_KEY') {
    // Demo mode: log OTP to console if EmailJS not configured
    console.log(`🔐 OTP for ${toEmail}: ${otp} (EmailJS not configured — check console)`);
    return { ok: true, demo: true };
  }
  try {
    await emailjs.send(EMAILJS_CONFIG.serviceId, EMAILJS_CONFIG.otpTemplateId, {
      to_email: toEmail,
      user_name: userName || toEmail,
      otp: otp,
    });
    return { ok: true };
  } catch (err) {
    console.error('EmailJS error:', err);
    return { ok: false, msg: 'Failed to send email. Check your EmailJS config.' };
  }
}

// ── Send Meta Tags Email ──────────────────────────────────
async function sendTagsEmail(toEmail, tagsHTML) {
  if (EMAILJS_CONFIG.publicKey === 'YOUR_EMAILJS_PUBLIC_KEY') {
    console.log('📧 Tags email (EmailJS not configured)');
    showToast('⚠️ EmailJS not configured — see console');
    return;
  }
  try {
    await emailjs.send(EMAILJS_CONFIG.serviceId, EMAILJS_CONFIG.tagsTemplateId, {
      to_email: toEmail,
      meta_tags: tagsHTML,
    });
    showToast('📧 Meta tags sent to your inbox!');
    document.getElementById('email-modal').hidden = true;
  } catch (err) {
    console.error('EmailJS send error:', err);
    setError('email-error', 'Failed to send. Check your EmailJS config.');
  }
}

// ── Main Auth Logic ───────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initEmailJS();
  updateHeaderUI();

  // ── Open modal buttons ──
  document.getElementById('open-signin')?.addEventListener('click', () => showAuthModal('panel-signin'));
  document.getElementById('open-signup')?.addEventListener('click', () => showAuthModal('panel-signup'));

  // ── Close modal ──
  document.getElementById('modal-close-btn')?.addEventListener('click', hideAuthModal);
  document.getElementById('auth-modal')?.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) hideAuthModal();
  });

  // ── Panel switchers ──
  document.getElementById('go-signup')?.addEventListener('click', (e) => { e.preventDefault(); showPanel('panel-signup'); clearErrors(); });
  document.getElementById('go-signin')?.addEventListener('click', (e) => { e.preventDefault(); showPanel('panel-signin'); clearErrors(); });
  document.getElementById('go-forgot')?.addEventListener('click', (e) => { e.preventDefault(); showPanel('panel-forgot'); clearErrors(); });
  document.getElementById('back-to-signin')?.addEventListener('click', (e) => { e.preventDefault(); showPanel('panel-signin'); clearErrors(); });
  document.getElementById('success-signin-btn')?.addEventListener('click', () => showPanel('panel-signin'));

  // ── Password visibility toggles ──
  document.querySelectorAll('.pw-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = document.getElementById(btn.dataset.target);
      if (!target) return;
      target.type = target.type === 'password' ? 'text' : 'password';
      btn.textContent = target.type === 'password' ? '👁' : '🙈';
    });
  });

  // ── Sign Up ──
  document.getElementById('signup-btn')?.addEventListener('click', async () => {
    const name = document.getElementById('su-name').value.trim();
    const email = document.getElementById('su-email').value.trim().toLowerCase();
    const password = document.getElementById('su-password').value;
    const confirm = document.getElementById('su-confirm').value;

    if (!name) return setError('su-error', 'Please enter your full name.');
    if (!email || !email.includes('@')) return setError('su-error', 'Please enter a valid email.');
    if (password.length < 6) return setError('su-error', 'Password must be at least 6 characters.');
    if (password !== confirm) return setError('su-error', 'Passwords do not match.');

    const users = getUsers();
    if (users[email]) return setError('su-error', 'An account with this email already exists.');

    users[email] = { name, email, password, createdAt: Date.now() };
    saveUsers(users);
    setSession(email);
    hideAuthModal();
    updateHeaderUI();
    showToast(`🎉 Welcome, ${name.split(' ')[0]}!`);
  });

  // ── Sign In ──
  document.getElementById('signin-btn')?.addEventListener('click', () => {
    const email = document.getElementById('si-email').value.trim().toLowerCase();
    const password = document.getElementById('si-password').value;

    if (!email || !email.includes('@')) return setError('si-error', 'Please enter a valid email.');
    if (!password) return setError('si-error', 'Please enter your password.');

    const users = getUsers();
    const user = users[email];
    if (!user) return setError('si-error', 'No account found with this email.');
    if (user.password !== password) return setError('si-error', 'Incorrect password.');

    setSession(email);
    hideAuthModal();
    updateHeaderUI();
    showToast(`👋 Welcome back, ${user.name.split(' ')[0]}!`);
  });

  // ── Sign Out ──
  document.getElementById('signout-btn')?.addEventListener('click', () => {
    clearSession();
    updateHeaderUI();
    showToast('👋 Signed out. See you soon!');
  });

  // ── Forgot Password — Send OTP ──
  document.getElementById('send-otp-btn')?.addEventListener('click', async () => {
    const email = document.getElementById('fp-email').value.trim().toLowerCase();
    if (!email || !email.includes('@')) return setError('fp-error', 'Please enter a valid email.');

    const users = getUsers();
    if (!users[email]) return setError('fp-error', 'No account found with this email.');

    const btn = document.getElementById('send-otp-btn');
    setButtonLoading(btn, true);

    const otp = generateOTP();
    storeOTP(email, otp);
    const result = await sendOTPEmail(email, users[email].name, otp);

    setButtonLoading(btn, false);

    if (!result.ok) return setError('fp-error', result.msg);

    document.getElementById('forgot-step-1').hidden = true;
    document.getElementById('forgot-step-2').hidden = false;

    if (result.demo) {
      setError('fp-otp-error', `⚠️ Demo mode: OTP is ${otp} (EmailJS not configured yet)`);
    }
  });

  // ── Resend OTP ──
  document.getElementById('resend-otp')?.addEventListener('click', async (e) => {
    e.preventDefault();
    const email = document.getElementById('fp-email').value.trim().toLowerCase();
    const users = getUsers();
    const otp = generateOTP();
    storeOTP(email, otp);
    const result = await sendOTPEmail(email, users[email]?.name, otp);
    if (result.ok) {
      showToast('📧 OTP resent! Check your inbox.');
      if (result.demo) setError('fp-otp-error', `⚠️ Demo OTP: ${otp}`);
    } else {
      setError('fp-otp-error', result.msg);
    }
  });

  // ── Forgot Password — Verify OTP & Reset ──
  document.getElementById('verify-otp-btn')?.addEventListener('click', () => {
    const email = document.getElementById('fp-email').value.trim().toLowerCase();
    const otp = document.getElementById('fp-otp').value.trim();
    const newPw = document.getElementById('fp-new-pw').value;

    if (!otp) return setError('fp-otp-error', 'Please enter the OTP from your email.');
    if (newPw.length < 6) return setError('fp-otp-error', 'New password must be at least 6 characters.');

    const check = verifyOTP(email, otp);
    if (!check.ok) return setError('fp-otp-error', check.msg);

    const users = getUsers();
    users[email].password = newPw;
    saveUsers(users);
    clearOTP();

    document.getElementById('forgot-step-1').hidden = false;
    document.getElementById('forgot-step-2').hidden = true;
    document.getElementById('fp-email').value = '';
    document.getElementById('fp-otp').value = '';
    document.getElementById('fp-new-pw').value = '';

    showPanel('panel-success');
  });

  // ── Email My Tags button ──
  document.getElementById('email-btn')?.addEventListener('click', () => {
    const code = document.getElementById('output-code')?.textContent;
    if (!code || code.includes('Your generated meta tags')) {
      showToast('⚠️ Generate your tags first!');
      return;
    }
    // Pre-fill email from logged-in user
    const user = getCurrentUser();
    if (user) document.getElementById('email-recipient').value = user.email;
    document.getElementById('email-modal').hidden = false;
  });

  document.getElementById('email-modal-close')?.addEventListener('click', () => {
    document.getElementById('email-modal').hidden = true;
  });
  document.getElementById('email-modal')?.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) document.getElementById('email-modal').hidden = true;
  });

  document.getElementById('send-email-btn')?.addEventListener('click', async () => {
    const toEmail = document.getElementById('email-recipient').value.trim();
    if (!toEmail || !toEmail.includes('@')) return setError('email-error', 'Please enter a valid email.');
    const tags = document.getElementById('output-code')?.textContent || '';
    const btn = document.getElementById('send-email-btn');
    setButtonLoading(btn, true);
    await sendTagsEmail(toEmail, tags);
    setButtonLoading(btn, false);
  });

  // ── Enter key support ──
  document.getElementById('si-password')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') document.getElementById('signin-btn')?.click();
  });
  document.getElementById('su-confirm')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') document.getElementById('signup-btn')?.click();
  });
});
