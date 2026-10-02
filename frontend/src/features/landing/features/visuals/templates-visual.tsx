"use client";

import { motion } from "motion/react";

export function TemplatesVisual() {
  return (
    <svg
      viewBox="0 0 220 130"
      fill="none"
      className="h-full w-full"
      aria-hidden
    >
      <defs>
        <linearGradient id="tmp1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#e879f9" />
          <stop offset="100%" stopColor="#a21caf" />
        </linearGradient>
        <linearGradient id="tmp2" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#0ea5e9" />
        </linearGradient>
      </defs>

      <g transform="translate(-6 8)">
        <motion.rect
          x="18"
          y="16"
          width="150"
          height="92"
          rx="14"
          stroke="url(#tmp1)"
          strokeWidth="1.2"
          fill="rgba(217,70,239,0.04)"
          initial={{ opacity: 0, x: -12, rotate: -5 }}
          whileInView={{ opacity: 1, x: 0, rotate: -5 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        />
      </g>

      <g transform="translate(10 -4)">
        <motion.rect
          x="24"
          y="26"
          width="162"
          height="96"
          rx="14"
          stroke="url(#tmp2)"
          strokeWidth="1.2"
          fill="rgba(56,189,248,0.04)"
          initial={{ opacity: 0, x: 12, rotate: 4 }}
          whileInView={{ opacity: 1, x: 0, rotate: 4 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1 }}
        />
      </g>

      <motion.rect
        x="36"
        y="20"
        width="148"
        height="86"
        rx="14"
        stroke="rgba(255,255,255,0.22)"
        strokeWidth="1.4"
        fill="rgba(16,16,24,0.92)"
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.25 }}
      />

      <g stroke="#5a5a70" strokeWidth="4" strokeLinecap="round">
        <motion.line
          x1="54" y1="40" x2="130" y2="40"
          initial={{ pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.5 }}
        />
        <motion.line
          x1="54" y1="60" x2="110" y2="60"
          initial={{ pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.5 }}
        />
        <motion.line
          x1="54" y1="80" x2="164" y2="80"
          initial={{ pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.7, duration: 0.5 }}
        />
      </g>

      <motion.circle
        cx="172"
        cy="88"
        r="4"
        fill="#38bdf8"
        initial={{ scale: 0, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.9, type: "spring", stiffness: 300 }}
      />
    </svg>
  );
}
