export interface HNJob {
  id: number;
  author: string | null;
  title: string;
  text: string;
  numReplies: number;
  createdAt: string;
  hnUrl: string;
}
