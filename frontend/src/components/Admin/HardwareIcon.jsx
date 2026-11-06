import React, { memo } from "react";

/**
 * High-performance, zero-network SVG hardware category icons.
 * Eliminates memory leaks and CDN image decoding bottlenecks on low-end systems.
 */
export const HardwareIcon = memo(({ category, className = "", size = 20, color = "currentColor" }) => {
  const cat = (category || "").toLowerCase().trim();

  switch (cat) {
    case "gpu":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke={color}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`hw-icon hw-icon-gpu ${className}`}
        >
          <rect x="2" y="5" width="20" height="14" rx="2" />
          <circle cx="8" cy="12" r="3.2" />
          <circle cx="8" cy="12" r="1" />
          <circle cx="16" cy="12" r="3.2" />
          <circle cx="16" cy="12" r="1" />
          <line x1="5" y1="19" x2="11" y2="19" strokeWidth="2.5" />
          <line x1="13" y1="19" x2="19" y2="19" strokeWidth="2.5" />
          <line x1="2" y1="8" x2="2" y2="16" strokeWidth="2.5" />
        </svg>
      );

    case "motherboard":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke={color}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`hw-icon hw-icon-mobo ${className}`}
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <rect x="6.5" y="6.5" width="5.5" height="5.5" rx="0.8" />
          <line x1="14.5" y1="6" x2="14.5" y2="13" strokeWidth="1.5" />
          <line x1="17" y1="6" x2="17" y2="13" strokeWidth="1.5" />
          <line x1="6.5" y1="15.5" x2="17.5" y2="15.5" strokeWidth="2" />
          <line x1="6.5" y1="18" x2="14.5" y2="18" strokeWidth="1.6" />
        </svg>
      );

    case "cpu":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke={color}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`hw-icon hw-icon-cpu ${className}`}
        >
          <rect x="5" y="5" width="14" height="14" rx="2" />
          <rect x="8.5" y="8.5" width="7" height="7" rx="1" />
          <line x1="9" y1="2" x2="9" y2="5" />
          <line x1="12" y1="2" x2="12" y2="5" />
          <line x1="15" y1="2" x2="15" y2="5" />
          <line x1="9" y1="19" x2="9" y2="22" />
          <line x1="12" y1="19" x2="12" y2="22" />
          <line x1="15" y1="19" x2="15" y2="22" />
          <line x1="2" y1="9" x2="5" y2="9" />
          <line x1="2" y1="12" x2="5" y2="12" />
          <line x1="2" y1="15" x2="5" y2="15" />
          <line x1="19" y1="9" x2="22" y2="9" />
          <line x1="19" y1="12" x2="22" y2="12" />
          <line x1="19" y1="15" x2="22" y2="15" />
        </svg>
      );

    case "ram":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke={color}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`hw-icon hw-icon-ram ${className}`}
        >
          <rect x="2" y="7" width="20" height="10" rx="1.5" />
          <rect x="4.5" y="9" width="3" height="4" rx="0.5" />
          <rect x="9" y="9" width="3" height="4" rx="0.5" />
          <rect x="13.5" y="9" width="3" height="4" rx="0.5" />
          <rect x="17.5" y="9" width="2" height="4" rx="0.5" />
          <line x1="3" y1="17" x2="10" y2="17" strokeWidth="2.5" />
          <line x1="13" y1="17" x2="21" y2="17" strokeWidth="2.5" />
          <circle cx="11.5" cy="17" r="0.6" fill={color} />
        </svg>
      );

    case "storage":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke={color}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`hw-icon hw-icon-storage ${className}`}
        >
          <rect x="3" y="6" width="18" height="12" rx="1.5" />
          <rect x="6" y="8.5" width="4" height="4" rx="0.5" />
          <rect x="12" y="8.5" width="6" height="3" rx="0.5" />
          <rect x="12" y="12.5" width="6" height="3" rx="0.5" />
          <line x1="3" y1="10" x2="3" y2="14" strokeWidth="2.5" />
        </svg>
      );

    case "psu":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke={color}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`hw-icon hw-icon-psu ${className}`}
        >
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <circle cx="10" cy="12" r="4.5" />
          <circle cx="10" cy="12" r="1.5" />
          <rect x="16.5" y="8" width="2.5" height="4" rx="0.5" />
          <rect x="16.5" y="14" width="2.5" height="2" rx="0.5" />
        </svg>
      );

    case "case":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke={color}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`hw-icon hw-icon-case ${className}`}
        >
          <rect x="5" y="2.5" width="14" height="19" rx="2" />
          <rect x="7.5" y="5.5" width="9" height="11" rx="1" />
          <circle cx="16" cy="3.8" r="0.7" fill={color} />
          <line x1="7" y1="21.5" x2="9" y2="21.5" strokeWidth="2.5" />
          <line x1="15" y1="21.5" x2="17" y2="21.5" strokeWidth="2.5" />
          <line x1="7.5" y1="16.5" x2="16.5" y2="16.5" strokeDasharray="1.5 1.5" />
        </svg>
      );

    default:
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke={color}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`hw-icon hw-icon-default ${className}`}
        >
          <polygon points="12 2 2 7 12 12 22 7 12 2" />
          <polyline points="2 17 12 22 22 17" />
          <polyline points="2 12 12 17 22 12" />
        </svg>
      );
  }
});

export default HardwareIcon;
