"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Hero() {
  return (
    <section
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "0 24px",
        background: "var(--bg-primary)",
        position: "relative",
      }}
    >
      {/* Subtle ambient glow */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 50% 40% at 50% 45%, rgba(255,255,255,0.025) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          position: "relative",
          zIndex: 1,
          textAlign: "center",
          maxWidth: 540,
          width: "100%",
          marginTop: -60,
        }}
      >
        {/* Badge */}
        <div style={{ marginBottom: 28 }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 16px",
              borderRadius: 100,
              fontSize: 11,
              letterSpacing: "0.08em",
              textTransform: "uppercase" as const,
              color: "var(--label-tertiary)",
              background: "var(--bg-secondary)",
              border: "1px solid var(--separator)",
            }}
          >
            <span
              style={{
                width: 5,
                height: 5,
                borderRadius: "50%",
                background: "#34c759",
                opacity: 0.7,
              }}
            />
            Inteligencia Soberana
          </span>
        </div>

        {/* Title */}
        <h1
          style={{
            fontSize: "clamp(48px, 8vw, 80px)",
            fontWeight: 600,
            color: "var(--label-primary)",
            letterSpacing: "-0.02em",
            lineHeight: 1.1,
            marginBottom: 16,
          }}
        >
          Aeon IA
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontSize: "clamp(15px, 2vw, 18px)",
            color: "var(--label-tertiary)",
            maxWidth: 420,
            margin: "0 auto 40px",
            lineHeight: 1.55,
          }}
        >
          Plataforma de inteligencia artificial con soberanía total sobre tus
          datos. Sin nubes públicas. Sin compromisos.
        </p>

        {/* CTA */}
        <Link href="/chat" style={{ textDecoration: "none" }}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              padding: "14px 28px",
              fontSize: 14,
              fontWeight: 500,
              color: "var(--label-primary)",
              background: "var(--bg-secondary)",
              border: "1px solid var(--separator)",
              borderRadius: 14,
              cursor: "pointer",
              transition: "all 0.2s",
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
            Iniciar conversación
            <ArrowRight size={16} />
          </motion.button>
        </Link>
      </motion.div>
    </section>
  );
}
