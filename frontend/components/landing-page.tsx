"use client";

import {
  Activity,
  ArrowRight,
  Bot,
  BriefcaseBusiness,
  Check,
  CheckCircle2,
  FileCheck2,
  FileText,
  Gauge,
  Home,
  Menu,
  MessageSquareText,
  Moon,
  Network,
  Pause,
  Play,
  Quote,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  Sun,
  Target,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import { useEffect, useRef, useState } from "react";

const heroWorkspaceNav = [
  {
    label: "Workspace",
    items: [
      { label: "Home", icon: Home },
      { label: "My work", icon: BriefcaseBusiness, count: 4 },
    ],
  },
  {
    label: "Knowledge",
    items: [
      { label: "Documents", icon: FileText, count: 11 },
      { label: "Changes", icon: Activity, count: 7 },
      { label: "Assistant", icon: MessageSquareText },
    ],
  },
  {
    label: "Readiness",
    items: [
      { label: "People", icon: Users },
      { label: "Campaigns", icon: Target, count: 3 },
      { label: "Risk", icon: ShieldAlert, count: 4 },
      { label: "Analytics", icon: Gauge },
    ],
  },
  {
    label: "Governance",
    items: [
      { label: "AI governance", icon: ShieldCheck },
      { label: "Enterprise admin", icon: BriefcaseBusiness },
      { label: "Integrations", icon: Network },
    ],
  },
];

const tourScenes = [
  {
    label: "Detect",
    title: "AI finds what materially changed",
    copy: "Seven meaningful changes identified in Policy v3.0, each linked to its original source section.",
    stat: "7 changes",
    icon: Activity,
  },
  {
    label: "Map",
    title: "Impact becomes an owned audience",
    copy: "Alethia maps sensitive-access rules to 40 affected people across four divisions.",
    stat: "40 people",
    icon: Users,
  },
  {
    label: "Learn",
    title: "Every person gets the next best action",
    copy: "Role-specific learning and cited AI answers replace one-size-fits-all policy broadcasts.",
    stat: "4 roles",
    icon: Bot,
  },
  {
    label: "Verify",
    title: "Understanding is proven, not assumed",
    copy: "Scenario questions verify whether employees can apply the approved knowledge in context.",
    stat: "85% verified",
    icon: FileCheck2,
  },
  {
    label: "Act",
    title: "Leaders see risk before it becomes an incident",
    copy: "Six remaining gaps become owned actions with reminders, escalation and an audit trail.",
    stat: "6 gaps",
    icon: ShieldCheck,
  },
];

const capabilityStories = [
  { label: "AI answers", title: "Trusted AI answers", copy: "Every response is grounded in approved company knowledge and linked to its source.", metric: "96% cited confidence" },
  { label: "Documents", title: "Governed knowledge", copy: "Upload policies and SOPs, preserve ownership, and keep every version accountable.", metric: "100% source linked" },
  { label: "Campaigns", title: "Targeted campaigns", copy: "Assign learning to the exact divisions, roles, or people affected by a change.", metric: "40 people mapped" },
  { label: "Verification", title: "Verified understanding", copy: "Scenario-based questions prove employees can apply knowledge—not merely open it.", metric: "92% verified" },
  { label: "People scores", title: "Live readiness scores", copy: "Leaders see individual, team, and organization knowledge readiness in real time.", metric: "86 readiness score" },
  { label: "Audit trail", title: "Evidence-ready audit trail", copy: "Every source, assignment, answer, score, and manager decision stays traceable.", metric: "Complete history" },
];

export function LandingPage() {
  const reduceMotion = useReducedMotion();
  const showcaseRef = useRef<HTMLElement>(null);
  const { scrollYProgress: showcaseProgress } = useScroll({
    target: showcaseRef,
    offset: ["start end", "end start"],
  });
  const showcaseTitleY = useTransform(showcaseProgress, [0, 1], [36, -28]);
  const managerShotY = useTransform(showcaseProgress, [0, 1], [70, -54]);
  const sideShotsY = useTransform(showcaseProgress, [0, 1], [-18, 42]);
  const orbOneY = useTransform(showcaseProgress, [0, 1], [120, -160]);
  const orbTwoY = useTransform(showcaseProgress, [0, 1], [-40, 130]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState<boolean | null>(null);
  const [scene, setScene] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [activeCapability, setActiveCapability] = useState(0);

  useEffect(() => {
    const savedTheme = localStorage.getItem("alethia-marketing-theme");
    const timer = window.setTimeout(
      () =>
        setDarkMode(
          savedTheme
            ? savedTheme === "dark"
            : window.matchMedia("(prefers-color-scheme: dark)").matches,
        ),
      0,
    );
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (darkMode === null) return;
    localStorage.setItem(
      "alethia-marketing-theme",
      darkMode ? "dark" : "light",
    );
  }, [darkMode]);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(
      () => setScene((current) => (current + 1) % tourScenes.length),
      3200,
    );
    return () => window.clearInterval(timer);
  }, [playing]);

  const current = tourScenes[scene];
  const SceneIcon = current.icon;
  const scrollToSection = (
    event: React.MouseEvent<HTMLAnchorElement>,
    id: string,
  ) => {
    event.preventDefault();
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "start",
    });
    window.history.replaceState(null, "", `#${id}`);
  };

  const reveal = reduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 38 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, amount: 0.14 },
        transition: {
          duration: 0.62,
          ease: [0.22, 1, 0.36, 1] as const,
        },
      };

  return (
    <main className={`marketing-page ${darkMode ? "marketing-dark" : ""}`}>
      <motion.header
        className="marketing-nav"
        initial={reduceMotion ? false : { opacity: 0, y: -18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <Link href="/" className="marketing-brand">
          <span>A</span>
          <b>Alethia</b>
        </Link>
        <nav className={menuOpen ? "open" : ""} aria-label="Product navigation">
          <motion.a
            href="#problem"
            onClick={(event) => scrollToSection(event, "problem")}
            whileHover={reduceMotion ? undefined : { y: -2, color: "#6857eb" }}
            whileTap={{ scale: 0.97 }}
          >
            Why Alethia
          </motion.a>
          <motion.a
            href="#how-it-works"
            onClick={(event) => scrollToSection(event, "how-it-works")}
            whileHover={reduceMotion ? undefined : { y: -2, color: "#6857eb" }}
            whileTap={{ scale: 0.97 }}
          >
            How it works
          </motion.a>
          <motion.a
            href="#ai"
            onClick={(event) => scrollToSection(event, "ai")}
            whileHover={reduceMotion ? undefined : { y: -2, color: "#6857eb" }}
            whileTap={{ scale: 0.97 }}
          >
            Responsible AI
          </motion.a>
          <motion.a
            href="#tour"
            onClick={(event) => scrollToSection(event, "tour")}
            whileHover={reduceMotion ? undefined : { y: -2, color: "#6857eb" }}
            whileTap={{ scale: 0.97 }}
          >
            Product tour
          </motion.a>
          <motion.a
            href="#impact"
            onClick={(event) => scrollToSection(event, "impact")}
            whileHover={reduceMotion ? undefined : { y: -2, color: "#6857eb" }}
            whileTap={{ scale: 0.97 }}
          >
            Impact
          </motion.a>
        </nav>
        <Link href="/login" className="nav-login">
          Open live demo <ArrowRight />
        </Link>
        <motion.button
          className="marketing-theme-toggle"
          aria-label={darkMode ? "Use light theme" : "Use dark theme"}
          aria-pressed={Boolean(darkMode)}
          onClick={() => setDarkMode((value) => !(value ?? false))}
          whileHover={
            reduceMotion ? undefined : { y: -2, rotate: darkMode ? -8 : 8 }
          }
          whileTap={{ scale: 0.92 }}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={darkMode ? "sun" : "moon"}
              initial={
                reduceMotion ? false : { opacity: 0, rotate: -45, scale: 0.7 }
              }
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={
                reduceMotion
                  ? { opacity: 0 }
                  : { opacity: 0, rotate: 45, scale: 0.7 }
              }
              transition={{ duration: reduceMotion ? 0.01 : 0.2 }}
            >
              {darkMode ? <Sun /> : <Moon />}
            </motion.span>
          </AnimatePresence>
        </motion.button>
        <button
          className="marketing-menu"
          onClick={() => setMenuOpen((value) => !value)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X /> : <Menu />}
        </button>
      </motion.header>

      <section className="marketing-hero">
        <motion.div
          className="hero-copy"
          initial={reduceMotion ? false : { opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="marketing-kicker">
            <Sparkles /> The AI readiness layer for modern teams <ArrowRight />
          </div>
          <h1>
            Knowledge that proves <em>your team is ready.</em>
          </h1>
          <div className="hero-benefits">
            <span><Check /><b>Find risk faster.</b> AI detects what changed and who it affects.</span>
            <span><Check /><b>Verify understanding.</b> Turn approved documents into role-based questions.</span>
            <span><Check /><b>Prove readiness.</b> Give leaders live, auditable knowledge scores.</span>
          </div>
          <div className="hero-actions">
            <Link href="/login" className="marketing-primary">
              Explore the live demo <ArrowRight />
            </Link>
            <small><b>Ready instantly.</b><br />No setup or credit card.</small>
          </div>
          <div className="hero-capabilities">
            <small>ONE LOOP · FROM DOCUMENT TO PROOF</small>
            <div>
              {capabilityStories.map((item, index) => (
                <motion.button
                  key={item.label}
                  type="button"
                  aria-pressed={activeCapability === index}
                  className={activeCapability === index ? "active" : ""}
                  onClick={() => setActiveCapability(index)}
                  whileHover={reduceMotion ? undefined : { y: -3, scale: 1.03 }}
                  whileTap={reduceMotion ? undefined : { scale: .96 }}
                >
                  {index === 0 && <Sparkles />}{item.label}
                </motion.button>
              ))}
            </div>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                className="capability-detail"
                key={activeCapability}
                initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
                transition={{ duration: reduceMotion ? .01 : .22 }}
              >
                <span><b>{capabilityStories[activeCapability].title}</b>{capabilityStories[activeCapability].copy}</span>
                <strong>{capabilityStories[activeCapability].metric}</strong>
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
        <div className="hero-product-stage">
          <motion.div
            className="hero-product"
            aria-label="Alethia readiness dashboard preview"
            initial={reduceMotion ? false : { opacity: 0, y: 34 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              type: "spring",
              stiffness: 95,
              damping: 18,
              delay: 0.12,
            }}
            whileHover={reduceMotion ? undefined : { y: -5 }}
          >
          <div className="hero-workspace-bar">
            <b><i>A</i> Northstar Technologies</b>
            <span>Search knowledge… <Sparkles /></span>
          </div>
          <div className="hero-workspace">
            <aside className="hero-real-nav" aria-label="Live workspace navigation preview">
              {heroWorkspaceNav.map((group) => (
                <div className="hero-nav-group" key={group.label}>
                  <strong>{group.label}</strong>
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        className={item.label === "Home" ? "active" : ""}
                        href="/demo"
                        key={item.label}
                        aria-label={`Open ${item.label} in the live demo`}
                      >
                        <Icon aria-hidden="true" />
                        <span>{item.label}</span>
                        {item.count && <em>{item.count}</em>}
                      </Link>
                    );
                  })}
                </div>
              ))}
            </aside>
            <div className="hero-workspace-main">
              <div className="workspace-title"><span><small>LIVE WORKSPACE</small><AnimatePresence mode="wait" initial={false}><motion.b key={activeCapability} initial={reduceMotion ? {opacity:0}:{opacity:0,y:6}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-5}}>{capabilityStories[activeCapability].title}</motion.b></AnimatePresence></span><button>Review risks <ArrowRight /></button></div>
              <div className="workspace-stats">
                <div className="primary-stat"><span>Alethia Health</span><b>86<small>/100</small></b><em>↑ 12% this quarter</em></div>
                <div><span>People verified</span><b>92%</b><em>37 of 40 ready</em></div>
                <div><span>Risk closed</span><b>18</b><em>4 gaps remaining</em></div>
              </div>
              <div className="workspace-content">
                <div className="readiness-chart">
                  <div><span><small>READINESS TREND</small><b>Knowledge health</b></span><em>+12.4%</em></div>
                  <svg viewBox="0 0 320 105" role="img" aria-label="Readiness increased from 58 to 86">
                    <defs><linearGradient id="readiness-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#705bec" stopOpacity=".35"/><stop offset="1" stopColor="#705bec" stopOpacity="0"/></linearGradient></defs>
                    <path className="chart-grid" d="M0 25H320M0 55H320M0 85H320" />
                    <path className="chart-area" d="M0 88 C35 82 45 68 78 72 S125 54 156 60 S210 38 238 43 S286 20 320 14 L320 105 L0 105Z" />
                    <path className="chart-line" d="M0 88 C35 82 45 68 78 72 S125 54 156 60 S210 38 238 43 S286 20 320 14" />
                    <circle cx="320" cy="14" r="5" />
                  </svg>
                  <div className="chart-labels"><span>JAN</span><span>FEB</span><span>MAR</span><span>APR</span><span>MAY</span><span>JUN</span></div>
                </div>
                <div className="workspace-ai"><Sparkles /><small>AI INSIGHT</small><b>Verify 4 people to close the highest-risk gap.</b><button>View recommendation <ArrowRight /></button></div>
              </div>
              <div className="workspace-progress"><div><span><b>Campaign completion</b><small>Secure Deployment Policy · Engineering</small></span><strong>37 / 40</strong></div><i><em style={{width:"92%"}} /></i><footer><span>92% verified</span><span>3 people remaining</span></footer></div>
            </div>
          </div>
            <div className="hero-product-fade" aria-hidden="true" />
          </motion.div>
          <motion.span
            className="floating-proof proof-one"
            animate={reduceMotion ? undefined : { y: [0, -5, 0] }}
            transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
          >
            <CheckCircle2 /> Evidence linked
          </motion.span>
          <motion.span
            className="floating-proof proof-two"
            animate={reduceMotion ? undefined : { y: [0, 5, 0] }}
            transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
          >
            <Target /> 40 people mapped
          </motion.span>
        </div>
      </section>

      <section className="trust-strip" aria-label="Industries Alethia supports" tabIndex={0}>
        <div className="trust-marquee-track">
          {[0, 1].map((copy) => (
            <div className="trust-marquee-group" key={copy} aria-hidden={copy === 1}>
              <span>BUILT FOR SOP-HEAVY TEAMS</span>
              <b>Financial services</b>
              <b>Healthcare</b>
              <b>Technology</b>
              <b>Operations</b>
              <b>Compliance</b>
            </div>
          ))}
        </div>
      </section>

      <motion.section
        ref={showcaseRef}
        className="visual-showcase"
        {...reveal}
      >
        <motion.i
          aria-hidden="true"
          className="showcase-orb showcase-orb-one"
          style={reduceMotion ? undefined : { y: orbOneY }}
        />
        <motion.i
          aria-hidden="true"
          className="showcase-orb showcase-orb-two"
          style={reduceMotion ? undefined : { y: orbTwoY }}
        />
        <motion.div
          className="section-heading showcase-heading"
          style={reduceMotion ? undefined : { y: showcaseTitleY }}
        >
          <span>SEE ALETHIA IN ACTION</span>
          <h2>One workspace. Every step visible.</h2>
          <p>
            Follow approved knowledge from a manager upload to an employee
            score—without losing the source, owner or business context.
          </p>
        </motion.div>
        <div className="showcase-grid">
          <motion.article
            className="showcase-feature main-shot"
            style={reduceMotion ? undefined : { y: managerShotY }}
            initial={reduceMotion ? false : { opacity: 0, x: -46, rotate: -1.2 }}
            whileInView={{ opacity: 1, x: 0, rotate: 0 }}
            viewport={{ once: true, amount: 0.18 }}
            transition={{ type: "spring", stiffness: 95, damping: 20 }}
            whileHover={reduceMotion ? undefined : { scale: 1.012 }}
          >
            <div className="showcase-copy"><span>MANAGER VIEW</span><h3>See readiness before it becomes risk.</h3><p>Live coverage, overdue work and division-level gaps give leaders a clear next action.</p></div>
            <div className="app-screenshot dashboard-shot">
              <div className="shot-sidebar"><b><i>A</i>Alethia</b>{["Overview","My work","Documents","People","Campaigns","Analytics"].map((item,index)=><span className={index===0?"active":""} key={item}>{item}</span>)}</div>
              <div className="shot-app"><div className="shot-top"><span>Northstar Technologies / Overview</span><i>MP</i></div><div className="shot-body"><small>OVERVIEW</small><h4>Good morning, Maya</h4><div className="shot-metrics"><div><span>Alethia Health</span><b>86</b><em>+7 this month</em></div><div><span>Verified people</span><b>92%</b><em>Engineering</em></div><div><span>Open gaps</span><b>4</b><em className="danger">Needs action</em></div></div><div className="shot-panels"><div><b>Readiness by division</b>{[["Engineering","94%"],["Legal & Compliance","88%"],["Operations","76%"]].map(([name,value])=><span key={name}><small>{name}</small><i><em style={{width:value}}/></i><b>{value}</b></span>)}</div><div className="shot-insight"><Sparkles/><small>AI INSIGHT</small><b>Verify 4 people to close the highest-risk gap.</b><button>Review impact <ArrowRight/></button></div></div></div></div>
            </div>
          </motion.article>
          <motion.article
            className="showcase-feature"
            style={reduceMotion ? undefined : { y: sideShotsY }}
            initial={reduceMotion ? false : { opacity: 0, x: 44, rotate: 1.2 }}
            whileInView={{ opacity: 1, x: 0, rotate: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ type: "spring", stiffness: 105, damping: 21, delay: 0.08 }}
            whileHover={reduceMotion ? undefined : { scale: 1.018, rotate: -0.35 }}
          >
            <div className="showcase-copy"><span>AI WORKFLOW</span><h3>Upload once. Generate the action plan.</h3><p>AI extracts requirements, affected roles and cited scenario questions for manager review.</p></div>
            <div className="app-screenshot analysis-shot"><div className="mini-window-bar"><i/><i/><i/><b>Upload approved knowledge</b></div><div className="analysis-result"><span><Sparkles/> Generated with deepseek-v4-flash</span><h4>Secure Deployment Policy</h4><p>Production changes require review, approval, automated checks and a rollback plan.</p><div><b>6</b><small>requirements</small><b>3</b><small>cited questions</small></div><button>Review & assign <ArrowRight/></button></div></div>
          </motion.article>
          <motion.article
            className="showcase-feature"
            style={reduceMotion ? undefined : { y: sideShotsY }}
            initial={reduceMotion ? false : { opacity: 0, x: 44, rotate: -1.2 }}
            whileInView={{ opacity: 1, x: 0, rotate: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ type: "spring", stiffness: 105, damping: 21, delay: 0.16 }}
            whileHover={reduceMotion ? undefined : { scale: 1.018, rotate: 0.35 }}
          >
            <div className="showcase-copy"><span>EMPLOYEE VIEW</span><h3>Prove understanding—not attendance.</h3><p>Employees answer practical questions and instantly receive an auditable score.</p></div>
            <div className="app-screenshot verify-shot"><div className="mini-window-bar"><i/><i/><i/><b>Knowledge verification</b></div><small>QUESTION 3 OF 3</small><h4>What must exist before production deployment?</h4>{["A verbal approval","Passing checks and a rollback plan","A support ticket"].map((item,index)=><span className={index===1?"selected":""} key={item}>{index===1?<CheckCircle2/>:<i/>}{item}</span>)}<div className="score-pop"><b>100%</b><span>Verified</span></div></div>
          </motion.article>
        </div>
        <motion.div
          className="showcase-flow"
          initial={reduceMotion ? false : "hidden"}
          whileInView="visible"
          viewport={{ once: true, amount: 0.65 }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.1 } },
          }}
        >
          {[
            { label: "Manager uploads", copy: "Approved source", icon: FileCheck2 },
            { label: "AI builds evidence", copy: "Cited questions", icon: Sparkles },
            { label: "People verify", copy: "Role-based proof", icon: Users },
            { label: "Readiness rises", copy: "Live risk signal", icon: Activity },
          ].map((item, index) => {
            const StepIcon = item.icon;
            return (
            <span key={item.label} className="showcase-flow-step">
              <motion.span
                tabIndex={0}
                variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }}
                whileHover={reduceMotion ? undefined : { y: -5, scale: 1.025 }}
              >
                <b>{index + 1}</b>
                <i><StepIcon /></i>
                <em><strong>{item.label}</strong><small>{item.copy}</small></em>
              </motion.span>
              {index < 3 && <ArrowRight />}
            </span>
            );
          })}
        </motion.div>
      </motion.section>

      <motion.section className="problem-section" id="problem" {...reveal}>
        <div className="section-heading">
          <span>THE BUSINESS PROBLEM</span>
          <h2>Documents are stored. Readiness is still unknown.</h2>
          <p>
            Traditional knowledge tools stop at publishing. Alethia closes the
            loop between approved knowledge and real employee action.
          </p>
        </div>
        <div className="problem-grid">
          <motion.article
            whileHover={reduceMotion ? undefined : { y: -7, rotate: -0.4 }}
            whileTap={{ scale: 0.99 }}
          >
            <span>01</span>
            <h3>Change is invisible</h3>
            <p>
              Teams cannot reliably identify which policy edits materially
              affect daily work.
            </p>
            <b>
              AI change intelligence <ArrowRight />
            </b>
          </motion.article>
          <motion.article
            whileHover={reduceMotion ? undefined : { y: -7, rotate: 0.4 }}
            whileTap={{ scale: 0.99 }}
          >
            <span>02</span>
            <h3>Broadcast is not learning</h3>
            <p>
              Sending a document cannot prove that the right people understood
              the change.
            </p>
            <b>
              Role-based verification <ArrowRight />
            </b>
          </motion.article>
          <motion.article
            whileHover={reduceMotion ? undefined : { y: -7, rotate: -0.4 }}
            whileTap={{ scale: 0.99 }}
          >
            <span>03</span>
            <h3>Risk arrives too late</h3>
            <p>
              Leaders discover knowledge gaps after missed controls, escalations
              or incidents.
            </p>
            <b>
              Continuous readiness <ArrowRight />
            </b>
          </motion.article>
        </div>
      </motion.section>

      <motion.section
        className="product-story-section"
        id="how-it-works"
        {...reveal}
      >
        <div className="section-heading">
          <span>PRODUCT PITCH · HOW ALETHIA WORKS</span>
          <h2>From scattered knowledge to measurable readiness.</h2>
          <p>
            Alethia creates one accountable operating loop between approved
            company knowledge, the people who must apply it, and the leaders
            responsible for business outcomes.
          </p>
        </div>

        <div className="pitch-problem">
          <div className="pitch-label">PROBLEM STATEMENT</div>
          <div>
            <h3>Companies distribute documents—but cannot prove readiness.</h3>
            <p>
              Policies, SOPs and technical standards change across disconnected
              tools. Employees receive the same broadcast regardless of role,
              leaders cannot see who is affected, and knowledge gaps surface
              only after a missed control, escalation or incident.
            </p>
          </div>
          <div className="pitch-costs">
            <span>
              <b>Slow</b> Manual change review
            </span>
            <span>
              <b>Blind</b> Unknown understanding
            </span>
            <span>
              <b>Risky</b> Reactive remediation
            </span>
          </div>
        </div>

        <div className="pitch-block">
          <div className="pitch-block-head">
            <span>THE FLOW</span>
            <h3>One continuous knowledge-to-action loop</h3>
          </div>
          <div className="pitch-flow">
            {[
              [
                "01",
                "Connect",
                "Bring approved documents and systems into one governed layer.",
              ],
              [
                "02",
                "Understand",
                "AI detects meaningful changes and always links the evidence.",
              ],
              [
                "03",
                "Target",
                "Map each change to the roles and people it actually affects.",
              ],
              [
                "04",
                "Verify",
                "Turn knowledge into learning, scenarios and proof of understanding.",
              ],
              [
                "05",
                "Improve",
                "Convert remaining gaps into owned reminders, campaigns and risk.",
              ],
            ].map(([number, title, copy], index) => (
              <motion.article
                key={title}
                whileHover={reduceMotion ? undefined : { y: -6, scale: 1.015 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
              >
                <span>{number}</span>
                <b>{title}</b>
                <p>{copy}</p>
                {index < 4 && <ArrowRight aria-hidden="true" />}
              </motion.article>
            ))}
          </div>
        </div>

        <div className="pitch-two-column">
          <div className="pitch-block hierarchy-block">
            <div className="pitch-block-head">
              <span>THE HIERARCHY</span>
              <h3>Clear ownership at every layer</h3>
            </div>
            <div className="hierarchy-stack">
              <div>
                <small>BUSINESS OUTCOME</small>
                <b>Organization readiness and reduced operational risk</b>
              </div>
              <i />
              <div>
                <small>ACCOUNTABLE LEADERS</small>
                <b>Managers, Legal and knowledge owners approve and act</b>
              </div>
              <i />
              <div className="hierarchy-core">
                <small>ALETHIA INTELLIGENCE</small>
                <b>
                  Grounded AI connects change, people, learning and evidence
                </b>
              </div>
              <i />
              <div>
                <small>EMPLOYEE ACTION</small>
                <b>Role-specific answers, learning and verification</b>
              </div>
              <i />
              <div>
                <small>TRUSTED FOUNDATION</small>
                <b>Approved policies, SOPs, standards and system knowledge</b>
              </div>
            </div>
          </div>

          <div className="pitch-block solution-block">
            <div className="pitch-block-head">
              <span>THE SOLUTION</span>
              <h3>What Alethia provides</h3>
            </div>
            <div className="solution-list">
              <div>
                <Activity />
                <span>
                  <b>Change intelligence</b>
                  <small>Know exactly what changed and why it matters.</small>
                </span>
              </div>
              <div>
                <Users />
                <span>
                  <b>Impact mapping</b>
                  <small>Know who is affected before assigning work.</small>
                </span>
              </div>
              <div>
                <Bot />
                <span>
                  <b>Trusted AI answers</b>
                  <small>
                    Give every role cited, permission-aware guidance.
                  </small>
                </span>
              </div>
              <div>
                <FileCheck2 />
                <span>
                  <b>Verified understanding</b>
                  <small>
                    Prove people can apply knowledge—not just open it.
                  </small>
                </span>
              </div>
              <div>
                <ShieldCheck />
                <span>
                  <b>Continuous risk action</b>
                  <small>
                    Turn gaps into owned workflows and auditable outcomes.
                  </small>
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="pitch-outcome">
          <span>THE RESULT</span>
          <h3>
            Faster change adoption. Fewer hidden gaps. Evidence-ready
            leadership.
          </h3>
          <Link href="/login" className="marketing-primary">
            See the solution by role <ArrowRight />
          </Link>
        </div>
      </motion.section>

      <motion.section className="ai-section" id="ai" {...reveal}>
        <div className="ai-copy">
          <div className="marketing-kicker dark-kicker">
            <Bot /> Responsible AI by design
          </div>
          <h2>AI that shows its work.</h2>
          <p>
            Alethia does not replace accountable owners. It accelerates bounded
            workflows while keeping every recommendation connected to approved
            knowledge.
          </p>
          <ul>
            <li>
              <ShieldCheck /> Permission-aware retrieval prevents cross-role
              leakage.
            </li>
            <li>
              <Quote /> Every answer includes document, version and source
              section.
            </li>
            <li>
              <Gauge /> Confidence and insufficient evidence are explicit.
            </li>
            <li>
              <Activity /> Every recommendation and decision stays auditable.
            </li>
          </ul>
        </div>
        <motion.div
          className="ai-answer-card"
          initial={reduceMotion ? false : { opacity: 0, x: 35 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
        >
          <small>ASK ALETHIA</small>
          <h3>What changed for privileged access reviews?</h3>
          <div className="answer-bubble">
            <Sparkles />
            <p>
              Privileged customer-data access must now be reviewed every{" "}
              <b>90 days</b>. Managers must keep evidence of approval and
              completion.
            </p>
          </div>
          <div className="source-card">
            <FileCheck2 />
            <div>
              <b>Customer Data Handling Policy v3.0</b>
              <span>Section 4.2 · Access review controls</span>
            </div>
            <em>96% confidence</em>
          </div>
          <p className="ai-boundary">
            AI recommendation · Final accountability remains with the policy
            owner.
          </p>
        </motion.div>
      </motion.section>

      <motion.section className="tour-section" id="tour" {...reveal}>
        <div className="section-heading">
          <span>INTERACTIVE PRODUCT TOUR</span>
          <h2>From policy change to verified action.</h2>
          <p>
            Follow the complete value loop—using the same scenario available in
            the live workspace.
          </p>
        </div>
        <div className="tour-player">
          <div className="tour-screen">
            <div className="tour-chrome">
              <span>
                <i />
                <i />
                <i />
              </span>
              <b>Alethia · {current.label}</b>
              <small>
                SCENE {scene + 1} / {tourScenes.length}
              </small>
            </div>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                className="tour-stage"
                key={scene}
                initial={
                  reduceMotion
                    ? { opacity: 0 }
                    : { opacity: 0, x: 45, scale: 0.98 }
                }
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={
                  reduceMotion
                    ? { opacity: 0 }
                    : { opacity: 0, x: -35, scale: 0.98 }
                }
                transition={{
                  duration: reduceMotion ? 0.01 : 0.32,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <motion.span
                  className="tour-icon"
                  initial={reduceMotion ? false : { rotate: -8, scale: 0.8 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 16 }}
                >
                  <SceneIcon />
                </motion.span>
                <div>
                  <small>{current.label.toUpperCase()}</small>
                  <h3>{current.title}</h3>
                  <p>{current.copy}</p>
                </div>
                <motion.strong
                  initial={reduceMotion ? false : { scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 220,
                    damping: 15,
                    delay: 0.08,
                  }}
                >
                  {current.stat}
                </motion.strong>
              </motion.div>
            </AnimatePresence>
            <button
              className="tour-play"
              onClick={() => setPlaying((value) => !value)}
              aria-label={playing ? "Pause product tour" : "Play product tour"}
            >
              {playing ? <Pause /> : <Play />}
            </button>
          </div>
          <div className="tour-timeline">
            {tourScenes.map((item, index) => (
              <button
                key={item.label}
                className={scene === index ? "active" : ""}
                onClick={() => {
                  setScene(index);
                  setPlaying(false);
                }}
              >
                <span>{index + 1}</span>
                <b>{item.label}</b>
              </button>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section className="impact-section" id="impact" {...reveal}>
        <div className="section-heading light-heading">
          <span>DEMO IMPACT SNAPSHOT</span>
          <h2>One workflow. Measurable operational value.</h2>
        </div>
        <div className="impact-grid">
          <motion.article
            whileHover={reduceMotion ? undefined : { y: -6, scale: 1.015 }}
          >
            <strong>40</strong>
            <span>affected employees mapped automatically</span>
          </motion.article>
          <motion.article
            whileHover={reduceMotion ? undefined : { y: -6, scale: 1.015 }}
          >
            <strong>85%</strong>
            <span>verification coverage visible in real time</span>
          </motion.article>
          <motion.article
            whileHover={reduceMotion ? undefined : { y: -6, scale: 1.015 }}
          >
            <strong>6</strong>
            <span>knowledge gaps converted into owned actions</span>
          </motion.article>
          <motion.article
            whileHover={reduceMotion ? undefined : { y: -6, scale: 1.015 }}
          >
            <strong>100%</strong>
            <span>AI answers linked to approved sources</span>
          </motion.article>
        </div>
        <div className="impact-quote">
          <Quote />
          <blockquote>
            “Alethia changes the leadership question from ‘Did we send the
            policy?’ to ‘Can our people act on it?’”
          </blockquote>
          <span>Competition demo thesis</span>
        </div>
      </motion.section>

      <motion.section className="marketing-cta" {...reveal}>
        <span className="marketing-kicker">
          <Sparkles /> Ready to explore?
        </span>
        <h2>Experience Alethia from every role.</h2>
        <p>
          Choose a manager, legal, developer or employee persona and see how one
          trusted knowledge layer changes the work.
        </p>
        <Link href="/login" className="marketing-primary">
          Enter the live demo <ArrowRight />
        </Link>
      </motion.section>
      <footer className="marketing-footer">
        <div className="marketing-brand">
          <span>A</span>
          <b>Alethia</b>
        </div>
        <p>Trusted knowledge. Verified people.</p>
        <span>Competition build · 2026</span>
      </footer>
    </main>
  );
}
