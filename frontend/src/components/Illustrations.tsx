/** Ilustraciones simples (SVG en línea, < 1 KB c/u) para las lecciones. */
const P = { fill: 'none', stroke: '#1E4A2C', strokeWidth: 3, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }

export function LessonArt({ icon, size = 64 }: { icon: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <rect width="64" height="64" rx="16" fill={icon === 'frost' || icon === 'hail' ? '#E1E8EF' : icon === 'soil' || icon === 'field' ? '#EFE3D3' : '#DCE7D1'} />
      {icon === 'forecast' && <><circle cx="24" cy="24" r="8" fill="#F3D98B" /><path {...P} d="M22 46h22a8 8 0 0 0 0-16 11 11 0 0 0-21 3 7 7 0 0 0-1 13z" fill="#FFFDF8" /></>}
      {icon === 'frost' && <g {...P} stroke="#24435F"><path d="M32 14v36M16 23l32 18M16 41l32-18" /><path d="M27 17l5 4 5-4M27 47l5-4 5 4" /></g>}
      {icon === 'hail' && <><path {...P} d="M18 34h28a8 8 0 0 0 0-16 11 11 0 0 0-21 3 7 7 0 0 0-7 13z" fill="#FFFDF8" stroke="#24435F" />{[[22, 44], [32, 48], [42, 44], [27, 54], [38, 55]].map(([x, y]) => <circle key={`${x}${y}`} cx={x} cy={y} r="3" fill="#24435F" />)}</>}
      {icon === 'seed' && <><path {...P} d="M32 50V30" /><path d="M32 36c-8 0-12-5-12-12 8 0 12 5 12 12zM32 32c0-8 5-12 12-12 0 8-5 12-12 12z" fill="#2C6640" /><path d="M12 52h40" {...P} stroke="#7A4E2D" /></>}
      {icon === 'soil' && <><path d="M8 30h48v26H8z" fill="#7A4E2D" /><path d="M8 30c8-4 16 4 24 0s16 4 24 0" {...P} stroke="#2C6640" />{[[20, 40], [36, 46], [46, 38]].map(([x, y]) => <path key={x} d={`M${x} ${y}c-3 4 0 7 3 4`} fill="#9CC4E4" stroke="#9CC4E4" strokeWidth="3" />)}</>}
      {icon === 'field' && <>{[0, 1, 2].map(i => <path key={i} d={`M6 ${30 + i * 9}c16-6 36-6 52 0`} {...P} stroke={i === 1 ? '#B87A2A' : '#7A4E2D'} />)}<circle cx="48" cy="16" r="6" fill="#F3D98B" /></>}
      {icon === 'shield' && <><path d="M32 10l18 7v13c0 12-8 20-18 24-10-4-18-12-18-24V17z" {...P} fill="#FFFDF8" /><path {...P} d="M24 32l6 6 11-12" /></>}
    </svg>
  )
}
