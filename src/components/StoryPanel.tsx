import type { HNStory } from '../types/hn';
import { timeAgo } from '../utils/time';
import { parseTitle } from '../utils/title';

interface StoryPanelProps {
  story: HNStory;
  onOpen: (story: HNStory) => void;
}

export function StoryPanel({ story, onOpen }: StoryPanelProps) {
  const { title, isVideo } = parseTitle(story.title);

  return (
    <article className="panel-card" onClick={() => onOpen(story)}>
      <div className="panel-card__top">
        <span className="panel-card__rank">{story.rank}</span>
        {story.summary && (
          <span className="panel-card__ai-badge" title="AI summary available">
            &#129302;
          </span>
        )}
      </div>
      <h3 className="panel-card__title">
        {isVideo && <span title="Video">&#127909; </span>}
        {title}
      </h3>
      {story.domain && <span className="panel-card__domain">{story.domain}</span>}
      <div className="panel-card__meta">
        <span className="panel-card__points">&#9650; {story.points}</span>
        <span>{story.numComments} comments</span>
        <span>{timeAgo(story.createdAt)}</span>
      </div>
    </article>
  );
}
