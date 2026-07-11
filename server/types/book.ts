export interface Book {
  id: string;
  title: string;
  author: string;
  rating?: number;
  slug?: string;
  cover_url?: string;
  summary?: string;
  genre?: string;
}
