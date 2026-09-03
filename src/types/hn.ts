import type { GitHubRepo } from './github';
import type { DevToArticle } from './devto';
import type { HNJob } from './hnjob';
import type { SOQuestion } from './stackoverflow';
import type { ArticleFeedItem } from './article';
import type { ItchGame } from './itch';

export interface HNComment {
  id: number;
  author: string | null;
  text: string | null;
  createdAt: string;
}

export interface HNStory {
  id: number;
  rank: number;
  title: string;
  url: string | null;
  hnUrl: string;
  domain: string | null;
  points: number;
  author: string | null;
  createdAt: string;
  numComments: number;
  topComments: HNComment[];
  summary: string | null;
}

export interface HotTopic {
  word: string;
  count: number;
}

export interface HNSnapshot {
  fetchedAt: string;
  stories: HNStory[];
  topics: HotTopic[];
  githubTrending: GitHubRepo[];
  devtoArticles: DevToArticle[];
  jobs: HNJob[];
  jobsThreadTitle: string | null;
  jobsThreadUrl: string | null;
  stackOverflowQuestions: SOQuestion[];
  showHnStories: HNStory[];
  itchGames: ItchGame[];
  quantaArticles: ArticleFeedItem[];
  infoqArticles: ArticleFeedItem[];
  xdaArticles: ArticleFeedItem[];
}
