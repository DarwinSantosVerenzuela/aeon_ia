"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

/**
 * CTA section — centered card with gradient border.
 */
export default function CTASection() {
  return (
    <section className="relative z-10 w-full max-w-5xl mx-auto px-6 sm:px-8 py-16 sm:py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5 }}
        className="max-w-xl mx-auto"
      >
        {/* Card */}
        <div className="relative rounded-3xl overflow-hidden">
          {/* Gradient border glow */}
          <div className="absolute -inset-px rounded-3xl bg-gradient-to-br from-white/[0.1] via-transparent to-white/[0.05]" />

          <div className="relative rounded-3xl bg-[var(--aeon-surface)] p-8 sm:p-10 md:p-12 text-center">
            <h3 className="text-xl sm:text-2xl font-semibold tracking-tight text-[var(--aeon-text-primary)] mb-3">
              Tu inteligencia, tu servidor
            </h3>
            <p className="text-sm text-[var(--aeon-text-secondary)] mb-8 max-w-sm mx-auto leading-relaxed tracking-wide font-light">
              Comienza a interactuar con Aeon IA. La plataforma está lista para
              conectarse con tu infraestructura cuando lo decidas.
            </p>
            <Link href="/chat">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2.5 px-7 py-3 text-sm font-medium text-white bg-white/[0.1] hover:bg-white/[0.15] border border-white/[0.15] hover:border-white/[0.25] rounded-xl transition-all duration-200 cursor-pointer"
              >
                Abrir Chat
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Footer */}
      <p className="mt-16 text-center text-[11px] text-[var(--aeon-text-muted)] tracking-[0.15em] uppercase">
        Aeon IA — Inteligencia Soberana
      </p>
    </section>
  );
}
