"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Circle } from "lucide-react";
import Link from "next/link";
import type { ConnectionStatus } from "@/types";

interface ChatHeaderProps {
  status?: ConnectionStatus;
}

const statusConfig: Record<
  ConnectionStatus,
  { label: string; color: string }
> = {
  connected: { label: "Conectado", color: "bg-green-500/60" },
  connecting: { label: "Conectando...", color: "bg-yellow-500/60" },
  reconnecting: { label: "Reconectando...", color: "bg-yellow-500/60" },
  disconnected: { label: "Demo", color: "bg-[var(--aeon-accent)]" },
  error: { label: "Error", color: "bg-red-500/60" },
};

/**
 * Chat header with navigation, branding, and connection status.
 */
export default function ChatHeader({
  status = "disconnected",
}: ChatHeaderProps) {
  const { label, color } = statusConfig[status];

  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="sticky top-0 z-50 glass-subtle"
    >
      <div className="flex items-center justify-between h-14 px-5 max-w-4xl mx-auto">
        {/* Back button */}
        <Link
          href="/"
          className="flex items-center gap-2 text-[var(--aeon-text-tertiary)] hover:text-[var(--aeon-text-primary)] transition-colors duration-200"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-xs tracking-wide hidden sm:inline">Inicio</span>
        </Link>

        {/* Logo */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium tracking-wider text-[var(--aeon-text-primary)]">
            Aeon
          </span>
          <span className="text-sm font-light tracking-wider text-[var(--aeon-text-tertiary)]">
            IA
          </span>
        </div>

        {/* Status */}
        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${color}`} />
          <span className="text-xs text-[var(--aeon-text-muted)] tracking-wide">
            {label}
          </span>
        </div>
      </div>

      {/* Bottom border */}
      <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
    </motion.header>
  );
}
