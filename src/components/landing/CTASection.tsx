"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import AeonLogo from "@/components/ui/AeonLogo";

export default function CTASection() {
  return (
    <section style={{ width: "100%", maxWidth: 960, margin: "0 auto", padding: "0 24px 96px" }}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        style={{
          maxWidth: 480, margin: "0 auto", background: "#ffffff",
          border: "1px solid #d2d2d7", borderRadius: 24, padding: "40px 32px",
          textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        }}
      >
        <h3 style={{ fontSize: 22, fontWeight: 600, color: "#48484a", marginBottom: 10 }}>
          Tu inteligencia, tu servidor
        </h3>
        <p style={{ fontSize: 14, color: "#6e6e73", maxWidth: 340, margin: "0 auto 28px", lineHeight: 1.5 }}>
          Comienza a interactuar con Aeon IA. La plataforma está lista para conectarse con tu infraestructura.
        </p>
        <Link href="/chat" style={{ textDecoration: "none" }}>
          <button
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "12px 24px", fontSize: 14, fontWeight: 500,
              color: "#ffffff", background: "#3d3d3d", border: "none",
              borderRadius: 12, cursor: "pointer", transition: "all 0.15s",
              boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
            }}
            onMouseOver={(e) => { e.currentTarget.style.background = "#555558"; }}
            onMouseOut={(e) => { e.currentTarget.style.background = "#3d3d3d"; }}
          >
            Abrir Chat
            <ArrowRight size={15} />
          </button>
        </Link>
      </motion.div>

      {/* Footer brand */}
      <div style={{ marginTop: 48, display: "flex", justifyContent: "center" }}>
        <AeonLogo variant="wordmark" theme="dark" size={16} style={{ opacity: 0.35 }} />
      </div>
    </section>
  );
}
