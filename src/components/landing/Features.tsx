"use client";

import { motion } from "framer-motion";
import { Shield, Zap, Lock, Server, Eye, Fingerprint } from "lucide-react";

const features = [
  { icon: Shield, title: "Soberanía Total", desc: "Tus datos permanecen en tu infraestructura. Sin intermediarios, sin nubes públicas." },
  { icon: Zap, title: "Streaming en Tiempo Real", desc: "Respuestas fluidas vía Server-Sent Events con latencia mínima y conexión persistente." },
  { icon: Lock, title: "Seguridad por Diseño", desc: "Validación Zod, sanitización XSS/SQL, rate-limiting y headers CSP integrados." },
  { icon: Server, title: "Despliegue Privado", desc: "Arquitectura Docker-ready para despliegue continuo. Tu servidor, tus reglas." },
  { icon: Eye, title: "Interfaz Premium", desc: "Animaciones fluidas y una experiencia visual a nivel enterprise." },
  { icon: Fingerprint, title: "Backend Agnóstico", desc: "Conecta cualquier LLM: OpenAI, Anthropic, Ollama o tu propio modelo." },
];

export default function Features() {
  return (
    <section className="w-full max-w-[960px] mx-auto px-6 py-24 sm:py-32">
      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.4 }}
        className="text-center mb-14"
      >
        <h2 className="text-[28px] sm:text-[34px] font-semibold text-white tracking-[-0.01em] mb-3">
          Construido para control total
        </h2>
        <p className="text-[15px] text-[#8e8e93] max-w-[440px] mx-auto leading-[1.5]">
          Cada componente diseñado con seguridad, rendimiento y privacidad como prioridad.
        </p>
      </motion.div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06, duration: 0.35 }}
            className="flex flex-col p-5 rounded-2xl bg-[#141414] border border-[#1d1d1f] hover:border-[#2c2c2e] hover:bg-[#1a1a1a] transition-all duration-200"
          >
            <div className="w-9 h-9 rounded-[10px] bg-[#1c1c1e] border border-[#2c2c2e] flex items-center justify-center mb-4">
              <f.icon size={16} className="text-[#a1a1a6]" />
            </div>
            <h3 className="text-[14px] font-medium text-white mb-1.5">{f.title}</h3>
            <p className="text-[13px] text-[#636366] leading-[1.55] flex-1">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
