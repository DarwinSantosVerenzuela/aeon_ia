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
    <section
      style={{
        width: "100%",
        maxWidth: 960,
        margin: "0 auto",
        padding: "80px 24px 96px",
      }}
    >
      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.4 }}
        style={{ textAlign: "center", marginBottom: 48 }}
      >
        <h2
          style={{
            fontSize: "clamp(24px, 4vw, 36px)",
            fontWeight: 600,
            color: "var(--label-primary)",
            letterSpacing: "-0.01em",
            marginBottom: 10,
          }}
        >
          Construido para control total
        </h2>
        <p
          style={{
            fontSize: 15,
            color: "var(--label-tertiary)",
            maxWidth: 420,
            margin: "0 auto",
            lineHeight: 1.5,
          }}
        >
          Cada componente diseñado con seguridad, rendimiento y privacidad como
          prioridad.
        </p>
      </motion.div>

      {/* Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 12,
        }}
      >
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05, duration: 0.3 }}
            style={{
              display: "flex",
              flexDirection: "column",
              padding: 20,
              borderRadius: 16,
              background: "var(--bg-secondary)",
              border: "1px solid var(--separator)",
              transition: "all 0.2s",
              cursor: "default",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = "var(--bg-tertiary)";
              e.currentTarget.style.borderColor = "var(--separator-opaque)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "var(--bg-secondary)";
              e.currentTarget.style.borderColor = "var(--separator)";
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: "var(--bg-tertiary)",
                border: "1px solid var(--separator)",
                display: "grid",
                placeItems: "center",
                marginBottom: 14,
              }}
            >
              <f.icon size={16} color="var(--label-secondary)" />
            </div>
            <h3
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "var(--label-primary)",
                marginBottom: 6,
              }}
            >
              {f.title}
            </h3>
            <p
              style={{
                fontSize: 13,
                color: "var(--label-quaternary)",
                lineHeight: 1.55,
                flex: 1,
              }}
            >
              {f.desc}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
