"use client";

import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { ConnectionStatus } from "@/types";

interface ChatHeaderProps {
  status?: ConnectionStatus;
}

const statusConfig: Record<
  ConnectionStatus,
  { label: string; color: string }
> = {
  connected: { label: "Conectado", color: "bg-emerald-500/70" },
  connecting: { label: "Conectando...", color: "bg-amber-500/70" },
  reconnecting: { label: "Reconectando...", color: "bg-amber-500/70" },
  disconnected: { label: "Demo", color: "bg-[var(--aeon-accent)]" },
  error: { label: "Error", color: "bg-red-500/70" },
};

/**
 * Chat header — centered content with consistent max-w and padding.
 */
export default function ChatHeader({
  status = "disconnected",
}: ChatHeaderProps) {
  const { label, color } = statusConfig[status];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-2xl mx-auto h-14 px-5 sm:px-6 flex items-center justify-between"
    >
      {/* Back */}
      <Link
        href="/"
        className="flex items-center gap-2 text-[var(--aeon-text-tertiary)] hover:text-[var(--aeon-text-primary)] transition-colors duration-200 min-w-[60px]"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-xs tracking-wide hidden sm:inline">Inicio</span>
      </Link>

      {/* Brand — always centered */}
      <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1.5">
        <span className="text-sm font-medium tracking-wider text-[var(--aeon-text-primary)]">
          Aeon
        </span>
        <span className="text-sm font-light tracking-wider text-[var(--aeon-text-tertiary)]">
          IA
        </span>
      </div>

      {/* Status */}
      <div className="flex items-center gap-2 min-w-[60px] justify-end">
        <div className={`w-1.5 h-1.5 rounded-full ${color}`} />
        <span className="text-xs text-[var(--aeon-text-tertiary)] tracking-wide">
          {label}
        </span>
      </div>
    </motion.div>
  );
}
