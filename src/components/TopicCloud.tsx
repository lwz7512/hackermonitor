import type { HotTopic } from '../types/hn';

interface TopicCloudProps {
  topics: HotTopic[];
  activeTopic: string | null;
  onSelect: (topic: string) => void;
}

export function TopicCloud({ topics, activeTopic, onSelect }: TopicCloudProps) {
  if (topics.length === 0) return null;
  const maxCount = Math.max(...topics.map((t) => t.count));

  return (
    <section className="panel topics">
      <h2 className="panel__heading">Hot Tags</h2>
      <div className="topics__cloud">
        {topics.map((topic) => {
          const weight = topic.count / maxCount;
          const isActive = topic.word === activeTopic;
          return (
            <button
              key={topic.word}
              type="button"
              className={`topics__tag${isActive ? ' topics__tag--active' : ''}`}
              style={{
                fontSize: `${0.75 + weight * 0.65}rem`,
                opacity: isActive ? 1 : 0.55 + weight * 0.45,
              }}
              title={`${topic.count} stories mention "${topic.word}"`}
              onClick={() => onSelect(topic.word)}
            >
              #{topic.word}
            </button>
          );
        })}
      </div>
    </section>
  );
}
