import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import CTASection from "@/components/landing/CTASection";

/**
 * Landing page — Server Component by default.
 * The client-side animations are encapsulated in child components.
 */
export default function HomePage() {
  return (
    <main className="relative noise-overlay">
      <Hero />
      <Features />
      <CTASection />
    </main>
  );
}
