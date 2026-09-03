import { useEffect, useMemo, useState } from 'react';
import snapshot from './data/latest.json';
import { Header } from './components/Header';
import { TopicCloud } from './components/TopicCloud';
import { StoryPanel } from './components/StoryPanel';
import { StoryModal } from './components/StoryModal';
import { DatePager } from './components/DatePager';
import { Tabs, type TabKey } from './components/Tabs';
import { RepoCard } from './components/RepoCard';
import { RepoModal } from './components/RepoModal';
import { DevToCard } from './components/DevToCard';
import { DevToModal } from './components/DevToModal';
import { JobCard } from './components/JobCard';
import { JobModal } from './components/JobModal';
import { SOCard } from './components/SOCard';
import { SOModal } from './components/SOModal';
import { GameCard } from './components/GameCard';
import { GameModal } from './components/GameModal';
import { ArticleCard } from './components/ArticleCard';
import { ArticleModal } from './components/ArticleModal';
import type { HNSnapshot, HNStory } from './types/hn';
import type { GitHubRepo } from './types/github';
import type { DevToArticle } from './types/devto';
import type { HNJob } from './types/hnjob';
import type { SOQuestion } from './types/stackoverflow';
import type { ItchGame } from './types/itch';
import type { ArticleFeedItem } from './types/article';
import { titleMatchesTopic } from './utils/topics';
import { fetchArchiveDates, fetchSnapshotForDate } from './utils/archive';

const bundledData = snapshot as HNSnapshot;
const todayDate = bundledData.fetchedAt.slice(0, 10);

export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('hn');
  const [selectedStory, setSelectedStory] = useState<HNStory | null>(null);
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepo | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<DevToArticle | null>(null);
  const [selectedJob, setSelectedJob] = useState<HNJob | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<SOQuestion | null>(null);
  const [selectedGame, setSelectedGame] = useState<ItchGame | null>(null);
  const [selectedFeedArticle, setSelectedFeedArticle] = useState<ArticleFeedItem | null>(null);
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
  const devtoArticles = data.devtoArticles ?? [];
  const jobs = data.jobs ?? [];
  const stackOverflowQuestions = data.stackOverflowQuestions ?? [];
  const showHnStories = data.showHnStories ?? [];
  const itchGames = data.itchGames ?? [];
  const quantaArticles = data.quantaArticles ?? [];
  const infoqArticles = data.infoqArticles ?? [];
  const xdaArticles = data.xdaArticles ?? [];
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

        {activeTab === 'hn' && (
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
        )}

        {activeTab === 'github' && (
          <section className="panel">
            <h2 className="panel__heading">Trending Repositories</h2>
            <div className="story-grid">
              {githubTrending.map((repo, index) => (
                <RepoCard key={repo.id} repo={repo} rank={index + 1} onOpen={setSelectedRepo} />
              ))}
            </div>
            {githubTrending.length === 0 && (
              <p className="comments__empty">No trending repository data for this day.</p>
            )}
          </section>
        )}

        {activeTab === 'devto' && (
          <section className="panel">
            <h2 className="panel__heading">Dev.to &middot; #gamedev</h2>
            <div className="story-grid">
              {devtoArticles.map((article, index) => (
                <DevToCard
                  key={article.id}
                  article={article}
                  rank={index + 1}
                  onOpen={setSelectedArticle}
                />
              ))}
            </div>
            {devtoArticles.length === 0 && (
              <p className="comments__empty">No Dev.to articles for this day.</p>
            )}
          </section>
        )}

        {activeTab === 'jobs' && (
          <section className="panel">
            <div className="panel__heading-row">
              <h2 className="panel__heading">{data.jobsThreadTitle ?? 'Who is Hiring?'}</h2>
              {data.jobsThreadUrl && (
                <a
                  className="panel__filter-clear"
                  href={data.jobsThreadUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  view full thread on HN
                </a>
              )}
            </div>
            <div className="story-grid">
              {jobs.map((job, index) => (
                <JobCard key={job.id} job={job} rank={index + 1} onOpen={setSelectedJob} />
              ))}
            </div>
            {jobs.length === 0 && (
              <p className="comments__empty">No job postings for this day.</p>
            )}
          </section>
        )}

        {activeTab === 'stackoverflow' && (
          <section className="panel">
            <h2 className="panel__heading">Stack Overflow &middot; Hot Questions</h2>
            <div className="story-grid">
              {stackOverflowQuestions.map((question, index) => (
                <SOCard
                  key={question.id}
                  question={question}
                  rank={index + 1}
                  onOpen={setSelectedQuestion}
                />
              ))}
            </div>
            {stackOverflowQuestions.length === 0 && (
              <p className="comments__empty">No Stack Overflow data for this day.</p>
            )}
          </section>
        )}

        {activeTab === 'showhn' && (
          <section className="panel">
            <h2 className="panel__heading">Show HN</h2>
            <div className="story-grid">
              {showHnStories.map((story) => (
                <StoryPanel key={story.id} story={story} onOpen={setSelectedStory} />
              ))}
            </div>
            {showHnStories.length === 0 && (
              <p className="comments__empty">No Show HN posts for this day.</p>
            )}
          </section>
        )}

        {activeTab === 'itch' && (
          <section className="panel">
            <h2 className="panel__heading">itch.io &middot; New &amp; Popular</h2>
            <div className="story-grid">
              {itchGames.map((game, index) => (
                <GameCard key={game.id} game={game} rank={index + 1} onOpen={setSelectedGame} />
              ))}
            </div>
            {itchGames.length === 0 && (
              <p className="comments__empty">No itch.io games for this day.</p>
            )}
          </section>
        )}

        {activeTab === 'quanta' && (
          <section className="panel">
            <h2 className="panel__heading">Quanta Magazine</h2>
            <div className="story-grid">
              {quantaArticles.map((article, index) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  rank={index + 1}
                  onOpen={setSelectedFeedArticle}
                />
              ))}
            </div>
            {quantaArticles.length === 0 && (
              <p className="comments__empty">No Quanta Magazine articles for this day.</p>
            )}
          </section>
        )}

        {activeTab === 'infoq' && (
          <section className="panel">
            <h2 className="panel__heading">InfoQ</h2>
            <div className="story-grid">
              {infoqArticles.map((article, index) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  rank={index + 1}
                  onOpen={setSelectedFeedArticle}
                />
              ))}
            </div>
            {infoqArticles.length === 0 && (
              <p className="comments__empty">No InfoQ articles for this day.</p>
            )}
          </section>
        )}

        {activeTab === 'xda' && (
          <section className="panel">
            <h2 className="panel__heading">XDA Developers</h2>
            <div className="story-grid">
              {xdaArticles.map((article, index) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  rank={index + 1}
                  onOpen={setSelectedFeedArticle}
                />
              ))}
            </div>
            {xdaArticles.length === 0 && (
              <p className="comments__empty">No XDA Developers articles for this day.</p>
            )}
          </section>
        )}
      </main>
      <footer className="app__footer">
        Data refreshed daily via GitHub Actions from the{' '}
        <a href="https://hn.algolia.com/api" target="_blank" rel="noreferrer">
          HN Algolia API
        </a>
        , <a href="https://github.com/trending" target="_blank" rel="noreferrer">
          GitHub Trending
        </a>
        , <a href="https://dev.to/api" target="_blank" rel="noreferrer">
          Dev.to
        </a>
        , the{' '}
        <a href="https://api.stackexchange.com/" target="_blank" rel="noreferrer">
          Stack Exchange API
        </a>
        , <a href="https://itch.io/games/new-and-popular" target="_blank" rel="noreferrer">
          itch.io
        </a>
        , <a href="https://www.quantamagazine.org/" target="_blank" rel="noreferrer">
          Quanta Magazine
        </a>
        , <a href="https://www.infoq.com/" target="_blank" rel="noreferrer">
          InfoQ
        </a>
        , and{' '}
        <a href="https://www.xda-developers.com/" target="_blank" rel="noreferrer">
          XDA Developers
        </a>
        , with AI summaries generated by Claude. Not affiliated with Y Combinator, GitHub,
        Forem/Dev.to, Stack Exchange, itch.io, Quanta Magazine, InfoQ, or XDA Developers.
      </footer>

      {selectedStory && (
        <StoryModal story={selectedStory} onClose={() => setSelectedStory(null)} />
      )}
      {selectedRepo && <RepoModal repo={selectedRepo} onClose={() => setSelectedRepo(null)} />}
      {selectedArticle && (
        <DevToModal article={selectedArticle} onClose={() => setSelectedArticle(null)} />
      )}
      {selectedJob && <JobModal job={selectedJob} onClose={() => setSelectedJob(null)} />}
      {selectedQuestion && (
        <SOModal question={selectedQuestion} onClose={() => setSelectedQuestion(null)} />
      )}
      {selectedGame && <GameModal game={selectedGame} onClose={() => setSelectedGame(null)} />}
      {selectedFeedArticle && (
        <ArticleModal article={selectedFeedArticle} onClose={() => setSelectedFeedArticle(null)} />
      )}
    </div>
  );
}
