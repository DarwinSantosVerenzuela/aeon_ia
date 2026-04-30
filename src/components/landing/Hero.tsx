"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

/**
 * Hero — full viewport centered with radial light beam.
 */
export default function Hero() {
  return (
    <section className="relative flex items-center justify-center min-h-screen w-full px-6 sm:px-8 overflow-hidden">
      {/* Radial light beam */}
      <div className="light-beam" />

      {/* Content — centered column */}
      <div className="relative z-10 w-full max-w-2xl mx-auto text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="mb-8"
        >
          <span className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full text-[11px] tracking-[0.1em] uppercase text-[var(--aeon-text-tertiary)] border border-white/[0.08] bg-white/[0.03]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/60 animate-pulse" />
            Inteligencia Soberana
          </span>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5 }}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-semibold tracking-tight leading-[1.05] text-[var(--aeon-text-primary)] mb-6"
        >
          Aeon IA
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.5 }}
          className="text-base sm:text-lg text-[var(--aeon-text-secondary)] max-w-md mx-auto leading-relaxed tracking-wide font-light mb-10"
        >
          Plataforma de inteligencia artificial con soberanía total sobre tus
          datos. Sin nubes públicas. Sin compromisos.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65, duration: 0.4 }}
        >
          <Link href="/chat">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-3 px-8 py-4 text-sm sm:text-base font-medium text-white bg-white/[0.08] hover:bg-white/[0.13] border border-white/[0.12] hover:border-white/[0.22] rounded-2xl transition-all duration-200 cursor-pointer tracking-wide"
            >
              Iniciar conversación
              <motion.span
                animate={{ x: [0, 3, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" as const }}
              >
                <ArrowRight className="w-4 h-4" />
              </motion.span>
            </motion.button>
          </Link>
        </motion.div>

        {/* Accent line */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="mt-14 w-16 h-px mx-auto bg-gradient-to-r from-transparent via-white/[0.15] to-transparent"
        />
      </div>
    </section>
  );
}
