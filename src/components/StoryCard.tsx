import { useState } from 'react';
import type { HNStory } from '../types/hn';
import { timeAgo } from '../utils/time';
import { CommentList } from './CommentList';

interface StoryCardProps {
  story: HNStory;
}

export function StoryCard({ story }: StoryCardProps) {
  const [expanded, setExpanded] = useState(false);
  const targetUrl = story.url ?? story.hnUrl;

  return (
    <article className="story">
      <div className="story__rank">{story.rank}</div>
      <div className="story__body">
        <h3 className="story__title">
          <a href={targetUrl} target="_blank" rel="noreferrer">
            {story.title}
          </a>
          {story.domain && <span className="story__domain">{story.domain}</span>}
        </h3>
        <div className="story__meta">
          <span className="story__points">&#9650; {story.points}</span>
          <span>by {story.author ?? 'unknown'}</span>
          <span>{timeAgo(story.createdAt)}</span>
          <button
            type="button"
            className="story__comments-toggle"
            onClick={() => setExpanded((v) => !v)}
            disabled={story.topComments.length === 0}
          >
            {story.numComments} comments {story.topComments.length > 0 && (expanded ? '▲' : '▼')}
          </button>
          <a className="story__hn-link" href={story.hnUrl} target="_blank" rel="noreferrer">
            view on HN
          </a>
        </div>
        {expanded && (
          <div className="story__comments">
            <CommentList comments={story.topComments} />
          </div>
        )}
      </div>
    </article>
  );
}
