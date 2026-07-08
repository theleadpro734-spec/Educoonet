interface EduConnetLogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'light' | 'dark';
}

export function EduConnetLogo({ size = 'md', variant = 'light' }: EduConnetLogoProps) {
  const dims = {
    sm: { img: 26, fs: 14, pad: 3, br: 5 },
    md: { img: 32, fs: 18, pad: 4, br: 6 },
    lg: { img: 40, fs: 22, pad: 5, br: 8 },
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
      {/* On dark backgrounds: wrap in a white pill so the logo is visible */}
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: dims.img + dims.pad * 2,
          height: dims.img + dims.pad * 2,
          borderRadius: dims.br,
          backgroundColor: variant === 'dark' ? 'rgba(255,255,255,0.92)' : 'transparent',
          flexShrink: 0,
          transition: 'background-color 0.3s ease',
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
            display: 'block',
          }}
        />
      </span>

      <span
        style={{
          fontSize: dims.fs,
          fontWeight: 800,
          letterSpacing: '-0.03em',
          lineHeight: 1,
        }}
      >
        <span style={{ color: variant === 'dark' ? '#ffffff' : '#0A2463' }}>Edu</span>
        <span style={{ color: variant === 'dark' ? '#88C6FC' : '#2D8BDB' }}>Connet</span>
      </span>
    </span>
  );
}
