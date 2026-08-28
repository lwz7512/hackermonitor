import { formatTimestamp, timeAgo } from '../utils/time';

interface HeaderProps {
  fetchedAt: string;
  storyCount: number;
}

export function Header({ fetchedAt, storyCount }: HeaderProps) {
  return (
    <header className="header">
      <div className="header__title-row">
        <h1 className="header__title">
          <span className="header__mark">$</span> hacker-monitor
        </h1>
        <a
          className="header__source-link"
          href="https://news.ycombinator.com/"
          target="_blank"
          rel="noreferrer"
        >
          news.ycombinator.com &rarr;
        </a>
      </div>
      <p className="header__subtitle">
        {storyCount} stories captured &middot; updated {timeAgo(fetchedAt)}{' '}
        <span className="header__timestamp">({formatTimestamp(fetchedAt)})</span>
      </p>
    </header>
  );
}
