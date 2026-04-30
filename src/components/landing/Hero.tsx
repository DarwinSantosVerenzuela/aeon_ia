"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-6">
      {/* Subtle radial glow */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse 50% 40% at 50% 45%, rgba(255,255,255,0.03) 0%, transparent 70%)"
      }} />

      <div className="relative z-10 text-center max-w-[560px] mx-auto">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[11px] tracking-[0.08em] uppercase text-[#8e8e93] border border-[#2c2c2e] bg-[#1c1c1e]/50">
            <span className="w-[5px] h-[5px] rounded-full bg-emerald-500/60 animate-pulse" />
            Inteligencia Soberana
          </span>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="text-[48px] sm:text-[60px] md:text-[72px] font-semibold tracking-[-0.02em] text-white leading-[1.1] mb-5"
        >
          Aeon IA
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-[16px] sm:text-[18px] text-[#8e8e93] leading-[1.6] max-w-[420px] mx-auto mb-10"
        >
          Plataforma de inteligencia artificial con soberanía total sobre tus datos. Sin nubes públicas. Sin compromisos.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.4 }}
        >
          <Link href="/chat">
            <button className="inline-flex items-center gap-2.5 px-7 py-3.5 text-[14px] font-medium text-white bg-[#1c1c1e] hover:bg-[#2c2c2e] border border-[#3a3a3c] hover:border-[#48484a] rounded-[14px] transition-all duration-200 cursor-pointer">
              Iniciar conversación
              <ArrowRight size={16} />
            </button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
