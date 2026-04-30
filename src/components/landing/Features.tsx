"use client";

import { motion } from "framer-motion";
import { Shield, Zap, Lock, Server, Eye, Fingerprint } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";

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
      "Respuestas fluidas vía SSE con latencia mínima y conexión persistente.",
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
      "Arquitectura Docker-ready para CI/CD. Tu servidor, tus reglas.",
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
      "Conecta cualquier LLM: OpenAI, Anthropic, Ollama o tu modelo propio.",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

/**
 * Features grid with glassmorphism cards and stagger animation.
 */
export default function Features() {
  return (
    <section className="relative z-10 px-6 py-24 max-w-6xl mx-auto">
      {/* Section heading */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[var(--aeon-text-primary)] mb-4">
          Construido para control total
        </h2>
        <p className="text-[var(--aeon-text-secondary)] text-lg max-w-2xl mx-auto tracking-wide font-light">
          Cada componente diseñado con seguridad, rendimiento y privacidad como
          prioridad absoluta.
        </p>
      </motion.div>

      {/* Features grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
      >
        {features.map((feature) => (
          <motion.div key={feature.title} variants={itemVariants}>
            <GlassCard
              className="p-6 h-full group cursor-default hover:bg-[var(--glass-bg-hover)] transition-all duration-300"
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
            >
              <div className="flex flex-col gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center group-hover:bg-white/[0.08] group-hover:border-white/[0.12] transition-all duration-300">
                  <feature.icon className="w-5 h-5 text-[var(--aeon-accent-light)]" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-[var(--aeon-text-primary)] mb-2 tracking-wide">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-[var(--aeon-text-tertiary)] leading-relaxed tracking-wide">
                    {feature.description}
                  </p>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
