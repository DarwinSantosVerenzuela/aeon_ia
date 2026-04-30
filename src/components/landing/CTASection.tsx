"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import Button from "@/components/ui/Button";

/**
 * Bottom CTA section with glassmorphism card and subtle gradient border.
 */
export default function CTASection() {
  return (
    <section className="relative z-10 px-6 py-24">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl mx-auto"
      >
        {/* Card with gradient border effect */}
        <div className="relative rounded-3xl p-px overflow-hidden">
          {/* Gradient border */}
          <div
            className="absolute inset-0 rounded-3xl"
            style={{
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 40%, transparent 60%, rgba(255,255,255,0.04) 100%)",
            }}
          />

          {/* Card content */}
          <div className="relative rounded-3xl bg-[var(--aeon-surface)]/80 backdrop-blur-xl p-10 sm:p-12 text-center">
            <h3 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[var(--aeon-text-primary)] mb-4">
              Tu inteligencia, tu servidor
            </h3>
            <p className="text-[var(--aeon-text-secondary)] mb-8 max-w-md mx-auto leading-relaxed tracking-wide text-sm font-light">
              Comienza a interactuar con Aeon IA. La plataforma está lista para
              conectarse con tu infraestructura de IA cuando lo decidas.
            </p>
            <Link href="/chat">
              <Button size="lg" className="gap-3 px-8">
                Abrir Chat
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="mt-20 text-center"
      >
        <p className="text-xs text-[var(--aeon-text-muted)] tracking-[0.15em] uppercase">
          Aeon IA — Inteligencia Soberana
        </p>
      </motion.footer>
    </section>
  );
}
