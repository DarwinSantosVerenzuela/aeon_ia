"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function CTASection() {
  return (
    <section
      style={{
        width: "100%",
        maxWidth: 960,
        margin: "0 auto",
        padding: "0 24px 96px",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        style={{
          maxWidth: 480,
          margin: "0 auto",
          background: "var(--bg-secondary)",
          border: "1px solid var(--separator)",
          borderRadius: 24,
          padding: "40px 32px",
          textAlign: "center",
        }}
      >
        <h3
          style={{
            fontSize: 22,
            fontWeight: 600,
            color: "var(--label-primary)",
            marginBottom: 10,
            letterSpacing: "-0.01em",
          }}
        >
          Tu inteligencia, tu servidor
        </h3>
        <p
          style={{
            fontSize: 14,
            color: "var(--label-tertiary)",
            maxWidth: 340,
            margin: "0 auto 28px",
            lineHeight: 1.5,
          }}
        >
          Comienza a interactuar con Aeon IA. La plataforma está lista para
          conectarse con tu infraestructura.
        </p>
        <Link href="/chat" style={{ textDecoration: "none" }}>
          <button
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "12px 24px",
              fontSize: 14,
              fontWeight: 500,
              color: "var(--label-primary)",
              background: "var(--bg-tertiary)",
              border: "1px solid var(--separator-opaque)",
              borderRadius: 12,
              cursor: "pointer",
              transition: "all 0.15s",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = "var(--bg-elevated)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "var(--bg-tertiary)";
            }}
          >
            Abrir Chat
            <ArrowRight size={15} />
          </button>
        </Link>
      </motion.div>

      <p
        style={{
          marginTop: 48,
          textAlign: "center",
          fontSize: 11,
          color: "var(--label-quaternary)",
          letterSpacing: "0.12em",
          textTransform: "uppercase" as const,
        }}
      >
        Aeon IA — Inteligencia Soberana
      </p>
    </section>
  );
}
