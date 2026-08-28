import type { PHLaunch } from '../types/producthunt';
import { useEscapeKey } from '../hooks/useEscapeKey';

interface PHModalProps {
  launch: PHLaunch;
  onClose: () => void;
}

export function PHModal({ launch, onClose }: PHModalProps) {
  useEscapeKey(onClose);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="modal__close" onClick={onClose} aria-label="Close">
          &times;
        </button>

        <h2 className="modal__title">
          <a href={launch.url} target="_blank" rel="noreferrer">
            {launch.name}
          </a>
        </h2>

        <div className="modal__meta">
          <span className="story__points">&#9650; {launch.votes}</span>
          <span>{launch.comments} comments</span>
          <a href={launch.url} target="_blank" rel="noreferrer">
            view on Product Hunt
          </a>
        </div>

        <section className="modal__section">
          <h3 className="panel__heading">Tagline</h3>
          <p className="modal__summary">{launch.tagline || 'No tagline available.'}</p>
        </section>

        {launch.topics.length > 0 && (
          <section className="modal__section">
            <h3 className="panel__heading">Topics</h3>
            <div className="modal__topics">
              {launch.topics.map((topic) => (
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
