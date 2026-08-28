import type { HotTopic } from '../types/hn';

interface TopicCloudProps {
  topics: HotTopic[];
}

export function TopicCloud({ topics }: TopicCloudProps) {
  if (topics.length === 0) return null;
  const maxCount = Math.max(...topics.map((t) => t.count));

  return (
    <section className="panel topics">
      <h2 className="panel__heading">Hot Topics</h2>
      <div className="topics__cloud">
        {topics.map((topic) => {
          const weight = topic.count / maxCount;
          return (
            <span
              key={topic.word}
              className="topics__tag"
              style={{
                fontSize: `${0.75 + weight * 0.65}rem`,
                opacity: 0.55 + weight * 0.45,
              }}
              title={`${topic.count} stories mention "${topic.word}"`}
            >
              {topic.word}
            </span>
          );
        })}
      </div>
    </section>
  );
}
