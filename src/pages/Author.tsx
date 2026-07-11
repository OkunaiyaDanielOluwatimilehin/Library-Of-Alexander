import React, { useState, useEffect, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { 
  ChevronLeft, 
  ChevronRight,
  Quote, 
  Award, 
  Layers,
  Globe,
  Twitter,
  BookOpen,
  Bookmark,
  Check,
  Star,
  Lightbulb,
  Sparkles,
  Instagram,
  Facebook,
  Linkedin,
  Plus
} from "lucide-react";
import Layout from "../components/layout/Layout";
import { useAuthorSpotlight } from "../hooks/useAuthorSpotlight";
import { useBooks } from "../hooks/useBooks";
import { useAuthors } from "../hooks/useAuthors";
import { BookCover } from "../components/books/BookCover";
import { Book, getBookSlug, getAuthorSlug } from "../types";
import { BookCard } from "../components/books/BookCard";

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
        return <strong key={i} className="font-extrabold text-stone-950">{part.text}</strong>;
      case "italic":
        return <em key={i} className="italic text-stone-850">{part.text}</em>;
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
        <blockquote key={blockIdx} className="border-l-4 border-[#e07540] pl-5 py-3.5 pr-4 bg-[#faf8f4] italic font-serif text-stone-700 my-5 rounded-none relative shadow-4xs leading-relaxed text-base flex gap-2">
          <Quote className="w-8 h-8 text-[#e07540]/10 shrink-0 mt-0.5 select-none pointer-events-none" />
          <div>
            {lines.map((l, lIdx) => (
              <p key={lIdx} className={lIdx > 0 ? "mt-2" : ""}>
                {parseInlineMarkdown(l)}
              </p>
            ))}
          </div>
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
      <p key={blockIdx} className="text-justify font-serif text-stone-850 text-sm sm:text-base md:text-[16px] sm:leading-relaxed leading-relaxed mb-5 sm:mb-6 last:mb-0 max-w-none break-words">
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

export function Author() {
  const { name } = useParams<{ name: string }>();
  const { spotlight, loading: loadingSpotlight } = useAuthorSpotlight();
  const { books } = useBooks();
  const { authors, loading: loadingAuthors } = useAuthors();

  // Highlight toggle for spotlight section on authors main directory
  const [showSpotlightCuration, setShowSpotlightCuration] = useState(true);
  const [authorPage, setAuthorPage] = useState(1);
  const AUTHORS_PER_PAGE = 6;

  // Carousel scroll states for notable works
  const authorsCarouselRef = useRef<HTMLDivElement | null>(null);
  const [isAuthorsCarouselHovered, setIsAuthorsCarouselHovered] = useState(false);

  const scrollCarouselLeft = () => {
    if (authorsCarouselRef.current) {
      authorsCarouselRef.current.scrollBy({ left: -320, behavior: "smooth" });
    }
  };

  const scrollCarouselRight = () => {
    if (authorsCarouselRef.current) {
      authorsCarouselRef.current.scrollBy({ left: 320, behavior: "smooth" });
    }
  };

  // Carousel scroll states for relatable authors
  const relatableCarouselRef = useRef<HTMLDivElement | null>(null);
  const scrollRelatable = (direction: "left" | "right") => {
    if (relatableCarouselRef.current) {
      relatableCarouselRef.current.scrollBy({
        left: direction === "left" ? -300 : 300,
        behavior: "smooth"
      });
    }
  };

  // Carousel scroll states for notable works (books)
  const booksCarouselRef = useRef<HTMLDivElement | null>(null);
  const scrollBooks = (direction: "left" | "right") => {
    if (booksCarouselRef.current) {
      booksCarouselRef.current.scrollBy({
        left: direction === "left" ? -150 : 150,
        behavior: "smooth"
      });
    }
  };

  // User marked reading progress state
  const [progressState, setProgressState] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem("scriptorium_reading_progress");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [isBioExpanded, setIsBioExpanded] = useState(false);
  const bioRef = useRef<HTMLDivElement>(null);
  const [showReadMoreButton, setShowReadMoreButton] = useState(false);

  useEffect(() => {
    setIsBioExpanded(false);
  }, [name]);

  const updateProgress = (bookId: string, status: string) => {
    setProgressState(prev => {
      const next = { ...prev };
      if (!status) {
        delete next[bookId];
      } else {
        next[bookId] = status;
      }
      try {
        localStorage.setItem("scriptorium_reading_progress", JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  };

  // Safe fallback spotlight author
  const fallbackSpotlight = spotlight || {
    id: "jorge-luis-borges",
    name: "Jorge Luis Borges",
    bio: "An Argentine short-story writer, essayist, poet and translator, and a key figure in Spanish-language and international literature. His best-known books compile short stories interconnected by philosophical themes, mirrors, labyrinths, and dreams.",
    notable_works: [],
    spotlight_quote: "I have always imagined that Paradise will be a kind of library.",
    image_url: "https://images.unsplash.com/photo-1544947950-fa07a98d237f"
  };

  // Active author resolution
  const isDirectoryPage = !name;
  const authorName = name ? decodeURIComponent(name) : fallbackSpotlight.name;

  // Gathering all books associated with the computed author
  const directMatches = books.filter(
    (b) => b.author.toLowerCase().includes(authorName.toLowerCase())
  );

  const nestedMatches: Book[] = [];
  books.forEach((b) => {
    if (b.series_books && Array.isArray(b.series_books)) {
      b.series_books.forEach((sb) => {
        if (typeof sb === "object" && sb !== null) {
          const sbAuthor = sb.author || b.author;
          if (sbAuthor && sbAuthor.toLowerCase().includes(authorName.toLowerCase())) {
            const alreadyExists = directMatches.some(m => m.title.toLowerCase() === sb.title.toLowerCase()) || 
                                 nestedMatches.some(m => m.title.toLowerCase() === sb.title.toLowerCase());
            if (!alreadyExists) {
              nestedMatches.push({
                id: sb.id || `nested-${sb.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
                title: sb.title,
                author: sbAuthor,
                rating: sb.rating || b.rating || 5,
                reviewDate: b.reviewDate,
                genre: sb.genre || b.genre || "General Literature",
                coverColor: b.coverColor || "navy",
                coverStyle: b.coverStyle || "classic",
                summary: sb.synopsis || "No synopsis available.",
                reviewText: sb.hasReview ? "Full critique is published on the platform." : "",
                themes: b.themes || [],
                quotes: [],
                is_series_review: false,
                cover_url: sb.coverUrl,
                bookNumber: sb.bookNumber
              } as Book);
            }
          }
        }
      });
    }
  });

  const allAuthorBooks = [...directMatches, ...nestedMatches];
  const totalCataloged = allAuthorBooks.length;
  const averageRating = allAuthorBooks.length > 0 
    ? (allAuthorBooks.reduce((acc, curr) => acc + (curr.rating || 5), 0) / allAuthorBooks.length).toFixed(1)
    : "5.0";
  const uniqueGenres = Array.from(new Set(allAuthorBooks.map(b => b.genre?.split(/[,;|]+/)[0]?.trim()).filter(Boolean)));
  const favoriteGenre = uniqueGenres[0] || "General Literature";

  // Target author document
  const activeSpotlight = spotlight || fallbackSpotlight;
  const matchedAuthorInList = name 
    ? authors.find((a) => {
        const paramSlug = name.toLowerCase();
        const authorSlug = getAuthorSlug(a).toLowerCase();
        const optionName = a.name.toLowerCase();
        const decodedParamName = authorName.toLowerCase();
        return (
          authorSlug === paramSlug || 
          optionName === decodedParamName ||
          authorSlug === getAuthorSlug({ name: decodedParamName }).toLowerCase()
        );
      }) 
    : null;
  const authorObj = matchedAuthorInList || activeSpotlight;

  const relatableAuthors = authors.filter(
    (a) => a.id !== authorObj.id && a.name.toLowerCase() !== authorObj.name.toLowerCase()
  );

  useEffect(() => {
    const checkHeight = () => {
      if (bioRef.current) {
        const hasOverflow = bioRef.current.scrollHeight > 282;
        setShowReadMoreButton(hasOverflow);
      }
    };
    checkHeight();
    window.addEventListener("resize", checkHeight);
    return () => window.removeEventListener("resize", checkHeight);
  }, [authorObj?.bio, name]);

  const rawWorksList = authorObj?.notable_works || Array.from(new Set(allAuthorBooks.map(b => b.title))).slice(0, 5);

  const notableWorksResolved: Book[] = rawWorksList.map((work: any, index: number) => {
    if (work && typeof work === "object") {
      return {
        id: work.id || `notable-ref-${index}`,
        title: work.title || "Untitled",
        author: work.author || authorName,
        rating: work.rating || 5,
        reviewDate: "",
        genre: work.genre || "General Literature",
        coverColor: work.coverColor || "burgundy",
        coverStyle: work.coverStyle || "classic",
        summary: work.synopsis || "Biography entry volume.",
        reviewText: work.reviewText || (work.slug ? "Reviewed" : ""),
        themes: [],
        quotes: [],
        cover_url: work.cover_url || work.coverUrl,
        bookNumber: work.bookNumber
      } as Book;
    }

    // Try finding in master catalog list
    const matchedBook = books.find(
      (b) => b.title.toLowerCase().includes(String(work).toLowerCase()) || String(work).toLowerCase().includes(b.title.toLowerCase())
    );

    if (matchedBook) {
      return matchedBook;
    }

    const colors: Book["coverColor"][] = ["burgundy", "emerald", "navy", "saffron", "obsidian", "russet"];
    const styles: Book["coverStyle"][] = ["classic", "vintage", "minimalist", "ornate"];
    return {
      id: `fallback-${index}-${String(work).toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      title: String(work),
      author: authorName,
      rating: 5,
      reviewDate: "",
      genre: "General Literature",
      coverColor: colors[index % colors.length],
      coverStyle: styles[index % styles.length],
      summary: "Critique and full monograph analyses under editorial curation.",
      reviewText: "",
      themes: [],
      quotes: [],
      is_series_review: false
    } as Book;
  });

  // Auto-scrolling carousel logic removed to allow purely manual scroll
  useEffect(() => {
    // No-op to prevent auto carousel movement
  }, []);

  // Loading indicator matching the Scriptorium aesthetic
  if (loadingSpotlight || loadingAuthors) {
    return (
      <Layout>
        <div className="py-24 flex flex-col items-center justify-center space-y-6 w-full max-w-md mx-auto animate-fade-in text-center">
          <div className="relative flex items-center justify-center w-16 h-16">
            <div className="absolute inset-0 bg-amber-500/10 rounded-full blur-xl animate-pulse" />
            <div className="absolute w-14 h-14 border-2 border-dashed border-amber-500/40 rounded-full animate-spin [animation-duration:8s]" />
            <div className="absolute w-10 h-10 border-t-2 border-r-2 border-amber-600 rounded-full animate-spin" />
            <div className="w-3.5 h-3.5 bg-amber-650 rounded-full" />
          </div>
          <div className="space-y-1.5 text-center">
            <span className="block text-[11px] font-mono tracking-widest uppercase font-black text-amber-600 animate-pulse">
              Consulting Scriptorium Archives
            </span>
            <span className="block text-xs font-serif text-stone-500 italic">
              Opening scholar accounts and records...
            </span>
          </div>
        </div>
      </Layout>
    );
  }

  const authorBio = authorObj?.bio || `A master writer and esteemed literary philosopher featured in our catalog. Known for their intricate narrative architecture, deep thematic structures, and exceptional prose that shapes modern intellectual thought.`;
  const authorQuote = authorObj?.spotlight_quote;

  return (
    <Layout fullWidth={true}>
      <div className="max-w-[2100px] mx-auto py-6 sm:py-8 px-4 sm:px-8 lg:px-12 text-left space-y-6 sm:space-y-8 animate-fade-in text-stone-900 w-full">
        
        {/* Navigation Breadcrumb */}
        <div>
          <Link
            to={isDirectoryPage ? "/" : "/author"}
            className="inline-flex items-center gap-2 text-xs font-mono font-black uppercase tracking-widest text-[#be8873] hover:text-amber-800 transition-colors"
          >
            ← {isDirectoryPage ? "Back to Home" : "Back to Authors List"}
          </Link>
        </div>

        {isDirectoryPage ? (
          /* =========================================================
             1. MAIN AUTHORS DIRECTORY VIEW (SIMILAR TO BOOKS VIEW)
             ========================================================= */
          <div className="space-y-10">
            {/* Simple Elegant Page Header */}
            <div className="border-b border-stone-200 pb-6 text-left">
              <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-black text-[#0b0a0a] uppercase tracking-tight">
                Author's Page
              </h1>
            </div>

            {/* Conditionally Render Highlighted Scholar Monograph at the top as a beautiful, premium feature showcase */}
            {showSpotlightCuration && activeSpotlight && (
              <section id="author-spotlight-section" className="py-6 sm:py-10 md:py-12 bg-dusk-blue text-white relative overflow-hidden animate-fade-in w-full">
                {/* background Cover Image on Right with gradient left effect */}
                <div className="absolute right-0 top-0 bottom-0 w-full md:w-[60%] h-full z-0">
                  <div 
                    className="absolute inset-0 bg-dusk-blue/85 md:bg-transparent md:bg-gradient-to-r md:from-dusk-blue md:via-dusk-blue/95 md:to-transparent z-10"
                  />
                  {activeSpotlight.image_url && (
                    <img 
                      src={activeSpotlight.image_url} 
                      alt="" 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover select-none pointer-events-none absolute inset-0 opacity-80"
                    />
                  )}
                </div>

                {/* Showcase Container */}
                <div className="max-w-[1920px] mx-auto px-6 sm:px-12 md:px-16 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-12 relative z-20">
                  <div className="w-full md:max-w-[60%] flex flex-col items-start text-left space-y-2.5 sm:space-y-4 group">
                    <div className="space-y-2.5 sm:space-y-4 flex flex-col items-start text-left w-full">
                      <div className="flex flex-col items-start gap-1 sm:gap-2 pt-1 sm:pt-4">
                        <span 
                          className="font-display font-mono tracking-widest text-[#4ecdc4] font-bold uppercase block text-left text-xl sm:text-[36px] sm:leading-[36px]"
                        >
                          FEATURED SCHOLAR
                        </span>
                      </div>

                      <h1 className="font-display text-2xl sm:text-5xl md:text-[55px] md:leading-[52px] font-bold tracking-tight text-white group-hover:text-yellow transition-colors leading-tight uppercase text-left decoration-transparent">
                        <Link to={`/author/${getAuthorSlug(activeSpotlight)}`}>{activeSpotlight.name}</Link>
                      </h1>

                      <p className="text-sm sm:text-base font-sans text-stone-200/90 leading-relaxed font-light tracking-wide max-w-xl text-left">
                        {activeSpotlight.bio && activeSpotlight.bio.length > 225 ? activeSpotlight.bio.substring(0, 225).trim() + "..." : activeSpotlight.bio}
                      </p>

                      <div className="pt-2">
                        <Link 
                          to={`/author/${getAuthorSlug(activeSpotlight)}`}
                          className="inline-flex items-center gap-2 bg-yellow hover:bg-white text-slate-950 px-5 py-2.5 font-mono font-black text-[11px] tracking-wider uppercase transition-all shadow-md active:scale-95 duration-150 border border-yellow hover:border-white"
                        >
                          <span>Read Biography</span>
                          <ChevronRight className="w-4 h-4 text-slate-950" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Grid of Multiple Authors (Styled like a beautiful ledger index list) */}
            <div className="space-y-6 pt-2">
              <h4 className="font-mono text-[10px] font-black uppercase tracking-widest text-stone-500 border-b border-stone-100 pb-1.5 matches-heading">
                ALL ENROLLED WRITERS
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {(() => {
                  const sorted = [...authors].sort((a, b) => a.name.localeCompare(b.name));
                  const startIndex = (authorPage - 1) * AUTHORS_PER_PAGE;
                  const paginated = sorted.slice(startIndex, startIndex + AUTHORS_PER_PAGE);
                  return paginated.map((author, index) => {
                    const isSpotlightAuthor = author.isSpotlight;
                    return (
                      <Link 
                        key={author.id}
                        to={`/author/${getAuthorSlug(author)}`}
                        className={`group flex bg-[#faf8f5]/40 border border-stone-200 hover:border-[#be8873]/60 shadow-xs hover:shadow-md transition-all duration-300 relative overflow-hidden select-none text-left rounded-none ${isSpotlightAuthor ? 'border-amber-500 bg-amber-50/10' : ''}`}
                      >
                        {/* Image container */}
                        <div className="w-24 sm:w-28 overflow-hidden bg-stone-100 border-r border-stone-200/50 shrink-0">
                          <img 
                            src={author.image_url || "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80&w=400"} 
                            alt={author.name} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 aspect-[3/4]"
                            referrerPolicy="no-referrer"
                          />
                        </div>

                        {/* Info padding */}
                        <div className="p-3 sm:p-4 flex flex-col justify-between flex-1 min-w-0">
                          <div className="space-y-1">
                            <h3 className="font-serif font-black text-xs sm:text-sm text-stone-900 group-hover:text-amber-800 transition-colors uppercase tracking-tight line-clamp-2">
                              {author.name}
                            </h3>
                            <p className="text-[11px] text-stone-500 line-clamp-3 font-sans leading-relaxed">
                              {author.bio}
                            </p>
                          </div>
                          <div className="flex items-center justify-between text-[9px] font-mono text-stone-400 mt-2">
                            <span>{author.notable_works?.length || 0} Works</span>
                            <span className="text-amber-600 group-hover:translate-x-0.5 transition-transform">Bio &rarr;</span>
                          </div>
                        </div>
                      </Link>
                    );
                  });
                })()}
              </div>

              {/* Pagination Controls for Authors */}
              {authors.length > AUTHORS_PER_PAGE && (
                <div className="flex items-center justify-center gap-2 pt-6">
                  <button
                    disabled={authorPage === 1}
                    onClick={() => setAuthorPage(prev => Math.max(prev - 1, 1))}
                    className={`px-3 py-1.5 border font-mono text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-colors ${
                      authorPage === 1
                        ? "text-stone-300 border-stone-200 cursor-not-allowed"
                        : "text-stone-700 border-stone-300 hover:bg-stone-50"
                    }`}
                  >
                    <ChevronLeft className="w-3.5 h-3.5" /> PREV
                  </button>
                  <span className="font-mono text-[10px] font-bold text-stone-500 uppercase tracking-widest px-3">
                    Page {authorPage} of {Math.ceil(authors.length / AUTHORS_PER_PAGE)}
                  </span>
                  <button
                    disabled={authorPage >= Math.ceil(authors.length / AUTHORS_PER_PAGE)}
                    onClick={() => setAuthorPage(prev => Math.min(prev + 1, Math.ceil(authors.length / AUTHORS_PER_PAGE)))}
                    className={`px-3 py-1.5 border font-mono text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-colors ${
                      authorPage >= Math.ceil(authors.length / AUTHORS_PER_PAGE)
                        ? "text-stone-300 border-stone-200 cursor-not-allowed"
                        : "text-stone-700 border-stone-300 hover:bg-stone-50"
                    }`}
                  >
                    NEXT <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* =========================================================
             2. INDIVIDUAL AUTHOR DETAILED PAGE VIEW (WITH SMALL CARDS)
             ========================================================= */
          <div className="space-y-6 sm:space-y-8 animate-fade-in w-full">
            {/* Unified Main Section with gold corner framing removed */}
            <section className="p-0 relative overflow-hidden space-y-6 sm:space-y-8 text-stone-900 max-w-[1920px] mx-auto w-full">
              {/* Grid layout with Left Profile and Right Biography */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 md:gap-12 items-start">
                
                {/* Left Column: Image, Socials, website, where to buy, quote, did you know */}
                <div className="md:col-span-2 space-y-4 md:space-y-6">
                  {/* Author Image - breathing and no bg padding */}
                  <div className="w-full select-none flex justify-center md:justify-start">
                    <img 
                      src={authorObj.image_url || "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80&w=400"} 
                      alt={authorObj.name} 
                      className="w-[240px] h-[240px] sm:w-full sm:h-auto object-cover rounded-none border border-stone-200/40 shadow-xs"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  {/* Divider line underneath Image */}
                  <div className="border-t border-stone-200/60 my-4 w-full" />

                  {/* Social media, website, and where to get books in a clean side-by-side grid */}
                  <div className="pt-2 hidden sm:grid sm:grid-cols-2 gap-4 items-start text-left w-full">
                    {/* Left: Links & Socials */}
                    <div className="space-y-3">
                      <h4 className="font-mono text-[10px] font-black uppercase tracking-widest text-stone-500 pb-0.5">
                        Links & Socials
                      </h4>
                      <div className="flex flex-col gap-2.5">
                        {authorObj.website_url && (
                          <a 
                            href={authorObj.website_url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="flex items-center gap-2 text-xs font-sans text-stone-700 hover:text-[#be8873] transition-colors p-2 sm:p-0 bg-stone-100/40 sm:bg-transparent rounded-sm sm:rounded-none border border-stone-200/30 sm:border-0"
                          >
                            <Globe className="w-4 h-4 shrink-0 text-stone-500" />
                            <span>Official Website</span>
                          </a>
                        )}

                        {authorObj.socials_url && (
                          <a 
                            href={authorObj.socials_url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="flex items-center gap-2 text-xs font-sans text-stone-700 hover:text-[#be8873] transition-colors p-2 sm:p-0 bg-stone-100/40 sm:bg-transparent rounded-sm sm:rounded-none border border-stone-200/30 sm:border-0"
                          >
                            <BookOpen className="w-4 h-4 shrink-0 text-stone-500" />
                            <span>Goodreads Profile</span>
                          </a>
                        )}

                        {/* Social handle clickable link */}
                        {(authorObj.social_media_handle || authorObj.socialMediaHandle) && (
                          <a 
                            href={authorObj.twitter_url || `https://twitter.com/${(authorObj.social_media_handle || authorObj.socialMediaHandle || "").replace("@", "")}`}
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="flex items-center gap-2 text-xs font-sans text-stone-700 hover:text-[#be8873] transition-colors p-2 sm:p-0 bg-stone-100/40 sm:bg-transparent rounded-sm sm:rounded-none border border-stone-200/30 sm:border-0"
                          >
                            <Twitter className="w-4 h-4 shrink-0 text-stone-500" />
                            <span>{authorObj.social_media_handle || authorObj.socialMediaHandle}</span>
                          </a>
                        )}

                        {authorObj.twitter_url && !(authorObj.social_media_handle || authorObj.socialMediaHandle) && (
                          <a 
                            href={authorObj.twitter_url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="flex items-center gap-2 text-xs font-sans text-stone-700 hover:text-[#be8873] transition-colors p-2 sm:p-0 bg-stone-100/40 sm:bg-transparent rounded-sm sm:rounded-none border border-stone-200/30 sm:border-0"
                          >
                            <Twitter className="w-4 h-4 shrink-0 text-stone-500" />
                            <span>Twitter / X</span>
                          </a>
                        )}

                        {authorObj.instagram_url && (
                          <a 
                            href={authorObj.instagram_url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="flex items-center gap-2 text-xs font-sans text-stone-700 hover:text-[#be8873] transition-colors p-2 sm:p-0 bg-stone-100/40 sm:bg-transparent rounded-sm sm:rounded-none border border-stone-200/30 sm:border-0"
                          >
                            <Instagram className="w-4 h-4 shrink-0 text-stone-500" />
                            <span>Instagram</span>
                          </a>
                        )}

                        {authorObj.facebook_url && (
                          <a 
                            href={authorObj.facebook_url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="flex items-center gap-2 text-xs font-sans text-stone-700 hover:text-[#be8873] transition-colors p-2 sm:p-0 bg-stone-100/40 sm:bg-transparent rounded-sm sm:rounded-none border border-stone-200/30 sm:border-0"
                          >
                            <Facebook className="w-4 h-4 shrink-0 text-stone-500" />
                            <span>Facebook</span>
                          </a>
                        )}

                        {authorObj.linkedin_url && (
                          <a 
                            href={authorObj.linkedin_url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="flex items-center gap-2 text-xs font-sans text-stone-700 hover:text-[#be8873] transition-colors p-2 sm:p-0 bg-stone-100/40 sm:bg-transparent rounded-sm sm:rounded-none border border-stone-200/30 sm:border-0"
                          >
                            <Linkedin className="w-4 h-4 shrink-0 text-stone-500" />
                            <span>LinkedIn</span>
                          </a>
                        )}

                        {(authorObj.social_media_url || authorObj.socialMediaUrl) && (
                          <a 
                            href={authorObj.social_media_url || authorObj.socialMediaUrl} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="flex items-center gap-2 text-xs font-sans text-stone-700 hover:text-[#be8873] transition-colors font-bold p-2 sm:p-0 bg-stone-100/40 sm:bg-transparent rounded-sm sm:rounded-none border border-stone-200/30 sm:border-0"
                          >
                            <Sparkles className="w-4 h-4 shrink-0 text-orange-500" />
                            <span>Social Media Profile</span>
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Right: Buy Books */}
                    {authorObj.buy_books_url && (
                      <div className="space-y-3">
                        <h4 className="font-mono text-[10px] font-black uppercase tracking-widest text-stone-500 pb-0.5">
                          Buy Books
                        </h4>
                        <div className="text-left">
                          <a 
                            href={authorObj.buy_books_url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="inline-flex items-center justify-center gap-2 w-full sm:w-fit px-5 py-3 sm:px-3 sm:py-1.5 bg-[#be8873] text-white sm:bg-transparent sm:text-stone-700 border border-[#be8873] sm:border-stone-300 hover:bg-[#be8873]/90 sm:hover:bg-stone-50/50 hover:text-white sm:hover:text-[#be8873] font-mono font-black text-xs sm:text-[11px] uppercase tracking-wider transition-all cursor-pointer rounded-none shadow-xs sm:shadow-none text-center"
                          >
                            <span>Get Books</span>
                          </a>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Quote */}
                  {authorQuote && (
                    <div className="pt-2 space-y-2 text-left w-full">
                      <span className="font-mono text-[9px] text-[#be8873] uppercase tracking-widest font-black block text-left">
                        Famous Quote
                      </span>
                      <blockquote className="border-l-4 border-amber-600/70 pl-3.5 py-2.5 pr-3 bg-amber-50/15 italic font-serif text-sm text-stone-700 relative leading-relaxed text-left w-full">
                        "{authorQuote}"
                      </blockquote>
                    </div>
                  )}

                  {/* Divider line after Quote / Left Column on mobile view */}
                  <div className="border-t border-stone-200/60 my-4 md:hidden w-full" />
                </div>

                {/* Right Column: Biography & Fun facts */}
                <div className="md:col-span-3 space-y-4 md:space-y-6">
                  {/* Biography Section */}
                  <div className="space-y-6">
                    <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl lg:leading-tight font-black text-stone-900 tracking-tight pt-1 uppercase text-left">
                      {authorObj.name.toUpperCase()}
                    </h2>

                    <div className="relative">
                      <div 
                        ref={bioRef}
                        className="font-serif leading-relaxed text-left transition-all duration-500 overflow-hidden relative"
                        style={showReadMoreButton ? { maxHeight: isBioExpanded ? "3000px" : "282px" } : undefined}
                      >
                        {renderMarkdown(authorObj.bio)}
                        
                        {/* Fade-out overlay when collapsed */}
                        {showReadMoreButton && !isBioExpanded && (
                          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#fdfbf7] via-[#fdfbf7]/80 to-transparent pointer-events-none" />
                        )}
                      </div>
                      
                      {/* Read More / Read Less trigger */}
                      {showReadMoreButton && (
                        <div className="pt-2 flex justify-start">
                          <button
                            onClick={() => setIsBioExpanded(!isBioExpanded)}
                            className="font-mono text-[10px] font-black uppercase tracking-wider text-[#be8873] hover:text-stone-900 transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <span>{isBioExpanded ? "Read Less" : "Read More"}</span>
                            {isBioExpanded ? (
                              <span className="text-[9px]">▲</span>
                            ) : (
                              <span className="text-[9px]">▼</span>
                            )}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Fun Facts & Did You Know Segment beside each other */}
                    {((authorObj.fun_facts && authorObj.fun_facts.length > 0) || authorObj.did_you_know) && (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 border-t border-stone-200/80 pt-6">
                        {/* Fun Facts Segment */}
                        {authorObj.fun_facts && authorObj.fun_facts.length > 0 && (
                          <div className="space-y-4 text-left">
                            <span className="font-display text-[15px] sm:text-lg text-[#be8873] uppercase tracking-wider font-extrabold pb-2 flex items-center gap-2">
                              <Sparkles className="w-4 h-4 text-[#e07540] shrink-0" />
                              Literary Fun Facts
                            </span>
                            <ul className="space-y-3">
                              {authorObj.fun_facts.map((fact, index) => (
                                <li key={index} className="flex gap-2.5 items-start text-sm text-stone-750 font-serif">
                                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-50 border border-amber-100 text-[10px] font-mono font-black text-[#e07540] shrink-0 mt-0.5">
                                    {index + 1}
                                  </span>
                                  <span className="leading-relaxed text-stone-750 font-serif flex-1 w-full pt-0.5">
                                    {fact}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Did you know Segment beside Literary Fun facts */}
                        {authorObj.did_you_know && (
                          <div className="space-y-4 text-left lg:border-l lg:border-stone-200/60 lg:pl-6">
                            <span className="font-display text-[15px] sm:text-lg text-[#be8873] uppercase tracking-wider font-extrabold pb-2 flex items-center gap-2">
                              <Lightbulb className="w-4 h-4 text-[#e07540] shrink-0" />
                              Did You Know?
                            </span>
                            <p className="text-sm text-stone-600 font-serif leading-relaxed text-justify">
                              {authorObj.did_you_know}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Mobile-only Links & Socials & Buy Books */}
                    <div className="sm:hidden border-t border-stone-200/60 pt-6 mt-4 w-full">
                      {/* Social media, website, and where to get books in a clean list */}
                      <div className="space-y-6 text-left w-full">
                        {/* Links & Socials */}
                        <div className="space-y-3">
                          <h4 className="font-mono text-[10px] font-black uppercase tracking-widest text-stone-500 pb-0.5">
                            Links & Socials
                          </h4>
                          <div className="flex flex-col gap-2.5">
                            {authorObj.website_url && (
                              <a 
                                href={authorObj.website_url} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="flex items-center gap-2 text-xs font-sans text-stone-700 hover:text-[#be8873] transition-colors p-2.5 bg-stone-100/40 rounded-sm border border-stone-200/30"
                              >
                                <Globe className="w-4 h-4 shrink-0 text-stone-500" />
                                <span>Official Website</span>
                              </a>
                            )}

                            {authorObj.socials_url && (
                              <a 
                                href={authorObj.socials_url} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="flex items-center gap-2 text-xs font-sans text-stone-700 hover:text-[#be8873] transition-colors p-2.5 bg-stone-100/40 rounded-sm border border-stone-200/30"
                              >
                                <BookOpen className="w-4 h-4 shrink-0 text-stone-500" />
                                <span>Goodreads Profile</span>
                              </a>
                            )}

                            {(authorObj.social_media_handle || authorObj.socialMediaHandle) && (
                              <a 
                                href={authorObj.twitter_url || `https://twitter.com/${(authorObj.social_media_handle || authorObj.socialMediaHandle || "").replace("@", "")}`}
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="flex items-center gap-2 text-xs font-sans text-stone-700 hover:text-[#be8873] transition-colors p-2.5 bg-stone-100/40 rounded-sm border border-stone-200/30"
                              >
                                <Twitter className="w-4 h-4 shrink-0 text-stone-500" />
                                <span>{authorObj.social_media_handle || authorObj.socialMediaHandle}</span>
                              </a>
                            )}

                            {authorObj.twitter_url && !(authorObj.social_media_handle || authorObj.socialMediaHandle) && (
                              <a 
                                href={authorObj.twitter_url} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="flex items-center gap-2 text-xs font-sans text-stone-700 hover:text-[#be8873] transition-colors p-2.5 bg-stone-100/40 rounded-sm border border-stone-200/30"
                              >
                                <Twitter className="w-4 h-4 shrink-0 text-stone-500" />
                                <span>Twitter / X</span>
                              </a>
                            )}

                            {authorObj.instagram_url && (
                              <a 
                                href={authorObj.instagram_url} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="flex items-center gap-2 text-xs font-sans text-stone-700 hover:text-[#be8873] transition-colors p-2.5 bg-stone-100/40 rounded-sm border border-stone-200/30"
                              >
                                <Instagram className="w-4 h-4 shrink-0 text-stone-500" />
                                <span>Instagram</span>
                              </a>
                            )}

                            {authorObj.facebook_url && (
                              <a 
                                href={authorObj.facebook_url} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="flex items-center gap-2 text-xs font-sans text-stone-700 hover:text-[#be8873] transition-colors p-2.5 bg-stone-100/40 rounded-sm border border-stone-200/30"
                              >
                                <Facebook className="w-4 h-4 shrink-0 text-stone-500" />
                                <span>Facebook</span>
                              </a>
                            )}

                            {authorObj.linkedin_url && (
                              <a 
                                href={authorObj.linkedin_url} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="flex items-center gap-2 text-xs font-sans text-stone-700 hover:text-[#be8873] transition-colors p-2.5 bg-stone-100/40 rounded-sm border border-stone-200/30"
                              >
                                <Linkedin className="w-4 h-4 shrink-0 text-stone-500" />
                                <span>LinkedIn</span>
                              </a>
                            )}

                            {(authorObj.social_media_url || authorObj.socialMediaUrl) && (
                              <a 
                                href={authorObj.social_media_url || authorObj.socialMediaUrl} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="flex items-center gap-2 text-xs font-sans text-stone-700 hover:text-[#be8873] transition-colors font-bold p-2.5 bg-stone-100/40 rounded-sm border border-stone-200/30"
                              >
                                <Sparkles className="w-4 h-4 shrink-0 text-orange-500" />
                                <span>Social Media Profile</span>
                              </a>
                            )}
                          </div>
                        </div>

                        {/* Buy Books */}
                        {authorObj.buy_books_url && (
                          <div className="space-y-3 pt-2">
                            <h4 className="font-mono text-[10px] font-black uppercase tracking-widest text-stone-500 pb-0.5">
                              Buy Books
                            </h4>
                            <div className="text-left">
                              <a 
                                href={authorObj.buy_books_url} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="inline-flex items-center justify-center gap-2 w-full px-5 py-3.5 bg-[#be8873] text-white border border-[#be8873] hover:bg-[#be8873]/90 font-mono font-black text-xs uppercase tracking-wider transition-all cursor-pointer rounded-none shadow-xs text-center"
                              >
                                <span>Get Books</span>
                              </a>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notable Works spread underneath back to the left */}
              {notableWorksResolved.length > 0 && (
                <div className="pt-6 border-t border-stone-200/80 mt-4 space-y-4 text-left w-full">
                    <div className="border-b border-stone-150 pb-1.5 flex items-center justify-between">
                      <span className="font-display text-[20px] sm:text-[24px] text-black uppercase tracking-widest font-black block">
                        Notable Works
                      </span>
                      {/* Mobile Arrow Scroll Navigation Buttons */}
                      <div className="flex sm:hidden items-center gap-1.5 select-none">
                        <button
                          type="button"
                          onClick={() => scrollBooks("left")}
                          className="w-7 h-7 rounded-full border border-stone-200 flex items-center justify-center bg-white hover:bg-stone-50 active:scale-95 transition-all shadow-3xs cursor-pointer"
                          title="Scroll Left"
                        >
                          <ChevronLeft className="w-3.5 h-3.5 text-stone-600" />
                        </button>
                        <button
                          type="button"
                          onClick={() => scrollBooks("right")}
                          className="w-7 h-7 rounded-full border border-stone-200 flex items-center justify-center bg-white hover:bg-stone-50 active:scale-95 transition-all shadow-3xs cursor-pointer"
                          title="Scroll Right"
                        >
                          <ChevronRight className="w-3.5 h-3.5 text-stone-600" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Desktop/Tablet Grid View */}
                    <div className="hidden sm:grid sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-4 w-full">
                      {notableWorksResolved.slice(0, notableWorksResolved.length > 8 ? 7 : 8).map((work) => {
                        return (
                          <div key={work.id} className="group/work bg-[#faf8f5]/45 border border-stone-200 p-2 hover:border-[#be8873]/60 transition-all shadow-3xs flex flex-col justify-between h-full">
                            <div className="space-y-2">
                              <div className="aspect-[3/4] overflow-hidden bg-stone-100 border border-stone-200/50">
                                <img 
                                  src={work.cover_url || "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80&w=200"} 
                                  alt={work.title} 
                                  className="w-full h-full object-cover group-hover/work:scale-105 transition-transform duration-300"
                                  referrerPolicy="no-referrer"
                                />
                              </div>
                              <h5 className="font-serif font-black text-[11px] text-stone-900 line-clamp-2 uppercase tracking-tight leading-tight text-left">
                                {work.title}
                              </h5>
                            </div>
                            <div className="text-[9px] font-mono text-stone-400 mt-1.5 uppercase truncate text-left">
                              {work.genre?.split(/[,;|]+/)[0]?.trim()}
                            </div>
                          </div>
                        );
                      })}
                      {notableWorksResolved.length > 8 && (
                        <Link 
                          to={`/books?author=${encodeURIComponent(authorObj.name)}`}
                          className="w-full aspect-[3/4] flex flex-col items-center justify-center border border-dashed border-stone-300 hover:border-[#be8873] bg-stone-50/50 hover:bg-orange-50/10 text-stone-500 hover:text-[#be8873] transition-all duration-300 group cursor-pointer p-2 shadow-3xs"
                        >
                          <div className="w-8 h-8 rounded-full bg-white group-hover:bg-orange-100 flex items-center justify-center border border-stone-200 group-hover:border-orange-300 shadow-3xs transition-all duration-300 mb-1.5">
                            <Plus className="w-3.5 h-3.5 transition-transform group-hover:rotate-90 text-stone-600" />
                          </div>
                          <span className="font-mono text-[10px] font-black uppercase tracking-wider text-center">View More</span>
                          <span className="text-[8px] text-stone-400 mt-0.5 font-sans text-center">
                            +{notableWorksResolved.length - 7} works
                          </span>
                        </Link>
                      )}
                    </div>

                    {/* Mobile Carousel View */}
                    <div 
                      ref={booksCarouselRef}
                      className="flex sm:hidden overflow-x-auto pb-4 gap-3 w-full snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden scroll-smooth"
                    >
                      {(notableWorksResolved.length > 4 ? notableWorksResolved.slice(0, 3) : notableWorksResolved).map((work) => {
                        return (
                          <div key={work.id} className="snap-start shrink-0 w-[120px] group/work bg-[#faf8f5]/45 border border-stone-200 p-2 hover:border-[#be8873]/60 transition-all shadow-3xs flex flex-col justify-between">
                            <div className="space-y-2">
                              <div className="aspect-[3/4] overflow-hidden bg-stone-100 border border-stone-200/50">
                                <img 
                                  src={work.cover_url || "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80&w=200"} 
                                  alt={work.title} 
                                  className="w-full h-full object-cover"
                                  referrerPolicy="no-referrer"
                                />
                              </div>
                              <h5 className="font-serif font-black text-[9px] text-stone-900 line-clamp-2 uppercase tracking-tight leading-tight text-left">
                                {work.title}
                              </h5>
                            </div>
                            <div className="text-[8px] font-mono text-stone-400 mt-1.5 uppercase truncate text-left">
                              {work.genre?.split(/[,;|]+/)[0]?.trim()}
                            </div>
                          </div>
                        );
                      })}
                      {notableWorksResolved.length > 4 && (
                        <Link 
                          to={`/books?g=${encodeURIComponent(notableWorksResolved[0]?.genre?.split(/[,;|]+/)[0]?.trim() || "All Genres")}`}
                          className="snap-start shrink-0 w-[120px] aspect-[3/4] flex flex-col items-center justify-center border border-dashed border-stone-300 hover:border-[#be8873] bg-stone-50/50 hover:bg-orange-50/10 text-stone-500 hover:text-[#be8873] transition-all duration-300 group cursor-pointer p-2 shadow-3xs"
                        >
                          <div className="w-6 h-6 rounded-full bg-white group-hover:bg-orange-100 flex items-center justify-center border border-stone-200 group-hover:border-orange-300 shadow-3xs transition-all duration-300 mb-1">
                            <Plus className="w-3 h-3 transition-transform group-hover:rotate-90 text-stone-600" />
                          </div>
                          <span className="font-mono text-[8px] font-black uppercase tracking-wider text-center">Read More</span>
                          <span className="text-[7px] text-stone-400 mt-0.5 font-sans text-center truncate w-full px-1">
                            {notableWorksResolved[0]?.genre?.split(/[,;|]+/)[0]?.trim() || "Genre"}
                          </span>
                        </Link>
                      )}
                    </div>
                  </div>
                )}

                {/* Relatable Authors spread underneath */}
                {relatableAuthors.length > 0 && (
                  <div className="pt-8 border-t border-stone-200/80 mt-6 space-y-6 text-left w-full">
                    <div className="pb-3 border-b border-stone-200 flex items-center justify-between">
                      <h3 className="font-cinzel text-xl sm:text-2xl md:text-3xl font-black text-stone-900 tracking-tight flex items-center gap-1.5">
                        Relatable Authors
                      </h3>
                      
                      {/* Manual Arrow Scroll Navigation Buttons */}
                      <div className="flex items-center gap-2 select-none">
                        <button
                          type="button"
                          onClick={() => scrollRelatable("left")}
                          className="w-8 h-8 rounded-full border border-stone-200 flex items-center justify-center bg-white hover:bg-stone-50 hover:border-stone-450 transition-colors shadow-2xs cursor-pointer active:scale-95"
                          title="Scroll Left"
                        >
                          <ChevronLeft className="w-4 h-4 text-stone-600" />
                        </button>
                        <button
                          type="button"
                          onClick={() => scrollRelatable("right")}
                          className="w-8 h-8 rounded-full border border-stone-200 flex items-center justify-center bg-white hover:bg-stone-50 hover:border-stone-450 transition-colors shadow-2xs cursor-pointer active:scale-95"
                          title="Scroll Right"
                        >
                          <ChevronRight className="w-4 h-4 text-stone-600" />
                        </button>
                      </div>
                    </div>

                    {/* Horizontal scroll container with scrollbar hidden */}
                    <div 
                      ref={relatableCarouselRef}
                      className="flex flex-row overflow-x-auto pb-4 gap-6 scroll-smooth snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                    >
                      {relatableAuthors.map((relAuth) => (
                        <div key={relAuth.id} className="snap-start shrink-0 w-[240px] sm:w-[280px]">
                          <Link 
                            to={`/author/${getAuthorSlug(relAuth)}`}
                            className="group flex bg-[#faf8f5]/40 border border-stone-200 hover:border-[#be8873]/60 shadow-xs hover:shadow-md transition-all duration-300 relative overflow-hidden select-none text-left rounded-none h-full"
                          >
                            <div className="w-20 overflow-hidden bg-stone-100 border-r border-stone-200/50 shrink-0">
                              <img 
                                src={relAuth.image_url || "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80&w=400"} 
                                alt={relAuth.name} 
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 aspect-[3/4]"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                            <div className="p-3 flex flex-col justify-between flex-1 min-w-0">
                              <div className="space-y-1">
                                <h4 className="font-serif font-black text-xs text-stone-900 group-hover:text-amber-800 transition-colors uppercase tracking-tight truncate">
                                  {relAuth.name}
                                </h4>
                                <p className="text-[10px] text-stone-500 line-clamp-3 font-sans leading-relaxed">
                                  {relAuth.bio}
                                </p>
                              </div>
                              <span className="text-[9px] font-mono text-amber-600 mt-1 self-end group-hover:translate-x-0.5 transition-transform font-bold">Bio &rarr;</span>
                            </div>
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

            </section>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default Author;
