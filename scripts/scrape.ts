import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Anthropic from '@anthropic-ai/sdk';
import type { HNComment, HNSnapshot, HNStory, HotTopic } from '../src/types/hn.ts';
import type { GitHubRepo } from '../src/types/github.ts';
import type { DevToArticle } from '../src/types/devto.ts';
import type { HNJob } from '../src/types/hnjob.ts';
import type { SOQuestion } from '../src/types/stackoverflow.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const ALGOLIA_BASE = 'https://hn.algolia.com/api/v1';
const STORY_COUNT = 30;
const COMMENTS_PER_STORY = 4;
const TOPIC_COUNT = 24;

const GITHUB_TRENDING_URL = 'https://github.com/trending?since=daily';

const DEVTO_TAG = 'gamedev';
const DEVTO_TOP_DAYS = 7;
const DEVTO_COUNT = 20;

const JOBS_COUNT = 40;

const SO_COUNT = 30;
const SO_BODY_CHAR_LIMIT = 2000;

const SUMMARY_MODEL = 'claude-haiku-4-5';
const ARTICLE_CHAR_LIMIT = 6000;
const ARTICLE_FETCH_TIMEOUT_MS = 10_000;

const anthropic = process.env.ANTHROPIC_API_KEY ? new Anthropic() : null;
if (!anthropic) {
  console.warn('ANTHROPIC_API_KEY not set — skipping AI summaries.');
}

const STOPWORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'of', 'in', 'on', 'at', 'to', 'for',
  'with', 'is', 'are', 'was', 'were', 'be', 'been', 'it', 'its', 'this',
  'that', 'these', 'those', 'from', 'as', 'by', 'how', 'why', 'what', 'when',
  'who', 'you', 'your', 'we', 'our', 'i', 'my', 'do', 'does', 'did', 'not',
  'no', 'yes', 'new', 'vs', 'up', 'out', 'about', 'into', 'over', 'after',
  'show', 'ask', 'hn', 'via', 'using', 'use', 'can', 'will', 'just', 'more',
  'than', 'now', 'all', 'has', 'have', 'had', 'get', 'gets', 'one', 'two',
]);

interface AlgoliaHit {
  objectID: string;
  title: string;
  url: string | null;
  points: number;
  author: string;
  created_at: string;
  num_comments: number;
}

interface AlgoliaItem {
  id: number;
  author: string | null;
  text: string | null;
  created_at: string;
  children: AlgoliaItem[];
}

const HTML_ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  '#x27': "'",
  '#39': "'",
  nbsp: ' ',
  apos: "'",
};

function decodeEntities(input: string): string {
  return input.replace(/&(#x?[0-9a-f]+|[a-z0-9]+);/gi, (match, code: string) => {
    if (code.startsWith('#x')) return String.fromCodePoint(parseInt(code.slice(2), 16));
    if (code.startsWith('#')) return String.fromCodePoint(parseInt(code.slice(1), 10));
    return HTML_ENTITIES[code.toLowerCase()] ?? match;
  });
}

function stripHtml(html: string): string {
  const withoutTags = html.replace(/<[^>]*>/g, ' ');
  return decodeEntities(withoutTags).replace(/\s+/g, ' ').trim();
}

function extractArticleText(html: string): string {
  const withoutNonContent = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ');
  return stripHtml(withoutNonContent).slice(0, ARTICLE_CHAR_LIMIT);
}

async function fetchArticleText(url: string): Promise<string | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ARTICLE_FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; HackerMonitorBot/1.0)' },
    });
    if (!res.ok) return null;
    const contentType = res.headers.get('content-type') ?? '';
    if (!contentType.includes('html')) return null;
    const html = await res.text();
    const text = extractArticleText(html);
    return text.length > 200 ? text : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

async function summarizeText(title: string, text: string, context: string): Promise<string | null> {
  if (!anthropic) return null;
  try {
    const message = await anthropic.messages.create({
      model: SUMMARY_MODEL,
      max_tokens: 200,
      messages: [
        {
          role: 'user',
          content: `Summarize the following ${context} in 2-3 concise sentences for someone deciding whether to read it. Return only the summary, no preamble.\n\nTitle: ${title}\n\nText:\n${text}`,
        },
      ],
    });
    const block = message.content.find((b) => b.type === 'text');
    return block && block.type === 'text' ? block.text.trim() : null;
  } catch (err) {
    console.warn(`  summary failed for "${title}": ${(err as Error).message}`);
    return null;
  }
}

async function summarizeStory(title: string, url: string): Promise<string | null> {
  if (!anthropic) return null;
  const articleText = await fetchArticleText(url);
  if (!articleText) return null;
  return summarizeText(title, articleText, 'article');
}

async function summarizeSelfPost(title: string, rawText: string): Promise<string | null> {
  if (!anthropic) return null;
  const text = stripHtml(rawText).slice(0, ARTICLE_CHAR_LIMIT);
  if (text.length < 100) return null;
  return summarizeText(title, text, 'Hacker News post');
}

function extractDomain(url: string | null): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Request failed (${res.status}): ${url}`);
  return res.json() as Promise<T>;
}

interface StoryItemDetails {
  comments: HNComment[];
  selfText: string | null;
}

async function fetchStoryItemDetails(storyId: number): Promise<StoryItemDetails> {
  const item = await fetchJson<AlgoliaItem>(`${ALGOLIA_BASE}/items/${storyId}`);
  const comments: HNComment[] = [];
  for (const child of item.children ?? []) {
    if (!child.text) continue;
    comments.push({
      id: child.id,
      author: child.author,
      text: stripHtml(child.text),
      createdAt: child.created_at,
    });
    if (comments.length >= COMMENTS_PER_STORY) break;
  }
  return { comments, selfText: item.text };
}

function extractTopics(stories: HNStory[]): HotTopic[] {
  const counts = new Map<string, number>();
  for (const story of stories) {
    const words = story.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, ' ')
      .split(/\s+/)
      .filter((word) => word.length > 2 && !STOPWORDS.has(word) && Number.isNaN(Number(word)));
    const seenInTitle = new Set(words);
    for (const word of seenInTitle) {
      counts.set(word, (counts.get(word) ?? 0) + 1);
    }
  }
  return Array.from(counts.entries())
    .filter(([, count]) => count > 1)
    .sort((a, b) => b[1] - a[1])
    .slice(0, TOPIC_COUNT)
    .map(([word, count]) => ({ word, count }));
}

function parseTrendingRepos(html: string): GitHubRepo[] {
  const repos: GitHubRepo[] = [];
  const blockRe = /<article class="Box-row">([\s\S]*?)<\/article>/g;
  let blockMatch: RegExpExecArray | null;

  while ((blockMatch = blockRe.exec(html))) {
    const block = blockMatch[1];

    const headingMatch = block.match(/<h2 class="h3 lh-condensed">([\s\S]*?)<\/h2>/);
    if (!headingMatch) continue;
    const hrefMatch = headingMatch[1].match(/href="\/([^"/]+)\/([^"/]+)"/);
    if (!hrefMatch) continue;
    const [, owner, name] = hrefMatch;

    const descMatch = block.match(/<p class="col-9 color-fg-muted my-1 tmp-pr-4">\s*([\s\S]*?)\s*<\/p>/);
    const description = descMatch ? decodeEntities(descMatch[1].trim()) : null;

    const langMatch = block.match(/<span itemprop="programmingLanguage">([^<]*)<\/span>/);
    const language = langMatch ? langMatch[1].trim() : null;

    const colorMatch = block.match(/repo-language-color" style="background-color:\s*(#[0-9a-fA-F]{3,6})"/);
    const languageColor = colorMatch ? colorMatch[1] : null;

    const starsMatch = block.match(/\/stargazers"[^>]*>[\s\S]*?<\/svg>\s*([\d,]+)/);
    const stars = starsMatch ? Number(starsMatch[1].replace(/,/g, '')) : 0;

    const forksMatch = block.match(/\/forks"[^>]*>[\s\S]*?<\/svg>\s*([\d,]+)/);
    const forks = forksMatch ? Number(forksMatch[1].replace(/,/g, '')) : 0;

    const starsTodayMatch = block.match(/([\d,]+)\s+stars?\s+today/);
    const starsToday = starsTodayMatch ? Number(starsTodayMatch[1].replace(/,/g, '')) : 0;

    repos.push({
      id: `${owner}/${name}`,
      owner,
      name,
      url: `https://github.com/${owner}/${name}`,
      description,
      language,
      languageColor,
      stars,
      forks,
      starsToday,
      homepage: null,
      topics: [],
    });
  }

  return repos;
}

interface GitHubApiRepo {
  homepage: string | null;
  topics: string[];
}

async function fetchRepoDetails(owner: string, name: string): Promise<Pick<GitHubRepo, 'homepage' | 'topics'>> {
  try {
    const res = await fetch(`https://api.github.com/repos/${owner}/${name}`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; HackerMonitorBot/1.0)', Accept: 'application/vnd.github+json' },
    });
    if (!res.ok) return { homepage: null, topics: [] };
    const data = (await res.json()) as GitHubApiRepo;
    return { homepage: data.homepage?.trim() || null, topics: data.topics ?? [] };
  } catch {
    return { homepage: null, topics: [] };
  }
}

async function fetchTrendingRepos(): Promise<GitHubRepo[]> {
  let repos: GitHubRepo[];
  try {
    const res = await fetch(GITHUB_TRENDING_URL, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; HackerMonitorBot/1.0)' },
    });
    if (!res.ok) throw new Error(`Request failed (${res.status})`);
    const html = await res.text();
    repos = parseTrendingRepos(html);
  } catch (err) {
    console.warn(`  failed to fetch GitHub trending: ${(err as Error).message}`);
    return [];
  }

  for (const repo of repos) {
    const details = await fetchRepoDetails(repo.owner, repo.name);
    repo.homepage = details.homepage;
    repo.topics = details.topics;
  }

  return repos;
}

interface DevToApiArticle {
  id: number;
  title: string;
  url: string;
  description: string | null;
  cover_image: string | null;
  tag_list: string[];
  user: { name: string; username: string };
  positive_reactions_count: number;
  comments_count: number;
  reading_time_minutes: number;
  published_at: string;
}

async function fetchDevToArticles(): Promise<DevToArticle[]> {
  try {
    const url = `https://dev.to/api/articles?tag=${DEVTO_TAG}&top=${DEVTO_TOP_DAYS}&per_page=${DEVTO_COUNT}`;
    const articles = await fetchJson<DevToApiArticle[]>(url);
    return articles.map((a) => ({
      id: a.id,
      title: a.title,
      url: a.url,
      description: a.description,
      coverImage: a.cover_image,
      tags: a.tag_list,
      authorName: a.user.name,
      authorUsername: a.user.username,
      reactions: a.positive_reactions_count,
      comments: a.comments_count,
      readingTimeMinutes: a.reading_time_minutes,
      publishedAt: a.published_at,
    }));
  } catch (err) {
    console.warn(`  failed to fetch Dev.to articles: ${(err as Error).message}`);
    return [];
  }
}

function splitJobPosting(html: string): { title: string; body: string } {
  const splitIndex = html.search(/<p>/i);
  if (splitIndex === -1) {
    const full = stripHtml(html);
    return { title: full.slice(0, 140), body: full };
  }
  const header = stripHtml(html.slice(0, splitIndex));
  const body = stripHtml(html.slice(splitIndex));
  return { title: header.length > 0 ? header : body.slice(0, 140), body };
}

interface JobsThread {
  jobs: HNJob[];
  threadTitle: string | null;
  threadUrl: string | null;
}

async function fetchWhoIsHiringJobs(): Promise<JobsThread> {
  const empty: JobsThread = { jobs: [], threadTitle: null, threadUrl: null };
  try {
    const search = await fetchJson<{ hits: AlgoliaHit[] }>(
      `${ALGOLIA_BASE}/search_by_date?tags=story,author_whoishiring&hitsPerPage=10`,
    );
    const thread = search.hits.find((hit) => /who is hiring/i.test(hit.title));
    if (!thread) return empty;

    const threadId = Number(thread.objectID);
    const item = await fetchJson<AlgoliaItem>(`${ALGOLIA_BASE}/items/${threadId}`);

    const jobs: HNJob[] = (item.children ?? [])
      .filter((child) => child.text && !/^\[(flagged|dead|deleted)\]$/i.test(stripHtml(child.text)))
      .map((child) => {
        const { title, body } = splitJobPosting(child.text as string);
        return {
          id: child.id,
          author: child.author,
          title,
          text: body,
          numReplies: (child.children ?? []).length,
          createdAt: child.created_at,
          hnUrl: `https://news.ycombinator.com/item?id=${child.id}`,
        };
      })
      .sort((a, b) => b.numReplies - a.numReplies)
      .slice(0, JOBS_COUNT);

    return {
      jobs,
      threadTitle: thread.title,
      threadUrl: `https://news.ycombinator.com/item?id=${threadId}`,
    };
  } catch (err) {
    console.warn(`  failed to fetch Who is Hiring thread: ${(err as Error).message}`);
    return empty;
  }
}

interface SOApiQuestion {
  question_id: number;
  title: string;
  link: string;
  tags: string[];
  score: number;
  answer_count: number;
  view_count: number;
  is_answered: boolean;
  owner?: { display_name?: string; link?: string };
  creation_date: number;
  body?: string;
}

async function fetchStackOverflowQuestions(): Promise<SOQuestion[]> {
  try {
    const url = `https://api.stackexchange.com/2.3/questions?order=desc&sort=hot&site=stackoverflow&pagesize=${SO_COUNT}&filter=withbody`;
    const data = await fetchJson<{ items: SOApiQuestion[] }>(url);
    return data.items.map((q) => ({
      id: q.question_id,
      title: decodeEntities(q.title),
      url: q.link,
      tags: q.tags,
      score: q.score,
      answerCount: q.answer_count,
      viewCount: q.view_count,
      isAnswered: q.is_answered,
      ownerName: q.owner?.display_name ?? 'unknown',
      ownerUrl: q.owner?.link ?? null,
      createdAt: new Date(q.creation_date * 1000).toISOString(),
      bodyExcerpt: stripHtml(q.body ?? '').slice(0, SO_BODY_CHAR_LIMIT),
    }));
  } catch (err) {
    console.warn(`  failed to fetch Stack Overflow questions: ${(err as Error).message}`);
    return [];
  }
}

async function main() {
  console.log('Fetching HN front page...');
  const search = await fetchJson<{ hits: AlgoliaHit[] }>(
    `${ALGOLIA_BASE}/search?tags=front_page&hitsPerPage=${STORY_COUNT}`,
  );

  const stories: HNStory[] = [];
  let rank = 1;
  for (const hit of search.hits.slice(0, STORY_COUNT)) {
    console.log(`  [${rank}/${STORY_COUNT}] ${hit.title}`);
    const id = Number(hit.objectID);
    const { comments: topComments, selfText } = await fetchStoryItemDetails(id);
    const summary = hit.url
      ? await summarizeStory(hit.title, hit.url)
      : selfText
        ? await summarizeSelfPost(hit.title, selfText)
        : null;
    stories.push({
      id,
      rank,
      title: hit.title,
      url: hit.url,
      hnUrl: `https://news.ycombinator.com/item?id=${id}`,
      domain: extractDomain(hit.url),
      points: hit.points,
      author: hit.author,
      createdAt: hit.created_at,
      numComments: hit.num_comments,
      topComments,
      summary,
    });
    rank += 1;
  }

  console.log('Fetching GitHub trending repositories...');
  const githubTrending = await fetchTrendingRepos();
  console.log(`  found ${githubTrending.length} trending repositories`);

  console.log(`Fetching Dev.to #${DEVTO_TAG} articles...`);
  const devtoArticles = await fetchDevToArticles();
  console.log(`  found ${devtoArticles.length} articles`);

  console.log('Fetching HN "Who is hiring?" thread...');
  const { jobs, threadTitle, threadUrl } = await fetchWhoIsHiringJobs();
  console.log(`  found ${jobs.length} job postings from "${threadTitle ?? 'no thread found'}"`);

  console.log('Fetching Stack Overflow hot questions...');
  const stackOverflowQuestions = await fetchStackOverflowQuestions();
  console.log(`  found ${stackOverflowQuestions.length} questions`);

  const snapshot: HNSnapshot = {
    fetchedAt: new Date().toISOString(),
    stories,
    topics: extractTopics(stories),
    githubTrending,
    devtoArticles,
    jobs,
    jobsThreadTitle: threadTitle,
    jobsThreadUrl: threadUrl,
    stackOverflowQuestions,
  };

  const outDir = path.resolve(__dirname, '../src/data');
  await mkdir(outDir, { recursive: true });
  await writeFile(path.join(outDir, 'latest.json'), JSON.stringify(snapshot, null, 2));
  console.log(`Wrote ${stories.length} stories to src/data/latest.json`);

  await writeArchive(snapshot);
}

async function writeArchive(snapshot: HNSnapshot) {
  const date = snapshot.fetchedAt.slice(0, 10); // YYYY-MM-DD (UTC)
  const archiveDir = path.resolve(__dirname, '../public/data/archive');
  await mkdir(archiveDir, { recursive: true });
  await writeFile(path.join(archiveDir, `${date}.json`), JSON.stringify(snapshot, null, 2));

  const indexPath = path.join(archiveDir, 'index.json');
  let dates: string[] = [];
  try {
    dates = JSON.parse(await readFile(indexPath, 'utf-8'));
  } catch {
    dates = [];
  }
  const updatedDates = Array.from(new Set([...dates, date])).sort((a, b) => b.localeCompare(a));
  await writeFile(indexPath, JSON.stringify(updatedDates, null, 2));

  console.log(`Archived snapshot for ${date} (${updatedDates.length} day(s) available)`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
