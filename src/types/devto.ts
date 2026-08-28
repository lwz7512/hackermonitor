export interface DevToArticle {
  id: number;
  title: string;
  url: string;
  description: string | null;
  coverImage: string | null;
  tags: string[];
  authorName: string;
  authorUsername: string;
  reactions: number;
  comments: number;
  readingTimeMinutes: number;
  publishedAt: string;
}
