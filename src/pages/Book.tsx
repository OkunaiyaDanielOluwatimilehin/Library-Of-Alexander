import React, { useState, useEffect, useRef } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { 
  Star, Share2, Tag, BookOpen, 
  ArrowRight, ThumbsUp, Flame, Zap, Scale, X, Heart, Bookmark, Check,
  ChevronDown, ChevronUp, Search, MessageSquare, ExternalLink, ChevronLeft, ChevronRight
} from "lucide-react";
import { motion } from "motion/react";
import Layout from "../components/layout/Layout";
import useBook from "../hooks/useBook";
import useReactions from "../hooks/useReactions";
import useComments from "../hooks/useComments";
import useRecommendations from "../hooks/useRecommendations";
import { useBooks } from "../hooks/useBooks";
import { useBookProgress } from "../hooks/useBookProgress";
import { BookCover } from "../components/books/BookCover";
import BookCard from "../components/books/BookCard";
import { SocialPreviewCard } from "../components/books/SocialPreviewCard";
import { SeriesCollection } from "../components/books/SeriesCollection";
import { Comment } from "../types";
import { ReactionCounts } from "../hooks/useReactions";

const reactionBackgrounds: Record<string, string> = {
  like: "#edf4fe",     // Soft light blue
  love: "#fff0f2",     // Soft pink-rose
  fire: "#fff8f1",     // Soft warm peach-amber
  smash: "#fbf3ff",    // Soft indigo-violet
  mid: "#f5f5f4",      // Soft neutral stone
  pass: "#fff5f5"      // Soft red-rose
};

const ratingItems = [
  { value: 1, emoji: "🥱", label: "Pass" },
  { value: 2, emoji: "😐", label: "Mid" },
  { value: 3, emoji: "👍", label: "Like" },
  { value: 4, emoji: "🔥", label: "Fire" },
  { value: 5, emoji: "😍", label: "Love" },
];

const progressItems = [
  { value: "Want to Read" as const, emoji: "🔖", label: "Want to Read", countKey: "want_to_read" as const },
  { value: "Reading" as const, emoji: "📖", label: "Reading", countKey: "reading" as const },
  { value: "Completed" as const, emoji: "🏆", label: "Completed", countKey: "completed" as const }
];

const parseInlineMarkdown = (text: string): React.ReactNode => {
  if (!text) return "";

  let parts: Array<{ type: "text" | "bold" | "italic" | "link"; text: string; href?: string }> = [
    { type: "text", text }
  ];

  // 1. Process Bold
  let processed = false;
  do {
    processed = false;
    const nextParts: typeof parts = [];
    for (const part of parts) {
      if (part.type === "text" && part.text.includes("**")) {
        const matches = Array.from(part.text.matchAll(/\*\*([^*]+)\*\*/g));
        if (matches.length > 0) {
          let textIdx = 0;
          for (const match of matches) {
            const start = match.index!;
            const fullMatch = match[0];
            const content = match[1];

            if (start > textIdx) {
              nextParts.push({ type: "text", text: part.text.substring(textIdx, start) });
            }
            nextParts.push({ type: "bold", text: content });
            textIdx = start + fullMatch.length;
          }
          if (textIdx < part.text.length) {
            nextParts.push({ type: "text", text: part.text.substring(textIdx) });
          }
          processed = true;
        } else {
          nextParts.push(part);
        }
      } else {
        nextParts.push(part);
      }
    }
    parts = nextParts;
  } while (processed);

  // 2. Process Italics
  do {
    processed = false;
    const nextParts: typeof parts = [];
    for (const part of parts) {
      if (part.type === "text" && part.text.includes("*")) {
        const matches = Array.from(part.text.matchAll(/\*([^*]+)\*/g));
        if (matches.length > 0) {
          let textIdx = 0;
          for (const match of matches) {
            const start = match.index!;
            const fullMatch = match[0];
            const content = match[1];

            if (start > textIdx) {
              nextParts.push({ type: "text", text: part.text.substring(textIdx, start) });
            }
            nextParts.push({ type: "italic", text: content });
            textIdx = start + fullMatch.length;
          }
          if (textIdx < part.text.length) {
            nextParts.push({ type: "text", text: part.text.substring(textIdx) });
          }
          processed = true;
        } else {
          nextParts.push(part);
        }
      } else {
        nextParts.push(part);
      }
    }
    parts = nextParts;
  } while (processed);

  // 3. Process Links [anchor](url)
  do {
    processed = false;
    const nextParts: typeof parts = [];
    for (const part of parts) {
      if (part.type === "text" && part.text.includes("[")) {
        const matches = Array.from(part.text.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g));
        if (matches.length > 0) {
          let textIdx = 0;
          for (const match of matches) {
            const start = match.index!;
            const fullMatch = match[0];
            const anchor = match[1];
            const url = match[2];

            if (start > textIdx) {
              nextParts.push({ type: "text", text: part.text.substring(textIdx, start) });
            }
            nextParts.push({ type: "link", text: anchor, href: url });
            textIdx = start + fullMatch.length;
          }
          if (textIdx < part.text.length) {
            nextParts.push({ type: "text", text: part.text.substring(textIdx) });
          }
          processed = true;
        } else {
          nextParts.push(part);
        }
      } else {
        nextParts.push(part);
      }
    }
    parts = nextParts;
  } while (processed);

  // Convert processed parts to HTML React elements
  return parts.map((part, i) => {
    switch (part.type) {
      case "bold":
        return <strong key={i} className="font-extrabold text-stone-900">{part.text}</strong>;
      case "italic":
        return <em key={i} className="italic text-stone-800">{part.text}</em>;
      case "link":
        return (
          <a key={i} href={part.href} target="_blank" rel="noopener noreferrer" className="text-[#e2733d] hover:text-orange-700 underline underline-offset-3 font-semibold transition-colors">
            {part.text}
          </a>
        );
      default:
        return part.text;
    }
  });
};

const renderMarkdown = (text: string | undefined): React.ReactNode => {
  if (!text) return null;

  // Split content into blocks by double newlines to handle paragraphs/headers/lists
  const blocks = text.split(/\r?\n\r?\n/);

  return blocks.map((block, blockIdx) => {
    const trimmed = block.trim();
    if (!trimmed) return null;

    // 1. Heading 1
    if (trimmed.startsWith("# ")) {
      return (
        <h1 key={blockIdx} className="font-serif text-2xl sm:text-3xl font-extrabold text-stone-900 mt-8 mb-4 tracking-tight">
          {parseInlineMarkdown(trimmed.substring(2))}
        </h1>
      );
    }

    // 2. Heading 2
    if (trimmed.startsWith("## ")) {
      return (
        <h2 key={blockIdx} className="font-serif text-xl sm:text-2xl font-bold text-stone-900 mt-6 mb-3 tracking-tight border-b border-stone-200/60 pb-1.5">
          {parseInlineMarkdown(trimmed.substring(3))}
        </h2>
      );
    }

    // 3. Heading 3
    if (trimmed.startsWith("### ")) {
      return (
        <h3 key={blockIdx} className="font-serif text-lg sm:text-xl font-bold text-stone-900 mt-5 mb-2.5 tracking-tight border-b border-stone-100 pb-1">
          {parseInlineMarkdown(trimmed.substring(4))}
        </h3>
      );
    }

    // 4. Blockquotes
    if (trimmed.startsWith("> ")) {
      const lines = trimmed.split(/\r?\n/).map(line => line.replace(/^>\s?/, ""));
      return (
        <blockquote key={blockIdx} className="border-l-4 border-[#e07540] pl-4 italic text-stone-700 bg-[#fcfaf7] py-3 px-4 my-5 rounded-none font-serif leading-relaxed text-base">
          {lines.map((l, lIdx) => (
            <p key={lIdx} className={lIdx > 0 ? "mt-2" : ""}>
              {parseInlineMarkdown(l)}
            </p>
          ))}
        </blockquote>
      );
    }

    // 5. Unordered Lists
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ") || trimmed.startsWith("• ")) {
      const lines = trimmed.split(/\r?\n/);
      return (
        <ul key={blockIdx} className="list-disc pl-6 my-4 mb-5 space-y-2 font-sans text-stone-800 text-sm sm:text-base leading-relaxed last:mb-0">
          {lines.map((line, lineIdx) => {
            const cleanLine = line.replace(/^[\s\-\*•]+\s?/, "");
            return (
              <li key={lineIdx} className="pl-1">
                {parseInlineMarkdown(cleanLine)}
              </li>
            );
          })}
        </ul>
      );
    }

    // 6. Ordered Lists
    if (/^\d+\.\s/.test(trimmed)) {
      const lines = trimmed.split(/\r?\n/);
      return (
        <ol key={blockIdx} className="list-decimal pl-6 my-4 mb-5 space-y-2 font-sans text-stone-800 text-sm sm:text-base leading-relaxed last:mb-0">
          {lines.map((line, lineIdx) => {
            const cleanLine = line.replace(/^\d+\.\s?/, "");
            return (
              <li key={lineIdx} className="pl-1">
                {parseInlineMarkdown(cleanLine)}
              </li>
            );
          })}
        </ol>
      );
    }

    // 7. General Paragraph
    const lines = trimmed.split(/\r?\n/);
    return (
      <p key={blockIdx} className="text-justify font-serif text-stone-850 text-sm sm:text-base md:text-[15.5px] sm:leading-relaxed leading-relaxed mb-5 sm:mb-6 last:mb-0 max-w-none break-words">
        {lines.map((line, lineIdx) => (
          <React.Fragment key={lineIdx}>
            {parseInlineMarkdown(line)}
            {lineIdx < lines.length - 1 && <br />}
          </React.Fragment>
        ))}
      </p>
    );
  });
};

export function Book() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const { book, loading: bookLoading } = useBook(id);
  const { reactions, userReaction, react } = useReactions(id, book?.reactions);
  const { comments, errorMsg, addComment } = useComments(id);
  const { recommendCount, userRecommended, toggleRecommend } = useRecommendations(id);
  const { books: allBooks } = useBooks();
  const { counts, userStatus, setProgress, userRating, averageRating, ratingCount, ratingDistribution, setRating } = useBookProgress(book?.id, undefined);

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const [authorName, setAuthorName] = useState("");
  const [newCommentText, setNewCommentText] = useState("");
  const [pinAsReview, setPinAsReview] = useState(false);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [commentPostMsg, setCommentPostMsg] = useState<string | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  const [isRatingHovered, setIsRatingHovered] = useState(false);
  const [isSeriesRatingHovered, setIsSeriesRatingHovered] = useState(false);
  const [hoveredSeriesReaction, setHoveredSeriesReaction] = useState<string | null>(null);
  const [isProgressHovered, setIsProgressHovered] = useState(false);
  const [hoveredProgress, setHoveredProgress] = useState<string | null>(null);

  // Goodreads inspired states
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [searchReviewText, setSearchReviewText] = useState("");
  const [categories, setCategories] = useState<Array<{ id: string; title: string; books: any[] }>>([]);
  const [isDisclaimerOpen, setIsDisclaimerOpen] = useState(false);

  const scrollRelated = (direction: "left" | "right") => {
    if (carouselRef.current) {
      const scrollAmount = 320;
      carouselRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth"
      });
    }
  };

  useEffect(() => {
    let active = true;
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/cms/categories");
        if (response.ok) {
          const json = await response.json();
          if (active && json.data && json.data.length > 0) {
            setCategories(json.data);
          }
        }
      } catch (err) {
        console.warn("Failed to fetch categories:", err);
      }
    };
    fetchCategories();
    return () => { active = false; };
  }, []);

  // Deterministic ratings configuration to show beautiful statistic chart like Goodreads!
  const baseRatingMeta = React.useMemo(() => {
    const titleSum = (book?.title || "").split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) + (book?.author || "").split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const mockRatingBase = 4.12 + ((titleSum % 7) * 0.08); // Rating between 4.12 and 4.60
    const mockRatingsCount = 1420 + (titleSum * 3) % 2500; // Ratings count between 1420 and 3920
    const mockReviewsCount = Math.round(mockRatingsCount * 0.15) + (titleSum % 80);

    const stars5Pct = 40 + (titleSum % 15);
    const stars4Pct = 28 + (titleSum % 10);
    const stars3Pct = 12 + (titleSum % 8);
    const stars2Pct = 6 + (titleSum % 5);
    const stars1Pct = 4 + (titleSum % 3);

    const totalPct = stars5Pct + stars4Pct + stars3Pct + stars2Pct + stars1Pct;
    const r5Pct = Math.round((stars5Pct / totalPct) * 100);
    const r4Pct = Math.round((stars4Pct / totalPct) * 100);
    const r3Pct = Math.round((stars3Pct / totalPct) * 100);
    const r2Pct = Math.round((stars2Pct / totalPct) * 100);
    const r1Pct = Math.max(1, 100 - (r5Pct + r4Pct + r3Pct + r2Pct));

    const distCounts = [
      { stars: 5, pct: r5Pct, count: Math.round(mockRatingsCount * (r5Pct / 100)) },
      { stars: 4, pct: r4Pct, count: Math.round(mockRatingsCount * (r4Pct / 100)) },
      { stars: 3, pct: r3Pct, count: Math.round(mockRatingsCount * (r3Pct / 100)) },
      { stars: 2, pct: r2Pct, count: Math.round(mockRatingsCount * (r2Pct / 100)) },
      { stars: 1, pct: r1Pct, count: Math.round(mockRatingsCount * (r1Pct / 100)) },
    ];

    return { 
      baseAvg: mockRatingBase, 
      ratingsCount: mockRatingsCount, 
      reviewsCount: mockReviewsCount, 
      distribution: distCounts 
    };
  }, [book?.id]);

  // Totally dynamic database rating calculations from Supabase and direct localStorage offline fallback
  const finalAvg = averageRating || 0;

  const finalRatingsCount = ratingCount;

  const finalDistribution = React.useMemo(() => {
    const list = [
      { stars: 5, count: ratingDistribution?.[5] || 0 },
      { stars: 4, count: ratingDistribution?.[4] || 0 },
      { stars: 3, count: ratingDistribution?.[3] || 0 },
      { stars: 2, count: ratingDistribution?.[2] || 0 },
      { stars: 1, count: ratingDistribution?.[1] || 0 }
    ];
    return list.map((item) => ({
      ...item,
      pct: ratingCount > 0 ? Math.round((item.count / ratingCount) * 100) : 0
    }));
  }, [ratingDistribution, ratingCount]);

  const getCommentRating = (comment: Comment) => {
    if (typeof comment.rating === "number") {
      return comment.rating;
    }
    if (userRating && (comment.author === authorName)) {
      return userRating;
    }
    const lowerText = comment.text.toLowerCase();
    if (lowerText.includes("masterpiece") || lowerText.includes("excellent") || lowerText.includes("brilliant") || lowerText.includes("incredible") || lowerText.includes("love")) {
      return 5;
    }
    if (lowerText.includes("good") || lowerText.includes("enjoyed") || lowerText.includes("solid") || lowerText.includes("nice")) {
      return 4;
    }
    if (lowerText.includes("okay") || lowerText.includes("average") || lowerText.includes("mid")) {
      return 3;
    }
    const num = comment.id.charCodeAt(comment.id.length - 1) || 5;
    return (num % 2) === 0 ? 5 : 4;
  };

  const getFollowerDetails = (authName: string) => {
    const sum = authName.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const reviewsCount = 12 + (sum % 120);
    const followersCount = 45 + (sum % 800);
    return { reviewsCount, followersCount };
  };

  // Auto-scrolling carousel state & ref
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  // Related books algorithm: Match strictly by sharing same author, category, or specific genres
  // ALSO: If this is a series review, do not show related books (as requested by user).
  const relatedBooks = React.useMemo(() => {
    if (!book || book.is_series_review) return [];

    const scored = allBooks
      .filter((b) => b.id !== book.id)
      .map((b) => {
        let score = 0;

        // 1. Same author gets highest score boost
        if (b.author && book.author && b.author.toLowerCase().trim() === book.author.toLowerCase().trim()) {
          score += 15;
        }

        // 2. Same category from catalog collection list
        if (categories && categories.length > 0) {
          const sharingCats = categories.filter((cat) => 
            cat.books && cat.books.some((cb) => cb.id === book.id) && cat.books.some((cb) => cb.id === b.id)
          );
          score += sharingCats.length * 10;
        }

        // 3. Same string category
        if (b.category && book.category && b.category.toLowerCase().trim() === book.category.toLowerCase().trim()) {
          score += 8;
        }

        // 4. Same genre, excluding broad common defaults like "General Literature" or "Literature"
        if (book.genre && b.genre) {
          const currentGenres = (typeof book.genre === "string" ? book.genre : Array.isArray(book.genre) ? (book.genre as string[]).join(", ") : String(book.genre))
            .split(/[,;|]+/)
            .map((g) => g.trim().toLowerCase())
            .filter((g) => g && g !== "general literature" && g !== "literature");

          const targetGenres = (typeof b.genre === "string" ? b.genre : Array.isArray(b.genre) ? (b.genre as string[]).join(", ") : String(b.genre))
            .split(/[,;|]+/)
            .map((g) => g.trim().toLowerCase())
            .filter((g) => g && g !== "general literature" && g !== "literature");

          const common = currentGenres.filter((g) => targetGenres.includes(g));
          score += common.length * 5;
        }

        return { book: b, score };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score);

    return scored.map((item) => item.book).slice(0, 8);
  }, [book, allBooks, categories]);

  const hasReview = !!(book && book.reviewText && 
    book.reviewText.trim().length > 0 && 
    !book.reviewText.toLowerCase().includes("no review analysis is published yet") &&
    !book.reviewText.toLowerCase().includes("no review text") &&
    !book.reviewText.toLowerCase().includes("no secondary detailed review text"));

  const isReview = hasReview || !!book?.is_series_review;

  const hasQuotes = !!(book && book.quotes && book.quotes.length > 0);

  const handleReactClick = (type: "like" | "love" | "fire" | "smash" | "mid" | "pass") => {
    react(type);
  };

  const handleWriteReviewClick = () => {
    const el = document.getElementById("comments-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleAddCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    const cleanAuthor = authorName.trim() || "Anonymous";

    try {
      await addComment(cleanAuthor, newCommentText.trim(), pinAsReview, reviewRating);
      setAuthorName("");
      setNewCommentText("");
      setPinAsReview(false);
      setReviewRating(5);
      setCommentPostMsg(pinAsReview ? "Standalone review checklist published and pinned successfully!" : "Observation published successfully!");
      setTimeout(() => setCommentPostMsg(null), 4000);
    } catch (_) {
      // Error is stored and handled in hook
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setShareSuccess(true);
    setTimeout(() => setShareSuccess(false), 2500);
  };

  useEffect(() => {
    if (book) {
      document.title = `${book.title} | Library of Alexander`;

      // Dynamic Open Graph and search engine metadata updates for premium social sharing previews
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute('content', book.summary || book.description || "An analytical review and critique from the curation archives.");

      let ogTitle = document.querySelector('meta[property="og:title"]');
      if (!ogTitle) {
        ogTitle = document.createElement('meta');
        ogTitle.setAttribute('property', 'og:title');
        document.head.appendChild(ogTitle);
      }
      ogTitle.setAttribute('content', `${book.title} | Book Review`);

      let ogDesc = document.querySelector('meta[property="og:description"]');
      if (!ogDesc) {
        ogDesc = document.createElement('meta');
        ogDesc.setAttribute('property', 'og:description');
        document.head.appendChild(ogDesc);
      }
      ogDesc.setAttribute('content', book.summary || book.description || "Review and notes from the curator archives.");

      let ogImg = document.querySelector('meta[property="og:image"]');
      if (!ogImg) {
        ogImg = document.createElement('meta');
        ogImg.setAttribute('property', 'og:image');
        document.head.appendChild(ogImg);
      }
      ogImg.setAttribute('content', book.cover_url || "https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&q=80&w=1200");
    }
  }, [book]);

  if (bookLoading) {
    return (
      <Layout fullWidth={true}>
        <div className="py-36 flex flex-col items-center justify-center space-y-6 w-full max-w-md mx-auto animate-fade-in">
          <div className="relative flex items-center justify-center w-16 h-16">
            {/* Glowing background pulp effect */}
            <div className="absolute inset-0 bg-orange-500/10 rounded-full blur-xl animate-pulse" />
            
            {/* Outer spinning dash ring */}
            <div className="absolute w-14 h-14 border-2 border-dashed border-orange-500/40 rounded-full animate-spin [animation-duration:8s]" />
            
            {/* Inner high-speed loading spinner */}
            <div className="absolute w-10 h-10 border-t-2 border-r-2 border-orange-500 rounded-full animate-spin" />
            
            {/* Center core dot */}
            <div className="w-3.5 h-3.5 bg-orange-500 rounded-full" />
          </div>
          <div className="space-y-1.5 text-center">
            <span className="block text-[11px] font-mono tracking-widest uppercase font-black text-orange-600 animate-pulse">
              Consulting Scriptorium
            </span>
            <span className="block text-xs font-serif text-stone-500 italic">
              Unrolling parchment analysis and community scrolls...
            </span>
          </div>
        </div>
      </Layout>
    );
  }

  if (!book) {
    return (
      <Layout fullWidth={true}>
        <div className="py-20 text-center space-y-4">
          <BookOpen className="w-12 h-12 mx-auto text-parchment-450" />
          <h3 className="font-serif text-lg text-parchment-950">The requested book does not exist.</h3>
          <p className="text-xs font-mono text-parchment-550 uppercase">It might have been moved or can no longer be found.</p>
          <div className="pt-4">
            <Link to="/books" className="text-xs font-mono uppercase bg-orange-500 hover:bg-orange-600 text-parchment-955 px-5 py-2.5 rounded-none font-bold">
              Return to Books Catalog
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  // Determine dynamic go-back-to-categories target depending on router state
  const backTarget = "/books";
  const backLabel = "BACK TO BOOKS CATALOG";

  return (
    <Layout 
      fullWidth={true}
    >
      <div className="pt-8 sm:pt-12 pb-4 animate-fade-in text-left max-w-[1920px] w-full px-4 sm:px-12 md:px-16 lg:px-20 xl:px-0 mx-auto text-parchment-950">
        
        {/* Navigation */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 pb-4">
          <Link
            to={backTarget}
            className="inline-flex items-center gap-1.5 text-xs font-sans font-semibold text-stone-500 hover:text-orange-600 transition-colors uppercase tracking-wider"
          >
            ← {backLabel}
          </Link>
        </div>

        {/* Unified Majestic Container for Detail Screen */}
        <div className="mt-8 space-y-12 w-full">
          
          {/* Goodreads-Style Content Panel */}
          <div className="w-full max-w-[95%] xl:max-w-[1920px] sm:max-w-none bg-white rounded-none p-4 sm:p-10 md:p-12 shadow-xs relative mx-auto">
            {/* Colored top line to match premium header border */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-400 via-orange-600 to-yellow-600" />

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
              {/* Left Column: Cover, Want to Read, Rating (col-span 3) */}
              <div className="md:col-span-4 lg:col-span-3 flex flex-col items-center md:items-stretch space-y-6 text-center md:text-left select-none">
                {/* Book Cover Frame (Clean with no stroke/border or background) */}
                <div className="select-none inline-block max-w-none">
                  <BookCover 
                    title={book.title} 
                    author={book.author} 
                    genre={book.genre}
                    color={book.coverColor} 
                    style={book.coverStyle} 
                    cover_url={book.cover_url}
                    size={isMobile ? "md" : "md-lg"}
                    hideTextOverlay={true}
                  />
                </div>

                {/* Reading Status Forest Green Dropdown button */}
                <div className="w-full select-none max-w-[210px] sm:max-w-none">
                  <div className="relative inline-flex w-full rounded-xs overflow-visible shadow-xs border border-[#1e5c3b] bg-[#216a45] text-white">
                    {/* Left Segment: Active Status Click */}
                    <button
                      type="button"
                      onClick={() => {
                        const nextStatus = userStatus === "Want to Read" ? "Reading" : userStatus === "Reading" ? "Completed" : "Want to Read";
                        setProgress(nextStatus);
                      }}
                      className="flex-1 px-4 py-2.5 text-xs sm:text-sm font-semibold tracking-wide hover:bg-[#1a5537] active:bg-[#15442b] transition-colors border-r border-[#1a5537] text-center font-sans uppercase flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Check className={`w-4 h-4 transition-transform ${userStatus ? "scale-100" : "scale-0 w-0"}`} />
                      <span>{userStatus || "Want to Read"}</span>
                    </button>

                    {/* Right Segment: Arrow Trigger for Dropdown */}
                    <button
                      type="button"
                      onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                      className="px-3 py-2.5 hover:bg-[#1a5537] active:bg-[#15442b] transition-colors flex items-center justify-center cursor-pointer"
                      title="Choose status"
                    >
                      <ChevronDown className={`w-4 h-4 transition-transform ${isStatusDropdownOpen ? "rotate-180" : ""}`} />
                    </button>

                    {/* Status Options absolute overlay */}
                    {isStatusDropdownOpen && (
                      <>
                        <div 
                          className="fixed inset-0 z-30" 
                          onClick={() => setIsStatusDropdownOpen(false)}
                        />
                        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-stone-200 shadow-xl rounded-none z-40 py-1 text-left">
                          {(["Want to Read", "Reading", "Completed"] as const).map((status) => {
                            const isCurrent = userStatus === status;
                            return (
                              <button
                                key={status}
                                type="button"
                                onClick={() => {
                                  setProgress(isCurrent ? null : status);
                                  setIsStatusDropdownOpen(false);
                                }}
                                className={`w-full px-4 py-2 text-xs font-semibold tracking-wider font-sans uppercase block text-left transition-colors cursor-pointer ${
                                  isCurrent 
                                    ? "bg-stone-100 text-[#216a45] flex items-center justify-between" 
                                    : "text-stone-700 hover:bg-stone-50"
                                }`}
                              >
                                <span>{status}</span>
                                {isCurrent && <Check className="w-3.5 h-3.5 text-[#216a45]" />}
                              </button>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Beautiful & Prominent community shelf progress tracker stats */}
                  <div className="mt-3 bg-stone-50 border border-stone-200 p-3 shadow-2xs">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-[#be8873] font-bold mb-2 text-center border-b border-stone-200 pb-1">
                      Shelf Progress Tracker
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-white p-1.5 border border-stone-100 flex flex-col justify-center">
                        <span className="font-mono text-xs font-black text-[#216a45]">{counts.want_to_read}</span>
                        <span className="text-[7.5px] font-sans font-extrabold tracking-tight text-stone-500 uppercase">Want to Read</span>
                      </div>
                      <div className="bg-white p-1.5 border border-stone-100 flex flex-col justify-center">
                        <span className="font-mono text-xs font-black text-blue-700">{counts.reading}</span>
                        <span className="text-[7.5px] font-sans font-extrabold tracking-tight text-stone-500 uppercase">Reading</span>
                      </div>
                      <div className="bg-white p-1.5 border border-stone-100 flex flex-col justify-center">
                        <span className="font-mono text-xs font-black text-emerald-700">{counts.completed}</span>
                        <span className="text-[7.5px] font-sans font-extrabold tracking-tight text-stone-500 uppercase">Completed</span>
                      </div>
                    </div>
                  </div>
                </div>



                {/* White external-like button 'Shop this Series/Book' */}
                <a 
                  href={`https://www.google.com/search?tbm=bks&q=${encodeURIComponent(book.title + " " + book.author)}`}
                  target="_blank" 
                  referrerPolicy="no-referrer"
                  className="w-full max-w-[210px] sm:max-w-none text-center inline-flex items-center justify-center gap-1.5 px-4 py-2.5 border border-stone-300 hover:border-stone-400 bg-white hover:bg-stone-50 text-stone-850 font-sans font-bold text-xs uppercase tracking-wide transition-colors cursor-pointer"
                >
                  <span>Shop this book</span>
                  <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
                </a>
              </div>

              {/* Right Column: Information, synopsis, quotes, and detailed reviews (col-span 9) */}
              <div className="md:col-span-8 lg:col-span-9 space-y-6 text-left relative flex flex-col justify-between p-4 sm:p-8 m-2 sm:m-4">
                <div className="space-y-4">
                  {/* Header layout: Series, Title, Author, Rating info block */}
                  <div className="space-y-2 relative">
                    <div className="flex justify-between items-start gap-4 pr-10">
                      <div className="space-y-1">
                        {book.series && (
                          <div className="text-[13px] font-serif italic text-stone-500 font-medium select-none">
                            {book.series}
                          </div>
                        )}
                        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold text-stone-900 leading-tight tracking-tight">
                          {book.title}
                        </h1>
                      </div>

                      {/* Circular Elegant Share Button matching images */}
                      <button
                        type="button"
                        onClick={() => setIsShareModalOpen(true)}
                        className="absolute top-0 right-0 w-9 h-9 rounded-full border border-stone-200 hover:border-stone-400 flex items-center justify-center bg-white hover:bg-stone-50 shadow-2xs transition-colors cursor-pointer group shrink-0"
                        title="Share this book"
                      >
                        <Share2 className="w-4 h-4 text-stone-400 group-hover:text-[#ff8f5a] transition-colors" />
                      </button>
                    </div>

                    {/* Author line with contributors */}
                    <div className="text-sm font-sans text-stone-505 flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-stone-800 capitalize text-base border-b border-transparent hover:border-stone-300 pb-0.5 transition-colors cursor-pointer">
                        {book.author}
                      </span>
                      <span className="text-stone-400 capitalize whitespace-nowrap text-xs">(Author)</span>
                      {book.title.includes("Chamber") && (
                        <>
                          <span className="text-stone-300">·</span>
                          <span className="text-stone-500 text-xs hover:underline cursor-pointer">Mary GrandPré (Illustrator)</span>
                        </>
                      )}
                    </div>

                    {/* Star Rating display segment: 5 gold stars & rating count text */}
                    {!isReview && (
                      <div className="flex flex-wrap items-center gap-3 select-none pt-2">
                        <div className="flex items-center gap-1.5 select-none shrink-0" title={`Average: ${finalAvg}`}>
                          {Array.from({ length: 5 }).map((_, i) => {
                            const isFilled = i < Math.floor(finalAvg);
                            const isPartial = !isFilled && i < Math.ceil(finalAvg);
                            const partialPct = isPartial ? Math.round((finalAvg % 1) * 100) : 0;
                            return (
                              <div key={i} className="relative inline-block w-4.5 h-4.5 select-none shrink-0">
                                {/* Background Star */}
                                <Star className="absolute top-0 left-0 w-4.5 h-4.5 text-stone-200 fill-stone-150 stroke-stone-300" />
                                {/* Masked filled star */}
                                {isFilled && (
                                  <Star className="absolute top-0 left-0 w-4.5 h-4.5 text-[#f25f0c] fill-[#f25f0c] stroke-none" />
                                )}
                                {isPartial && (
                                  <div className="absolute top-0 left-0 overflow-hidden" style={{ width: `${partialPct}%` }}>
                                    <Star className="w-4.5 h-4.5 text-[#f25f0c] fill-[#f25f0c] max-w-none stroke-none" />
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        <span className="text-base font-bold text-stone-900 font-sans select-none tracking-tight">
                          {finalAvg.toFixed(2)}
                        </span>

                        <span className="text-stone-300">·</span>

                        <button
                          type="button"
                          onClick={handleWriteReviewClick}
                          className="text-xs font-sans text-stone-450 hover:underline hover:text-stone-750 font-medium"
                        >
                          {finalRatingsCount.toLocaleString()} ratings · {(comments || []).length.toLocaleString()} reviews
                        </button>

                        {recommendCount > 0 && (
                          <div className="flex items-center gap-1 bg-rose-50 text-rose-700 border border-rose-100 scale-90 px-2.5 py-0.5 text-[10px] font-mono font-black uppercase tracking-wider">
                            <span>{recommendCount} Recommended</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Genres Section structured as underlined interactive links */}
                  <div className="pt-2 pb-1 flex flex-wrap gap-x-3 gap-y-1.5 items-center text-xs font-sans text-stone-500">
                    <span className="font-bold text-stone-700 uppercase tracking-wider text-[11px] font-mono select-none">Genres:</span>
                    {(typeof book.genre === "string" ? book.genre : Array.isArray(book.genre) ? (book.genre as string[]).join(", ") : String(book.genre || "General Literature")).split(/[,;|]+/).map(g => g.trim()).filter(Boolean).map((g, idx, arr) => (
                      <React.Fragment key={idx}>
                        <span 
                          className="text-[#be8873] hover:text-stone-850 underline underline-offset-3 font-semibold capitalize cursor-pointer transition-colors"
                        >
                          {g}
                        </span>
                        {idx < arr.length - 1 && <span className="text-stone-300 select-none">,</span>}
                      </React.Fragment>
                    ))}
                  </div>

                  {/* Dividing spacing */}
                  <div className="h-[1px] bg-stone-150 my-1" />

                  {/* Synopsis / Description with Fade Expand/Collapse Toggle */}
                  <div className="space-y-3 pt-1 text-stone-850 leading-relaxed font-serif text-sm sm:text-base">
                    <div className="relative overflow-hidden transition-all duration-350 ease-in-out">
                      <div className="text-justify leading-relaxed">
                        {isDescriptionExpanded 
                          ? renderMarkdown(book.description || book.summary)
                          : renderMarkdown(`${(book.description || book.summary).slice(0, 320)}${(book.description || book.summary).length > 320 ? "..." : ""}`)
                        }
                      </div>
                      
                      {/* Beautiful elegant gradient fade-out to signal expansion */}
                      {!isDescriptionExpanded && (book.description || book.summary).length > 320 && (
                        <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-white to-transparent pointer-events-none" />
                      )}
                    </div>

                    {/* Toggle Show More link */}
                    {(book.description || book.summary).length > 320 && (
                      <button
                        type="button"
                        onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#8a5f4e] hover:text-[#216a45] transition-colors uppercase tracking-widest font-mono pt-1 cursor-pointer"
                      >
                        <span>{isDescriptionExpanded ? "Show less" : "Show more"}</span>
                        {isDescriptionExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>
                    )}
                  </div>

                  {/* Rate this book under the summary with beautiful space and gap-10 */}
                  <div className="pt-6 mt-6 border-t border-stone-150 flex flex-col items-start justify-start text-left space-y-3.5 select-none w-full">
                    <span className="text-[11px] font-mono uppercase tracking-widest text-[#be8873] font-bold">
                      Rate this book
                    </span>
                    <div className="flex items-center gap-3 xs:gap-6 sm:gap-10 py-1.5 select-none">
                      {[1, 2, 3, 4, 5].map((starVal) => {
                        const isFilled = hoveredStar !== null ? starVal <= hoveredStar : userRating !== null && starVal <= userRating;
                        return (
                          <button
                            key={starVal}
                            type="button"
                            onMouseEnter={() => setHoveredStar(starVal)}
                            onMouseLeave={() => setHoveredStar(null)}
                            onClick={() => setRating(userRating === starVal ? null : starVal)}
                            className="p-1 cursor-pointer transition-all duration-150 hover:scale-125 hover:rotate-6 text-amber-500 select-none focus:outline-none"
                            title={`Rate ${starVal} Star${starVal > 1 ? "s" : ""}`}
                          >
                            <Star 
                              className={`w-7 h-7 xs:w-8 xs:h-8 sm:w-9 sm:h-9 select-none ${isFilled ? "fill-amber-400 stroke-amber-500 text-amber-500" : "text-stone-300 stroke-stone-350"}`} 
                            />
                          </button>
                        );
                      })}
                    </div>
                    {userRating && (
                      <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2.5 py-1 border border-emerald-100 font-extrabold uppercase mt-1.5">
                        Your Rating: {userRating}/5
                      </span>
                    )}
                  </div>

                  {/* Categories Section (Top Pick, Discovery, Bottom Shelf) */}
                  {(() => {
                    const cats: { label: string; color: string; to: string }[] = [];
                    if (book.is_top_pick || (book as any).isTopPick || book.category === "top-picks") {
                      cats.push({ label: "Top Pick", color: "bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200/70", to: "/" });
                    }
                    if (book.is_discovery || (book as any).isDiscovery || book.category === "discovery") {
                      cats.push({ label: "Discovery", color: "bg-teal-100 text-teal-800 border-teal-200 hover:bg-teal-200/70", to: "/" });
                    }
                    if (book.is_bottom_shelf || (book as any).isBottomShelf || book.category === "bottom-shelf") {
                      cats.push({ label: "Bottom Shelf", color: "bg-stone-100 text-stone-800 border-stone-200 hover:bg-stone-200/70", to: "/" });
                    }
                    if (cats.length === 0) return null;
                    return (
                      <div className="pt-3 flex flex-wrap gap-2 items-center text-xs font-sans">
                        <span className="font-bold text-stone-700 uppercase tracking-wider text-[11px] font-mono select-none">Categories:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {cats.map((cat, idx) => (
                            <Link
                              key={idx}
                              to={cat.to}
                              className={`px-2.5 py-0.5 border text-[10px] font-mono uppercase tracking-wider font-extrabold transition-colors ${cat.color}`}
                            >
                              {cat.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Memorable Quotes block, rendered elegantly if present */}
                {!isReview && hasQuotes && (
                  <div className="pt-6 mt-6 border-t border-stone-150 space-y-3.5">
                    <h3 className="font-serif text-xs uppercase tracking-widest text-[#be8873] font-bold select-none border-b border-stone-100 pb-1.5">
                      Memorable Quotes & Passages
                    </h3>
                    <div className="grid grid-cols-1 gap-3.5">
                      {book.quotes.slice(0, 3).map((quote, i) => (
                        <div key={i} className="bg-[#fcfaf7] p-4.5 border border-stone-200/50 rounded-none relative text-left">
                          <span className="absolute top-2 left-3 font-serif text-4xl text-stone-200 leading-none select-none">“</span>
                          <p 
                            className="font-serif italic text-sm text-stone-750 leading-relaxed pl-5 pr-2 whitespace-nowrap overflow-hidden text-ellipsis"
                            title={quote}
                          >
                            {quote}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Detailed review or summary section */}
                {isReview && hasReview && (
                  <div className="pt-8 mt-8 border-t border-stone-150 space-y-5">
                    <div className="flex items-center justify-between border-b border-stone-150 pb-2">
                      <h2 className="font-serif text-lg font-black text-stone-900 tracking-tight uppercase">
                        Book Critique & Analysis
                      </h2>
                      <span className="text-[10px] font-mono uppercase tracking-widest bg-orange-100/60 text-[#be8873] px-2.5 py-0.5 border border-orange-200/40">
                        Detailed Review
                      </span>
                    </div>
                    <div className="font-serif text-stone-850 leading-relaxed text-base sm:text-lg space-y-5 text-justify pl-2 pr-2">
                      {renderMarkdown(book.reviewText)}
                    </div>
                  </div>
                )}
              </div>
            </div>



              {/* START GOODREADS RATINGS AND REVIEWS */}
              {true && (
              <div className="border-t border-stone-200 mt-12 pt-8 text-left">
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 tracking-tight flex items-center gap-2 mb-6 select-none animate-fade-in">
                  Ratings & Reviews
                </h2>

                {/* Center What do you think? display */}
                <div className="flex flex-col items-center justify-center bg-[#faf8f5] border border-stone-200/60 p-6 sm:p-8 rounded-none text-center space-y-4 mb-8 select-none animate-fade-in duration-300">
                  {/* Gray Circle Avatar with profile initial */}
                  <div className="w-14 h-14 rounded-full bg-stone-250 flex items-center justify-center font-bold text-stone-605 text-lg border border-stone-350 shadow-inner">
                    U
                  </div>
                  
                  <div className="space-y-1">
                    <h3 className="font-serif text-lg font-bold text-stone-900">What do you think?</h3>
                    <p className="text-xs text-stone-450 font-sans max-w-sm">
                      Write a review comment or rate this title to support the literary community.
                    </p>
                  </div>

                  {/* Star rating block inside Prompt */}
                  <div className="flex flex-col items-center space-y-2 select-none animate-fade-in">
                    <div className="flex items-center gap-3 xs:gap-6 sm:gap-10 py-1 select-none">
                      {[1, 2, 3, 4, 5].map((starVal) => {
                        const isFilled = userRating !== null && starVal <= userRating;
                        return (
                          <button
                            key={starVal}
                            type="button"
                            onClick={() => setRating(userRating === starVal ? null : starVal)}
                            className="p-1 cursor-pointer transition-all duration-150 hover:scale-125 hover:rotate-6 text-amber-500 select-none text-3xl focus:outline-none focus:ring-0 focus-visible:outline-none border-none"
                            title={`Rate ${starVal} Star${starVal > 1 ? "s" : ""}`}
                          >
                            <Star 
                              className={`w-7 h-7 xs:w-8 xs:h-8 sm:w-9 sm:h-9 select-none ${isFilled ? "fill-amber-400 stroke-amber-500 text-amber-500" : "text-stone-300 stroke-stone-350"}`} 
                            />
                          </button>
                        );
                      })}
                    </div>
                    {userRating && (
                      <span className="text-[11px] font-mono font-bold text-emerald-850 bg-emerald-50 px-2.5 py-0.5 border border-emerald-100 uppercase mt-1 animate-fade-in">
                        You rated this book {userRating}/5
                      </span>
                    )}
                  </div>
                </div>

                {isReview && (
                  <div className="flex flex-wrap items-center justify-center gap-4 py-4 mb-8 border border-stone-200 bg-stone-50/50 select-none">
                    <motion.button
                      onClick={() => {
                        toggleRecommend();
                      }}
                      whileTap={{ scale: 0.95 }}
                      className={`px-4.5 py-2.5 rounded-none border transition-all cursor-pointer flex items-center gap-2 text-xs font-mono font-black select-none duration-150 ${
                        userRecommended
                          ? "bg-amber-50 text-amber-950 border-amber-500 shadow-[0_2px_0_#d97706] translate-y-[1px]"
                          : "bg-white border-stone-250 text-stone-600 hover:bg-[#fafaf9] shadow-[0_2px_0_#d6d3d1]"
                      }`}
                      title={`Recommend this review (${recommendCount})`}
                    >
                      <Bookmark className={`w-4 h-4 shrink-0 transition-colors ${userRecommended ? "text-amber-550 fill-amber-500" : "text-stone-400"}`} />
                      <span className="uppercase text-[11px] sm:text-xs">Recommend ({recommendCount})</span>
                    </motion.button>

                    <button
                      type="button"
                      onClick={() => setIsShareModalOpen(true)}
                      className="px-4.5 py-2.5 border border-stone-900 bg-stone-900 hover:bg-white text-white hover:text-stone-900 cursor-pointer transition-all text-xs uppercase font-mono tracking-widest font-black inline-flex items-center gap-2 shadow-[0_2px_0_#be8873] active:translate-y-[1px] rounded-none"
                    >
                      <Share2 className="w-4 h-4 shrink-0 text-[#ff8f5a]" />
                      <span className="uppercase text-[11px] sm:text-xs">Share Review</span>
                    </button>
                  </div>
                )}

                {/* Aggregate Rating Stat Block & Dynamic Distribution progress-bars */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center bg-white p-6 border border-stone-200/90 mb-10 text-left select-none animate-fade-in">
                  {/* Left Part: Big Average value */}
                  <div className="md:col-span-4 flex flex-col items-center justify-center text-center space-y-2 select-none border-b md:border-b-0 md:border-r border-stone-200/70 pb-6 md:pb-0">
                    <span className="text-stone-400 text-xs font-mono tracking-widest uppercase font-bold">Community Rating</span>
                    <h4 className="text-5xl sm:text-6xl font-black text-stone-900 font-sans tracking-tight">
                      {finalAvg.toFixed(2)}
                    </h4>
                    
                    {/* 5 solid orange stars */}
                    <div className="flex items-center gap-1 py-1 shrink-0 px-2" title={`Average: ${finalAvg}`}>
                      {Array.from({ length: 5 }).map((_, i) => {
                        const isFilled = i < Math.floor(finalAvg);
                        const isPartial = !isFilled && i < Math.ceil(finalAvg);
                        const partialPct = isPartial ? Math.round((finalAvg % 1) * 100) : 0;
                        return (
                          <div key={i} className="relative inline-block w-4.5 h-4.5 select-none shrink-0">
                            <Star className="absolute top-0 left-0 w-4.5 h-4.5 text-stone-200 fill-stone-150 stroke-stone-300" />
                            {isFilled && (
                              <Star className="absolute top-0 left-0 w-4.5 h-4.5 text-[#f25f0c] fill-[#f25f0c] stroke-none" />
                            )}
                            {isPartial && (
                              <div className="absolute top-0 left-0 overflow-hidden" style={{ width: `${partialPct}%` }}>
                                <Star className="w-4.5 h-4.5 text-[#f25f0c] fill-[#f25f0c] max-w-none stroke-none" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <span className="text-[11px] font-mono text-stone-405 uppercase tracking-wide">
                      {finalRatingsCount.toLocaleString()} aggregate votes
                    </span>
                  </div>

                  {/* Right Part: Horizontal Progress Chart bars in Goodreads custom palette */}
                  <div className="md:col-span-8 space-y-2.5 px-2">
                    {finalDistribution.map((row) => (
                      <div key={row.stars} className="flex items-center gap-3.5 text-xs text-stone-550 font-sans">
                        {/* Rating name */}
                        <span className="w-12 text-right font-semibold select-none">{row.stars} star{row.stars > 1 ? "s" : ""}</span>
                        
                        {/* Progress Bar background block */}
                        <div className="flex-1 h-3.5 bg-stone-100 rounded-none overflow-hidden border border-stone-200">
                          <div 
                            className="h-full bg-[#f25f0c]/95 transition-all duration-500" 
                            style={{ width: `${row.pct}%` }}
                          />
                        </div>

                        {/* Progress Percentage & Total votes */}
                        <span className="w-32 text-left font-mono text-[11px] text-stone-400 select-none">
                          <strong className="text-stone-700">{row.count.toLocaleString()}</strong> ({row.pct}%)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Community comments header reviews list */}
                <section id="comments-section" className="space-y-6 pt-2">
                  <div className="border-b border-stone-250 pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="space-y-1">
                      <h3 className="font-serif text-lg font-bold text-stone-900">
                        Community Reviews & Discussion
                      </h3>
                      <p className="text-xs text-stone-405 font-sans">
                        Displaying {(comments || []).length} reader review observations.
                      </p>
                    </div>

                    {/* Dynamic Text-Based Review Search bar directly from Goodreads mockup! */}
                    <div className="relative max-w-xs w-full select-all">
                      <Search className="absolute left-3 top-2.5 w-4 h-4 text-stone-400 pointer-events-none" />
                      <input
                        type="text"
                        placeholder="Search reviews text..."
                        value={searchReviewText}
                        onChange={(e) => setSearchReviewText(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-250 hover:border-stone-300 focus:border-[#216a45] rounded-full text-xs font-sans text-stone-850 focus:outline-none focus:ring-1 focus:ring-[#216a45] transition-all"
                      />
                    </div>
                  </div>

                  {/* Review Items Map Grid */}
                  <div className="pt-2 space-y-6">
                    {(() => {
                      const filtered = (comments || []).filter(c => 
                        !searchReviewText || 
                        c.text.toLowerCase().includes(searchReviewText.toLowerCase()) ||
                        c.author.toLowerCase().includes(searchReviewText.toLowerCase())
                      );

                      const sorted = [...filtered].sort((a, b) => {
                        const aVal = a.isReview ? 1 : 0;
                        const bVal = b.isReview ? 1 : 0;
                        if (aVal !== bVal) {
                          return bVal - aVal;
                        }
                        return (b.created_at || "").localeCompare(a.created_at || "");
                      });

                      if (sorted.length > 0) {
                        return sorted.map((comment) => {
                          const details = getFollowerDetails(comment.author);
                          const commentRating = getCommentRating(comment);
                          const initialCode = comment.author.charCodeAt(0) || 65;
                          const colorIndex = initialCode % 5;
                          const bgPresets = ["bg-emerald-100 text-emerald-800", "bg-amber-100 text-amber-800", "bg-stone-200 text-stone-800", "bg-rose-100 text-[#8e3e3b]", "bg-orange-150 text-orange-850"];
                          const resolvedAvatarBg = bgPresets[colorIndex];

                          return (
                            <div 
                              key={comment.id} 
                              className={`flex flex-col sm:flex-row gap-4 border-b border-stone-150 pb-6 items-start animate-fade-in ${
                                comment.isReview 
                                  ? "bg-amber-50/20 border border-amber-200/65 p-4 rounded-xs shadow-2xs relative" 
                                  : ""
                              }`}
                            >
                              {/* Left part: Avatar & reviewers stats details */}
                              <div className="flex sm:flex-col items-center sm:items-start shrink-0 gap-3 w-full sm:w-[155px] select-none text-left">
                                <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm shrink-0 border border-stone-200 shadow-inner ${resolvedAvatarBg}`}>
                                  {comment.author.charAt(0).toUpperCase()}
                                </div>
                                <div className="space-y-0.5 text-left w-full">
                                  <span className="font-extrabold text-stone-900 font-sans break-all block text-sm sm:text-xs hover:underline cursor-pointer">
                                    {comment.author}
                                  </span>
                                  <span className="text-[10px] text-stone-400 font-sans block select-none">
                                    {details.reviewsCount} reviews · {details.followersCount} followers
                                  </span>
                                  <button
                                    type="button"
                                    className="text-[9px] font-mono text-[#216a45] bg-[#216a45]/5 hover:bg-[#216a45]/10 px-2.5 py-0.5 border border-[#216a45]/20 font-black rounded-xs tracking-wider uppercase mt-1 transition-colors block cursor-pointer text-left font-sans"
                                  >
                                    Follow
                                  </button>
                                </div>
                              </div>

                              {/* Right part: Star ratings, timestamp dates, text content reviewer */}
                              <div className="flex-1 space-y-2 text-left w-full">
                                {comment.isReview && (
                                  <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-600 text-white font-mono text-[9px] font-black uppercase tracking-wider rounded-xs mb-1.5 select-none shrink-0" style={{ animationDuration: "2s" }}>
                                    ★ PINNED CRITIQUE & REVIEW
                                  </div>
                                )}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-start sm:justify-between gap-1">
                                  {/* Star ratings associated deterministically with reviewer comments */}
                                  <div className="flex items-center gap-0.5 select-none" title={`${commentRating} Stars`}>
                                    {Array.from({ length: 5 }).map((_, i) => (
                                      <Star 
                                        key={i} 
                                        className={`w-3.5 h-3.5 shrink-0 ${
                                          i < commentRating 
                                            ? "fill-amber-400 stroke-amber-500 text-amber-500" 
                                            : "text-stone-200 stroke-stone-250"
                                        }`} 
                                      />
                                    ))}
                                  </div>

                                  <span className="text-[11px] font-sans text-stone-450">{comment.timestamp}</span>
                                </div>

                                {/* Text of critique review */}
                                <p className="text-[13.5px] sm:text-[14.5px] font-serif text-stone-750 leading-relaxed text-justify whitespace-pre-line select-text">
                                  {comment.text}
                                </p>

                                {/* Interactions line */}
                                <div className="flex items-center gap-4 pt-1 text-stone-400 font-sans text-xs select-none">
                                  <button 
                                    type="button"
                                    className="flex items-center gap-1 hover:text-stone-750 transition-colors cursor-pointer text-[11px] font-bold uppercase tracking-wider"
                                  >
                                    <ThumbsUp className="w-3.5 h-3.5 text-stone-350 hover:text-stone-700" />
                                    <span>Like</span>
                                  </button>
                                  <button 
                                    type="button"
                                    className="flex items-center gap-1 hover:text-[#216a45] transition-colors cursor-pointer text-[11px] font-bold uppercase tracking-wider"
                                  >
                                    <MessageSquare className="w-3.5 h-3.5 text-stone-300" />
                                    <span>Comment</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        });
                      } else {
                        return (
                          <p className="text-xs font-serif text-stone-455 italic py-6 text-center select-none bg-stone-50 border border-stone-150 animate-fade-in">
                            No reviews found matching "{searchReviewText}". Be the first to post yours below!
                          </p>
                        );
                      }
                    })()}
                  </div>

                  {/* Form to post comments directly */}
                  <form onSubmit={handleAddCommentSubmit} className="space-y-4 pt-8 text-left animate-fade-in">
                    <div className="flex justify-between items-center border-b border-stone-150 pb-1.5 select-none">
                      <h4 className="text-[11px] font-mono uppercase tracking-widest text-[#be8873] font-black font-sans">
                        Add Your Review Thoughts
                      </h4>
                      <span className="text-[9px] font-mono text-stone-405 font-sans">posted publicly on community reviews</span>
                    </div>

                    {errorMsg && (
                      <div id="comment-error" className="p-3 bg-red-50 border border-red-250 text-red-700 text-xs font-mono rounded-none">
                        ⚠️ {errorMsg}
                      </div>
                    )}

                    {commentPostMsg && (
                      <div id="comment-success" className="p-3 bg-[#fff8f1] border border-stone-200 text-stone-850 text-xs font-mono rounded-none animate-fade-in">
                        ✓ {commentPostMsg}
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <input
                        type="text"
                        placeholder="Your name (e.g. Sofia G.)"
                        value={authorName}
                        onChange={(e) => setAuthorName(e.target.value)}
                        className="md:col-span-1 p-2.5 bg-white border border-stone-200 focus:border-[#216a45] rounded-none text-xs font-serif text-stone-850 focus:outline-none focus:ring-1 focus:ring-[#216a45] transition-colors"
                        required
                      />
                      <input
                        type="text"
                        required
                        placeholder="Enter your observations or comments about this book..."
                        value={newCommentText}
                        onChange={(e) => setNewCommentText(e.target.value)}
                        className="md:col-span-2 p-2.5 bg-white border border-stone-200 focus:border-[#216a45] rounded-none text-xs font-serif text-stone-850 focus:outline-none focus:ring-1 focus:ring-[#216a45] transition-colors"
                      />
                    </div>
                    
                    <div className="text-right">
                      <button
                        type="submit"
                        className="px-5 py-2.5 bg-[#216a45] hover:bg-[#1a5537] text-white font-sans font-bold text-xs tracking-wider rounded-none cursor-pointer transition-all active:scale-95 uppercase shadow-2xs inline-flex items-center gap-1.5"
                      >
                        Post Review Comment
                      </button>
                    </div>
                  </form>
                </section>
              </div>
              )}

              {/* Scriptorium Series Collection Books - Standalone under comments and reactions */}
              {book.is_series_review && book.series_books && book.series_books.length > 0 && (
                <div className="pt-8 mt-10 w-full animate-fade-in text-left">
                  <SeriesCollection 
                    seriesBooks={book.series_books}
                    seriesTitle={book.series}
                    allBooks={allBooks || []}
                    parentBookTitle={book.title}
                  />
                </div>
              )}

              {/* Related Reviews match section nested underneath reader comments */}
              {relatedBooks.length > 0 && (
                <div className="pt-8 mt-10 w-full animate-fade-in">
                  <section id="related-books-section" className="space-y-6 text-left">
                    <div className="pb-3 border-b border-stone-200 flex items-center justify-between">
                      <h3 className="font-cinzel text-2xl sm:text-3xl font-black text-stone-900 tracking-tight flex items-center gap-1.5">
                        Related Books under {(typeof book.genre === "string" ? book.genre : Array.isArray(book.genre) ? (book.genre as string[]).join(", ") : String(book.genre || "General Literature")).split(/[,;|]+/)[0]}
                      </h3>
                      
                      {/* Manual Arrow Scroll Navigation Buttons */}
                      <div className="flex items-center gap-2 select-none">
                        <button
                          type="button"
                          onClick={() => scrollRelated("left")}
                          className="w-8 h-8 rounded-full border border-stone-200 flex items-center justify-center bg-white hover:bg-stone-50 hover:border-stone-450 transition-colors shadow-2xs cursor-pointer active:scale-95"
                          title="Scroll Left"
                        >
                          <ChevronLeft className="w-4 h-4 text-stone-600" />
                        </button>
                        <button
                          type="button"
                          onClick={() => scrollRelated("right")}
                          className="w-8 h-8 rounded-full border border-stone-200 flex items-center justify-center bg-white hover:bg-stone-50 hover:border-stone-450 transition-colors shadow-2xs cursor-pointer active:scale-95"
                          title="Scroll Right"
                        >
                          <ChevronRight className="w-4 h-4 text-stone-600" />
                        </button>
                      </div>
                    </div>

                    {/* Horizontal scroll container with scrollbar hidden */}
                    <div 
                      ref={carouselRef}
                      className="flex flex-row overflow-x-auto pb-4 gap-6 scroll-smooth snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                    >
                      {relatedBooks.map((relatedBook) => (
                        <div key={relatedBook.id} className="snap-start shrink-0 w-[180px] sm:w-[200px] flex justify-center">
                          <BookCard review={relatedBook} viewMode="grid" />
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              )}






            </div>

        </div>

      </div>

      {/* Share & Social Preview Modal Popup */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/45 backdrop-blur-xl animate-fade-in select-none">
          {/* Modal Container */}
          <div 
            className="bg-white shadow-2xl w-[900px] max-w-[900px] relative overflow-hidden rounded-none p-6 sm:p-8 text-stone-900"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Elegant header accent line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-400 via-orange-600 to-yellow-600" />
            
            {/* Close button in header */}
            <button
              onClick={() => setIsShareModalOpen(false)}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-900 transition-colors font-sans font-black text-sm p-1 cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-6 text-left">
              <div>
                <h3 className="font-serif text-xl sm:text-2xl font-black text-stone-900 uppercase tracking-tight">
                  Share Book Review
                </h3>
                <p className="text-xs font-mono text-stone-400 uppercase tracking-wider mt-1">
                  Preview how this review appears when shared on social platforms
                </p>
              </div>

              {/* Render the social preview card inside the popup */}
              <div className="border border-stone-100 bg-stone-50/50 p-2 rounded-none">
                <SocialPreviewCard book={book} />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setIsShareModalOpen(false)}
                  className="px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-sans font-bold text-xs rounded-full cursor-pointer uppercase transition-all duration-100 shadow-2xs"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>

          {/* Click outside backdrop overlay to close */}
          <div className="absolute inset-0 -z-10 bg-transparent" onClick={() => setIsShareModalOpen(false)} />
        </div>
      )}

      {/* Copyright Disclaimer Modal Popup */}
      {isDisclaimerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/45 backdrop-blur-xl animate-fade-in select-none">
          {/* Modal Container */}
          <div 
            className="bg-white shadow-2xl max-w-xl w-full relative overflow-hidden rounded-none p-6 sm:p-8 text-stone-900 animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Elegant header accent line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-400 via-orange-600 to-yellow-600" />
            
            {/* Close button in header */}
            <button
              onClick={() => setIsDisclaimerOpen(false)}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-900 transition-colors font-sans font-black text-sm p-1 cursor-pointer"
              aria-label="Close disclaimer modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-6 text-left">
              <div>
                <h3 className="font-serif text-xl sm:text-2xl font-black text-stone-900 uppercase tracking-tight">
                  Copyright Disclaimer
                </h3>
                <p className="text-xs font-mono text-stone-400 uppercase tracking-wider mt-1">
                  Intellectual Integrity & Scholastic respect
                </p>
              </div>

              <div className="font-serif text-stone-700 text-xs sm:text-sm leading-relaxed space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                <p className="italic">
                  All book covers, titles, author names, and related trademarks featured on this website remain the property of their respective copyright holders, authors, and publishers.
                </p>
                <p className="italic">
                  Book covers are displayed for identification, review, commentary, and informational purposes only. This website does not claim ownership of any copyrighted material belonging to third parties.
                </p>
                <p className="italic">
                  Reviews, essays, ratings, and original commentary published on this website are the intellectual property of Alexander unless otherwise stated.
                </p>
                <p className="italic">
                  If you are a copyright holder and believe any content on this website has been used improperly, please contact us and the matter will be reviewed promptly.
                </p>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setIsDisclaimerOpen(false)}
                  className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-sans font-bold text-xs rounded-none cursor-pointer uppercase transition-all"
                >
                  Understood
                </button>
              </div>
            </div>
          </div>

          {/* Click outside backdrop overlay to close */}
          <div className="absolute inset-0 -z-10 bg-transparent" onClick={() => setIsDisclaimerOpen(false)} />
        </div>
      )}
    </Layout>
  );
}

export default Book;
