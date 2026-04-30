"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function CTASection() {
  return (
    <section className="w-full max-w-[960px] mx-auto px-6 pt-8 pb-24 sm:pb-32">
      {/* CTA Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="max-w-[480px] mx-auto bg-[#141414] border border-[#1d1d1f] rounded-3xl p-8 sm:p-10 text-center"
      >
        <h3 className="text-[22px] font-semibold text-white tracking-tight mb-3">
          Tu inteligencia, tu servidor
        </h3>
        <p className="text-[14px] text-[#8e8e93] mb-8 max-w-[360px] mx-auto leading-[1.5]">
          Comienza a interactuar con Aeon IA. La plataforma está lista para conectarse con tu infraestructura.
        </p>
        <Link href="/chat">
          <button className="inline-flex items-center gap-2 px-6 py-3 text-[14px] font-medium text-white bg-[#1c1c1e] hover:bg-[#2c2c2e] border border-[#3a3a3c] hover:border-[#48484a] rounded-xl transition-all duration-200 cursor-pointer">
            Abrir Chat
            <ArrowRight size={15} />
          </button>
        </Link>
      </motion.div>

      {/* Footer */}
      <p className="mt-14 text-center text-[11px] text-[#3a3a3c] tracking-[0.12em] uppercase">
        Aeon IA — Inteligencia Soberana
      </p>
    </section>
  );
}
