"use client";

import { cn } from "@/lib/utils";

interface InfiniteMarqueeProps {
  text: string;
  className?: string;
  textClassName?: string;
  separator?: string;
  speed?: "slow" | "normal" | "fast";
}

export function InfiniteMarquee({
  text,
  className,
  textClassName,
  separator = "—",
  speed = "normal",
}: InfiniteMarqueeProps) {
  const speedClass = {
    slow: "animate-marquee-slow",
    normal: "animate-marquee",
    fast: "animate-marquee-fast",
  }[speed];

  const items = Array(20).fill(`${text} ${separator} `);

  return (
    <div className={cn("overflow-hidden whitespace-nowrap", className)}>
      <div className={cn("inline-flex", speedClass)}>
        {items.map((item, i) => (
          <span key={i} className={cn("mx-4", textClassName)}>
            {item}
          </span>
        ))}
        {items.map((item, i) => (
          <span key={`dup-${i}`} className={cn("mx-4", textClassName)}>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
