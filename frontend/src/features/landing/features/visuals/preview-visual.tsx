"use client";

import { motion } from "motion/react";

export function PreviewVisual() {
  return (
    <svg
      viewBox="0 0 260 400"
      fill="none"
      className="h-full w-full"
      aria-hidden
    >
      <motion.rect
        x="20"
        y="18"
        width="220"
        height="364"
        rx="24"
        stroke="rgba(255,255,255,0.18)"
        strokeWidth="1.4"
        fill="rgba(255,255,255,0.02)"
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.1, ease: "easeOut" }}
      />

      <motion.circle
        cx="78"
        cy="86"
        r="26"
        fill="rgba(129,140,248,0.2)"
        stroke="#818cf8"
        strokeWidth="1.5"
        initial={{ scale: 0, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ type: "spring", stiffness: 200, damping: 14, delay: 0.3 }}
      />

      <g stroke="#4a4a5e" strokeWidth="6" strokeLinecap="round">
        <motion.line
          x1="120" y1="76" x2="196" y2="76"
          initial={{ pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.5, ease: "easeOut" }}
        />
        <motion.line
          x1="120" y1="98" x2="170" y2="98"
          initial={{ pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.5, ease: "easeOut" }}
        />
      </g>

      <g stroke="#3f3f55" strokeWidth="6" strokeLinecap="round">
        {[
          { y: 160, w: 140, d: 0.55 },
          { y: 188, w: 170, d: 0.63 },
          { y: 216, w: 120, d: 0.71 },
          { y: 244, w: 160, d: 0.79 },
          { y: 290, w: 150, d: 0.87 },
          { y: 318, w: 130, d: 0.95 },
        ].map((l) => (
          <motion.line
            key={l.y}
            x1="48"
            y1={l.y}
            x2={48 + l.w}
            y2={l.y}
            initial={{ pathLength: 0, opacity: 0 }}
            whileInView={{ pathLength: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: l.d, duration: 0.5, ease: "easeOut" }}
          />
        ))}
      </g>

      <motion.g
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 1, duration: 0.5 }}
      >
        <rect
          x="48"
          y="252"
          width="82"
          height="18"
          rx="9"
          fill="rgba(52,211,153,0.12)"
          stroke="rgba(52,211,153,0.4)"
          strokeWidth="1"
        />
        <circle cx="58" cy="261" r="3" fill="#34d399" />
        <path d="M66 261h40" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />
      </motion.g>
    </svg>
  );
}
