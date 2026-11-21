/** Portadas ilustradas para artículos (SVG propio, ~1 KB c/u: cargan rápido con poca señal).
 *  Estilo de revista: escena del tema + franja vertical de color con la categoría. */

export type Motif = 'forecast' | 'frost' | 'hail' | 'seed' | 'soil' | 'field' | 'shield' | 'potato' | 'quinoa' | 'corn'
  | 'calendar' | 'pest' | 'coffee' | 'water'

const SKY = '#dfeaf2'
const EARTH = '#7a4e2d'
const LEAF = '#2c6640'

function Scene({ motif }: { motif: Motif }) {
  switch (motif) {
    case 'forecast': return <>
      <rect width="320" height="200" fill="#cfe1ee" />
      <circle cx="120" cy="80" r="34" fill="#f3d98b" />
      <path d="M130 150h110a34 34 0 0 0 0-68 46 46 0 0 0-88 12 30 30 0 0 0-22 56z" fill="#fffdf8" />
      <path d="M0 175c60-14 120-14 180-4s100 6 140-4v33H0z" fill="#9cc28a" />
    </>
    case 'frost': return <>
      <rect width="320" height="200" fill="#d9e6f0" />
      <path d="M0 150c50-20 110-24 170-12s110 10 150-4v66H0z" fill="#eef3f7" />
      <g stroke="#24435f" strokeWidth="7" strokeLinecap="round" fill="none" transform="translate(200 78)">
        <path d="M0-48V48M-42-24l84 48M-42 24l84-48" /><path d="M-12-38l12 10 12-10M-12 38l12-10 12 10" />
      </g>
      {[40, 80, 120].map(x => <g key={x} transform={`translate(${x} 150)`} fill={LEAF}><path d="M0 0v-26" stroke={LEAF} strokeWidth="4" /><ellipse cx="-8" cy="-20" rx="9" ry="5" /><ellipse cx="8" cy="-26" rx="9" ry="5" /></g>)}
    </>
    case 'hail': return <>
      <rect width="320" height="200" fill="#c9d4de" />
      <path d="M70 92h170a40 40 0 0 0 0-80 56 56 0 0 0-106 14 38 38 0 0 0-64 66z" fill="#7d8c99" />
      {[[90, 120], [130, 140], [170, 118], [210, 145], [250, 122], [110, 165], [190, 175], [235, 168]].map(([x, y]) => <circle key={`${x}${y}`} cx={x} cy={y} r="8" fill="#fff" stroke="#24435f" strokeWidth="2" />)}
      <path d="M0 185h320v15H0z" fill="#9cc28a" />
    </>
    case 'seed': return <>
      <rect width="320" height="200" fill={SKY} />
      <path d="M0 120h320v80H0z" fill={EARTH} />
      <path d="M160 122V70" stroke={LEAF} strokeWidth="8" strokeLinecap="round" />
      <path d="M160 92c-26 0-40-16-40-40 26 0 40 16 40 40zM160 80c0-26 16-40 40-40 0 26-16 40-40 40z" fill="#4f9a5c" />
      <ellipse cx="160" cy="150" rx="16" ry="10" fill="#e3c27a" />
      {[50, 100, 220, 270].map(x => <path key={x} d={`M${x} 140c6-6 14-6 20 0`} stroke="#5b3a21" strokeWidth="4" fill="none" />)}
    </>
    case 'soil': return <>
      <rect width="320" height="200" fill={SKY} />
      <path d="M0 70h320v130H0z" fill="#8a5a36" /><path d="M0 115h320v85H0z" fill="#6c4428" /><path d="M0 160h320v40H0z" fill="#553420" />
      <path d="M0 70c30-10 60 8 90 0s60 8 90 0 60 8 90 0 30-8 50 0" stroke="#4f9a5c" strokeWidth="8" fill="none" />
      {[[70, 100], [150, 135], [230, 95], [270, 150]].map(([x, y]) => <path key={x} d={`M${x} ${y}c-7 10 0 18 7 10`} fill="#9cc4e4" stroke="#9cc4e4" strokeWidth="5" />)}
    </>
    case 'field': return <>
      <rect width="320" height="200" fill="#e9dcc3" />
      <circle cx="260" cy="50" r="24" fill="#f3d98b" />
      {[0, 1, 2, 3].map(i => <path key={i} d={`M-10 ${90 + i * 30}c80-22 240-22 340 0`} stroke={i % 2 ? '#b87a2a' : EARTH} strokeWidth="14" fill="none" />)}
    </>
    case 'shield': return <>
      <rect width="320" height="200" fill="#e5ebde" />
      <path d="M160 30l66 24v46c0 44-30 72-66 86-36-14-66-42-66-86V54z" fill="#fffdf8" stroke={LEAF} strokeWidth="8" />
      <path d="M128 106l22 22 42-46" stroke={LEAF} strokeWidth="12" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </>
    case 'potato': return <>
      <rect width="320" height="200" fill="#efe3d3" />
      <path d="M0 140h320v60H0z" fill={EARTH} />
      {[[110, 140, 40, 28], [190, 150, 46, 30], [150, 170, 34, 22]].map(([x, y, rx, ry]) => <ellipse key={x} cx={x} cy={y} rx={rx} ry={ry} fill="#c79a5b" stroke="#8a5f30" strokeWidth="3" />)}
      <path d="M160 112V50" stroke={LEAF} strokeWidth="6" /><ellipse cx="140" cy="62" rx="18" ry="9" fill="#4f9a5c" /><ellipse cx="180" cy="74" rx="18" ry="9" fill="#4f9a5c" /><ellipse cx="160" cy="44" rx="12" ry="8" fill="#4f9a5c" />
    </>
    case 'quinoa': return <>
      <rect width="320" height="200" fill="#dfe8ef" />
      <path d="M0 165h320v35H0z" fill="#b08a5a" />
      {[[90, '#b5462f'], [160, '#d98b2b'], [230, '#8e3a5a']].map(([x, c]) => <g key={x as number} transform={`translate(${x} 0)`}>
        <path d="M0 168V80" stroke={LEAF} strokeWidth="5" />
        {[0, 1, 2, 3, 4, 5].map(i => <circle key={i} cx={(i % 2 ? 9 : -9) * (1 - i / 8)} cy={40 + i * 10} r={9 - i / 2} fill={c as string} />)}
      </g>)}
    </>
    case 'corn': return <>
      <rect width="320" height="200" fill="#e9eedc" />
      <path d="M0 178h320v22H0z" fill="#b08a5a" />
      <path d="M150 180V30" stroke={LEAF} strokeWidth="8" />
      <path d="M150 140c-40-12-74 6-96 34M150 110c-34-30-70-30-94-20" stroke="#4f9a5c" strokeWidth="11" fill="none" strokeLinecap="round" />
      <g transform="translate(196 96) rotate(18)">
        <path d="M0-52c18 8 22 40 18 70-4 22-14 34-18 34s-14-12-18-34c-4-30 0-62 18-70z" fill="#f2c84b" stroke="#c89a1e" strokeWidth="3" />
        {[-34, -20, -6, 8, 22, 36].map(y => <path key={y} d={`M-14 ${y}h28`} stroke="#d9a92a" strokeWidth="2.5" />)}
        <path d="M0-50V50" stroke="#d9a92a" strokeWidth="2.5" />
        <path d="M-6 52c-18-8-30-30-26-62M6 52c18-8 30-30 26-62" stroke="#6aa35a" strokeWidth="8" fill="none" strokeLinecap="round" />
      </g>
    </>
    case 'calendar': return <>
      <rect width="320" height="200" fill="#e5ebde" />
      <rect x="80" y="38" width="160" height="134" rx="10" fill="#fffdf8" stroke={LEAF} strokeWidth="5" />
      <path d="M80 70h160" stroke={LEAF} strokeWidth="5" />
      {[0, 1, 2, 3].map(r => [0, 1, 2, 3, 4].map(c => <rect key={`${r}${c}`} x={96 + c * 28} y={82 + r * 22} width="18" height="14" rx="3"
        fill={r === 1 && c > 1 ? '#4f9a5c' : r === 2 && c < 3 ? '#b87a2a' : '#dce7d1'} />))}
    </>
    case 'pest': return <>
      <rect width="320" height="200" fill="#e3ecd9" />
      <path d="M60 170c20-90 120-140 220-130-10 100-90 150-220 130z" fill="#4f9a5c" />
      <path d="M60 170c60-40 120-80 220-130" stroke={LEAF} strokeWidth="4" fill="none" />
      <g transform="translate(190 100)"><ellipse rx="16" ry="11" fill="#a63a2b" /><circle cx="-14" r="7" fill="#1f2620" />{[-8, 0, 8].map(x => <path key={x} d={`M${x} 8l-4 10M${x} -8l-4 -10`} stroke="#1f2620" strokeWidth="3" />)}</g>
    </>
    case 'coffee': return <>
      <rect width="320" height="200" fill="#e9dcc3" />
      <path d="M40 60c40-30 100-30 130 10" stroke={LEAF} strokeWidth="6" fill="none" />
      {[[80, 110], [120, 130], [170, 108], [210, 136], [250, 112], [150, 160], [200, 170]].map(([x, y]) => <ellipse key={`${x}${y}`} cx={x} cy={y} rx="16" ry="12" fill={x > 180 ? '#5b3a21' : '#a63a2b'} />)}
    </>
    case 'water': return <>
      <rect width="320" height="200" fill="#dfeaf2" />
      <path d="M0 150h320v50H0z" fill={EARTH} />
      {[[90, 70], [160, 50], [230, 74]].map(([x, y]) => <path key={x} d={`M${x} ${y}c-18 26-18 46 0 46s18-20 0-46z`} fill="#5a9bd1" />)}
      {[70, 130, 190, 250].map(x => <g key={x} transform={`translate(${x} 150)`}><path d="M0 0v-20" stroke={LEAF} strokeWidth="4" /><ellipse cx="-7" cy="-16" rx="8" ry="4" fill="#4f9a5c" /></g>)}
    </>
  }
}

export function ArticleCover({ motif, band, bandColor }: { motif: Motif; band: string; bandColor: string }) {
  return (
    <div className="article-cover">
      <svg viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><Scene motif={motif} /></svg>
      <span className="article-band" style={{ background: bandColor }}>{band}</span>
    </div>
  )
}
