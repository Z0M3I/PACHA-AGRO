import { ArticleCover } from './ArticleCover'
import type { Article } from '../lib/articles'

/** Tarjeta de artículo estilo revista: imagen con franja de categoría, antetítulo y título. */
export function ArticleCard({ a, showSummary = false }: { a: Article; showSummary?: boolean }) {
  return (
    <a href={a.href} className="article-card" data-testid="article-card">
      <ArticleCover motif={a.motif} band={a.band} bandColor={a.bandColor} />
      <span className="article-kicker">{a.kicker}</span>
      <span className="article-title">{a.title}</span>
      {showSummary && <span className="article-summary">{a.summary}</span>}
    </a>
  )
}

export function ArticleGrid({ items, showSummary }: { items: Article[]; showSummary?: boolean }) {
  return (
    <ul className="article-grid">
      {items.map(a => <li key={a.id}><ArticleCard a={a} showSummary={showSummary} /></li>)}
    </ul>
  )
}
