import type { GitHubRepo } from '../types/github';

interface RepoCardProps {
  repo: GitHubRepo;
  rank: number;
  onOpen: (repo: GitHubRepo) => void;
}

export function RepoCard({ repo, rank, onOpen }: RepoCardProps) {
  return (
    <article className="panel-card" onClick={() => onOpen(repo)}>
      <div className="panel-card__top">
        <span className="panel-card__rank">{rank}</span>
        {repo.starsToday > 0 && (
          <span className="panel-card__stars-today">+{repo.starsToday} today</span>
        )}
      </div>
      <h3 className="panel-card__title">
        {repo.owner}/{repo.name}
      </h3>
      {repo.description && <p className="panel-card__desc">{repo.description}</p>}
      <div className="panel-card__meta">
        {repo.language && (
          <span className="repo-language">
            <span
              className="repo-language__dot"
              style={{ backgroundColor: repo.languageColor ?? 'var(--text-faint)' }}
            />
            {repo.language}
          </span>
        )}
        <span className="panel-card__points">&#9733; {repo.stars.toLocaleString()}</span>
        <span>{repo.forks.toLocaleString()} forks</span>
      </div>
    </article>
  );
}
