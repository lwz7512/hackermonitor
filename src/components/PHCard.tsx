import type { PHLaunch } from '../types/producthunt';

interface PHCardProps {
  launch: PHLaunch;
  onOpen: (launch: PHLaunch) => void;
}

export function PHCard({ launch, onOpen }: PHCardProps) {
  return (
    <article className="panel-card" onClick={() => onOpen(launch)}>
      <div className="panel-card__top">
        <span className="panel-card__rank">{launch.rank}</span>
      </div>
      <h3 className="panel-card__title">{launch.name}</h3>
      <p className="panel-card__desc">{launch.tagline}</p>
      <div className="panel-card__meta">
        <span className="panel-card__points">&#9650; {launch.votes}</span>
        <span>{launch.comments} comments</span>
      </div>
    </article>
  );
}
