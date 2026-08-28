export interface GitHubRepo {
  id: string; // "owner/name"
  owner: string;
  name: string;
  url: string;
  description: string | null;
  language: string | null;
  languageColor: string | null;
  stars: number;
  forks: number;
  starsToday: number;
  homepage: string | null;
  topics: string[];
}
