// app.js — shared logic for MFA demo (account.html + login.html)
const DB_KEY = 'mfa_demo_account';

// --- Storage ---
function loadAccount(){
  try { const s = localStorage.getItem(DB_KEY); return s ? JSON.parse(s) : null; } catch(e){ return null; }
}
function saveAccount(acc){ localStorage.setItem(DB_KEY, JSON.stringify(acc)); }
function resetDemo(){ localStorage.removeItem(DB_KEY); location.reload(); }

// --- Random helpers ---
function randDigits(len=6){ return String(Math.floor(Math.random()*Math.pow(10,len))).padStart(len,'0'); }
function randAlphaNum(len=8){
  const chars='ABCDEFGHJKMNPQRSTUVWXYZ23456789', arr=new Uint8Array(len);
  crypto.getRandomValues(arr);
  return Array.from(arr).map(i=>chars[i % chars.length]).join('');
}

// --- Base32 (RFC4648 no padding) ---
const BASE32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
function base32Encode(bytes){
  let bits=0,value=0,out='';
  for(let i=0;i<bytes.length;i++){
    value=(value<<8)|bytes[i]; bits+=8;
    while(bits>=5){ out += BASE32[(value >>> (bits-5)) & 31]; bits-=5; }
  }
  if(bits>0) out += BASE32[(value << (5-bits)) & 31];
  return out;
}
function base32Decode(str){
  const clean = str.replace(/=+$/,'').replace(/[^A-Z2-7]/g,'').toUpperCase();
  let bits=0,value=0, bytes=[];
  for(let i=0;i<clean.length;i++){
    const idx = BASE32.indexOf(clean[i]); value=(value<<5)|idx; bits+=5;
    if(bits>=8){ bytes.push((value >>> (bits-8)) & 0xFF); bits-=8; }
  }
  return new Uint8Array(bytes);
}

// --- TOTP (SubtleCrypto + HMAC-SHA1) ---
async function hotp(keyBytes, counter){
  const key = await crypto.subtle.importKey('raw', keyBytes, {name:'HMAC', hash:'SHA-1'}, false, ['sign']);
  const buf = new ArrayBuffer(8); const dv=new DataView(buf);
  dv.setUint32(4, counter & 0xFFFFFFFF); dv.setUint32(0, Math.floor(counter / 0x100000000));
  const sig = new Uint8Array(await crypto.subtle.sign('HMAC', key, buf));
  const off = sig[sig.length-1] & 0xf;
  const code = ((sig[off] & 0x7f) << 24) | ((sig[off+1] & 0xff) << 16) | ((sig[off+2] & 0xff) << 8) | (sig[off+3] & 0xff);
  return code;
}
async function totpFromSecret(secretBase32, forTime = Date.now(), digits=6, step=30){
  const key = base32Decode(secretBase32);
  const counter = Math.floor(forTime/1000/step);
  const c = await hotp(key, counter);
  return String(c % Math.pow(10,digits)).padStart(digits,'0');
}
async function verifyTotp(secret, code){
  if(!secret) return false;
  const now = Date.now(), step=30;
  for(let k=-1;k<=1;k++){
    const t = now + k*step*1000;
    const c = await totpFromSecret(secret, t);
    if(c === String(code).padStart(6,'0')) return true;
  }
  return false;
}

// --- Utilities for pages ---
function show(el){ if(!el) return; el.classList.remove('hidden'); }
function hide(el){ if(!el) return; el.classList.add('hidden'); }

// Start aligned TOTP updater — updates code on step boundary and provides per-second countdown
// Returns a stop() function
function startAlignedTotpUpdater(secret, codeEl, countdownEl, step=30){
  let boundaryTimer = null; let countdownTimer = null; let stopped = false;
  async function updateCode(){ if(stopped) return; try { if(codeEl) codeEl.textContent = await totpFromSecret(secret); } catch(e){ if(codeEl) codeEl.textContent = '— — — — — —'; } }
  function updateCountdown(){ if(!countdownEl) return; const seconds = step - Math.floor((Date.now()/1000) % step); countdownEl.textContent = String(seconds) + 's'; }
  async function tick(){ if(stopped) return; await updateCode(); updateCountdown(); if(countdownTimer) clearInterval(countdownTimer); countdownTimer = setInterval(updateCountdown, 1000); const msUntilNext = step*1000 - (Date.now() % (step*1000)); boundaryTimer = setTimeout(tick, msUntilNext + 30); }
  tick();
  return function stop(){ stopped = true; if(boundaryTimer){ clearTimeout(boundaryTimer); boundaryTimer = null; } if(countdownTimer){ clearInterval(countdownTimer); countdownTimer = null; } };
} 

// --- Account page wiring ---
function initAccountPage(){
  // DOM refs
  const createPassword = document.getElementById('createPassword');
  const createAccountBtn = document.getElementById('createAccountBtn');
  const resetBtn = document.getElementById('resetBtn');
  const accountStatus = document.getElementById('accountStatus');

  const enrollTotpBtn = document.getElementById('enrollTotpBtn');
  const showTotpSecretBtn = document.getElementById('showTotpSecretBtn');
  const totpBox = document.getElementById('totpBox');
  const totpSecretEl = document.getElementById('totpSecret');
  const otpauthUrlEl = document.getElementById('otpauthUrl');
  const verifyTotpBtn = document.getElementById('verifyTotpBtn');
  const totpVerifyCode = document.getElementById('totpVerifyCode');
  const totpVerifyResult = document.getElementById('totpVerifyResult');
  const totpLiveEl = document.getElementById('totpLive');
  const showCurrentTotpBtn = document.getElementById('showCurrentTotpBtn');

  const smsPhone = document.getElementById('smsPhone');
  const enrollSmsBtn = document.getElementById('enrollSmsBtn');
  const verifySmsBtn = document.getElementById('verifySmsBtn');
  const smsBox = document.getElementById('smsBox');
  const smsSentCodeEl = document.getElementById('smsSentCode');
  const smsCodeInput = document.getElementById('smsCodeInput');
  const smsVerifyResult = document.getElementById('smsVerifyResult');

  const genBackupBtn = document.getElementById('genBackupBtn');
  const showBackupBtn = document.getElementById('showBackupBtn');
  const backupList = document.getElementById('backupList');

  function refreshUI(){
    const acc = loadAccount();
    if(!acc){ accountStatus.textContent = 'No account created'; totpLiveEl && (totpLiveEl.textContent='— — — — — —'); hide(showTotpSecretBtn); hide(totpBox); hide(smsBox); hide(backupList); }
    else{
      accountStatus.textContent = acc.mfa && acc.mfa.enabled ? `MFA: ${acc.mfa.method.toUpperCase()}` : 'MFA: disabled';
      if(acc.mfa && acc.mfa.enabled && acc.mfa.method === 'totp') show(showTotpSecretBtn); else hide(showTotpSecretBtn);
      hide(totpBox); hide(smsBox); hide(backupList);
    }
  }

  createAccountBtn?.addEventListener('click', () => {
    const pwd = createPassword.value.trim();
    if(!pwd || pwd.length < 4){ alert('Use a demo password of at least 4 characters.'); return; }
    saveAccount({ password: pwd, mfa: { enabled:false } });
    refreshUI(); alert('Account created (demo). Now enroll MFA or test login.');
  });

  resetBtn?.addEventListener('click', resetDemo);

  enrollTotpBtn?.addEventListener('click', () => {
    const acc = loadAccount(); if(!acc){ alert('Please create an account first.'); return; }
    const bytes = new Uint8Array(20); crypto.getRandomValues(bytes);
    const secret = base32Encode(bytes);
    acc.mfa = { method:'totp', secret, enabled:false };
    saveAccount(acc);
    totpSecretEl.textContent = secret;
    otpauthUrlEl.textContent = `otpauth://totp/MFADemo:user@local?secret=${secret}&issuer=MFADemo`;
    show(totpBox); show(showTotpSecretBtn);
    totpVerifyResult.textContent = 'Enter the current code to enable.';
    totpVerifyResult.className = 'muted';
  });

  showTotpSecretBtn?.addEventListener('click', ()=> show(totpBox));

  // Show current code and ensure the TOTP box is visible (start aligned updater)
  showCurrentTotpBtn?.addEventListener('click', async () => {
    const acc = loadAccount(); if(!acc || !acc.mfa || !acc.mfa.secret) return;
    show(totpBox);
    // Kick the live updater right away — ensureTotpLiveUpdater will start it on next tick
    const code = await totpFromSecret(acc.mfa.secret);
    totpVerifyResult.textContent = 'Current demo code: ' + code;
    ensureTotpLiveUpdater();
  });

  verifyTotpBtn?.addEventListener('click', async () => {
    const acc = loadAccount(); const code = totpVerifyCode.value.trim();
    if(!acc || !acc.mfa || acc.mfa.method !== 'totp'){ alert('No totp enrollment present.'); return; }
    const ok = await verifyTotp(acc.mfa.secret, code);
    if(ok){ acc.mfa.enabled = true; saveAccount(acc); totpVerifyResult.textContent='TOTP verified — MFA enabled ✅'; totpVerifyResult.className='ok'; }
    else { totpVerifyResult.textContent='Verification failed — try again ❌'; totpVerifyResult.className='err'; }
    refreshUI();
  });

  // Replace earlier naive polling with a boundary-aligned updater that only runs when the TOTP box is visible
  let totpLiveStop = null;
  function ensureTotpLiveUpdater(){
    const acc = loadAccount();
    const countdownEl = document.getElementById('totpCountdown');
    if(acc && acc.mfa && acc.mfa.method === 'totp' && totpBox && !totpBox.classList.contains('hidden')){
      if(!totpLiveStop) totpLiveStop = startAlignedTotpUpdater(acc.mfa.secret, totpLiveEl, countdownEl);
    } else {
      if(totpLiveStop){ totpLiveStop(); totpLiveStop = null; }
      if(totpLiveEl) totpLiveEl.textContent = '— — — — — —';
      if(countdownEl) countdownEl.textContent = '--s';
    }
  }
  // Check every second if UI visibility/state changed (lightweight)
  setInterval(ensureTotpLiveUpdater, 1000);

  enrollSmsBtn?.addEventListener('click', () => {
    const acc = loadAccount(); if(!acc){ alert('Please create an account first.'); return; }
    const phone = smsPhone.value.trim(); if(!phone){ alert('Enter a demo phone number.'); return; }
    const code = randDigits(6); acc.mfa = { method:'sms', phone, pendingCode:code, enabled:false }; saveAccount(acc);
    smsSentCodeEl.textContent=code; show(smsBox); verifySmsBtn.disabled=false; smsVerifyResult.textContent='A code has been "sent" (displayed for demo).';
    smsVerifyResult.className='muted';
  });

  verifySmsBtn?.addEventListener('click', () => {
    const acc = loadAccount(); const typed = smsCodeInput.value.trim();
    if(!acc||!acc.mfa||acc.mfa.method!=='sms') { alert('No SMS enrollment present.'); return; }
    if(typed === acc.mfa.pendingCode){ acc.mfa.enabled=true; delete acc.mfa.pendingCode; saveAccount(acc); smsVerifyResult.textContent='SMS verified — MFA enabled ✅'; smsVerifyResult.className='ok'; refreshUI(); }
    else { smsVerifyResult.textContent='Code incorrect ❌'; smsVerifyResult.className='err'; }
  });

  genBackupBtn?.addEventListener('click', () => {
    const acc = loadAccount(); if(!acc){ alert('Please create an account first.'); return; }
    const codes = Array.from({length:10},()=>randAlphaNum(8)); acc.backups = codes.map(c=>({code:c,used:false})); saveAccount(acc); showBackupBtn.disabled=false; alert('Backup codes generated (view using "Show Backup Codes")');
  });

  showBackupBtn?.addEventListener('click', ()=> {
    const acc = loadAccount();
    if(!acc || !acc.backups){ alert('No backup codes generated.'); return; }
    backupList.textContent = acc.backups.map(b => (b.used ? b.code + ' (used)' : b.code)).join('\n'); show(backupList);
  });

  refreshUI();
}

// --- Login page wiring ---
function initLoginPage(){
  const loginPassword = document.getElementById('loginPassword');
  const loginBtn = document.getElementById('loginBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const loginStatus = document.getElementById('loginStatus');
  const mfaPrompt = document.getElementById('mfaPrompt');
  const mfaInstructions = document.getElementById('mfaInstructions');
  const mfaCodeInput = document.getElementById('mfaCodeInput');
  const mfaSubmitBtn = document.getElementById('mfaSubmitBtn');
  const mfaCancelBtn = document.getElementById('mfaCancelBtn');
  const mfaResult = document.getElementById('mfaResult');

  const smsBox = document.getElementById('smsBox'); const smsSentCodeEl = document.getElementById('smsSentCode');

  function resetLoginUI(){ hide(mfaPrompt); loginStatus.textContent='Log in to see MFA in action.'; logoutBtn.disabled=true; if(loginPassword){loginPassword.disabled=false;} if(loginBtn){loginBtn.disabled=false;} }

  loginBtn?.addEventListener('click', () => {
    const acc = loadAccount(); if(!acc){ alert('No account — create one first on Account page.'); return; }
    if(loginPassword.value !== acc.password){ loginStatus.innerHTML = '<span class="err">Password incorrect</span>'; return; }
    if(acc.mfa && acc.mfa.enabled){
      show(mfaPrompt); loginStatus.textContent='Password accepted. MFA required.'; mfaInstructions.textContent = `Please supply a code from ${acc.mfa.method === 'totp' ? 'your Authenticator app (TOTP)' : 'an SMS sent to ' + acc.mfa.phone } or a backup code.`;

      // Persist pending state so navigation won't forget we asked for MFA
      acc.mfa.loginPending = true;
      saveAccount(acc);

      // Disable password inputs to emphasize MFA step
      if(loginPassword){ loginPassword.disabled = true; loginPassword.value = ''; }
      if(loginBtn) loginBtn.disabled = true;

      // For SMS MFA, generate a per-login code and show it (demo only)
      if(acc.mfa.method === 'sms'){
        const code = randDigits(6);
        acc.mfa.sentOnLogin = code;
        saveAccount(acc);
        if(smsSentCodeEl) smsSentCodeEl.textContent = code;
        if(smsBox) show(smsBox);
      }
    } else { loginStatus.innerHTML = '<span class="ok">Logged in (no MFA)</span>'; logoutBtn.disabled=false; }
  });

  // if user previously accepted password and left the page, restore MFA prompt now
  const _acc = loadAccount();
  if(_acc && _acc.mfa && _acc.mfa.loginPending){
    show(mfaPrompt);
    loginStatus.textContent = 'Password previously accepted — MFA required.';
    mfaInstructions.textContent = `Please supply a code from ${_acc.mfa.method === 'totp' ? 'your Authenticator app (TOTP)' : 'an SMS sent to ' + _acc.mfa.phone } or a backup code.`;
    if(loginPassword){ loginPassword.disabled = true; loginPassword.value = ''; }
    if(loginBtn) loginBtn.disabled = true;
    if(_acc.mfa.method === 'sms' && _acc.mfa.sentOnLogin){ if(smsSentCodeEl) smsSentCodeEl.textContent = _acc.mfa.sentOnLogin; if(smsBox) show(smsBox); }
  }

  mfaSubmitBtn?.addEventListener('click', async () => {
    const acc = loadAccount(); const code = mfaCodeInput.value.trim(); if(!acc) return;
    // check backup codes first
    if(acc.backups){
      const idx = acc.backups.findIndex(b=>b.code===code && !b.used);
      if(idx>=0){ acc.backups[idx].used=true; delete acc.mfa.loginPending; delete acc.mfa.sentOnLogin; saveAccount(acc); mfaResult.innerHTML='<span class="ok">Login success (backup code used)</span>'; hide(mfaPrompt); loginStatus.innerHTML='<span class="ok">Logged in</span>'; if(loginPassword) loginPassword.disabled=false; if(loginBtn) loginBtn.disabled=false; logoutBtn.disabled=false; return;}
    }
    if(acc.mfa.method === 'sms'){
      if(code === acc.mfa.pendingCode || (acc.mfa.sentOnLogin && code === acc.mfa.sentOnLogin)){
        // accepted
        delete acc.mfa.loginPending;
        delete acc.mfa.sentOnLogin;
        saveAccount(acc);
        mfaResult.innerHTML = '<span class="ok">SMS code accepted — logged in</span>';
        hide(mfaPrompt);
        loginStatus.innerHTML = '<span class="ok">Logged in</span>';
        if(loginPassword) loginPassword.disabled=false;
        if(loginBtn) loginBtn.disabled=false;
        logoutBtn.disabled = false;
        return;
      } else {
        mfaResult.innerHTML = '<span class="err">Invalid SMS code</span>';
        return;
      }
    } else if(acc.mfa.method === 'totp'){
      const ok = await verifyTotp(acc.mfa.secret, code);
      if(ok){
        delete acc.mfa.loginPending;
        delete acc.mfa.sentOnLogin;
        saveAccount(acc);
        mfaResult.innerHTML = '<span class="ok">TOTP verified — logged in</span>';
        hide(mfaPrompt);
        loginStatus.innerHTML = '<span class="ok">Logged in</span>';
        if(loginPassword) loginPassword.disabled=false;
        if(loginBtn) loginBtn.disabled=false;
        logoutBtn.disabled = false;
      } else {
        mfaResult.innerHTML = '<span class="err">Invalid TOTP code</span>';
      }
    } else {
      mfaResult.innerHTML = '<span class="err">Unknown MFA method</span>';
    }
  });

  mfaCancelBtn?.addEventListener('click', ()=> {
    const acc = loadAccount();
    if(acc && acc.mfa && acc.mfa.loginPending){
      delete acc.mfa.loginPending;
      delete acc.mfa.sentOnLogin;
      saveAccount(acc);
    }
    hide(mfaPrompt);
    loginStatus.textContent = 'Login cancelled';
    if(loginPassword) loginPassword.disabled=false;
    if(loginBtn) loginBtn.disabled=false;
  });

  logoutBtn?.addEventListener('click', ()=> { hide(mfaPrompt); loginStatus.textContent='Logged out'; logoutBtn.disabled=true; if(loginPassword) loginPassword.disabled=false; if(loginBtn) loginBtn.disabled=false; });

  resetLoginUI();
}

// --- Nav active highlight ---
function markActiveNav(){
  try {
    const anchors = document.querySelectorAll('.nav-link');
    const current = location.pathname.split('/').pop();
    anchors.forEach(a => {
      const href = (new URL(a.href, location.href)).pathname.split('/').pop();
      a.classList.toggle('active', href === current);
    });
  } catch(e){}
}

// Auto-init
document.addEventListener('DOMContentLoaded', () => {
  markActiveNav();
  if(document.getElementById('accountCard')) initAccountPage();
  if(document.getElementById('loginCard')) initLoginPage();
});