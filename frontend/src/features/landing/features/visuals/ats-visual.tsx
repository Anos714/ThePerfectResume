"use client";

import { motion } from "motion/react";

export function ATSVisual() {
  return (
    <svg
      viewBox="0 0 220 120"
      fill="none"
      className="h-full w-full"
      aria-hidden
    >
      <defs>
        <linearGradient id="atsBar" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>
      </defs>

      <motion.line
        x1="24" y1="104" x2="196" y2="104"
        stroke="#3f3f55"
        strokeWidth="6"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />

      <g stroke="#3f3f55" strokeWidth="5" strokeLinecap="round">
        <motion.line
          x1="34" y1="76" x2="70" y2="76"
          initial={{ pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.4 }}
        />
        <motion.line
          x1="34" y1="52" x2="112" y2="52"
          initial={{ pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.4 }}
        />
        <motion.line
          x1="34" y1="28" x2="148" y2="28"
          initial={{ pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.4 }}
        />
      </g>

      <motion.g
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.6, duration: 0.4 }}
      >
        <rect
          x="160"
          y="46"
          width="48"
          height="20"
          rx="10"
          fill="rgba(52,211,153,0.14)"
          stroke="rgba(52,211,153,0.45)"
          strokeWidth="1"
        />
        <text
          x="184"
          y="60"
          textAnchor="middle"
          fill="#34d399"
          fontSize="11"
          fontWeight="700"
        >
          98
        </text>
      </motion.g>

      <motion.rect
        x="34"
        y="104"
        width="0"
        height="4"
        rx="2"
        fill="url(#atsBar)"
        initial={{ width: 0 }}
        whileInView={{ width: 148 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5, duration: 0.9, ease: "easeOut" }}
      />
    </svg>
  );
}
