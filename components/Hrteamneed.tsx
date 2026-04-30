import React from 'react'
import { BarChart3, Clock, Calendar, CreditCard, TrendingUp, UserCheck, Shield, Users, ChevronRight } from 'lucide-react';
export default function Hrteam() {
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
    <section id="modules" className="py-20 bg-gray-50">
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
