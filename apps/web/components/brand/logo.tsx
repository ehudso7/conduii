import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  linkToHome?: boolean;
  testId?: string;
}

const sizeClasses = {
  sm: "h-6 w-6",
  md: "h-8 w-8",
  lg: "h-10 w-10",
};

const textSizeClasses = {
  sm: "text-lg",
  md: "text-xl",
  lg: "text-2xl",
};

export function Logo({
  className,
  size = "md",
  showText = true,
  linkToHome = true,
  testId,
}: LogoProps) {
  const content = (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        className={cn(
          "relative rounded-lg overflow-hidden flex-shrink-0",
          sizeClasses[size]
        )}
      >
        {/* Inline SVG for the icon to avoid hydration issues */}
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <defs>
            <linearGradient
              id="iconGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#0D9488" />
              <stop offset="100%" stopColor="#14B8A6" />
            </linearGradient>
          </defs>
          <circle cx="24" cy="24" r="22" fill="url(#iconGradient)" />
          <path
            d="M24 12C17.4 12 12 17.4 12 24s5.4 12 12 12c4.1 0 7.7-2.1 9.8-5.2"
            stroke="white"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
          />
          <circle cx="19" cy="20" r="2" fill="rgba(255,255,255,0.9)" />
          <circle cx="24" cy="24" r="2" fill="rgba(255,255,255,0.8)" />
          <circle cx="29" cy="28" r="2" fill="rgba(255,255,255,0.7)" />
        </svg>
      </div>
      {showText && (
        <span
          className={cn(
            "font-bold tracking-tight",
            textSizeClasses[size]
          )}
        >
          Conduii
        </span>
      )}
    </div>
  );

  if (linkToHome) {
    return (
      <Link href="/" className="hover:opacity-90 transition-opacity" data-testid={testId}>
        {content}
      </Link>
    );
  }

  return content;
}

export function LogoIcon({ className, size = "md" }: Omit<LogoProps, "showText" | "linkToHome">) {
  return (
    <div className={cn("rounded-lg overflow-hidden", sizeClasses[size], className)}>
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          <linearGradient
            id="iconGradientSmall"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#0D9488" />
            <stop offset="100%" stopColor="#14B8A6" />
          </linearGradient>
        </defs>
        <circle cx="24" cy="24" r="22" fill="url(#iconGradientSmall)" />
        <path
          d="M24 12C17.4 12 12 17.4 12 24s5.4 12 12 12c4.1 0 7.7-2.1 9.8-5.2"
          stroke="white"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="19" cy="20" r="2" fill="rgba(255,255,255,0.9)" />
        <circle cx="24" cy="24" r="2" fill="rgba(255,255,255,0.8)" />
        <circle cx="29" cy="28" r="2" fill="rgba(255,255,255,0.7)" />
      </svg>
    </div>
  );
}
