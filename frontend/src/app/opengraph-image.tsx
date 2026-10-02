import { ImageResponse } from "next/og";

export const runtime = "nodejs";

export const alt = "ThePerfectResume — Build your perfect resume with AI";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

const pills = [
  "AI bullet suggestions",
  "ATS-friendly templates",
  "One-click export",
];

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          position: "relative",
          backgroundColor: "#08080d",
          backgroundImage:
            "radial-gradient(900px 420px at 50% -8%, rgba(99,102,241,0.38), transparent 60%), radial-gradient(520px 320px at 96% 108%, rgba(232,121,249,0.16), transparent 60%)",
          padding: "80px",
          fontFamily: "sans-serif",
        }}
      >
        {/* Grid texture */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.045) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            maskImage:
              "radial-gradient(ellipse 68% 58% at 50% 42%, black, transparent)",
            WebkitMaskImage:
              "radial-gradient(ellipse 68% 58% at 50% 42%, black, transparent)",
          }}
        />

        {/* Brand row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "72px",
              height: "72px",
              borderRadius: "20px",
              overflow: "hidden",
            }}
          >
            <svg width="72" height="72" viewBox="0 0 128 128" fill="none">
              <defs>
                <linearGradient id="og-grad" x1="8" y1="0" x2="120" y2="128" gradientUnits="userSpaceOnUse">
                  <stop offset="0" stopColor="#818cf8" />
                  <stop offset="1" stopColor="#4f46e5" />
                </linearGradient>
                <linearGradient id="og-check" x1="48" y1="52" x2="92" y2="84" gradientUnits="userSpaceOnUse">
                  <stop offset="0" stopColor="#4f46e5" />
                  <stop offset="1" stopColor="#3730a3" />
                </linearGradient>
              </defs>
              <rect width="128" height="128" rx="30" fill="url(#og-grad)" />
              <path
                d="M45 24h33l22 22v56a6 6 0 0 1-6 6H45a6 6 0 0 1-6-6V30a6 6 0 0 1 6-6Z"
                fill="white"
              />
              <path d="M78 24v18a6 6 0 0 0 6 6h16Z" fill="#c7d2fe" />
              <path
                d="M53 63l13 14 30-30"
                stroke="url(#og-check)"
                strokeWidth="10"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div
            style={{
              display: "flex",
              fontSize: "34px",
              fontWeight: 700,
              color: "#f4f4f8",
              letterSpacing: "-0.02em",
            }}
          >
            ThePerfect<span style={{ color: "#a5b4fc" }}>Resume</span>
          </div>
        </div>

        {/* Headline */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: "56px",
            fontSize: "76px",
            fontWeight: 700,
            letterSpacing: "-0.035em",
            lineHeight: 1.06,
          }}
        >
          <span style={{ color: "#f4f4f8" }}>Build the resume that</span>
          <span
            style={{
              display: "flex",
              backgroundImage:
                "linear-gradient(120deg, #ffffff 0%, #c7d2fe 45%, #818cf8 100%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              color: "transparent",
            }}
          >
            gets you hired
          </span>
        </div>

        {/* Subtext */}
        <div
          style={{
            display: "flex",
            marginTop: "28px",
            fontSize: "29px",
            color: "#9b9baa",
            maxWidth: "760px",
            lineHeight: 1.45,
          }}
        >
          A meticulous manual editor with an intelligent AI copilot — craft a
          pixel-perfect, ATS-friendly resume in minutes, not hours.
        </div>

        {/* Pills */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginTop: "48px",
          }}
        >
          {pills.map((pill) => (
            <div
              key={pill}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: "999px",
                padding: "14px 26px",
                fontSize: "24px",
                color: "#c7d2fe",
                backgroundColor: "rgba(255,255,255,0.04)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  width: "10px",
                  height: "10px",
                  borderRadius: "999px",
                  backgroundColor: "#818cf8",
                }}
              />
              {pill}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size },
  );
}
