"use client";

import { useEffect } from "react";
import {
  HeroSection,
  AboutSection,
  ServicesSection,
  ProcessSection,
  TestimonialsSection,
  WhyChooseSection,
  DoctorsSection,
} from "@/components/sections";
import HighlightsSection from "@/components/sections/HighlightsSection";

export default function HomePage() {
  useEffect(() => {
    // ✅ Handle scrolling to section after redirect
    if (typeof window !== "undefined") {
      const hash = window.location.hash;
      if (hash) {
        const id = hash.replace("#", "");
        const el = document.getElementById(id);
        if (el) {
          setTimeout(() => {
            el.scrollIntoView({ behavior: "smooth" });
          }, 300);
        }
      }
    }
  }, []);

  return (
    <div className="min-h-screen scroll-smooth">

      <main className="pt-16">
        <section id="hero">
          <HeroSection />
        </section>

        <section id="highlights">
          <HighlightsSection />
        </section>

        <section id="about">
          <AboutSection />
        </section>

        <section id="services">
          <ServicesSection />
        </section>

        <section id="why-choose">
          <WhyChooseSection />
        </section>

        <section id="process">
          <ProcessSection />
        </section>

        <section id="testimonials">
          <TestimonialsSection />
        </section>

        <section id="Doctors">
          <DoctorsSection />
        </section>
      </main>
     
    </div>
  );
}
