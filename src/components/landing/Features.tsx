"use client";

import { motion } from "framer-motion";
import { Shield, Zap, Lock, Server, Eye, Fingerprint } from "lucide-react";

const features = [
  { icon: Shield, title: "Soberanía Total", desc: "Tus datos permanecen en tu infraestructura. Sin intermediarios, sin nubes públicas." },
  { icon: Zap, title: "Streaming en Tiempo Real", desc: "Respuestas fluidas vía Server-Sent Events con latencia mínima." },
  { icon: Lock, title: "Seguridad por Diseño", desc: "Validación Zod, sanitización XSS/SQL, rate-limiting y headers CSP." },
  { icon: Server, title: "Despliegue Privado", desc: "Arquitectura Docker-ready para CI/CD. Tu servidor, tus reglas." },
  { icon: Eye, title: "Interfaz Premium", desc: "Animaciones fluidas y experiencia visual a nivel enterprise." },
  { icon: Fingerprint, title: "Backend Agnóstico", desc: "Conecta cualquier LLM: OpenAI, Anthropic, Ollama o tu modelo." },
];

export default function Features() {
  return (
    <section style={{ width: "100%", maxWidth: 960, margin: "0 auto", padding: "80px 24px 96px" }}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.4 }}
        style={{ textAlign: "center", marginBottom: 48 }}
      >
        <h2 style={{ fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 600, color: "#48484a", marginBottom: 10 }}>
          Construido para control total
        </h2>
        <p style={{ fontSize: 15, color: "#6e6e73", maxWidth: 420, margin: "0 auto", lineHeight: 1.5 }}>
          Cada componente diseñado con seguridad, rendimiento y privacidad como prioridad.
        </p>
      </motion.div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12 }}>
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05, duration: 0.3 }}
            style={{
              display: "flex", flexDirection: "column", padding: 20, borderRadius: 16,
              background: "#ffffff", border: "1px solid #d2d2d7", cursor: "default",
              transition: "all 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            }}
            onMouseOver={(e) => { e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)"; e.currentTarget.style.borderColor = "#c7c7cc"; }}
            onMouseOut={(e) => { e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.04)"; e.currentTarget.style.borderColor = "#d2d2d7"; }}
          >
            <div style={{
              width: 36, height: 36, borderRadius: 10, background: "#f5f5f7",
              border: "1px solid #e8e8ed", display: "grid", placeItems: "center", marginBottom: 14,
            }}>
              <f.icon size={16} color="#6e6e73" />
            </div>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: "#48484a", marginBottom: 6 }}>{f.title}</h3>
            <p style={{ fontSize: 13, color: "#86868b", lineHeight: 1.55, flex: 1 }}>{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
