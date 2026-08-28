import type { HNJob } from '../types/hnjob';
import { timeAgo } from '../utils/time';
import { useEscapeKey } from '../hooks/useEscapeKey';

interface JobModalProps {
  job: HNJob;
  onClose: () => void;
}

export function JobModal({ job, onClose }: JobModalProps) {
  useEscapeKey(onClose);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="modal__close" onClick={onClose} aria-label="Close">
          &times;
        </button>

        <h2 className="modal__title">{job.title}</h2>

        <div className="modal__meta">
          <span>by {job.author ?? 'unknown'}</span>
          {job.numReplies > 0 && <span>{job.numReplies} replies</span>}
          <span>{timeAgo(job.createdAt)}</span>
          <a href={job.hnUrl} target="_blank" rel="noreferrer">
            view on HN
          </a>
        </div>

        <section className="modal__section">
          <h3 className="panel__heading">Description</h3>
          <p className="modal__summary">{job.text}</p>
        </section>
      </div>
    </div>
  );
}
