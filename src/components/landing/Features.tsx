"use client";

import { motion } from "framer-motion";
import { Shield, Zap, Lock, Server, Eye, Fingerprint } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Soberanía Total",
    description:
      "Tus datos permanecen en tu infraestructura. Sin intermediarios, sin nubes públicas.",
  },
  {
    icon: Zap,
    title: "Streaming en Tiempo Real",
    description:
      "Respuestas fluidas vía Server-Sent Events con latencia mínima y conexión persistente.",
  },
  {
    icon: Lock,
    title: "Seguridad por Diseño",
    description:
      "Validación Zod, sanitización XSS/SQL, rate-limiting y headers CSP integrados.",
  },
  {
    icon: Server,
    title: "Despliegue Privado",
    description:
      "Arquitectura Docker-ready para despliegue continuo. Tu servidor, tus reglas.",
  },
  {
    icon: Eye,
    title: "Interfaz Premium",
    description:
      "Glassmorphism, animaciones fluidas y una experiencia visual a nivel enterprise.",
  },
  {
    icon: Fingerprint,
    title: "Backend Agnóstico",
    description:
      "Conecta cualquier LLM: OpenAI, Anthropic, Ollama o tu propio modelo privado.",
  },
];

/**
 * Features section — centered heading + 3-column grid with equal-height cards.
 */
export default function Features() {
  return (
    <section className="relative z-10 w-full max-w-5xl mx-auto px-6 sm:px-8 py-24 sm:py-32">
      {/* ── Heading ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5 }}
        className="text-center mb-14 sm:mb-16"
      >
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-[var(--aeon-text-primary)] mb-4">
          Construido para control total
        </h2>
        <p className="text-[var(--aeon-text-secondary)] text-sm sm:text-base max-w-lg mx-auto tracking-wide font-light leading-relaxed">
          Cada componente diseñado con seguridad, rendimiento y privacidad como
          prioridad absoluta.
        </p>
      </motion.div>

      {/* ── Grid ── */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.08 } },
        }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {features.map((feature) => (
          <motion.div
            key={feature.title}
            variants={{
              hidden: { opacity: 0, y: 16 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.4, ease: "easeOut" as const },
              },
            }}
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            className="group flex flex-col p-6 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.07] hover:border-white/[0.14] transition-all duration-300"
          >
            {/* Icon */}
            <div className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center mb-4 group-hover:bg-white/[0.09] group-hover:border-white/[0.16] transition-all duration-300">
              <feature.icon className="w-[18px] h-[18px] text-[var(--aeon-accent-light)]" />
            </div>

            {/* Text */}
            <h3 className="text-[15px] font-medium text-[var(--aeon-text-primary)] mb-2 tracking-wide">
              {feature.title}
            </h3>
            <p className="text-[13px] text-[var(--aeon-text-tertiary)] leading-[1.65] tracking-wide flex-1">
              {feature.description}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
