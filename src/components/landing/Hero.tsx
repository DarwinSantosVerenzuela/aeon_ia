"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import AeonLogo from "@/components/ui/AeonLogo";

export default function Hero() {
  const router = useRouter();

  const handleStart = () => {
    sessionStorage.removeItem("aeon-active-conv");
    router.push("/chat");
  };

  return (
    <section style={{
      minHeight: "100vh", display: "grid", placeItems: "center",
      padding: "0 24px", background: "#f5f5f7",
      position: "relative", overflow: "hidden",
    }}>

      {/* ── Animated blobs — pure CSS, GPU-accelerated ── */}
      <style>{`
        @keyframes drift1 {
          0%   { transform: translate(0vw, 0vh) scale(1); }
          25%  { transform: translate(18vw, -15vh) scale(1.18); }
          50%  { transform: translate(8vw, 20vh) scale(0.88); }
          75%  { transform: translate(-12vw, 8vh) scale(1.1); }
          100% { transform: translate(0vw, 0vh) scale(1); }
        }
        @keyframes drift2 {
          0%   { transform: translate(0vw, 0vh) scale(1); }
          30%  { transform: translate(-20vw, 18vh) scale(1.2); }
          60%  { transform: translate(15vw, -12vh) scale(0.85); }
          100% { transform: translate(0vw, 0vh) scale(1); }
        }
        @keyframes drift3 {
          0%   { transform: translate(0vw, 0vh) scale(1); }
          40%  { transform: translate(-15vw, -18vh) scale(1.22); }
          70%  { transform: translate(10vw, 15vh) scale(0.9); }
          100% { transform: translate(0vw, 0vh) scale(1); }
        }
        @keyframes drift4 {
          0%   { transform: translate(0vw, 0vh) scale(1); }
          35%  { transform: translate(16vw, 14vh) scale(1.15); }
          70%  { transform: translate(-10vw, -16vh) scale(0.87); }
          100% { transform: translate(0vw, 0vh) scale(1); }
        }

        .blob {
          position: absolute;
          border-radius: 50%;
          will-change: transform;
          pointer-events: none;
        }
        .blob1 {
          width: 65vw; height: 65vw; max-width: 800px; max-height: 800px;
          background: radial-gradient(circle, rgba(155,155,168,0.92) 0%, rgba(170,170,182,0.55) 40%, transparent 68%);
          filter: blur(28px);
          top: -20%; left: -18%;
          animation: drift1 10s ease-in-out infinite;
        }
        .blob2 {
          width: 58vw; height: 58vw; max-width: 720px; max-height: 720px;
          background: radial-gradient(circle, rgba(145,145,158,0.88) 0%, rgba(162,162,175,0.50) 40%, transparent 68%);
          filter: blur(24px);
          bottom: -18%; right: -15%;
          animation: drift2 13s ease-in-out infinite;
        }
        .blob3 {
          width: 50vw; height: 50vw; max-width: 640px; max-height: 640px;
          background: radial-gradient(circle, rgba(160,160,172,0.85) 0%, transparent 62%);
          filter: blur(22px);
          top: 20%; left: 42%;
          animation: drift3 9s ease-in-out infinite;
        }
        .blob4 {
          width: 44vw; height: 44vw; max-width: 560px; max-height: 560px;
          background: radial-gradient(circle, rgba(150,150,164,0.82) 0%, transparent 62%);
          filter: blur(26px);
          top: 48%; left: 8%;
          animation: drift4 11s ease-in-out infinite;
        }
      `}</style>

      <div className="blob blob1" />
      <div className="blob blob2" />
      <div className="blob blob3" />
      <div className="blob blob4" />

      {/* ── Content ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        style={{
          textAlign: "center", maxWidth: 540, width: "100%",
          marginTop: -60, position: "relative", zIndex: 1,
        }}
      >
        {/* Logo — oficial brand identity */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
          <AeonLogo variant="wordmark" theme="dark" height={64} />
        </div>

        {/* Subtitle */}
        <p style={{
          fontSize: "clamp(15px, 2vw, 18px)", color: "#6e6e73",
          maxWidth: 420, margin: "0 auto 40px", lineHeight: 1.55,
        }}>
          Plataforma de inteligencia artificial con soberanía total sobre tus conversaciones.
          Privada, segura y sin compromisos.
        </p>

        {/* CTA */}
        <motion.button
          onClick={handleStart}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={{
            display: "inline-flex", alignItems: "center", gap: 10,
            padding: "14px 28px", fontSize: 14, fontWeight: 500,
            color: "#ffffff", background: "#3d3d3d",
            border: "none", borderRadius: 14, cursor: "pointer",
            boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
          }}
          onMouseOver={(e) => { e.currentTarget.style.background = "#555558"; }}
          onMouseOut={(e) => { e.currentTarget.style.background = "#3d3d3d"; }}
        >
          Iniciar conversación
          <ArrowRight size={16} />
        </motion.button>
      </motion.div>
    </section>
  );
}
