import { useState, useEffect } from "react";

export interface HomepageConfig {
  curatorName: string;
  curatorTitle: string;
  curatorBio: string;
  heroImageUrl: string;
  scriptoriumTitle: string;
  scriptoriumSubtitle: string;
  scriptoriumDescription: string;
  scriptoriumAuthor: string;
  reviewsTitle: string;
  reviewsSubtitle: string;
  reviewsDescription: string;
  reviewsQuote: string;
  discoveryTitle?: string;
  discoveryDescription?: string;
  bottomShelfTitle?: string;
  bottomShelfDescription?: string;
  topPicksTitle?: string;
  topPicksDescription?: string;
  blogTitle?: string;
  blogSubtitle?: string;
  blogDescription?: string;
  rankingsTitle?: string;
  rankingsSubtitle?: string;
  rankingsDescription?: string;
}

export function useHomepageConfig() {
  const [config, setConfig] = useState<HomepageConfig>({
    curatorName: "Alexander",
    curatorTitle: "Librarian and Custodian of the Library",
    curatorBio: "Historically curated book reviews, critiques, and original manuscripts.",
    heroImageUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d",
    scriptoriumTitle: "Original Publications",
    scriptoriumSubtitle: "Stories & Manuscripts",
    scriptoriumDescription: "This is where I share my original writing—stories, ideas, and manuscripts created from imagination and personal exploration. Unlike the reviews section, this space is not about interpreting the work of others, but building my own. Each piece here represents a creative experiment or fully developed story, shaped by characters, worlds, and ideas I’ve written from the ground up.",
    scriptoriumAuthor: "Curated and Authored by Alexander",
    reviewsTitle: "Book Reviews & Critiques",
    reviewsSubtitle: "Library Reviews & Essays",
    reviewsDescription: "A comprehensive collection of book reviews, summaries, and thematic analyses. Filter by genre keyword or search for any title, author, or keyword below.",
    reviewsQuote: "Reading and writing reviews lets us engage deeper with authors' ideas, helping us understand the underlying structure, style, and key themes of each book.",
    discoveryTitle: "Curator's Literary Discoveries",
    discoveryDescription: "Explore our freshly uncovered manuscripts and recently added translations, bringing rare intellectual artifacts directly to your hands.",
    bottomShelfTitle: "Underdog Bottom Shelf",
    bottomShelfDescription: "Rare, under-appreciated classics that have quiet impact and profound, dense themes waiting for diligent minds to study.",
    topPicksTitle: "Top Picks Leaderboard",
    topPicksDescription: "The absolute highest rated and critically decorated scholars' choices representing pinnacle achievements of historical literature.",
    blogTitle: "Essays & Scholarly Updates",
    blogSubtitle: "Alexander's Scriptorium Journal",
    blogDescription: "Reflections on classical bibliography, medieval curation scriptoriums, translation betrothals, and the silent dialogues we hold with authors across millennia.",
    rankingsTitle: "Curated Scholarly Rankings",
    rankingsSubtitle: "The Leaderboard",
    rankingsDescription: "Explore the unified scriptorium rankings. Positions 1-5 are Top Picks and positions 15-20 are Bottom Shelf curations."
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchConfig() {
      try {
        const res = await fetch("/api/cms/homepage-config");
        if (!res.ok) throw new Error("CMS config response error");
        const json = await res.json();
        if (json.data) {
          setConfig(json.data);
        }
      } catch (err) {
        console.warn("Failed to load CMS homepage config, using standard defaults:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchConfig();
  }, []);

  return { config, loading };
}

export default useHomepageConfig;
