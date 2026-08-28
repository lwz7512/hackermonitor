import type { GitHubRepo } from './github';
import type { DevToArticle } from './devto';

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
}
