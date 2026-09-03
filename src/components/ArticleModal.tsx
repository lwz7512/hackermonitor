import type { ArticleFeedItem } from '../types/article';
import { timeAgo } from '../utils/time';
import { useEscapeKey } from '../hooks/useEscapeKey';

interface ArticleModalProps {
  article: ArticleFeedItem;
  onClose: () => void;
}

export function ArticleModal({ article, onClose }: ArticleModalProps) {
  useEscapeKey(onClose);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="modal__close" onClick={onClose} aria-label="Close">
          &times;
        </button>

        <h2 className="modal__title">
          <a href={article.url} target="_blank" rel="noreferrer">
            {article.title}
          </a>
        </h2>
        {article.author && <span className="modal__domain">by {article.author}</span>}

        <div className="modal__meta">
          <span>{timeAgo(article.publishedAt)}</span>
          <a href={article.url} target="_blank" rel="noreferrer">
            read full article
          </a>
        </div>

        <section className="modal__section">
          <h3 className="panel__heading">Summary</h3>
          {article.description ? (
            <p className="modal__summary">{article.description}</p>
          ) : (
            <p className="comments__empty">No summary available.</p>
          )}
        </section>

        {article.tags.length > 0 && (
          <section className="modal__section">
            <h3 className="panel__heading">Tags</h3>
            <div className="modal__topics">
              {article.tags.map((tag) => (
                <span key={tag} className="modal__topic-tag">
                  {tag}
                </span>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
