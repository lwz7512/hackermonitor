import { formatDateLabel } from '../utils/archive';

interface DatePagerProps {
  label: string;
  isToday: boolean;
  canGoOlder: boolean;
  canGoNewer: boolean;
  loading: boolean;
  onOlder: () => void;
  onNewer: () => void;
}

export function DatePager({
  label,
  isToday,
  canGoOlder,
  canGoNewer,
  loading,
  onOlder,
  onNewer,
}: DatePagerProps) {
  return (
    <div className="date-pager">
      <button
        type="button"
        className="date-pager__btn"
        onClick={onOlder}
        disabled={!canGoOlder || loading}
      >
        &larr; Older
      </button>
      <span className="date-pager__label">
        {isToday ? 'Today' : formatDateLabel(label)}
        {loading && <span className="date-pager__loading"> &middot; loading&hellip;</span>}
      </span>
      <button
        type="button"
        className="date-pager__btn"
        onClick={onNewer}
        disabled={!canGoNewer || loading}
      >
        Newer &rarr;
      </button>
    </div>
  );
}
