interface EduConnetLogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'light' | 'dark';
}

export function EduConnetLogo({ size = 'md', variant = 'light' }: EduConnetLogoProps) {
  const dims = { sm: { img: 28, fs: 15 }, md: { img: 36, fs: 19 }, lg: { img: 44, fs: 24 } }[size];

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 10,
        userSelect: 'none',
        whiteSpace: 'nowrap',
      }}
    >
      <img
        src="/logo.png"
        alt="EduConnet"
        width={dims.img}
        height={dims.img}
        style={{
          width: dims.img,
          height: dims.img,
          objectFit: 'contain',
          flexShrink: 0,
          filter: variant === 'dark' ? 'brightness(0) invert(1)' : 'none',
          transition: 'filter 0.3s ease',
        }}
      />
      <span
        style={{
          fontSize: dims.fs,
          fontWeight: 800,
          letterSpacing: '-0.03em',
          lineHeight: 1,
        }}
      >
        <span style={{ color: variant === 'dark' ? '#ffffff' : '#0A2463' }}>Edu</span>
        <span style={{ color: variant === 'dark' ? '#88C6FC' : '#0082F0' }}>Connet</span>
      </span>
    </span>
  );
}
