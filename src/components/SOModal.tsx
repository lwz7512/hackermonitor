import type { SOQuestion } from '../types/stackoverflow';
import { timeAgo } from '../utils/time';
import { useEscapeKey } from '../hooks/useEscapeKey';

interface SOModalProps {
  question: SOQuestion;
  onClose: () => void;
}

export function SOModal({ question, onClose }: SOModalProps) {
  useEscapeKey(onClose);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="modal__close" onClick={onClose} aria-label="Close">
          &times;
        </button>

        <h2 className="modal__title">
          <a href={question.url} target="_blank" rel="noreferrer">
            {question.title}
          </a>
        </h2>
        <span className="modal__domain">
          by{' '}
          {question.ownerUrl ? (
            <a href={question.ownerUrl} target="_blank" rel="noreferrer">
              {question.ownerName}
            </a>
          ) : (
            question.ownerName
          )}
        </span>

        <div className="modal__meta">
          <span className="story__points">&#9650; {question.score}</span>
          <span>{question.answerCount} answers</span>
          <span>{question.viewCount.toLocaleString()} views</span>
          {question.isAnswered && <span className="panel-card__answered">answered</span>}
          <span>{timeAgo(question.createdAt)}</span>
          <a href={question.url} target="_blank" rel="noreferrer">
            view on Stack Overflow
          </a>
        </div>

        <section className="modal__section">
          <h3 className="panel__heading">Description</h3>
          {question.bodyExcerpt ? (
            <p className="modal__summary">{question.bodyExcerpt}</p>
          ) : (
            <p className="comments__empty">No description available.</p>
          )}
        </section>

        {question.tags.length > 0 && (
          <section className="modal__section">
            <h3 className="panel__heading">Tags</h3>
            <div className="modal__topics">
              {question.tags.map((tag) => (
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
