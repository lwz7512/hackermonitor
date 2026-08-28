import type { HNJob } from '../types/hnjob';
import { timeAgo } from '../utils/time';

interface JobCardProps {
  job: HNJob;
  rank: number;
  onOpen: (job: HNJob) => void;
}

export function JobCard({ job, rank, onOpen }: JobCardProps) {
  return (
    <article className="panel-card" onClick={() => onOpen(job)}>
      <div className="panel-card__top">
        <span className="panel-card__rank">{rank}</span>
      </div>
      <h3 className="panel-card__title">{job.title}</h3>
      <p className="panel-card__desc">{job.text}</p>
      <div className="panel-card__meta">
        <span>by {job.author ?? 'unknown'}</span>
        {job.numReplies > 0 && <span>{job.numReplies} replies</span>}
        <span>{timeAgo(job.createdAt)}</span>
      </div>
    </article>
  );
}
