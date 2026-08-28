export interface SOQuestion {
  id: number;
  title: string;
  url: string;
  tags: string[];
  score: number;
  answerCount: number;
  viewCount: number;
  isAnswered: boolean;
  ownerName: string;
  ownerUrl: string | null;
  createdAt: string;
  bodyExcerpt: string;
}
