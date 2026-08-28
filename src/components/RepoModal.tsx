import type { GitHubRepo } from '../types/github';
import { useEscapeKey } from '../hooks/useEscapeKey';

interface RepoModalProps {
  repo: GitHubRepo;
  onClose: () => void;
}

export function RepoModal({ repo, onClose }: RepoModalProps) {
  useEscapeKey(onClose);
  const topics = repo.topics ?? [];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="modal__close" onClick={onClose} aria-label="Close">
          &times;
        </button>

        <h2 className="modal__title">
          <a href={repo.url} target="_blank" rel="noreferrer">
            {repo.owner}/{repo.name}
          </a>
        </h2>

        <div className="modal__meta">
          {repo.language && (
            <span className="repo-language">
              <span
                className="repo-language__dot"
                style={{ backgroundColor: repo.languageColor ?? 'var(--text-faint)' }}
              />
              {repo.language}
            </span>
          )}
          <span className="story__points">&#9733; {repo.stars.toLocaleString()}</span>
          <span>{repo.forks.toLocaleString()} forks</span>
          {repo.starsToday > 0 && (
            <span className="panel-card__stars-today">+{repo.starsToday} today</span>
          )}
          <a href={repo.url} target="_blank" rel="noreferrer">
            view on GitHub
          </a>
          {repo.homepage && (
            <a href={repo.homepage} target="_blank" rel="noreferrer">
              official website
            </a>
          )}
        </div>

        <section className="modal__section">
          <h3 className="panel__heading">Description</h3>
          {repo.description ? (
            <p className="modal__summary">{repo.description}</p>
          ) : (
            <p className="comments__empty">No description available.</p>
          )}
        </section>

        {topics.length > 0 && (
          <section className="modal__section">
            <h3 className="panel__heading">Topics</h3>
            <div className="modal__topics">
              {topics.map((topic) => (
                <span key={topic} className="modal__topic-tag">
                  {topic}
                </span>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
