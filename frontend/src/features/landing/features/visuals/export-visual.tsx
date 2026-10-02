"use client";

import { motion } from "motion/react";

export function ExportVisual() {
  return (
    <svg
      viewBox="0 0 220 120"
      fill="none"
      className="h-full w-full"
      aria-hidden
    >
      <defs>
        <linearGradient id="exGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>
      </defs>

      <motion.rect
        x="24"
        y="16"
        width="124"
        height="88"
        rx="14"
        stroke="rgba(255,255,255,0.2)"
        strokeWidth="1.4"
        fill="rgba(255,255,255,0.02)"
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, ease: "easeOut" }}
      />

      <g stroke="#5a5a70" strokeWidth="4" strokeLinecap="round">
        <motion.line
          x1="42" y1="40" x2="120" y2="40"
          initial={{ pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.5 }}
        />
        <motion.line
          x1="42" y1="56" x2="100" y2="56"
          initial={{ pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.5 }}
        />
        <motion.line
          x1="42" y1="72" x2="112" y2="72"
          initial={{ pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.5 }}
        />
      </g>

      <motion.g
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.7, type: "spring", stiffness: 200, damping: 15 }}
      >
        <circle cx="176" cy="60" r="26" fill="rgba(52,211,153,0.12)" stroke="rgba(52,211,153,0.5)" strokeWidth="1.4" />
        <path
          d="M176 48v18m0 0l-6-6m6 6l6-6"
          stroke="#34d399"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </motion.g>

      <motion.path
        d="M176 44l-14 0"
        stroke="rgba(52,211,153,0.4)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="3 5"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 1 }}
      >
        <animate attributeName="stroke-dashoffset" values="0;-16" dur="1.2s" repeatCount="indefinite" />
      </motion.path>
    </svg>
  );
}
