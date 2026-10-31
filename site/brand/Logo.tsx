// 站点的字标和圆环标记：页面用 Wordmark 画站名（size 是高度，单位像素），RingMark 是小标记，转起来就是加载动画。
// 这里用站名排字；有自己的 Logo 时，把 Wordmark 换成你的 SVG（保持同样的参数）。
import { SITE } from "../site.ts";

export function Wordmark({ size = 24, className = "", title = SITE.name }: { size?: number; className?: string; title?: string }) {
  return (
    <span className={`inline-flex min-w-0 items-center gap-2.5 ${className}`} aria-label={title} role="img">
      <svg viewBox="0 0 48 48" width={Math.max(26, size + 5)} height={Math.max(26, size + 5)} aria-hidden="true" className="shrink-0">
        <rect x="0" y="0" width="48" height="48" rx="12" fill="#172238"/>
        <circle cx="13" cy="34" r="4" fill="#9B9BFF"/>
        <path d="M17 33C26 32 32 24 32 15M17 33C31 30 38 22 39 11" fill="none" stroke="#9B9BFF" strokeWidth="3" strokeLinecap="round"/>
        <path d="m35 8 7 1-3 6" fill="none" stroke="#56DFD4" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      <span className="flex min-w-0 flex-col leading-[1.15] tracking-tight">
        <span className="whitespace-nowrap text-[12px] font-bold uppercase text-ink">AI Marketer</span>
        <span className="whitespace-nowrap text-[16px] font-black text-accent">Signal</span>
      </span>
    </span>
  );
}

/** A ring with a dot; spinning, it is the loader. */
export function RingMark({ className = "", spinning = false }: { className?: string; spinning?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <g style={spinning ? { transformOrigin: "12px 12px", animation: "spin-slow 1.1s linear infinite" } : undefined}>
        <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeDasharray="42 15" />
      </g>
      <circle cx="12" cy="12" r="2.6" fill="currentColor" />
    </svg>
  );
}
