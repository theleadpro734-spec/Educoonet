interface EduConnetLogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'light' | 'dark';
}

export function EduConnetLogo({ size = 'md', variant = 'light' }: EduConnetLogoProps) {
  const dims = {
    sm: { icon: 24, fs: 14, gap: 6 },
    md: { icon: 32, fs: 18, gap: 8 },
    lg: { icon: 40, fs: 22, gap: 10 },
  }[size];

  const primaryColor = variant === 'dark' ? '#ffffff' : '#0A2463';
  const accentColor = variant === 'dark' ? '#88C6FC' : '#0082F0';

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
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        <rect
          x="2"
          y="2"
          width="36"
          height="36"
          rx="10"
          fill={variant === 'dark' ? '#1E3352' : '#EFF8FF'}
        />
        <path
          d="M12 14C12 12.8954 12.8954 12 14 12H26C27.1046 12 28 12.8954 28 14V26C28 27.1046 27.1046 28 26 28H14C12.8954 28 12 27.1046 12 26V14Z"
          fill={accentColor}
        />
        <path
          d="M16 18L20 22L24 18"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="20" cy="24" r="1.5" fill="white" />
        <circle cx="20" cy="16" r="1.5" fill="white" />
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
