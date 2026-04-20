"use client";

import React, { useState } from "react";
import {
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  Check,
  Star,
  ArrowRight,
  Users,
  Calendar,
  BarChart3,
  Shield,
  Zap,
  Globe,
  Clock,
  CreditCard,
  FileText,
  Bot,
  BrainCircuit,
  Building2,
  TrendingUp,
  Layers,
  Settings,
  UserCheck,
  Award,
  Slack,
  Video,
  MessageSquare,
  Database,
  Lock,
  Cloud,
  Server,
  Eye,
  RefreshCw,
  CheckCircle2,
  ChevronUp,
  
} from "lucide-react";
import Link from "next/link";
// ── Navbar ────────────────────────────────────────────────────────────────────
function Navbar() {
  const [open, setOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const navLinks = [
    { label: "Features", dropdown: ["Employee Management", "Attendance", "Leave", "Payroll", "Performance", "Reports"] },
    { label: "Modules", dropdown: ["HR Module", "Recruitment", "Time Tracking", "Payroll Suite", "Analytics"] },
    { label: "AI Features", dropdown: ["AI Setup Wizard", "AI Payroll Assistant", "AI Attendance", "AI Recruitment", "Predictive Analytics"] },
    // { label: "Pricing", href: "#pricing" },
    { label: "About", href: "#about" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#0445AD] rounded-lg flex items-center justify-center">
              <Layers className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">HRFlow</span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <div key={link.label} className="relative">
                {link.href ? (
                  <a href={link.href} className="px-3 py-2 text-sm text-gray-600 hover:text-[#0445AD] font-medium rounded-lg hover:bg-gray-50 transition">
                    {link.label}
                  </a>
                ) : (
                  <button
                    onMouseEnter={() => setActiveDropdown(link.label)}
                    onMouseLeave={() => setActiveDropdown(null)}
                    className="px-3 py-2 text-sm text-gray-600 hover:text-[#0445AD] font-medium rounded-lg hover:bg-gray-50 transition flex items-center gap-1"
                  >
                    {link.label}
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                )}
                {link.dropdown && activeDropdown === link.label && (
                  <div className="absolute top-full left-0 mt-1 w-52 bg-white border border-gray-100 rounded-xl shadow-lg py-2 animate-fade-in">
                    {link.dropdown.map((item) => (
                      <a key={item} href="#" className="block px-4 py-2 text-sm text-gray-600 hover:text-[#0445AD] hover:bg-gray-50 transition">
                        {item}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <Link href="/login" className="hidden lg:flex items-center gap-3">
            <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-[#0445AD] transition">Login</button>
            <button className="px-4 py-2 text-sm font-medium text-[#0445AD] border border-[#0445AD]/20 rounded-lg hover:bg-[#0445AD]/5 transition">
              Book Demo
            </button>
            <button className="px-4 py-2 text-sm font-semibold text-white bg-[#0445AD] rounded-lg hover:bg-[#033591] transition shadow-sm shadow-[#0445AD]/20">
              Get Started
            </button>
          </Link>

          {/* Mobile Menu Toggle */}
          <button onClick={() => setOpen(!open)} className="lg:hidden p-2 text-gray-600">
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="lg:hidden bg-white border-t border-gray-100 px-6 py-4 space-y-1">
          {navLinks.map((link) => (
            <a key={link.label} href={link.href || "#"} className="block px-4 py-3 text-sm text-gray-700 hover:text-[#0445AD] hover:bg-gray-50 rounded-lg transition">
              {link.label}
            </a>
          ))}
          <div className="pt-4 flex flex-col gap-2">
            <button className="w-full px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg">Login</button>
            <button className="w-full px-4 py-2 text-sm font-semibold text-white bg-[#0445AD] rounded-lg">Get Started Free</button>
          </div>
        </div>
      )}
    </nav>
  );
}

// ── Hero Section ───────────────────────────────────────────────────────────────
function HeroSection() {
  return (
    <section className="relative bg-white overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 right-0 w-96 h-96 bg-[#0445AD]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-0 w-72 h-72 bg-blue-100/40 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-20 lg:py-28">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#0445AD]/10 rounded-full text-xs font-semibold text-[#0445AD]">
              <Sparkles className="w-3.5 h-3.5" />
              AI-Powered HR Management Platform
            </div>
            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 leading-tight">
              Automate Your HR,
              <br />
              <span className="text-[#0445AD]">Scale Your People</span>
            </h1>
            <p className="text-lg text-gray-500 leading-relaxed max-w-lg">
              From onboarding to payroll — manage your entire workforce from one intelligent, AI-powered platform that saves 80% of your HR time.
            </p>
            <Link href='/login' className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <button className="flex items-center gap-2 px-6 py-3 bg-[#0445AD] text-white font-semibold rounded-xl hover:bg-[#033591] transition shadow-lg shadow-[#0445AD]/25 text-sm">
                Start Free Trial <ArrowRight className="w-4 h-4" />
              </button>
              <button className="flex items-center gap-2 px-6 py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:border-[#0445AD] hover:text-[#0445AD] transition text-sm">
                <PlayCircle className="w-4 h-4" /> Book Demo
              </button>
            </Link>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <div className="flex -space-x-2">
                {["bg-blue-500", "bg-green-500", "bg-orange-400", "bg-purple-500"].map((c, i) => (
                  <div key={i} className={`w-8 h-8 rounded-full border-2 border-white ${c}`} />
                ))}
              </div>
              <span>Trusted by <strong className="text-gray-700">500+ companies</strong></span>
            </div>
          </div>

          {/* Right: Dashboard Preview */}
          <div className="relative">
            <div className="bg-white rounded-2xl shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
              {/* Browser Header */}
              <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-100">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 mx-4">
                  <div className="bg-white border border-gray-200 rounded-md px-3 py-1 text-xs text-gray-400">app.hrflow.io/dashboard</div>
                </div>
              </div>
              {/* Dashboard Content */}
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-800">HR Dashboard</p>
                  <span className="text-xs text-gray-400">April 2026</span>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { label: "Employees", value: "248", change: "+12%", color: "text-blue-600 bg-blue-50" },
                    { label: "Attendance", value: "96%", change: "+2%", color: "text-green-600 bg-green-50" },
                    { label: "Leave Pending", value: "18", change: "-5", color: "text-orange-600 bg-orange-50" },
                    { label: "Payroll", value: "₹28.4L", change: "Ready", color: "text-purple-600 bg-purple-50" },
                  ].map((kpi) => (
                    <div key={kpi.label} className={`rounded-xl p-3 ${kpi.color}`}>
                      <p className="text-xs opacity-70 font-medium">{kpi.label}</p>
                      <p className="text-lg font-bold mt-0.5">{kpi.value}</p>
                      <p className="text-[10px] font-medium mt-0.5 opacity-80">{kpi.change}</p>
                    </div>
                  ))}
                </div>
                {/* Mini Chart */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs font-semibold text-gray-500 mb-3">Monthly Payroll Trend</p>
                  <div className="flex items-end gap-2 h-16">
                    {[40, 55, 45, 70, 65, 80, 75, 90, 85, 95, 88, 100].map((h, i) => (
                      <div key={i} className="flex-1 bg-[#0445AD]/20 rounded-sm" style={{ height: `${h}%` }}>
                        <div className="w-full bg-[#0445AD] rounded-sm" style={{ height: `${h * 0.8}%` }} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            {/* Floating Cards */}
            <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg border border-gray-100 px-4 py-3 flex items-center gap-3 animate-float">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-800">Payroll Processed</p>
                <p className="text-[10px] text-gray-400">March 2026 • 248 employees</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Social Proof ───────────────────────────────────────────────────────────────
function SocialProof() {
  return (
    <section className="bg-gray-50 py-12 border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-6">
        <p className="text-center text-xs font-semibold text-gray-400 uppercase tracking-widest mb-8">Trusted by leading companies</p>
        <div className="flex flex-wrap items-center justify-center gap-8 lg:gap-16 opacity-50">
          {["TCS", "Infosys", "Wipro", "Accenture", "Deloitte", "HDFC Bank", "Flipkart"].map((brand) => (
            <span key={brand} className="text-sm lg:text-base font-bold text-gray-400 tracking-wide">{brand}</span>
          ))}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 max-w-3xl mx-auto">
          {[
            { value: "500+", label: "Companies" },
            { value: "50K+", label: "Employees" },
            { value: "99.9%", label: "Uptime" },
            { value: "4.9/5", label: "User Rating" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-400 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Problem vs Solution ───────────────────────────────────────────────────────
function ProblemSolution() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-14">
          <p className="text-xs font-semibold text-[#0445AD] uppercase tracking-widest mb-2">Why HRFlow?</p>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">Outdated HR Processes Are Costing You</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Problem */}
          <div className="bg-red-50 border border-red-100 rounded-2xl p-8 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <X className="w-4 h-4 text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-red-700">Without HRFlow</h3>
            </div>
            {[
              "Spreadsheets & manual payroll causing 30% errors",
              "Attendance tracking with paper timesheets",
              "Leave requests lost in email threads",
              "No central employee database",
              "Compliance risks and missed deadlines",
              "Disconnected HR tools costing 10x more",
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <X className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                <p className="text-sm text-red-700/80">{item}</p>
              </div>
            ))}
          </div>
          {/* Solution */}
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-8 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Check className="w-4 h-4 text-[#0445AD]" />
              </div>
              <h3 className="text-lg font-bold text-[#0445AD]">With HRFlow</h3>
            </div>
            {[
              "Automated payroll with zero errors",
              "AI-powered attendance & geofencing",
              "One-click leave approvals via mobile",
              "Single source of truth for all employee data",
              "Built-in compliance & audit trails",
              "All-in-one platform at 1/10th the cost",
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <Check className="w-4 h-4 text-[#0445AD] mt-0.5 shrink-0" />
                <p className="text-sm text-blue-700/80">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Core Features ─────────────────────────────────────────────────────────────
function CoreFeatures() {
  const features = [
    { icon: Users, title: "Employee Management", desc: "Complete employee lifecycle from onboarding to offboarding. Digital documentation, org charts, and profiles.", color: "bg-blue-50 text-blue-600" },
    { icon: Clock, title: "Attendance & Time", desc: "AI-powered facial recognition, geofencing, and smart clock-in/out. Integrates with shift schedules.", color: "bg-green-50 text-green-600" },
    { icon: Calendar, title: "Leave Management", desc: "Smart leave policies, auto-balance, calendar sync, and mobile request-approval workflows.", color: "bg-purple-50 text-purple-600" },
    { icon: CreditCard, title: "Payroll Automation", desc: "Automated salary calculations, tax deductions, bank transfers, and compliance reports.", color: "bg-orange-50 text-orange-600" },
    { icon: TrendingUp, title: "Performance Reviews", desc: "Goal tracking, OKRs, 360° feedback, and performance improvement plans with analytics.", color: "bg-pink-50 text-pink-600" },
    { icon: BarChart3, title: "Reports & Analytics", desc: "Real-time dashboards, custom reports, trend analysis, and exportable insights for all modules.", color: "bg-cyan-50 text-cyan-600" },
    { icon: UserCheck, title: "Recruitment", desc: "End-to-end applicant tracking, job postings, resume parsing, interview scheduling, and offer letters.", color: "bg-yellow-50 text-yellow-600" },
    { icon: Shield, title: "Compliance & Security", desc: "Role-based access, GDPR/CLPR compliance, audit logs, encrypted data, and SSO integration.", color: "bg-indigo-50 text-indigo-600" },
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-14">
          <p className="text-xs font-semibold text-[#0445AD] uppercase tracking-widest mb-2">Modules</p>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">Everything Your HR Team Needs</h2>
          <p className="text-gray-400 mt-3 max-w-md mx-auto">From recruitment to retirement, every HR function in one intelligent platform.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f) => (
            <div key={f.title} className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-[#0445AD]/20 hover:shadow-lg hover:shadow-[#0445AD]/5 transition-all group cursor-pointer">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${f.color}`}>
                <f.icon className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-gray-800 mb-2">{f.title}</h3>
              <p className="text-xs text-gray-400 leading-relaxed">{f.desc}</p>
              <div className="mt-4 flex items-center gap-1 text-xs font-medium text-[#0445AD] opacity-0 group-hover:opacity-100 transition">
                Learn more <ChevronRight className="w-3 h-3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── AI Features Section ───────────────────────────────────────────────────────
function AIFeatures() {
  const aiFeatures = [
    { icon: BrainCircuit, title: "AI Setup Wizard", desc: "Get started in minutes. AI guides you through org structure, policies, and payroll configuration automatically." },
    { icon: Bot, title: "AI Payroll Assistant", desc: "Auto-calculates complex payroll rules, handles tax variations, and flags anomalies before processing." },
    { icon: Zap, title: "AI Attendance Intelligence", desc: "Facial recognition, geofencing, and anomaly detection. Handles exceptions without manual intervention." },
    { icon: UserCheck, title: "AI Recruitment Assistant", desc: "Resume screening, candidate ranking, interview questions, and bias-free shortlisting powered by AI." },
    { icon: MessageSquare, title: "AI Chatbot", desc: "Employees get instant answers on leave balances, policies, payroll queries — 24/7 in multiple languages." },
    { icon: TrendingUp, title: "Predictive Analytics", desc: "Forecast turnover risk, hiring needs, headcount planning, and compensation trends with ML models." },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-100 rounded-full text-xs font-semibold text-purple-700 mb-4">
              <Sparkles className="w-3.5 h-3.5" /> AI-Powered
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Your AI HR Co-Pilot
            </h2>
            <p className="text-gray-500 leading-relaxed mb-8">
              HRFlow's AI doesn't just automate — it thinks. From predictive analytics to intelligent automation, our AI handles the complexity so your HR team can focus on people.
            </p>
            <div className="space-y-4">
              {aiFeatures.map((f) => (
                <div key={f.title} className="flex items-start gap-4 group">
                  <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-purple-100 transition">
                    <f.icon className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-800">{f.title}</h4>
                    <p className="text-xs text-gray-400 mt-0.5">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-8 border border-purple-100">
              <div className="space-y-4">
                {[
                  { label: "Turnover Risk", score: 87, color: "bg-red-400" },
                  { label: "Attendance Anomaly", score: 72, color: "bg-yellow-400" },
                  { label: "Payroll Accuracy", score: 98, color: "bg-green-400" },
                  { label: "Compliance Score", score: 95, color: "bg-blue-400" },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-gray-600">{item.label}</span>
                      <span className="text-xs font-bold text-gray-800">{item.score}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className={`h-2 rounded-full ${item.color}`} style={{ width: `${item.score}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 bg-white rounded-xl border border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <BrainCircuit className="w-4 h-4 text-purple-600" />
                  <span className="text-xs font-bold text-gray-700">AI Insight</span>
                </div>
                <p className="text-xs text-gray-500">2 employees show 40% absenteeism pattern. Consider a wellness check-in. — 98% confidence</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Module Details ─────────────────────────────────────────────────────────────
function ModuleDetails() {
  const [openModule, setOpenModule] = useState<string | null>("hr");

  const modules = [
    {
      id: "hr",
      icon: Users,
      color: "bg-blue-50 text-blue-600",
      title: "HR Management",
      subtitle: "Complete employee lifecycle",
      desc: "Digitize every HR process from hire to retire. Manage documents, performance cycles, promotions, and employee self-service — all in one place.",
      features: ["Digital employee onboarding", "Document management", "Org chart builder", "Employee self-service portal", "Exit management"],
      benefits: ["Reduce onboarding time by 60%", "Eliminate paper-based processes", "One-click access to employee records"],
    },
    {
      id: "attendance",
      icon: Clock,
      color: "bg-green-50 text-green-600",
      title: "Attendance & Time",
      subtitle: "Smart time tracking",
      desc: "Track employee time with AI-powered facial recognition, geofencing, and shift management. Automatic overtime calculations and compliance.",
      features: ["Facial recognition clock-in", "GPS geofencing", "Shift scheduling", "Overtime auto-calculation", "Mobile clock-in/out"],
      benefits: ["100% attendance accuracy", "Eliminates buddy punching", "Real-time shift updates"],
    },
    {
      id: "leave",
      icon: Calendar,
      color: "bg-purple-50 text-purple-600",
      title: "Leave Management",
      subtitle: "Automated leave workflows",
      desc: "Define policies, automate accruals, and streamline approvals. Employees request from mobile, managers approve in one click.",
      features: ["Custom leave policies", "Auto balance accrual", "Calendar integration", "Mobile request/approve", "Holiday calendar"],
      benefits: ["Zero manual leave calculations", "Manager approval < 2 min", "Policy violation alerts"],
    },
    {
      id: "payroll",
      icon: CreditCard,
      color: "bg-orange-50 text-orange-600",
      title: "Payroll Suite",
      subtitle: "Zero-error automated payroll",
      desc: "Process payroll in minutes, not days. Auto-calculate CTC, deductions, taxes, and generate payslips. Full compliance with statutory requirements.",
      features: ["Multi-state payroll", "Auto tax calculations", "Bank transfer processing", "Payslip generation", "Form 16 automation"],
      benefits: ["100% payroll accuracy", "Process payroll in 5 minutes", "TDS/PT/ESI auto-compliance"],
    },
  ];

  const active = modules.find((m) => m.id === openModule) || modules[0];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-14">
          <p className="text-xs font-semibold text-[#0445AD] uppercase tracking-widest mb-2">Deep Dive</p>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">Module-by-Module Power</h2>
        </div>
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Module Tabs */}
          <div className="lg:col-span-2 space-y-3">
            {modules.map((m) => (
              <button
                key={m.id}
                onClick={() => setOpenModule(m.id)}
                className={`w-full text-left flex items-center gap-4 p-4 rounded-xl border transition-all ${
                  openModule === m.id
                    ? "bg-white border-[#0445AD]/30 shadow-md shadow-[#0445AD]/5"
                    : "bg-white/50 border-gray-100 hover:border-gray-200"
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${m.color}`}>
                  <m.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800">{m.title}</p>
                  <p className="text-xs text-gray-400">{m.subtitle}</p>
                </div>
                {openModule === m.id && <ChevronRight className="w-4 h-4 text-[#0445AD] ml-auto" />}
              </button>
            ))}
          </div>
          {/* Module Detail */}
          <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${active.color}`}>
                <active.icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">{active.title}</h3>
                <p className="text-sm text-gray-400">{active.subtitle}</p>
              </div>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed mb-6">{active.desc}</p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase mb-2">Features</p>
                {active.features.map((f) => (
                  <div key={f} className="flex items-center gap-2 mb-1.5">
                    <Check className="w-3.5 h-3.5 text-green-500" />
                    <span className="text-xs text-gray-600">{f}</span>
                  </div>
                ))}
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase mb-2">Benefits</p>
                {active.benefits.map((b) => (
                  <div key={b} className="flex items-center gap-2 mb-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-[#0445AD]" />
                    <span className="text-xs text-gray-600">{b}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Role-Based Experience ───────────────────────────────────────────────────────
function RoleBased() {
  const roles = [
    {
      label: "Super Admin",
      desc: "Full platform control across all organizations",
      color: "bg-gray-900 text-white",
      actions: ["Multi-org management", "Billing & subscription", "Platform settings", "Audit all actions", "User provisioning"],
      icon: Settings,
    },
    {
      label: "Company Admin",
      desc: "Organization-level control and compliance",
      color: "bg-[#0445AD] text-white",
      actions: ["Company settings", "Department management", "Policy configuration", "Compliance reports", "User roles"],
      icon: Building2,
    },
    {
      label: "HR Manager",
      desc: "Day-to-day HR operations and people management",
      color: "bg-white text-gray-800 border border-gray-200",
      actions: ["Employee management", "Leave approvals", "Payroll processing", "Performance reviews", "Recruitment pipeline"],
      icon: UserCheck,
    },
    {
      label: "Employee",
      desc: "Self-service access to personal HR information",
      color: "bg-white text-gray-800 border border-gray-200",
      actions: ["View payslips", "Apply for leave", "Update profile", "Check attendance", "Announcements"],
      icon: Award,
    },
  ];
  const [activeRole, setActiveRole] = useState(0);
  const activeRoleData = roles[activeRole];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-14">
          <p className="text-xs font-semibold text-[#0445AD] uppercase tracking-widest mb-2">Role-Based Access</p>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">Built for Every Stakeholder</h2>
        </div>
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {roles.map((r, i) => (
            <button
              key={r.label}
              onClick={() => setActiveRole(i)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all border ${
                activeRole === i
                  ? `${r.color} border-transparent shadow-md`
                  : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
        <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${activeRoleData.color}`}>
              <activeRoleData.icon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">{activeRoleData.label}</h3>
              <p className="text-sm text-gray-400">{activeRoleData.desc}</p>
            </div>
          </div>
          <div className="grid sm:grid-cols-5 gap-3">
            {activeRoleData.actions.map((action) => (
              <div key={action} className="bg-white rounded-xl p-4 border border-gray-100 text-center">
                <CheckCircle2 className="w-5 h-5 text-[#0445AD] mx-auto mb-2" />
                <p className="text-xs font-medium text-gray-700">{action}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Integrations Section ───────────────────────────────────────────────────────
function Integrations() {
  const integrations = [
    { name: "Google Workspace", icon: Globe, category: "Productivity" },
    { name: "Microsoft 365", icon: Building2, category: "Productivity" },
    { name: "Slack", icon: Slack, category: "Communication" },
    { name: "Zoom", icon: Video, category: "Meetings" },
    { name: "WhatsApp", icon: MessageSquare, category: "Communication" },
    { name: "REST API", icon: Database, category: "Developer" },
    { name: "SSO / SAML", icon: Lock, category: "Security" },
    { name: "Tally", icon: CreditCard, category: "Accounting" },
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-14">
          <p className="text-xs font-semibold text-[#0445AD] uppercase tracking-widest mb-2">Integrations</p>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">Connects with Your Stack</h2>
          <p className="text-gray-400 mt-3">Works with the tools your team already uses. Open REST API for custom integrations.</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {integrations.map((int) => (
            <div key={int.name} className="bg-white rounded-xl p-6 border border-gray-100 hover:border-[#0445AD]/20 hover:shadow-lg transition text-center group">
              <int.icon className="w-8 h-8 text-gray-400 mx-auto mb-3 group-hover:text-[#0445AD] transition" />
              <p className="text-sm font-semibold text-gray-700">{int.name}</p>
              <p className="text-xs text-gray-400 mt-1">{int.category}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Security & Compliance ──────────────────────────────────────────────────────
function SecurityCompliance() {
  const features = [
    { icon: Lock, title: "AES-256 Encryption", desc: "All data encrypted at rest and in transit with bank-grade AES-256 encryption." },
    { icon: Shield, title: "Role-Based Access", desc: "Granular permissions per module, field, and action. No data leakage." },
    { icon: Eye, title: "Audit Trails", desc: "Every action logged with user, timestamp, IP, and before/after state." },
    { icon: Cloud, title: "99.9% Uptime SLA", desc: "Hosted on AWS with multi-zone redundancy. 99.9% uptime guaranteed." },
    { icon: Server, title: "Daily Backups", desc: "Automated daily backups with 30-day retention and point-in-time restore." },
    { icon: RefreshCw, title: "99.9% Uptime SLA", desc: "Hosted on AWS with multi-zone redundancy. 99.9% uptime guaranteed." },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          <div>
            <p className="text-xs font-semibold text-[#0445AD] uppercase tracking-widest mb-2">Security</p>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Enterprise-Grade Security</h2>
            <p className="text-gray-500 leading-relaxed mb-8">Built on security-first principles. HRFlow is trusted by banks, NBFCs, and enterprises for sensitive employee data.</p>
            <div className="space-y-5">
              {features.slice(0, 3).map((f) => (
                <div key={f.title} className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-[#0445AD]/10 rounded-xl flex items-center justify-center shrink-0">
                    <f.icon className="w-5 h-5 text-[#0445AD]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-800">{f.title}</h4>
                    <p className="text-xs text-gray-400 mt-0.5">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {features.slice(3).map((f) => (
              <div key={f.title} className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                <f.icon className="w-6 h-6 text-[#0445AD] mb-3" />
                <h4 className="text-sm font-bold text-gray-800 mb-1">{f.title}</h4>
                <p className="text-xs text-gray-400">{f.desc}</p>
              </div>
            ))}
            <div className="bg-[#0445AD] rounded-xl p-5 text-white col-span-2">
              <Shield className="w-6 h-6 mb-3 opacity-80" />
              <h4 className="text-sm font-bold mb-1">ISO 27001 Certified</h4>
              <p className="text-xs opacity-70">Fully compliant with ISO 27001, SOC 2 Type II, and GDPR standards.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── SaaS Benefits ─────────────────────────────────────────────────────────────
function SaaSBenefits() {
  const benefits = [
    { icon: Cloud, title: "Cloud-Native", desc: "No installation. Access from any device, anywhere. Auto-updates included." },
    { icon: Layers, title: "Scalable", desc: "From 5 to 50,000 employees. Pay only for what you use, no hidden costs." },
    { icon: Globe, title: "Multi-Tenant", desc: "Separate data per organization. Full isolation with shared infrastructure." },
    { icon: Zap, title: "Instant Setup", desc: "Go live in 1 day. AI wizard handles migration, data import, and configuration." },
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((b) => (
            <div key={b.title} className="bg-white rounded-2xl p-6 border border-gray-100 text-center hover:shadow-lg transition">
              <div className="w-12 h-12 bg-[#0445AD]/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <b.icon className="w-6 h-6 text-[#0445AD]" />
              </div>
              <h3 className="text-sm font-bold text-gray-800 mb-2">{b.title}</h3>
              <p className="text-xs text-gray-400">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Pricing Section ────────────────────────────────────────────────────────────
// function Pricing() {
//   const [annual, setAnnual] = useState(true);
//   const plans = [
//     {
//       name: "Starter",
//       desc: "Perfect for small teams getting started",
//       monthlyPrice: "₹99",
//       annualPrice: "₹79",
//       priceNote: "per employee / month",
//       color: "bg-gray-50 border-gray-200",
//       features: ["Up to 50 employees", "Core HR module", "Attendance & leave", "Employee self-service", "Email support", "5 GB storage"],
//       cta: "Start Free Trial",
//       highlight: false,
//     },
//     {
//       name: "Growth",
//       desc: "Best for growing companies scaling fast",
//       monthlyPrice: "₹199",
//       annualPrice: "₹159",
//       priceNote: "per employee / month",
//       color: "bg-[#0445AD] text-white",
//       features: ["Up to 500 employees", "All Starter features", "Payroll automation", "AI attendance", "Performance module", "Custom reports", "Priority support", "50 GB storage"],
//       cta: "Start Free Trial",
//       highlight: true,
//     },
//     {
//       name: "Enterprise",
//       desc: "For large organizations with complex needs",
//       monthlyPrice: "Custom",
//       annualPrice: "Custom",
//       priceNote: "unlimited employees",
//       color: "bg-gray-900 text-white",
//       features: ["Unlimited employees", "All Growth features", "Multi-location support", "Custom integrations", "SSO & SAML", "Dedicated CSM", "SLA guarantee", "Unlimited storage"],
//       cta: "Contact Sales",
//       highlight: false,
//     },
//   ];

//   return (
//     <section id="pricing" className="py-20 bg-white">
//       <div className="max-w-7xl mx-auto px-6">
//         <div className="text-center mb-10">
//           <p className="text-xs font-semibold text-[#0445AD] uppercase tracking-widest mb-2">Pricing</p>
//           <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">Simple, Transparent Pricing</h2>
//           <div className="flex items-center justify-center gap-3 mt-6">
//             <span className={`text-sm font-medium ${!annual ? "text-gray-900" : "text-gray-400"}`}>Monthly</span>
//             <button onClick={() => setAnnual(!annual)} className={`w-12 h-6 rounded-full transition relative ${annual ? "bg-[#0445AD]" : "bg-gray-300"}`}>
//               <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${annual ? "left-6.5" : "left-0.5"}`} />
//             </button>
//             <span className={`text-sm font-medium ${annual ? "text-gray-900" : "text-gray-400"}`}>Annual</span>
//             <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Save 20%</span>
//           </div>
//         </div>
//         <div className="grid md:grid-cols-3 gap-6">
//           {plans.map((plan) => (
//             <div key={plan.name} className={`rounded-2xl p-8 border ${plan.highlight ? "ring-2 ring-[#0445AD] shadow-xl shadow-[#0445AD]/10" : plan.color} ${!plan.highlight && plan.name !== "Enterprise" ? "bg-gray-50 border-gray-200" : ""}`}>
//               {plan.highlight && (
//                 <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-white/20 rounded-full text-xs font-semibold mb-3 text-white">
//                   <Star className="w-3 h-3" /> Most Popular
//                 </div>
//               )}
//               <h3 className={`text-lg font-bold mb-1 ${plan.highlight ? "text-white" : plan.name === "Enterprise" ? "text-white" : "text-gray-900"}`}>{plan.name}</h3>
//               <p className={`text-xs mb-5 ${plan.highlight ? "text-white/70" : plan.name === "Enterprise" ? "text-white/70" : "text-gray-400"}`}>{plan.desc}</p>
//               <div className="mb-6">
//                 <span className={`text-3xl font-bold ${plan.highlight ? "text-white" : plan.name === "Enterprise" ? "text-white" : "text-gray-900"}`}>
//                   {annual ? plan.annualPrice : plan.monthlyPrice}
//                 </span>
//                 {plan.name !== "Enterprise" && (
//                   <span className={`text-xs ml-1 ${plan.highlight ? "text-white/70" : plan.name === "Enterprise" ? "text-white/70" : "text-gray-400"}`}>{plan.priceNote}</span>
//                 )}
//               </div>
//               <ul className="space-y-2.5 mb-8">
//                 {plan.features.map((f) => (
//                   <li key={f} className={`flex items-center gap-2 text-xs ${plan.highlight ? "text-white/90" : plan.name === "Enterprise" ? "text-white/90" : "text-gray-600"}`}>
//                     <Check className={`w-4 h-4 shrink-0 ${plan.highlight ? "text-white" : "text-[#0445AD]"}`} />
//                     {f}
//                   </li>
//                 ))}
//               </ul>
//               <button className={`w-full py-3 rounded-xl font-semibold text-sm transition ${plan.highlight ? "bg-white text-[#0445AD] hover:bg-gray-50" : plan.name === "Enterprise" ? "bg-white text-gray-900 hover:bg-gray-50" : "bg-[#0445AD] text-white hover:bg-[#033591]"}`}>
//                 {plan.cta}
//               </button>
//             </div>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// }

// ── Testimonials ───────────────────────────────────────────────────────────────
function Testimonials() {
  const reviews = [
    {
      name: "Priya Sharma",
      role: "Head of HR",
      company: "TechNova Solutions",
      content: "HRFlow reduced our payroll processing time from 3 days to 30 minutes. The AI insights on attendance patterns have been a game-changer for our operations.",
      rating: 5,
    },
    {
      name: "Rajesh Kumar",
      role: "CEO",
      company: "FinServe India",
      content: "We evaluated 6 HRMS platforms before choosing HRFlow. The compliance automation and multi-state payroll support is exactly what a fintech company needs.",
      rating: 5,
    },
    {
      name: "Anita Desai",
      role: "HR Manager",
      company: "RetailMax",
      content: "Leave management went from chaos to one-click approvals. My team saves 15+ hours every month. The mobile app is loved by our field staff.",
      rating: 5,
    },
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-14">
          <p className="text-xs font-semibold text-[#0445AD] uppercase tracking-widest mb-2">Testimonials</p>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">Loved by HR Teams Across India</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {reviews.map((r) => (
            <div key={r.name} className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition">
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: r.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <p className="text-sm text-gray-600 leading-relaxed mb-5">"{r.content}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#0445AD]/10 rounded-full flex items-center justify-center text-sm font-bold text-[#0445AD]">
                  {r.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{r.name}</p>
                  <p className="text-xs text-gray-400">{r.role}, {r.company}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── FAQ Section ────────────────────────────────────────────────────────────────
function FAQ() {
  const [open, setOpen] = useState<string | null>(null);
  const faqs = [
    { q: "How long does implementation take?", a: "Most organizations are fully operational within 1-3 days. Our AI Setup Wizard automates 80% of the configuration, and our onboarding team handles data migration, employee import, and training." },
    { q: "Can HRFlow handle complex payroll rules?", a: "Yes. HRFlow supports multi-state payroll, complex deduction rules, variable pay, bonus structures, and full statutory compliance (TDS, PF, ESI, PT). Our AI Payroll Assistant flags anomalies before processing." },
    { q: "Is our employee data secure?", a: "Absolutely. We use AES-256 encryption at rest and in transit, ISO 27001 certified, SOC 2 Type II compliant, with daily backups and role-based access. No employee data is shared with third parties." },
    { q: "Can employees use it on mobile?", a: "Yes. HRFlow has a fully-featured mobile app (iOS & Android) where employees can view payslips, apply for leave, check attendance, and receive announcements. Managers can approve requests on the go." },
    { q: "Do you offer a free trial?", a: "Yes — 14 days free with full access to all features. No credit card required. You can import your employee data and go live without any commitment." },
    { q: "What integrations do you support?", a: "We integrate with Google Workspace, Microsoft 365, Slack, Zoom, WhatsApp Business, Tally, and offer a comprehensive REST API for custom integrations. SSO with SAML 2.0 is available on Growth and Enterprise plans." },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-14">
          <p className="text-xs font-semibold text-[#0445AD] uppercase tracking-widest mb-2">FAQ</p>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">Frequently Asked Questions</h2>
        </div>
        <div className="space-y-3">
          {faqs.map((faq) => (
            <div key={faq.q} className={`border rounded-xl transition ${open === faq.q ? "border-[#0445AD]/30 bg-[#0445AD]/5" : "border-gray-100 bg-gray-50"}`}>
              <button
                onClick={() => setOpen(open === faq.q ? null : faq.q)}
                className="w-full flex items-center justify-between px-6 py-4 text-left"
              >
                <span className="text-sm font-semibold text-gray-800">{faq.q}</span>
                {open === faq.q ? <ChevronUp className="w-4 h-4 text-[#0445AD] shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}
              </button>
              {open === faq.q && <p className="px-6 pb-5 text-sm text-gray-500 leading-relaxed">{faq.a}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Final CTA ──────────────────────────────────────────────────────────────────
function FinalCTA() {
  return (
    <section className="py-20 bg-[#0445AD]">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
          Ready to Transform Your HR Operations?
        </h2>
        <p className="text-white/70 text-lg mb-8 max-w-2xl mx-auto">
          Join 500+ companies using HRFlow to automate payroll, simplify leave management, and give their HR team their time back.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button className="flex items-center gap-2 px-8 py-4 bg-white text-[#0445AD] font-bold rounded-xl hover:bg-gray-50 transition shadow-lg text-sm">
            Start Free 14-Day Trial <ArrowRight className="w-4 h-4" />
          </button>
          <button className="flex items-center gap-2 px-8 py-4 border border-white/30 text-white font-semibold rounded-xl hover:bg-white/10 transition text-sm">
            Book a Demo
          </button>
        </div>
        <p className="text-white/50 text-xs mt-6">No credit card required • Free migration support • Cancel anytime</p>
      </div>
    </section>
  );
}

// ── Footer ─────────────────────────────────────────────────────────────────────
function Footer() {
  const columns = [
    {
      title: "Product",
      links: ["Employee Management", "Attendance & Time", "Leave Management", "Payroll Suite", "Performance Reviews", "Reports & Analytics"],
    },
    {
      title: "Company",
      links: ["About Us", "Careers", "Blog", "Press", "Contact Us", "Partners"],
    },
    {
      title: "Resources",
      links: ["Documentation", "API Reference", "Help Center", "Status Page", "Community", "Webinars"],
    },
    {
      title: "Legal",
      links: ["Privacy Policy", "Terms of Service", "GDPR", "Security", "SLA", "Cookie Policy"],
    },
  ];

  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 pb-12 border-b border-gray-800">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <Layers className="w-4 h-4 text-[#0445AD]" />
              </div>
              <span className="text-base font-bold">HRFlow</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">AI-powered HR management platform for modern Indian enterprises.</p>
            <div className="flex gap-3">
              {["#3b5998", "#1da1f2", "#0077b5", "#ea4c89"].map((_, i) => (
                <div key={i} className="w-8 h-8 bg-gray-800 rounded-lg" />
              ))}
            </div>
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-gray-400 hover:text-white transition">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="flex flex-col md:flex-row items-center justify-between pt-8 gap-4">
          <p className="text-xs text-gray-500">© 2026 HRFlow Technologies Pvt. Ltd. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-xs text-gray-500 hover:text-white transition">Privacy</a>
            <a href="#" className="text-xs text-gray-500 hover:text-white transition">Terms</a>
            <a href="#" className="text-xs text-gray-500 hover:text-white transition">Security</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ── Missing icon fix ───────────────────────────────────────────────────────────
function Sparkles({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" /><path d="M19 17v4" /><path d="M3 5h4" /><path d="M17 19h4" />
    </svg>
  );
}

function PlayCircle({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polygon points="10 8 16 12 10 16 10 8" />
    </svg>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div className="font-sans antialiased">
      <Navbar />
      <main>
        <HeroSection />
        <SocialProof />
        <ProblemSolution />
        <CoreFeatures />
        <AIFeatures />
        <ModuleDetails />
        <RoleBased />
        <Integrations />
        <SecurityCompliance />
        <SaaSBenefits />
        {/* <Pricing /> */}
        <Testimonials />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />

      {/* Global styles via Tailwind config not available — inline minimal animation */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-fade-in { animation: fade-in 0.15s ease-out; }
      `}</style>
    </div>
  );
}