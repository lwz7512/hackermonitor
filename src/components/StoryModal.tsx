import type { HNStory } from '../types/hn';
import { timeAgo } from '../utils/time';
import { parseTitle } from '../utils/title';
import { useEscapeKey } from '../hooks/useEscapeKey';
import { CommentList } from './CommentList';

interface StoryModalProps {
  story: HNStory;
  onClose: () => void;
}

export function StoryModal({ story, onClose }: StoryModalProps) {
  useEscapeKey(onClose);

  const targetUrl = story.url ?? story.hnUrl;
  const { title, isVideo } = parseTitle(story.title);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="modal__close" onClick={onClose} aria-label="Close">
          &times;
        </button>

        <h2 className="modal__title">
          {isVideo && <span title="Video">&#127909; </span>}
          <a href={targetUrl} target="_blank" rel="noreferrer">
            {title}
          </a>
        </h2>
        {story.domain && <span className="modal__domain">{story.domain}</span>}

        <div className="modal__meta">
          <span className="story__points">&#9650; {story.points}</span>
          <span>by {story.author ?? 'unknown'}</span>
          <span>{timeAgo(story.createdAt)}</span>
          <a href={story.hnUrl} target="_blank" rel="noreferrer">
            view on HN
          </a>
        </div>

        <section className="modal__section">
          <h3 className="panel__heading">AI Summary</h3>
          {story.summary ? (
            <p className="modal__summary">{story.summary}</p>
          ) : (
            <p className="comments__empty">No AI summary available for this story.</p>
          )}
        </section>

        <section className="modal__section">
          <h3 className="panel__heading">Top Comments</h3>
          <CommentList comments={story.topComments} />
        </section>
      </div>
    </div>
  );
}
