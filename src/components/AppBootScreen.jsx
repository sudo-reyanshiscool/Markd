export default function AppBootScreen({ message }) {
  return (
    <div className="auth-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap');
        * { margin:0; padding:0; box-sizing:border-box; }
        html, body { height:100%; }
        .auth-root { min-height:100vh; min-height:100dvh; background:#080810; background-image:radial-gradient(circle at 18% 18%, rgba(124,106,247,0.22) 0%, transparent 52%), radial-gradient(circle at 82% 82%, rgba(106,247,196,0.16) 0%, transparent 50%); color:#e8e8f0; font-family:'DM Mono',monospace; display:flex; align-items:center; justify-content:center; padding:24px; }
        .boot-card { width:100%; max-width:400px; background:rgba(255,255,255,0.07); backdrop-filter:blur(28px) saturate(1.5); -webkit-backdrop-filter:blur(28px) saturate(1.5); border:1px solid rgba(255,255,255,0.12); border-radius:20px; padding:32px 28px; display:flex; flex-direction:column; gap:16px; align-items:center; text-align:center; }
        .boot-logo { font-family:'Syne',sans-serif; font-weight:800; font-size:28px; color:#e8e8f0; }
        .boot-logo-dot { display:inline-block; width:9px; height:9px; background:#7c6af7; border-radius:50%; margin-left:3px; vertical-align:middle; position:relative; top:-2px; box-shadow:0 0 12px #7c6af7; }
        .boot-spinner { width:28px; height:28px; border-radius:50%; border:3px solid rgba(124,106,247,0.2); border-top-color:#7c6af7; animation:bootSpin 0.9s linear infinite; }
        .boot-message { font-size:12px; color:#6b6b80; line-height:1.6; }
        @keyframes bootSpin { to { transform:rotate(360deg); } }
      `}</style>
      <div className="boot-card">
        <div className="boot-logo">Markd<span className="boot-logo-dot"/></div>
        <div className="boot-spinner"/>
        <div className="boot-message">{message}</div>
      </div>
    </div>
  );
}
