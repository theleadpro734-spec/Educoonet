interface EduConnetLogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'light' | 'dark';
}

export function EduConnetLogo({ size = 'md', variant = 'light' }: EduConnetLogoProps) {
  const fontSizes = { sm: 16, md: 20, lg: 26 };
  const fs = fontSizes[size];

  return (
    <span
      style={{
        fontSize: fs,
        fontWeight: 800,
        letterSpacing: '-0.03em',
        lineHeight: 1,
        whiteSpace: 'nowrap',
        userSelect: 'none',
      }}
    >
      <span style={{ color: variant === 'dark' ? '#ffffff' : '#1e3a8a' }}>Edu</span>
      <span style={{ color: variant === 'dark' ? '#93c5fd' : '#2563eb' }}>Connet</span>
    </span>
  );
}
