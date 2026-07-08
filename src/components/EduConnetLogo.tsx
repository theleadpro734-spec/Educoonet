interface EduConnetLogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'light' | 'dark';
}

export function EduConnetLogo({ size = 'md', variant = 'light' }: EduConnetLogoProps) {
  const dims = {
    sm: { img: 28, fs: 14 },
    md: { img: 36, fs: 18 },
    lg: { img: 44, fs: 22 },
  }[size];

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        userSelect: 'none',
        whiteSpace: 'nowrap',
        flexShrink: 0,
      }}
    >
      <img
        src="/9dedd1da-760d-4b8f-95d7-2c4884db1d37.png"
        alt="EduConnet"
        width={dims.img}
        height={dims.img}
        style={{
          width: dims.img,
          height: dims.img,
          objectFit: 'contain',
          display: 'block',
          flexShrink: 0,
          filter: variant === 'dark' ? 'brightness(0) invert(1)' : 'none',
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
        <span style={{ color: variant === 'dark' ? '#88C6FC' : '#4A90D9' }}>Connet</span>
      </span>
    </span>
  );
}
