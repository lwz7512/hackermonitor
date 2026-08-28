import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { HNComment, HNSnapshot, HNStory, HotTopic } from '../src/types/hn.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const ALGOLIA_BASE = 'https://hn.algolia.com/api/v1';
const STORY_COUNT = 30;
const COMMENTS_PER_STORY = 4;
const TOPIC_COUNT = 24;

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

async function fetchTopComments(storyId: number): Promise<HNComment[]> {
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
  return comments;
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
    const topComments = await fetchTopComments(id);
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
    });
    rank += 1;
  }

  const snapshot: HNSnapshot = {
    fetchedAt: new Date().toISOString(),
    stories,
    topics: extractTopics(stories),
  };

  const outDir = path.resolve(__dirname, '../src/data');
  await mkdir(outDir, { recursive: true });
  await writeFile(path.join(outDir, 'latest.json'), JSON.stringify(snapshot, null, 2));

  console.log(`Wrote ${stories.length} stories to src/data/latest.json`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
