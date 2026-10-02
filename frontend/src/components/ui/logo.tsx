import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoMarkProps {
  className?: string;
  /** Unique id suffix so multiple gradient defs on one page never collide */
  uid?: string;
  style?: React.CSSProperties;
}

/**
 * ThePerfectResume mark — a folded resume document with a checkmark swept
 * across it: "resume" + "perfect" fused into one glyph, in the brand gradient.
 */
export function LogoMark({ className, uid = "logo", style }: LogoMarkProps) {
  return (
    <svg
      viewBox="0 0 128 128"
      fill="none"
      className={className}
      style={style}
      aria-hidden
      role="presentation"
    >
      <defs>
        <linearGradient
          id={`${uid}-grad`}
          x1="8"
          y1="0"
          x2="120"
          y2="128"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#818cf8" />
          <stop offset="1" stopColor="#4f46e5" />
        </linearGradient>
        <linearGradient
          id={`${uid}-check`}
          x1="48"
          y1="52"
          x2="92"
          y2="84"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#4f46e5" />
          <stop offset="1" stopColor="#3730a3" />
        </linearGradient>
      </defs>

      {/* Badge */}
      <rect width="128" height="128" rx="30" fill={`url(#${uid}-grad)`} />
      {/* Top-left gloss for depth */}
      <path
        d="M30 0h68a30 30 0 0 1 30 30v2c-24-14-58-22-98-24-6-2 0 0 0-8Z"
        fill="white"
        opacity="0.14"
      />

      {/* Paper */}
      <path
        d="M45 24h33l22 22v56a6 6 0 0 1-6 6H45a6 6 0 0 1-6-6V30a6 6 0 0 1 6-6Z"
        fill="white"
      />
      {/* Folded corner */}
      <path d="M78 24v18a6 6 0 0 0 6 6h16Z" fill="#c7d2fe" />

      {/* Checkmark — perfection */}
      <path
        d="M53 63l13 14 30-30"
        stroke={`url(#${uid}-check)`}
        strokeWidth="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface LogoProps {
  className?: string;
  markClassName?: string;
  /** mark size in px */
  size?: number;
  showWordmark?: boolean;
  href?: string | null;
  wordClassName?: string;
  ariaLabel?: string;
  onClick?: () => void;
}

export function Logo({
  className,
  markClassName,
  size = 36,
  showWordmark = true,
  href = "/",
  wordClassName,
  ariaLabel = "ThePerfectResume home",
  onClick,
}: LogoProps) {
  const mark = (
    <LogoMark
      uid={href ?? "logo"}
      className={cn("shrink-0", markClassName)}
      style={{ width: size, height: size }}
    />
  );

  const content = (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      {mark}
      {showWordmark && (
        <span
          className={cn(
            "font-display text-[17px] font-semibold tracking-tight",
            wordClassName,
          )}
        >
          ThePerfect<span className="text-brand-300">Resume</span>
        </span>
      )}
    </span>
  );

  if (!href) return content;

  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      onClick={onClick}
      className="inline-flex"
    >
      {content}
    </Link>
  );
}
