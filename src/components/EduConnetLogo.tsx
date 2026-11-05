interface EduConnetLogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'light' | 'dark';
}

export function EduConnetLogo({ size = 'md', variant = 'light' }: EduConnetLogoProps) {
  const dims = {
    sm: { icon: 26, fs: 15, gap: 7 },
    md: { icon: 34, fs: 19, gap: 9 },
    lg: { icon: 44, fs: 24, gap: 11 },
  }[size];

  const primaryColor = variant === 'dark' ? '#ffffff' : '#0F172A';
  const accentColor  = variant === 'dark' ? '#22D3EE' : '#06B6D4';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: dims.gap,
        userSelect: 'none',
        whiteSpace: 'nowrap',
        flexShrink: 0,
      }}
    >
      <svg
        width={dims.icon}
        height={dims.icon}
        viewBox="0 0 44 44"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        <defs>
          <linearGradient id="ec-grad" x1="4" y1="6" x2="40" y2="38" gradientUnits="userSpaceOnUse">
            <stop stopColor="#3B82F6" />
            <stop offset="1" stopColor="#1D4ED8" />
          </linearGradient>
        </defs>

        {/* Rounded background */}
        <rect x="2" y="2" width="40" height="40" rx="12" fill={variant === 'dark' ? '#1E293B' : '#EFF6FF'} />

        {/* Graduation cap - top diamond */}
        <path d="M22 9 L36 16 L22 23 L8 16 Z" fill="url(#ec-grad)" />

        {/* Cap base (trapezoid) */}
        <path d="M14 18.5 L14 25 Q14 27 22 27 Q30 27 30 25 L30 18.5 L22 23 Z" fill="#2563EB" opacity="0.75" />

        {/* Tassel */}
        <path d="M36 16 L36 22" stroke="#1D4ED8" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="36" cy="23.5" r="2" fill="#8B5CF6" />

        {/* Connection nodes - representing "Connet" */}
        <circle cx="14" cy="33" r="2.2" fill="#3B82F6" />
        <circle cx="22" cy="33" r="2.2" fill="#2563EB" />
        <circle cx="30" cy="33" r="2.2" fill="#3B82F6" />

        {/* Connection lines */}
        <path d="M14 33 L22 33 L30 33" stroke="#2563EB" strokeWidth="1.3" strokeLinecap="round" opacity="0.6" />

        {/* Upward connection from cap to nodes */}
        <path d="M22 27 L22 31" stroke="#2563EB" strokeWidth="1.3" strokeLinecap="round" opacity="0.5" />
      </svg>

      <span
        style={{
          fontSize: dims.fs,
          fontWeight: 800,
          letterSpacing: '-0.03em',
          lineHeight: 1,
        }}
      >
        <span style={{ color: primaryColor }}>Edu</span>
        <span style={{ color: accentColor }}>Connet</span>
      </span>
    </span>
  );
}
