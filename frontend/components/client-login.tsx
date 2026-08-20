"use client";
import { ArrowRight, Building2, CheckCircle2, PlayCircle, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { FormEvent, useState } from "react";

export function ClientLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@alethia.demo");
  const [password, setPassword] = useState("Welcome123!");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError("");
    const response = await fetch("/api/auth/client", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email, password }) });
    const result = await response.json();
    if (!response.ok) { setError(result.error); setBusy(false); return; }
    router.push("/workspace");
  }
  return <main className="client-auth-page">
    <section className="client-auth-story">
      <Link href="/" className="marketing-brand light-brand"><span>A</span><b>Alethia</b></Link>
      <div><div className="marketing-kicker light-kicker"><ShieldCheck/> Secure client workspace</div><h1>Make critical knowledge measurable.</h1><p>Turn approved company documents into role-aware guidance, targeted verification and evidence leaders can act on.</p>
        <div className="login-proof-list"><span><CheckCircle2/> Division-scoped knowledge</span><span><CheckCircle2/> AI grounded in approved sources</span><span><CheckCircle2/> Readiness from person to organization</span></div>
      </div><small>Tenant isolation · Role-based access · Auditable outcomes</small>
    </section>
    <section className="client-auth-panel"><motion.form className="client-auth-card" onSubmit={submit} initial={{opacity:0,y:18}} animate={{opacity:1,y:0}}>
      <div className="auth-eyebrow"><Building2/> CLIENT PORTAL</div><h2>Welcome back</h2><p>Sign in with your company account.</p>
      <label>Work email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email" required/></label>
      <label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} autoComplete="current-password" required/></label>
      {error && <div className="login-error" role="alert">{error}</div>}
      <button className="login-submit" disabled={busy}>{busy ? "Signing in…" : "Sign in to workspace"}<ArrowRight/></button>
      <div className="demo-credential"><b>Client showcase</b><span>Admin, engineering manager and developer accounts are preloaded.</span></div>
      <div className="auth-links"><Link href="/onboarding">Set up a new company</Link><Link href="/demo"><PlayCircle/> Explore guided demo</Link></div>
    </motion.form></section>
  </main>;
}
