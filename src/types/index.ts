export type BookCoverColor = "burgundy" | "emerald" | "navy" | "saffron" | "obsidian" | "russet";
export type BookCoverStyle = "classic" | "vintage" | "minimalist" | "ornate";

export interface SeriesBook {
  id?: string;
  title: string;
  author?: string;
  rating?: number;
  slug?: string;
  synopsis?: string;
  coverUrl?: string;
  hasReview?: boolean;
  bookNumber?: string | number;
  genre?: string;
}

export interface Book {
  id: string;
  slug?: string;
  title: string;
  author: string;
  rating: number; // 1-5
  reviewDate: string;
  genre: string;
  coverColor: BookCoverColor;
  coverStyle: BookCoverStyle;
  summary: string;
  reviewText: string;
  themes: string[];
  quotes: string[];
  reactions?: {
    love: number;
    insightful: number;
    agree: number;
    bookmark: number;
  };
  is_top_pick?: boolean;
  top_pick_order?: number;
  is_bottom_shelf?: boolean;
  is_discovery?: boolean;
  is_featured?: boolean;
  author_spotlight?: boolean;
  cover_url?: string;
  description?: string;
  category?: string;
  external_id?: string;
  created_at?: string;
  series?: string;
  is_series_review?: boolean;
  series_books?: (string | SeriesBook)[];
  bookNumber?: string | number;
}

export interface BookReview extends Book {}

export interface Comment {
  id: string;
  reviewId: string;
  author: string;
  timestamp: string;
  text: string;
  avatarSeed?: string;
  created_at?: string;
  isReview?: boolean;
  rating?: number;
}

export interface Reaction {
  book_id: string;
  love: number;
  insightful: number;
  agree: number;
  bookmark: number;
}

export interface Profile {
  id: string;
  username: string;
  role: "admin" | "user";
}

export interface SiteConfig {
  announcement?: string;
  featured_genre?: string;
  maintenance_mode?: boolean;
  library_name?: string;
}

export interface AuthorDiscovery {
  id: string;
  name: string;
  slug?: string;
  bio: string;
  notable_works: (string | Book)[];
  spotlight_quote?: string;
  image_url?: string;
  website_url?: string;
  socials_url?: string;
  buy_books_url?: string;
  twitter_url?: string;
  instagram_url?: string;
  facebook_url?: string;
  linkedin_url?: string;
  social_media_handle?: string;
  socialMediaHandle?: string;
  social_media_url?: string;
  socialMediaUrl?: string;
  did_you_know?: string;
  fun_facts?: string[];
  isSpotlight?: boolean;
}

export function getAuthorSlug(author: { id?: string; name: string; slug?: string }): string {
  if (author.slug && author.slug.trim()) return author.slug;
  return author.name.toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function getBookSlug(book: { id: string; slug?: string; title?: string }): string {
  const raw = (book.slug && book.slug.trim()) ? book.slug : (book.title || book.id);
  return raw.toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export interface BookCharacter {
  id: string;
  name: string;
  slug: string;
  bookId: string;
  role: "protagonist" | "antagonist" | "deuteragonist" | "supporting";
  description: string;
  traits: string[];
  reactions?: {
    love: number;
    insightful: number;
    agree: number;
    bookmark: number;
  };
  imageUrl?: string;
  created_at?: string;
}

export interface CustomRankingList {
  id: string;
  title: string;
  slug: string;
  itemType: "book" | "character";
  season: string;
  listType: "top-picks" | "bottom-shelf";
  items: string[];
  created_at?: string;
}


