import type { DevToArticle } from '../types/devto';
import { timeAgo } from '../utils/time';

interface DevToCardProps {
  article: DevToArticle;
  rank: number;
  onOpen: (article: DevToArticle) => void;
}

export function DevToCard({ article, rank, onOpen }: DevToCardProps) {
  return (
    <article className="panel-card" onClick={() => onOpen(article)}>
      <div className="panel-card__top">
        <span className="panel-card__rank">{rank}</span>
        <span className="panel-card__reading-time">{article.readingTimeMinutes} min read</span>
      </div>
      <h3 className="panel-card__title">{article.title}</h3>
      {article.description && <p className="panel-card__desc">{article.description}</p>}
      <div className="panel-card__meta">
        <span className="panel-card__points">&#9829; {article.reactions}</span>
        <span>{article.comments} comments</span>
        <span>{timeAgo(article.publishedAt)}</span>
      </div>
    </article>
  );
}
