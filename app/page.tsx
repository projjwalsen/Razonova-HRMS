"use client";

import React from "react";
import Hero from "@/components/Hero";
import LogoCarousel from "@/components/LogoCarousel";
import Action from "@/components/Action";
import CoreFeatures from "@/components/CoreFeatures";
import Hrteam from "@/components/Hrteamneed";
import {
  Navbar,
  ContactSection,
  AIFeatures,
  ModuleDetails,
  RoleBased,
  Integrations,
  SecurityCompliance,
  SaaSBenefits,
  Testimonials,
  FAQ,
  FinalCTA,
  Footer,
} from "@/components/LandingSections";

// ── Landing page sections moved to components

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div className="font-sans antialiased">
      <Navbar />
      <main className="">
        <Hero/>
        <LogoCarousel />
        {/* <Action/> */}
        <CoreFeatures />
        <Hrteam/>
        <AIFeatures />
        <ModuleDetails />
        <RoleBased />
        <Integrations />
        <SecurityCompliance />
        <SaaSBenefits />
        
        <Testimonials />
        <FAQ />
        <ContactSection />
        {/* <FinalCTA /> */}
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