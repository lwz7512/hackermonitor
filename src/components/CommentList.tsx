import type { HNComment } from '../types/hn';
import { timeAgo } from '../utils/time';

interface CommentListProps {
  comments: HNComment[];
}

export function CommentList({ comments }: CommentListProps) {
  if (comments.length === 0) {
    return <p className="comments__empty">No comments yet.</p>;
  }

  return (
    <ul className="comments">
      {comments.map((comment) => (
        <li key={comment.id} className="comments__item">
          <div className="comments__meta">
            <span className="comments__author">{comment.author ?? '[deleted]'}</span>
            <span className="comments__time">{timeAgo(comment.createdAt)}</span>
          </div>
          <p className="comments__text">{comment.text}</p>
        </li>
      ))}
    </ul>
  );
}
