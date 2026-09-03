import type { ItchGame } from '../types/itch';

interface GameCardProps {
  game: ItchGame;
  rank: number;
  onOpen: (game: ItchGame) => void;
}

export function GameCard({ game, rank, onOpen }: GameCardProps) {
  return (
    <article className="panel-card" onClick={() => onOpen(game)}>
      <div className="panel-card__top">
        <span className="panel-card__rank">{rank}</span>
        {game.price && <span className="panel-card__stars-today">{game.price}</span>}
      </div>
      <h3 className="panel-card__title">{game.title}</h3>
      {game.description && <p className="panel-card__desc">{game.description}</p>}
      <div className="panel-card__meta">
        {game.platforms.length > 0 && <span>{game.platforms.join(', ')}</span>}
      </div>
    </article>
  );
}
