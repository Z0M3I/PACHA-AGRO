/** Muestra texto con "## Título" y listas "- ítem" sin usar HTML (evita inyección de código). */
export function SimpleText({ text }: { text: string }) {
  const blocks = text.split(/\n\s*\n/)
  return (
    <div className="space-y-3 text-lg">
      {blocks.map((b, i) => {
        const lines = b.split('\n').filter(Boolean)
        if (lines[0]?.startsWith('## ')) {
          const rest = lines.slice(1)
          return (
            <section key={i}>
              <h2 className="text-xl font-bold text-bosque">{lines[0].slice(3)}</h2>
              {rest.length > 0 && <SimpleText text={rest.join('\n')} />}
            </section>
          )
        }
        if (lines.every(l => l.startsWith('- '))) {
          return <ul key={i} className="list-disc space-y-1 pl-6">{lines.map((l, j) => <li key={j}>{l.slice(2)}</li>)}</ul>
        }
        return <p key={i}>{lines.join(' ')}</p>
      })}
    </div>
  )
}
