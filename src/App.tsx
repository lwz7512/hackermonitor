import snapshot from './data/latest.json';
import { Header } from './components/Header';
import { TopicCloud } from './components/TopicCloud';
import { StoryCard } from './components/StoryCard';
import type { HNSnapshot } from './types/hn';

const data = snapshot as HNSnapshot;

export default function App() {
  return (
    <div className="app">
      <Header fetchedAt={data.fetchedAt} storyCount={data.stories.length} />
      <main className="app__main">
        <TopicCloud topics={data.topics} />
        <section className="panel">
          <h2 className="panel__heading">Top Stories</h2>
          <div className="story-list">
            {data.stories.map((story) => (
              <StoryCard key={story.id} story={story} />
            ))}
          </div>
        </section>
      </main>
      <footer className="app__footer">
        Data refreshed daily via GitHub Actions from the{' '}
        <a href="https://hn.algolia.com/api" target="_blank" rel="noreferrer">
          HN Algolia API
        </a>
        . Not affiliated with Y Combinator.
      </footer>
    </div>
  );
}
