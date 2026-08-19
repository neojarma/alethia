"use client";

import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  Code2,
  Scale,
  Sparkles,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState } from "react";

const roles = [
  {
    id: "manager",
    title: "Manager",
    person: "Maya Putri",
    description: "Organization readiness, people, risks and campaigns",
    icon: BriefcaseBusiness,
  },
  {
    id: "developer",
    title: "Developer",
    person: "Dimas Nugroho",
    description: "Technical knowledge, engineering risk and verification",
    icon: Code2,
  },
  {
    id: "legal",
    title: "Legal",
    person: "Laila Azzahra",
    description: "Policy changes, evidence, governance and risk",
    icon: Scale,
  },
  {
    id: "employee",
    title: "Employee",
    person: "Bima Saputra",
    description: "Assigned learning, trusted answers and verification",
    icon: UserRound,
  },
] as const;

export function DemoLogin() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [selected, setSelected] = useState("manager");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function enterWorkspace() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/auth/demo", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ role: selected }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not sign in.");
      router.push("/workspace");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not sign in.");
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-story">
        <Link href="/" className="marketing-brand light-brand">
          <span>A</span>
          <b>Alethia</b>
        </Link>
        <div className="login-story-copy">
          <div className="marketing-kicker light-kicker">
            <Sparkles /> Interactive product demo
          </div>
          <h1>See one knowledge change through every role.</h1>
          <p>
            Enter a role-specific workspace and follow the evidence from policy
            change to employee understanding and measurable business readiness.
          </p>
          <div className="login-proof-list">
            <span>
              <CheckCircle2 /> Role-scoped knowledge and actions
            </span>
            <span>
              <CheckCircle2 /> AI answers linked to approved sources
            </span>
            <span>
              <CheckCircle2 /> Persistent verification and risk outcomes
            </span>
          </div>
        </div>
        <p className="login-note">Fictional data · Safe judging environment</p>
      </section>
      <section className="login-panel">
        <motion.div
          className="login-card"
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 110, damping: 19 }}
        >
          <Link href="/" className="back-link">
            <ArrowLeft /> Back to overview
          </Link>
          <div className="login-heading">
            <span className="login-lock">AC</span>
            <div>
              <small>ALETHIA COMPANY</small>
              <h2>Choose your demo role</h2>
            </div>
          </div>
          <p className="login-intro">
            No password is needed. Each persona opens a different permission and
            workflow view.
          </p>
          <div className="role-grid" role="radiogroup" aria-label="Demo role">
            {roles.map((role) => {
              const Icon = role.icon;
              return (
                <motion.button
                  key={role.id}
                  className={`role-card ${selected === role.id ? "selected" : ""}`}
                  role="radio"
                  aria-checked={selected === role.id}
                  onClick={() => setSelected(role.id)}
                  whileHover={reduceMotion ? undefined : { y: -4, scale: 1.01 }}
                  whileTap={{ scale: 0.985 }}
                  transition={{ type: "spring", stiffness: 320, damping: 22 }}
                >
                  <span className="role-card-icon">
                    <Icon />
                  </span>
                  <span className="role-card-copy">
                    <b>{role.title}</b>
                    <small>{role.person}</small>
                    <span>{role.description}</span>
                  </span>
                  <span className="role-radio">
                    <AnimatePresence>
                      {selected === role.id && (
                        <motion.span
                          className="role-radio-dot"
                          initial={reduceMotion ? false : { scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          transition={{
                            type: "spring",
                            stiffness: 420,
                            damping: 22,
                          }}
                        />
                      )}
                    </AnimatePresence>
                  </span>
                </motion.button>
              );
            })}
          </div>
          {error && (
            <div className="login-error" role="alert">
              {error}
            </div>
          )}
          <motion.button
            className="login-submit"
            onClick={enterWorkspace}
            disabled={loading}
            whileHover={
              reduceMotion || loading ? undefined : { y: -2, scale: 1.005 }
            }
            whileTap={loading ? undefined : { scale: 0.99 }}
          >
            {loading
              ? "Opening workspace…"
              : `Continue as ${roles.find((role) => role.id === selected)?.title}`}
            {!loading && <ArrowRight />}
          </motion.button>
          <p className="login-privacy">Demo access expires after 8 hours.</p>
        </motion.div>
      </section>
    </main>
  );
}
