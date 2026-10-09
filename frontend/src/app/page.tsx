"use client";

import React from "react";
import LandingNavbar from "../components/landing/navbar";
import HeroSection from "../components/landing/hero-section";
import TrustStrip from "../components/landing/trust-strip";
import ProblemSolutionSection from "../components/landing/problem-solution";
import HowItWorksSection from "../components/landing/how-it-works";
import VerificationVisualSection from "../components/landing/verification-visual";
import TechnologySection from "../components/landing/technology-section";
import SolanaSection from "../components/landing/solana-section";
import FinalCtaSection from "../components/landing/final-cta";
import LandingFooter from "../components/landing/footer";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[#07130f] text-[#f4f5ef] selection:bg-[#38b87c] selection:text-[#07130f]">
      {/* 1. Navigation */}
      <LandingNavbar />

      <main className="flex-1 flex flex-col">
        {/* 2. Hero Section */}
        <HeroSection />

        {/* 3. Trust / Signal Strip */}
        <TrustStrip />

        {/* 4. Problem -> Solution Section */}
        <ProblemSolutionSection />

        {/* 5. How TerraVerify Works */}
        <HowItWorksSection />

        {/* 6. Verification Visual (The Immersive Highlight) */}
        <VerificationVisualSection />

        {/* 7. Technology Section */}
        <TechnologySection />

        {/* 8. Solana Section */}
        <SolanaSection />

        {/* 9. Final CTA */}
        <FinalCtaSection />
      </main>

      {/* 10. Semantic Footer */}
      <LandingFooter />
    </div>
  );
}
