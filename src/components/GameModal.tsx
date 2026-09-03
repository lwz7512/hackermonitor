import type { ItchGame } from '../types/itch';
import { useEscapeKey } from '../hooks/useEscapeKey';

interface GameModalProps {
  game: ItchGame;
  onClose: () => void;
}

export function GameModal({ game, onClose }: GameModalProps) {
  useEscapeKey(onClose);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="modal__close" onClick={onClose} aria-label="Close">
          &times;
        </button>

        <h2 className="modal__title">
          <a href={game.url} target="_blank" rel="noreferrer">
            {game.title}
          </a>
        </h2>

        <div className="modal__meta">
          {game.price && <span className="panel-card__points">{game.price}</span>}
          {game.platforms.length > 0 && <span>{game.platforms.join(', ')}</span>}
          <a href={game.url} target="_blank" rel="noreferrer">
            view on itch.io
          </a>
        </div>

        <section className="modal__section">
          <h3 className="panel__heading">Description</h3>
          {game.description ? (
            <p className="modal__summary">{game.description}</p>
          ) : (
            <p className="comments__empty">No description available.</p>
          )}
        </section>
      </div>
    </div>
  );
}
