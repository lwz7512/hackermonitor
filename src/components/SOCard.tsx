import type { SOQuestion } from '../types/stackoverflow';
import { timeAgo } from '../utils/time';

interface SOCardProps {
  question: SOQuestion;
  rank: number;
  onOpen: (question: SOQuestion) => void;
}

export function SOCard({ question, rank, onOpen }: SOCardProps) {
  return (
    <article className="panel-card" onClick={() => onOpen(question)}>
      <div className="panel-card__top">
        <span className="panel-card__rank">{rank}</span>
        {question.isAnswered && <span className="panel-card__answered">answered</span>}
      </div>
      <h3 className="panel-card__title">{question.title}</h3>
      <p className="panel-card__desc">{question.bodyExcerpt}</p>
      <div className="panel-card__meta">
        <span className="panel-card__points">&#9650; {question.score}</span>
        <span>{question.answerCount} answers</span>
        <span>{question.viewCount.toLocaleString()} views</span>
        <span>{timeAgo(question.createdAt)}</span>
      </div>
    </article>
  );
}
