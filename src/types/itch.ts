export interface ItchGame {
  id: string;
  title: string;
  url: string;
  description: string | null;
  price: string | null;
  platforms: string[];
  publishedAt: string;
}
