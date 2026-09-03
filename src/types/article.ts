export type ArticleSource = 'infoq' | 'quanta' | 'xda';

export interface ArticleFeedItem {
  id: string;
  source: ArticleSource;
  title: string;
  url: string;
  description: string | null;
  author: string | null;
  tags: string[];
  publishedAt: string;
}
