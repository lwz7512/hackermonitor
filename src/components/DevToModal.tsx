import type { DevToArticle } from '../types/devto';
import { timeAgo } from '../utils/time';
import { useEscapeKey } from '../hooks/useEscapeKey';

interface DevToModalProps {
  article: DevToArticle;
  onClose: () => void;
}

export function DevToModal({ article, onClose }: DevToModalProps) {
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
        <span className="modal__domain">by {article.authorName}</span>

        <div className="modal__meta">
          <span className="story__points">&#9829; {article.reactions}</span>
          <span>{article.comments} comments</span>
          <span>{article.readingTimeMinutes} min read</span>
          <span>{timeAgo(article.publishedAt)}</span>
          <a href={article.url} target="_blank" rel="noreferrer">
            view on Dev.to
          </a>
        </div>

        <section className="modal__section">
          <h3 className="panel__heading">Description</h3>
          {article.description ? (
            <p className="modal__summary">{article.description}</p>
          ) : (
            <p className="comments__empty">No description available.</p>
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
