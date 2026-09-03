import type { ArticleFeedItem } from '../types/article';
import { timeAgo } from '../utils/time';

interface ArticleCardProps {
  article: ArticleFeedItem;
  rank: number;
  onOpen: (article: ArticleFeedItem) => void;
}

export function ArticleCard({ article, rank, onOpen }: ArticleCardProps) {
  return (
    <article className="panel-card" onClick={() => onOpen(article)}>
      <div className="panel-card__top">
        <span className="panel-card__rank">{rank}</span>
      </div>
      <h3 className="panel-card__title">{article.title}</h3>
      {article.description && <p className="panel-card__desc">{article.description}</p>}
      <div className="panel-card__meta">
        {article.author && <span>by {article.author}</span>}
        <span>{timeAgo(article.publishedAt)}</span>
      </div>
    </article>
  );
}
