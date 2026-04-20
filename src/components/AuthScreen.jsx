import { useState } from "react";
import { isSupabaseConfigured, supabase } from "../lib/supabase";
import {
  CLOUD_CONFIG_ERROR,
  DEMO_ADMIN_EMAIL,
  DEMO_ADMIN_PASSWORD,
} from "../constants";
import { createEmptyAppData } from "../appData";
import { ensureProfile, getSchoolFromEmail, upsertProfile } from "../auth";
import { icons } from "../icons";
import { Icon } from "./Icon";

export default function AuthScreen({ onAuth, onDemoAuth, cloudError = "" }) {
  const [screen, setScreen] = useState("welcome"); // welcome | login | signup
  const [form, setForm] = useState({ name:"", school:"", email:"", password:"", confirm:"" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [demoTapCount, setDemoTapCount] = useState(0);
  const [demoUnlocked, setDemoUnlocked] = useState(false);

  const detectedSchool = getSchoolFromEmail(form.email);

  const upd = (k, v) => {
    setForm(f => {
      const next = { ...f, [k]: v };

      if (k === "email") {
        const nextDetectedSchool = getSchoolFromEmail(v);
        const previousDetectedSchool = getSchoolFromEmail(f.email);

        if (nextDetectedSchool) {
          next.school = nextDetectedSchool;
        } else if (f.school === previousDetectedSchool) {
          next.school = "";
        }
      }

      return next;
    });
    setError("");
  };
  const openDemoAdmin = () => {
    setError("");
    onDemoAuth?.();
  };
  const handleLogoTap = () => {
    setDemoTapCount(prev => {
      const next = prev + 1;
      if (next >= 5) {
        setDemoUnlocked(true);
        setScreen("login");
      }
      return next >= 5 ? 0 : next;
    });
  };

  const handleSignup = async () => {
    if (!isSupabaseConfigured || !supabase) return setError(cloudError || CLOUD_CONFIG_ERROR);
    const resolvedSchool = detectedSchool || form.school.trim();
    if (!form.name.trim()) return setError("Please enter your name.");
    if (!form.email.trim() || !form.email.includes("@")) return setError("Please enter a valid email.");
    if (!resolvedSchool) return setError("Please enter your school name.");
    if (form.password.length < 6) return setError("Password must be at least 6 characters.");
    if (form.password !== form.confirm) return setError("Passwords don't match.");
    setLoading(true);
    try {
      const email = form.email.toLowerCase().trim();
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password: form.password,
        options: {
          data: {
            name: form.name.trim(),
            school: resolvedSchool,
          },
        },
      });

      if (signUpError) throw signUpError;
      if (!data.user) throw new Error("Signup failed. Please try again.");

      if (!data.session) {
        setError("Check your email to confirm your account, then sign in.");
        setScreen("login");
        return;
      }

      const profile = await upsertProfile({
        id: data.user.id,
        email,
        name: form.name.trim(),
        school: resolvedSchool,
        appData: createEmptyAppData(),
      });

      onAuth({ authUser: data.user, profile });
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : "Could not create your account.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!form.email.trim() || !form.password) return setError("Please fill in all fields.");
    const email = form.email.toLowerCase().trim();
    if (email === DEMO_ADMIN_EMAIL && form.password === DEMO_ADMIN_PASSWORD) {
      setLoading(false);
      openDemoAdmin();
      return;
    }
    if (!isSupabaseConfigured || !supabase) return setError(cloudError || CLOUD_CONFIG_ERROR);
    setLoading(true);
    try {
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password: form.password,
      });

      if (loginError) throw loginError;
      if (!data.user) throw new Error("No account found with this email.");

      const profile = await ensureProfile(data.user, { email });
      onAuth({ authUser: data.user, profile });
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : "Could not sign you in.");
    } finally {
      setLoading(false);
    }
  };

  const initial = form.name ? form.name.trim()[0].toUpperCase() : "M";

  return (
    <div className="auth-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap');
        * { margin:0; padding:0; box-sizing:border-box; }
        html, body { height:100%; }
        .auth-root { min-height:100vh; min-height:100dvh; background:#080810; background-image:radial-gradient(circle at 18% 18%, rgba(124,106,247,0.22) 0%, transparent 52%), radial-gradient(circle at 82% 82%, rgba(106,247,196,0.16) 0%, transparent 50%); color:#e8e8f0; font-family:'DM Mono',monospace; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:24px; }
        .auth-card { width:100%; max-width:400px; background:rgba(255,255,255,0.07); backdrop-filter:blur(28px) saturate(1.5); -webkit-backdrop-filter:blur(28px) saturate(1.5); border:1px solid rgba(255,255,255,0.12); border-radius:20px; padding:32px 28px; display:flex; flex-direction:column; gap:20px; }
        .auth-logo { font-family:'Syne',sans-serif; font-weight:800; font-size:28px; color:#e8e8f0; text-align:center; }
        .auth-logo.tap-target { cursor:pointer; user-select:none; }
        .auth-logo-dot { display:inline-block; width:9px; height:9px; background:#7c6af7; border-radius:50%; margin-left:3px; vertical-align:middle; position:relative; top:-2px; box-shadow:0 0 12px #7c6af7; }
        .auth-avatar-wrap { display:flex; justify-content:center; margin-bottom:4px; }
        .auth-avatar { width:64px; height:64px; border-radius:50%; background:rgba(124,106,247,0.12); border:2px solid rgba(124,106,247,0.3); display:flex; align-items:center; justify-content:center; font-family:'Syne',sans-serif; font-weight:700; font-size:24px; color:#7c6af7; }
        .auth-title { font-family:'Syne',sans-serif; font-weight:700; font-size:20px; text-align:center; color:#e8e8f0; }
        .auth-sub { font-size:12px; color:#6b6b80; text-align:center; line-height:1.5; }
        .auth-input-wrap { position:relative; }
        .auth-input { width:100%; padding:12px 14px; border-radius:10px; border:1px solid rgba(255,255,255,0.11); background:rgba(255,255,255,0.07); color:#e8e8f0; font-family:'DM Mono',monospace; font-size:13px; outline:none; transition:border-color 0.2s, box-shadow 0.2s; }
        .auth-input:focus { border-color:#7c6af7; }
        .auth-input::placeholder { color:#6b6b80; }
        .auth-input.has-toggle { padding-right:44px; }
        .auth-eye { position:absolute; right:12px; top:50%; transform:translateY(-50%); background:none; border:none; cursor:pointer; color:#6b6b80; display:flex; align-items:center; padding:4px; }
        .auth-eye:hover { color:#e8e8f0; }
        .auth-btn { width:100%; padding:13px; border-radius:10px; border:none; background:#7c6af7; color:white; font-family:'Syne',sans-serif; font-weight:700; font-size:15px; cursor:pointer; transition:opacity 160ms var(--ease-out), transform 160ms var(--ease-out); }
        @media (hover:hover) and (pointer:fine) { .auth-btn:hover:not(:disabled) { opacity:0.88; } }
        .auth-btn:active:not(:disabled) { transform:scale(0.97); opacity:0.9; }
        .auth-btn:disabled { opacity:0.5; cursor:default; }
        .auth-btn.secondary { background:transparent; border:1px solid #2a2a38; color:#e8e8f0; font-family:'DM Mono',monospace; font-weight:400; font-size:13px; }
        .auth-btn.secondary:hover { background:#1a1a24; }
        .auth-error { background:rgba(247,106,106,0.1); border:1px solid rgba(247,106,106,0.25); border-radius:8px; padding:10px 14px; font-size:12px; color:#f76a6a; }
        .auth-divider { display:flex; align-items:center; gap:10px; }
        .auth-divider-line { flex:1; height:1px; background:#2a2a38; }
        .auth-divider-text { font-size:11px; color:#6b6b80; }
        .auth-link { background:none; border:none; color:#7c6af7; font-family:'DM Mono',monospace; font-size:12px; cursor:pointer; text-decoration:underline; text-underline-offset:3px; }
        .auth-link:hover { opacity:0.8; }
        .auth-footer { text-align:center; font-size:11px; color:#6b6b80; }
        .auth-helper { font-size:11px; color:#9d9db4; line-height:1.5; margin-top:-4px; }
        .auth-demo-note { font-size:11px; color:#9d9db4; line-height:1.6; text-align:center; }
        .auth-demo-creds { display:block; color:#e8e8f0; margin-top:4px; }
        .auth-secret-hint { text-align:center; font-size:10px; color:#6b6b80; letter-spacing:0.2px; }
        .auth-welcome-art { display:flex; justify-content:center; gap:8px; }
        .auth-dot { width:10px; height:10px; border-radius:50%; animation:authPulse 2s infinite ease-in-out; }
        .auth-dot:nth-child(2) { animation-delay:0.3s; }
        .auth-dot:nth-child(3) { animation-delay:0.6s; }
        @keyframes authPulse { 0%,100% { transform:scale(1); opacity:0.6; } 50% { transform:scale(1.3); opacity:1; } }
      `}</style>

      {screen === "welcome" && (
        <div className="auth-card">
          <div className="auth-logo tap-target" onClick={handleLogoTap}>Markd<span className="auth-logo-dot"/></div>
          <div className="auth-welcome-art">
            <div className="auth-dot" style={{background:"#7c6af7"}}/>
            <div className="auth-dot" style={{background:"#6af7c4"}}/>
            <div className="auth-dot" style={{background:"#f7a26a"}}/>
          </div>
          <div>
            <div className="auth-title">Your study organiser</div>
            <div className="auth-sub" style={{marginTop:8}}>Track subjects, deadlines, exams, and goals — all in one place.</div>
          </div>
          <button className="auth-btn" onClick={() => setScreen("signup")}>Get started</button>
          {demoUnlocked && <button className="auth-btn secondary" onClick={openDemoAdmin}>Use presenter workspace</button>}
          <div className="auth-footer">
            Already have an account?{" "}
            <button className="auth-link" onClick={() => setScreen("login")}>Sign in</button>
          </div>
        </div>
      )}

      {screen === "signup" && (
        <div className="auth-card">
          <div className="auth-logo tap-target" onClick={handleLogoTap}>Markd<span className="auth-logo-dot"/></div>
          <div className="auth-avatar-wrap">
            <div className="auth-avatar">{initial}</div>
          </div>
          <div className="auth-title">Create account</div>
          {(cloudError || error) && <div className="auth-error">{error || cloudError}</div>}
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            <input className="auth-input" placeholder="Your name" value={form.name} onChange={e=>upd("name",e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleSignup()}/>
            <input className="auth-input" placeholder="Email address" type="email" value={form.email} onChange={e=>upd("email",e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleSignup()}/>
            <input className="auth-input" placeholder="School name" value={form.school} onChange={e=>upd("school",e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleSignup()} readOnly={Boolean(detectedSchool)} />
            {detectedSchool && <div className="auth-helper">School detected from your email: {detectedSchool}</div>}
            <div className="auth-input-wrap">
              <input className="auth-input has-toggle" placeholder="Password (min. 6 characters)" type={showPass?"text":"password"} value={form.password} onChange={e=>upd("password",e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleSignup()}/>
              <button className="auth-eye" onClick={()=>setShowPass(s=>!s)}><Icon d={showPass?icons.eyeOff:icons.eye} size={16}/></button>
            </div>
            <input className="auth-input" placeholder="Confirm password" type="password" value={form.confirm} onChange={e=>upd("confirm",e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleSignup()}/>
          </div>
          <button className="auth-btn" onClick={handleSignup} disabled={loading}>{loading ? "Creating account…" : "Create account"}</button>
          <div className="auth-footer">
            Already have an account?{" "}
            <button className="auth-link" onClick={() => { setScreen("login"); setError(""); setForm(f=>({...f,password:"",confirm:""})); }}>Sign in</button>
          </div>
        </div>
      )}

      {screen === "login" && (
        <div className="auth-card">
          <div className="auth-logo tap-target" onClick={handleLogoTap}>Markd<span className="auth-logo-dot"/></div>
          <div className="auth-title">Welcome back</div>
          <div className="auth-sub">Sign in to your account</div>
          {(cloudError || error) && <div className="auth-error">{error || cloudError}</div>}
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            <input className="auth-input" placeholder="Email address" type="email" value={form.email} onChange={e=>upd("email",e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleLogin()}/>
            <div className="auth-input-wrap">
              <input className="auth-input has-toggle" placeholder="Password" type={showPass?"text":"password"} value={form.password} onChange={e=>upd("password",e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleLogin()}/>
              <button className="auth-eye" onClick={()=>setShowPass(s=>!s)}><Icon d={showPass?icons.eyeOff:icons.eye} size={16}/></button>
            </div>
          </div>
          <button className="auth-btn" onClick={handleLogin} disabled={loading}>{loading ? "Signing in…" : "Sign in"}</button>
          {demoUnlocked && (
            <>
              <div className="auth-divider">
                <div className="auth-divider-line"/>
                <div className="auth-divider-text">presenter</div>
                <div className="auth-divider-line"/>
              </div>
              <button className="auth-btn secondary" onClick={openDemoAdmin}>Use presenter workspace</button>
              <div className="auth-demo-note">
                Presenter login
                <span className="auth-demo-creds">{DEMO_ADMIN_EMAIL} / {DEMO_ADMIN_PASSWORD}</span>
              </div>
            </>
          )}
          <div className="auth-footer">
            Don't have an account?{" "}
            <button className="auth-link" onClick={() => { setScreen("signup"); setError(""); setForm(f=>({...f,password:""})); }}>Sign up</button>
          </div>
          {demoUnlocked && <div className="auth-secret-hint">Presenter access unlocked. Click the logo five times again after refresh if you need it later.</div>}
        </div>
      )}
    </div>
  );
}
