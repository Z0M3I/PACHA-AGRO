export function LogoMark({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <rect width="64" height="64" rx="14" fill="#1E4A2C" />
      <circle cx="44" cy="20" r="8" fill="#F3D98B" />
      <path d="M8 50c10-6 20-8 30-6s14 3 18 2v10H8z" fill="#7A4E2D" />
      <path d="M8 42c12-5 24-6 36-3 4 1 8 1 12 0v8c-4 1-8 1-13-1-11-3-23-2-35 3z" fill="#9CC28A" />
      <path d="M30 40V24" stroke="#EEF3E7" strokeWidth="3" strokeLinecap="round" />
      <path d="M30 30c-6 0-9-4-9-9 6 0 9 4 9 9zM30 27c0-6 4-9 9-9 0 6-4 9-9 9z" fill="#EEF3E7" />
    </svg>
  )
}

/** Ilustración de portada: andenes (terrazas) bajo el sol del Altiplano. */
export function HeroArt() {
  return (
    <svg viewBox="0 20 360 100" preserveAspectRatio="xMidYMax slice" className="h-full w-full" aria-hidden="true">
      <circle cx="292" cy="62" r="18" fill="#F3D98B" />
      <path d="M0 70 L60 40 L110 62 L170 28 L240 66 L300 46 L360 64 V120 H0Z" fill="#2C6640" opacity=".55" />
      <path d="M0 86c40-8 80-10 120-6s80 6 120 2 80-8 120-6v44H0z" fill="#9CC28A" />
      <path d="M0 98c50-6 100-6 150-2s100 6 150 2 40-3 60-4v26H0z" fill="#B87A2A" />
      <path d="M0 108c60-4 120-4 180-1s120 3 180 0v13H0z" fill="#7A4E2D" />
      {[40, 70, 100, 130, 160, 190, 220, 250].map((x, i) => (
        <g key={x} transform={`translate(${x} ${84 - (i % 2) * 2})`} stroke="#1E4A2C" strokeWidth="2" strokeLinecap="round" fill="#1E4A2C">
          <path d="M0 6V-4" /><path d="M0 0c-4 0-6-3-6-6 4 0 6 3 6 6zM0-2c0-4 3-6 6-6 0 4-3 6-6 6z" stroke="none" />
        </g>
      ))}
    </svg>
  )
}
