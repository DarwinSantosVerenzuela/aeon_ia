"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import Button from "@/components/ui/Button";

const letterVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.3 + i * 0.04,
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  }),
};

const subtitleVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { delay: 1.2, duration: 0.6, ease: "easeOut" as const },
  },
};

const ctaVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { delay: 1.6, duration: 0.5, ease: "easeOut" as const },
  },
};

const title = "Aeon IA";

/**
 * Hero section with radial light beam background,
 * letter-by-letter title animation, and glassmorphic CTA.
 */
export default function Hero() {
  return (
    <section className="relative flex flex-col items-center justify-center min-h-screen px-6 overflow-hidden">
      {/* Radial Light Beam */}
      <div className="light-beam" />

      {/* Additional ambient orbs */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(255,255,255,0.015) 0%, transparent 60%)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-3xl mx-auto">
        {/* Tag */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="mb-8"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs tracking-[0.1em] uppercase text-[var(--aeon-text-tertiary)] border border-white/[0.06] bg-white/[0.02]">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--aeon-accent)] animate-pulse" />
            Inteligencia Soberana
          </span>
        </motion.div>

        {/* Title — letter-by-letter */}
        <h1 className="text-6xl sm:text-7xl md:text-8xl font-semibold tracking-tight mb-6 leading-none">
          {title.split("").map((letter, i) => (
            <motion.span
              key={i}
              custom={i}
              variants={letterVariants}
              initial="hidden"
              animate="visible"
              className={
                letter === " "
                  ? "inline-block w-4"
                  : "inline-block text-[var(--aeon-text-primary)]"
              }
            >
              {letter}
            </motion.span>
          ))}
        </h1>

        {/* Subtitle */}
        <motion.p
          variants={subtitleVariants}
          initial="hidden"
          animate="visible"
          className="text-lg sm:text-xl text-[var(--aeon-text-secondary)] max-w-xl mx-auto leading-relaxed tracking-wide mb-12 font-light"
        >
          Plataforma de inteligencia artificial con soberanía total sobre tus
          datos. Sin nubes públicas. Sin compromisos.
        </motion.p>

        {/* CTA */}
        <motion.div
          variants={ctaVariants}
          initial="hidden"
          animate="visible"
        >
          <Link href="/chat">
            <Button
              size="lg"
              className="group gap-3 px-8 py-4 text-base tracking-wide"
            >
              Iniciar conversación
              <motion.span
                className="inline-flex"
                animate={{ x: [0, 4, 0] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <ArrowRight className="w-4 h-4" />
              </motion.span>
            </Button>
          </Link>
        </motion.div>

        {/* Bottom accent line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 2, duration: 0.8, ease: "easeOut" }}
          className="mt-16 w-24 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
        />
      </div>
    </section>
  );
}
