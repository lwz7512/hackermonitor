import { useEffect, useMemo, useState } from 'react';
import snapshot from './data/latest.json';
import { Header } from './components/Header';
import { TopicCloud } from './components/TopicCloud';
import { StoryPanel } from './components/StoryPanel';
import { StoryModal } from './components/StoryModal';
import { DatePager } from './components/DatePager';
import { Tabs, type TabKey } from './components/Tabs';
import { RepoCard } from './components/RepoCard';
import type { HNSnapshot, HNStory } from './types/hn';
import { titleMatchesTopic } from './utils/topics';
import { fetchArchiveDates, fetchSnapshotForDate } from './utils/archive';

const bundledData = snapshot as HNSnapshot;
const todayDate = bundledData.fetchedAt.slice(0, 10);

export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('hn');
  const [selectedStory, setSelectedStory] = useState<HNStory | null>(null);
  const [activeTopic, setActiveTopic] = useState<string | null>(null);

  const [availableDates, setAvailableDates] = useState<string[]>([todayDate]);
  const [viewDate, setViewDate] = useState<string | null>(null); // null = today (bundled data)
  const [remoteData, setRemoteData] = useState<HNSnapshot | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchArchiveDates().then((dates) => {
      if (dates.length > 0) setAvailableDates(dates);
    });
  }, []);

  useEffect(() => {
    if (viewDate === null) {
      setRemoteData(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetchSnapshotForDate(viewDate)
      .then((snap) => {
        if (!cancelled) setRemoteData(snap);
      })
      .catch(() => {
        if (!cancelled) setRemoteData(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [viewDate]);

  const data = viewDate === null ? bundledData : (remoteData ?? bundledData);
  const githubTrending = data.githubTrending ?? [];
  const currentIndex = Math.max(0, availableDates.indexOf(viewDate ?? todayDate));
  const canGoOlder = currentIndex < availableDates.length - 1;
  const canGoNewer = currentIndex > 0;

  function goToIndex(index: number) {
    const date = availableDates[index];
    setSelectedStory(null);
    setActiveTopic(null);
    setViewDate(date === todayDate ? null : date);
  }

  const visibleStories = useMemo(
    () =>
      activeTopic
        ? data.stories.filter((story) => titleMatchesTopic(story.title, activeTopic))
        : data.stories,
    [data, activeTopic],
  );

  return (
    <div className="app">
      <Header fetchedAt={data.fetchedAt} storyCount={data.stories.length} />
      <main className="app__main">
        {availableDates.length > 1 && (
          <DatePager
            label={viewDate ?? todayDate}
            isToday={viewDate === null}
            canGoOlder={canGoOlder}
            canGoNewer={canGoNewer}
            loading={loading}
            onOlder={() => goToIndex(currentIndex + 1)}
            onNewer={() => goToIndex(currentIndex - 1)}
          />
        )}

        <Tabs active={activeTab} onChange={setActiveTab} />

        {activeTab === 'hn' ? (
          <>
            <TopicCloud
              topics={data.topics}
              activeTopic={activeTopic}
              onSelect={(topic) => setActiveTopic((prev) => (prev === topic ? null : topic))}
            />
            <section className="panel">
              <div className="panel__heading-row">
                <h2 className="panel__heading">Top Stories</h2>
                {activeTopic && (
                  <button
                    type="button"
                    className="panel__filter-clear"
                    onClick={() => setActiveTopic(null)}
                  >
                    showing "{activeTopic}" &times; clear
                  </button>
                )}
              </div>
              <div className="story-grid">
                {visibleStories.map((story) => (
                  <StoryPanel key={story.id} story={story} onOpen={setSelectedStory} />
                ))}
              </div>
              {visibleStories.length === 0 && (
                <p className="comments__empty">No stories match "{activeTopic}".</p>
              )}
            </section>
          </>
        ) : (
          <section className="panel">
            <h2 className="panel__heading">Trending Repositories</h2>
            <div className="story-grid">
              {githubTrending.map((repo, index) => (
                <RepoCard key={repo.id} repo={repo} rank={index + 1} />
              ))}
            </div>
            {githubTrending.length === 0 && (
              <p className="comments__empty">No trending repository data for this day.</p>
            )}
          </section>
        )}
      </main>
      <footer className="app__footer">
        Data refreshed daily via GitHub Actions from the{' '}
        <a href="https://hn.algolia.com/api" target="_blank" rel="noreferrer">
          HN Algolia API
        </a>{' '}
        and{' '}
        <a href="https://github.com/trending" target="_blank" rel="noreferrer">
          GitHub Trending
        </a>
        , with AI summaries generated by Claude. Not affiliated with Y Combinator or GitHub.
      </footer>

      {selectedStory && (
        <StoryModal story={selectedStory} onClose={() => setSelectedStory(null)} />
      )}
    </div>
  );
}
