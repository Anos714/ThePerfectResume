"use client";

import { motion } from "motion/react";

export function AIVisual() {
  return (
    <svg
      viewBox="0 0 420 280"
      fill="none"
      className="h-full w-full"
      aria-hidden
    >
      <defs>
        <linearGradient id="aiStroke" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#a5b4fc" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
        <linearGradient id="aiAccent" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#e879f9" />
          <stop offset="100%" stopColor="#c026d3" />
        </linearGradient>
      </defs>

      <motion.rect
        x="24"
        y="30"
        width="372"
        height="220"
        rx="24"
        stroke="url(#aiStroke)"
        strokeWidth="1.5"
        fill="rgba(99,102,241,0.04)"
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.1, ease: "easeOut" }}
      />

      <g stroke="#3f3f55" strokeWidth="6" strokeLinecap="round">
        <motion.line
          x1="52" y1="66" x2="300" y2="66"
          initial={{ pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15, duration: 0.6, ease: "easeOut" }}
        />
        <motion.line
          x1="52" y1="86" x2="210" y2="86"
          initial={{ pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.5, ease: "easeOut" }}
        />
      </g>

      <motion.g
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.45, duration: 0.5 }}
      >
        <motion.rect
          x="316"
          y="50"
          width="66"
          height="56"
          rx="14"
          fill="rgba(99,102,241,0.16)"
          stroke="url(#aiStroke)"
          strokeWidth="1"
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        <g fill="#a5b4fc">
          <circle cx="329" cy="78" r="3.5">
            <animate attributeName="opacity" values="0.3;1;0.3" dur="1.1s" repeatCount="indefinite" begin="0s" />
          </circle>
          <circle cx="342" cy="78" r="3.5">
            <animate attributeName="opacity" values="0.3;1;0.3" dur="1.1s" repeatCount="indefinite" begin="0.25s" />
          </circle>
          <circle cx="355" cy="78" r="3.5">
            <animate attributeName="opacity" values="0.3;1;0.3" dur="1.1s" repeatCount="indefinite" begin="0.5s" />
          </circle>
        </g>
        <motion.path
          d="M329 102l10 8 16-14"
          stroke="#a5b4fc"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.7, duration: 0.5 }}
        />
      </motion.g>

      <g stroke="#3f3f55" strokeWidth="6" strokeLinecap="round">
        <motion.line
          x1="52" y1="150" x2="250" y2="150"
          initial={{ pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.55, duration: 0.6, ease: "easeOut" }}
        />
        <motion.line
          x1="52" y1="170" x2="180" y2="170"
          initial={{ pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.7, duration: 0.5, ease: "easeOut" }}
        />
      </g>

      <motion.g
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.85, duration: 0.5 }}
      >
        <motion.rect
          x="52"
          y="196"
          width="112"
          height="42"
          rx="12"
          fill="rgba(217,70,239,0.1)"
          stroke="url(#aiAccent)"
          strokeWidth="1"
          animate={{ x: [0, 6, 0] }}
          transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
        />
        <path d="M66 214h8" stroke="#c026d3" strokeWidth="3" strokeLinecap="round" />
        <path d="M82 214h40" stroke="#4a4a5e" strokeWidth="4" strokeLinecap="round" />
      </motion.g>
    </svg>
  );
}
