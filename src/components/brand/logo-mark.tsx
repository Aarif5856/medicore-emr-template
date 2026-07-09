import type { SVGProps } from "react";

/**
 * MediCore logomark: rounded square containing a medical cross
 * intersected by a pulse/heartbeat line. Uses currentColor for the
 * cross+pulse so it inherits from text color; background uses the
 * primary token via className.
 */
export function LogoMark({
  className,
  ...props
}: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
      {...props}
    >
      {/* Rounded square background */}
      <rect width="32" height="32" rx="8" fill="currentColor" />
      {/* Medical cross (white) */}
      <path
        d="M13.5 7h5a1 1 0 0 1 1 1v4.5H24a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1h-4.5V24a1 1 0 0 1-1 1h-5a1 1 0 0 1-1-1v-4.5H8a1 1 0 0 1-1-1v-5a1 1 0 0 1 1-1h4.5V8a1 1 0 0 1 1-1Z"
        fill="#fff"
        fillOpacity="0.18"
      />
      {/* Pulse line across the middle */}
      <path
        d="M5 16h5.5l2-3.5 3 7 2.5-5 2 3.5H27"
        stroke="#fff"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
