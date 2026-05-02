"use client";

import { motion } from "framer-motion";
import { Shield, Zap, Lock, Server, Eye, Fingerprint } from "lucide-react";

const features = [
  { icon: Shield, title: "Tu conversación, tu control", desc: "Tu historial y tus mensajes permanecen bajo tu dominio. Sin intermediarios que accedan a lo que conversas." },
  { icon: Zap, title: "Respuestas en tiempo real", desc: "Las respuestas fluyen token a token en el instante en que se generan. Sin esperas, sin pantallas en blanco." },
  { icon: Lock, title: "Identidad blindada", desc: "Aeon nunca revela cómo está construido, dónde opera ni qué tecnologías usa. Tu asistente, sin filtraciones." },
  { icon: Server, title: "Infraestructura propia", desc: "Diseñado para correr en tu servidor. Tus reglas, tu entorno, sin dependencias de plataformas externas." },
  { icon: Eye, title: "Diseño de nivel enterprise", desc: "Interfaz premium inspirada en los estándares de las mejores plataformas del mundo. Fluida, limpia y rápida." },
  { icon: Fingerprint, title: "Enrutamiento inteligente", desc: "Selecciona automáticamente el motor más adecuado para cada tipo de consulta. Precisión sin configuración manual." },
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
