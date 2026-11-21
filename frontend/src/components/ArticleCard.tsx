import { ArticleCover } from './ArticleCover'
import { Icon } from './Icon'
import type { Article } from '../lib/articles'

/** Tarjeta de artículo: franja de categoría, ilustración, antetítulo, título en serif, resumen y pie. */
export function ArticleCard({ a, showSummary = false }: { a: Article; showSummary?: boolean }) {
  const isLesson = a.href.startsWith('#/aprender/') && !a.href.includes('/biblioteca/')
  return (
    <a href={a.href} className="article-card" data-testid="article-card">
      <ArticleCover motif={a.motif} band={a.band} bandColor={a.bandColor} />
      <span className="article-body">
        <span>
          <span className="article-kicker">{a.kicker}</span>
          <span className="article-title">{a.title}</span>
          {showSummary && a.summary && <span className="article-summary">{a.summary}</span>}
        </span>
        <span className="article-foot">
          <span className="flex items-center gap-1 font-medium"><Icon name={isLesson ? 'book' : 'leaf'} size={14} />{isLesson ? 'Lección rápida' : 'Biblioteca'}</span>
          <strong>{isLesson ? 'Leer lección' : 'Leer guía'} →</strong>
        </span>
      </span>
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
