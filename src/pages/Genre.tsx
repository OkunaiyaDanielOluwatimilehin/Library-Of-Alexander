import React, { useState, useEffect } from "react";
import { Link, useSearchParams, useLocation, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Tag, Search, X, Sparkles, BookOpen, SlidersHorizontal, ArrowUpDown, LayoutGrid, List, User, ArrowRight, Plus, Minus } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Layout from "../components/layout/Layout";
import { useGenres } from "../hooks/useGenres";
import { useBooks } from "../hooks/useBooks";
import BookGrid from "../components/books/BookGrid";
import BookCard from "../components/books/BookCard";
import { useTopPicks } from "../hooks/useTopPicks";
import { useBottomShelf } from "../hooks/useBottomShelf";
import { useDiscovery } from "../hooks/useDiscovery";
import { useHomepageConfig } from "../hooks/useHomepageConfig";
import { FeaturedCarousel } from "../components/books/FeaturedCarousel";
import { getBookSlug } from "../types";
import { useAuthors } from "../hooks/useAuthors";

export function Genre() {
  const { genres } = useGenres();
  const { books, loading } = useBooks();
  const { authors } = useAuthors();
  const { config } = useHomepageConfig();
  const { topPicks } = useTopPicks();
  const { bottomShelf } = useBottomShelf();
  const { discoveryBooks } = useDiscovery();
  const [categories, setCategories] = useState<Array<{ id: string; title: string; books: any[] }>>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Helper to accurately classify reviewed/non-reviewed volumes in sync with BookCard
  const bookHasReview = (b: any): boolean => {
    return !!(b.reviewText && 
      b.reviewText.trim().length > 0 && 
      !b.reviewText.toLowerCase().includes("no review analysis is published yet") &&
      !b.reviewText.toLowerCase().includes("no review text") &&
      !b.reviewText.toLowerCase().includes("no secondary detailed review text"));
  };

  const [activeSegment, setActiveSegment] = useState<"books" | "reviews">(
    location.pathname === "/reviews" ? "reviews" : "books"
  );

  // Synchronize route pathname transitions instantly
  useEffect(() => {
    if (location.pathname === "/reviews") {
      setActiveSegment("reviews");
    } else if (location.pathname === "/books") {
      setActiveSegment("books");
    }
  }, [location.pathname]);
  
  // Directly bind search query to URL parameter for perfect global syncing
  const searchQuery = searchParams.get("q") || "";
  const setSearchQuery = (val: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (val) {
      newParams.set("q", val);
    } else {
      newParams.delete("q");
    }
    setSearchParams(newParams);
  };

  const [sortBy, setSortBy] = useState<"default" | "rating" | "reactions" | "comments" | "series" | "author" | "alphabet">("default");
  const [selectedAuthor, setSelectedAuthor] = useState<string>("All Authors");
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "individual" | "series">("all");
  const [selectedSeries, setSelectedSeries] = useState<string>("All Series");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Closed by default
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  
  // Auto-collapse sidebar on mobile screens on initial load to optimize mobile viewport space
  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  }, []);
  
  // Collapse states for sidebar sections
  const [isScopeCollapsed, setIsScopeCollapsed] = useState(false);
  const [isSeriesCollapsed, setIsSeriesCollapsed] = useState(false);
  const [isGenreCollapsed, setIsGenreCollapsed] = useState(false);
  const [isAuthorCollapsed, setIsAuthorCollapsed] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});
  const [currentCategoryPage, setCurrentCategoryPage] = useState(1);
  const categoriesPerPage = 4;

  const activeGenre = searchParams.get("g") || "All Genres";

  // Reset pagination to page 1 whenever any filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeGenre, activeTab, selectedSeries, selectedAuthor, searchQuery, sortBy]);

  const getSeededReactionsCount = (key: string): number => {
    const saved = localStorage.getItem(`reactions_counts_${key}`);
    if (saved) {
      try {
        const counts = JSON.parse(saved);
        return Object.values(counts).reduce((a: any, b: any) => a + Number(b), 0) as number;
      } catch (_) {}
    }
    const matchedBook = books?.find(b => b.id === key);
    if (matchedBook && matchedBook.reactions) {
      const r = matchedBook.reactions;
      return (r.love || 0) + (r.insightful || 0) + (r.agree || 0) + (r.bookmark || 0);
    }
    const seedMap: Record<string, number> = {
      "library-of-babel": 126,
      "foucaults-pendulum": 92,
      "shadow-of-the-wind": 178,
      "italo-calvino-traveler": 101,
      "picture-of-dorian-gray": 116,
      "dune": 242
    };
    return seedMap[key] || 14;
  };

  const getCommentsCount = (key: string): number => {
    const saved = localStorage.getItem(`comments_${key}`);
    if (saved) {
      try {
        return JSON.parse(saved).length;
      } catch (_) {}
    }
    return 2;
  };

  const availableSeries = Array.from(new Set(
    books
      .map(b => b.series)
      .filter(Boolean) as string[]
  )).sort();

  const availableAuthors = Array.from(new Set(
    books
      .map(b => b.author)
      .filter(Boolean) as string[]
  )).sort();

  const checkMatchesFiltersExceptSegment = (b: typeof books[0]) => {
    // Type/Tab matching
    const matchesTab = 
      activeTab === "all" ||
      (activeTab === "individual" && !b.is_series_review) ||
      (activeTab === "series" && !!b.is_series_review);

    // Dynamic series filtering matches
    const matchesSeries =
      selectedSeries === "All Series" ||
      b.series === selectedSeries;

    const bookGenres: string[] = [];
    if (b.genre) {
      const rawGenre = typeof b.genre === "string"
        ? b.genre
        : Array.isArray(b.genre)
        ? (b.genre as string[]).join(", ")
        : String(b.genre);
      rawGenre.split(/[,;|]+/).map(g => g.trim().toLowerCase()).forEach(g => {
        if (g) bookGenres.push(g);
      });
    }
    if (Array.isArray(b.themes)) {
      b.themes
        .map(t => {
          if (typeof t === "string") return t;
          if (t && typeof t === "object") {
            const maybeTitle = (t as any).name || (t as any).title;
            if (typeof maybeTitle === "string") return maybeTitle;
            const fieldsObj = (t as any).fields;
            if (fieldsObj && typeof fieldsObj.name === "string") return fieldsObj.name;
            if (fieldsObj && typeof fieldsObj.title === "string") return fieldsObj.title;
            try {
              return JSON.stringify(t);
            } catch (_) {
              return String(t);
            }
          }
          return String(t);
        })
        .filter(Boolean)
        .flatMap(t => t.split(/[,;|]+/))
        .map(t => t.trim().toLowerCase())
        .forEach(t => {
          if (t) bookGenres.push(t);
        });
    }

    const matchesGenre = 
      activeGenre === "All Genres" || 
      bookGenres.includes(activeGenre.trim().toLowerCase());
    const matchesSearch = 
      (b.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.author || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.summary || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.genre && String(b.genre).toLowerCase().includes(searchQuery.toLowerCase())) ||
      (b.themes && b.themes.some((t) => {
        if (!t) return false;
        const tStr = typeof t === "string" ? t : (t as any).name || (t as any).title || ((t as any).fields?.name) || ((t as any).fields?.title) || String(t);
        return typeof tStr === "string" ? tStr.toLowerCase().includes(searchQuery.toLowerCase()) : false;
      }));

    const matchesAuthor =
      selectedAuthor === "All Authors" ||
      b.author === selectedAuthor;

    return matchesGenre && matchesSearch && matchesTab && matchesSeries && matchesAuthor;
  };

  const dynamicBooksCount = books.filter(b => checkMatchesFiltersExceptSegment(b) && !bookHasReview(b)).length;
  const dynamicReviewsCount = books.filter(b => checkMatchesFiltersExceptSegment(b) && bookHasReview(b)).length;

  const filteredBooks = books.filter((b) => {
    const hasRvValue = bookHasReview(b);
    const matchesSegment = activeSegment === "reviews" ? hasRvValue : !hasRvValue;
    return checkMatchesFiltersExceptSegment(b) && matchesSegment;
  });

  const getDynamicRating = (bk: any) => {
    const userRatingStr = localStorage.getItem(`scriptorium_user_rating_${bk.id}`);
    const savedStats = localStorage.getItem(`rating_stats_${bk.id}`);
    if (savedStats) {
      try {
        const parsed = JSON.parse(savedStats);
        if (parsed?.avg !== null && parsed?.avg !== undefined) {
          return parsed.avg;
        }
      } catch (_) {}
    }
    if (userRatingStr !== null) {
      return Number(userRatingStr);
    }
    return bk.rating;
  };

  const sortedAndFilteredBooks = [...filteredBooks].sort((a, b) => {
    if (sortBy === "rating") {
      return getDynamicRating(b) - getDynamicRating(a);
    }
    if (sortBy === "reactions") {
      return getSeededReactionsCount(b.id) - getSeededReactionsCount(a.id);
    }
    if (sortBy === "comments") {
      return getCommentsCount(b.id) - getCommentsCount(a.id);
    }
    if (sortBy === "series") {
      const sA = a.series || "ZZZZZZZZ";
      const sB = b.series || "ZZZZZZZZ";
      return sA.localeCompare(sB);
    }
    if (sortBy === "author") {
      const authA = a.author || "";
      const authB = b.author || "";
      return authA.localeCompare(authB);
    }
    if (sortBy === "alphabet") {
      const tA = a.title || "";
      const tB = b.title || "";
      return tA.localeCompare(tB);
    }
    return 0; // default
  });

  const totalPages = Math.ceil(sortedAndFilteredBooks.length / itemsPerPage);
  const paginatedBooks = sortedAndFilteredBooks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleGenreClick = (genre: string) => {
    setSearchParams({ g: genre });
  };

  const genreDescriptions: Record<string, string> = {
    "top picks": config.topPicksDescription || "The absolute highest rated and critically decorated scholars' choices representing pinnacle achievements of historical literature.",
    "bottom shelf": config.bottomShelfDescription || "Rare, under-appreciated classics that have quiet impact and profound, dense themes waiting for diligent minds to study.",
    "discovery": "Speculative and experimental works, rare findings, and obscure titles selected for their intellectual curiosity.",
    "fiction": "Fiction is the telling of stories which are not real. More specifically, fiction is an imaginative creation or a pretense that does not represent actual people or events, but captures deep truths of human experience.",
    "classics": "Classics refers to major literary works of high merit that have stood the test of time, influencing writers and readers across multiple generations with their enduring themes and structural excellence.",
    "philosophy": "Philosophy is the systematic study of ideas and issues, a rational inquiry seeking to understand the fundamental truths about themselves, the world, and their relationships through logical reasoning.",
    "science fiction": "Science Fiction is a genre of speculative fiction that typically deals with imaginative and futuristic concepts such as advanced science and technology, space exploration, and time travel.",
    "historical fiction": "Historical fiction is a literary genre in which the plot takes place in a setting located in the past, capturing the spirit, manners, and social conditions of the persons or times presented.",
    "christian fiction": "A Christian novel is any novel that expounds and illustrates a Christian world view in its plot, its characters, or both, or which deals with Christian themes in a positive way. Many novels with Christian themes also fall into specific mainstream fiction genres.",
    "magical realism": "Magical realism is a literary genre in which realistic narrative and naturalistic technique are combined with surreal elements of dream or fantasy, presenting a magical worldview as everyday reality.",
    "poetry": "Poetry is a form of literature that uses aesthetic and rhythmic qualities of language—such as phonaesthetics, sound symbolism, and metre—to evoke meanings in addition to, or in place of, a prosaic ostensible meaning."
  };

  useEffect(() => {
    let active = true;
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/cms/categories");
        if (response.ok) {
          const json = await response.json();
          if (active && json.data) {
            setCategories(json.data);
            return;
          }
        }
      } catch (err) {
        console.warn("Failed to fetch categories:", err);
      }
      if (active) {
        setCategories([]);
      }
    };

    fetchCategories();
    return () => { active = false; };
  }, []);

  // Staggered Container Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 25 },
    show: { 
      opacity: 1, 
      y: 0, 
      transition: { type: "spring", stiffness: 80, damping: 14 } 
    }
  };

  const getFilterAndSortLabel = () => {
    const labels: string[] = [];
    if (activeGenre !== "All Genres") {
      labels.push(activeGenre);
    }
    if (activeTab !== "all") {
      labels.push(activeTab === "individual" ? "Single" : "Series");
    }
    if (selectedSeries !== "All Series") {
      labels.push(selectedSeries);
    }
    if (selectedAuthor !== "All Authors") {
      labels.push(selectedAuthor);
    }
    if (labels.length === 0) {
      labels.push("All");
    }
    const sortLabels: Record<string, string> = {
      default: "Default",
      rating: "Rating",
      reactions: "Reactions",
      comments: "Comments",
      series: "Series",
      author: "Author",
      alphabet: "A-Z"
    };
    labels.push(sortLabels[sortBy] || sortBy);
    return labels.join(" • ");
  };

  return (
    <Layout fullWidth={true}>
      <div className="w-full flex flex-col items-center pb-24">
        
        {/* Navigation Breadcrumb and Title Header (constrained to max-w-6xl) */}
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-8 mt-8 space-y-12 mb-12">
          {/* Navigation Breadcrumb */}
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center justify-between w-full"
          >
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 text-xs font-sans text-stone-500 hover:text-orange-600 font-semibold uppercase tracking-wider transition-all duration-250 hover:-translate-x-1"
            >
              <ChevronLeft className="w-4 h-4 text-orange-500" /> Back to Home
            </Link>
          </motion.div>

          {/* Master Catalog Header Box */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 70 }}
            className="border-b border-stone-200 pb-6 space-y-6 text-left relative overflow-hidden w-full"
          >
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div className="space-y-2 flex-1">
                <span className="text-xs uppercase font-sans tracking-widest text-[#be8873] font-extrabold block">
                  {config.reviewsTitle || "Curated Book Directory"}
                </span>
                <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-black text-stone-900 tracking-tight leading-none mt-1">
                  {config.reviewsSubtitle || "Tomes, Works & Reviews"}
                </h1>
                <p className="text-sm font-sans text-stone-600 leading-relaxed max-w-3xl pt-1">
                  {config.reviewsDescription || "A comprehensive collection of books, monographs, and curation reviews. Search and filter below to share details of any book, its rating, summary, quotes, and active discussions."}
                </p>

                {/* Active Filters Row */}
                {(activeGenre !== "All Genres" || activeTab !== "all" || selectedSeries !== "All Series" || selectedAuthor !== "All Authors" || searchQuery) && (
                  <div className="flex flex-wrap items-center gap-2 pt-3 animate-fade-in">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-400 mr-1">
                      Active Filters:
                    </span>
                    
                    {activeGenre !== "All Genres" && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-50 border border-orange-100 text-[#e07540] text-[11px] font-sans font-semibold shadow-3xs animate-fade-in">
                        <span>Genre: {activeGenre}</span>
                        <button 
                          onClick={() => setSearchParams({ g: "All Genres" })}
                          className="hover:text-orange-950 font-bold text-xs leading-none cursor-pointer"
                        >
                          ×
                        </button>
                      </span>
                    )}

                    {activeTab !== "all" && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-stone-100 border border-stone-200 text-stone-800 text-[11px] font-sans font-semibold shadow-3xs animate-fade-in">
                        <span>Type: {activeTab === "individual" ? "Standalone" : "Series"}</span>
                        <button 
                          onClick={() => setActiveTab("all")}
                          className="hover:text-stone-950 font-bold text-xs leading-none cursor-pointer"
                        >
                          ×
                        </button>
                      </span>
                    )}

                    {selectedSeries !== "All Series" && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-stone-100 border border-stone-200 text-stone-800 text-[11px] font-sans font-semibold shadow-3xs animate-fade-in">
                        <span>Series: {selectedSeries}</span>
                        <button 
                          onClick={() => setSelectedSeries("All Series")}
                          className="hover:text-stone-950 font-bold text-xs leading-none cursor-pointer"
                        >
                          ×
                        </button>
                      </span>
                    )}

                    {selectedAuthor !== "All Authors" && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-stone-100 border border-stone-200 text-stone-800 text-[11px] font-sans font-semibold shadow-3xs animate-fade-in">
                        <span>Author: {selectedAuthor}</span>
                        <button 
                          onClick={() => setSelectedAuthor("All Authors")}
                          className="hover:text-stone-950 font-bold text-xs leading-none cursor-pointer"
                        >
                          ×
                        </button>
                      </span>
                    )}

                    {searchQuery && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-100 text-amber-900 text-[11px] font-sans font-semibold shadow-3xs animate-fade-in">
                        <span>Search: "{searchQuery}"</span>
                        <button 
                          onClick={() => setSearchQuery("")}
                          className="hover:text-amber-950 font-bold text-xs leading-none cursor-pointer"
                        >
                          ×
                        </button>
                      </span>
                    )}

                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setSearchParams({ g: "All Genres" });
                        setSortBy("default");
                        setSelectedAuthor("All Authors");
                        setActiveTab("all");
                        setSelectedSeries("All Series");
                      }}
                      className="text-[10px] font-mono font-black uppercase tracking-wider text-stone-500 hover:text-orange-600 transition-colors ml-1 cursor-pointer underline underline-offset-2"
                    >
                      Clear All
                    </button>
                  </div>
                )}
              </div>

              {/* Filters & Sorting Action Modal Trigger Button */}
              <div className="flex flex-col items-start md:items-end gap-2 shrink-0 pt-2 md:pt-0">
                <button
                  id="books-filter-sort-btn"
                  onClick={() => setIsFilterModalOpen(true)}
                  className="px-5 py-2.5 border border-stone-200 hover:border-stone-900 bg-white hover:bg-stone-50 text-stone-850 hover:text-stone-950 font-sans font-extrabold text-xs rounded-full cursor-pointer transition-all flex items-center justify-center gap-2.5 select-none h-11 shadow-3xs"
                >
                  <SlidersHorizontal className="w-4 h-4 text-orange-500 shrink-0" />
                  <span>Filters & Sort</span>
                  <span className="bg-stone-100 text-stone-650 text-[10px] px-2.5 py-1 rounded-full font-sans font-bold uppercase tracking-wider border border-stone-200">
                    {getFilterAndSortLabel()}
                  </span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Featured Section component - takes 100% of w-full (max-w-[1920px])! */}
        {activeGenre === "All Genres" && !searchQuery && selectedAuthor === "All Authors" && selectedSeries === "All Series" && activeTab === "all" && ((topPicks && topPicks.length > 0) || (discoveryBooks && discoveryBooks.length > 0) || (bottomShelf && bottomShelf.length > 0)) && (
          <div className="w-full max-w-[1920px] mb-12">
            <FeaturedCarousel 
              topPicks={topPicks} 
              discoveryBooks={discoveryBooks} 
              bottomShelf={bottomShelf} 
            />
          </div>
        )}

        {/* Results Container Grid Area - constrained to max-w-6xl */}
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-8 flex flex-col items-center">
          
          {/* Main Results Content Column */}
          <div className="w-full space-y-8 flex flex-col items-center">
            
            {/* Search and Filters are placed in the Header section for a cleaner and more professional layout */}
            


            {/* Results Grid / Loading / Empty States */}
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div 
                  key="loading-state"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="py-32 flex flex-col items-center justify-center space-y-6 w-full max-w-md mx-auto"
                >
                  <div className="relative flex items-center justify-center w-16 h-16">
                    <div className="absolute inset-0 bg-orange-500/10 rounded-full blur-xl animate-pulse" />
                    <div className="absolute w-14 h-14 border-2 border-dashed border-orange-500/40 rounded-full animate-spin [animation-duration:8s]" />
                    <div className="absolute w-10 h-10 border-t-2 border-r-2 border-orange-500 rounded-full animate-spin" />
                    <div className="w-3.5 h-3.5 bg-orange-500 rounded-full" />
                  </div>
                  
                  <div className="space-y-1.5 text-center">
                    <span className="block text-[11px] font-mono tracking-widest uppercase font-black text-orange-600 animate-pulse font-bold">
                      Consulting Archives
                    </span>
                    <span className="block text-xs font-serif text-stone-500 italic">
                      Retrieving manuscript details from the great shelves...
                    </span>
                  </div>
                </motion.div>
              ) : sortedAndFilteredBooks.length > 0 ? (
                activeGenre === "All Genres" && !searchQuery && selectedAuthor === "All Authors" && selectedSeries === "All Series" && activeTab === "all" ? (
                  /* Goodreads style category rows */
                  <motion.div 
                    key="categories-mode"
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="w-full text-left space-y-16 animate-fade-in"
                  >

                    {(() => {
                      // Add author-based categories if they are linked in notable works
                      const authorCats = (authors || [])
                        .filter(auth => auth.notable_works && auth.notable_works.length > 0)
                        .map(auth => {
                          const authBooks = (books || []).filter(b => b.author.toLowerCase().includes(auth.name.toLowerCase()));
                          const notableWorksResolved = auth.notable_works.map((work: any, index: number) => {
                            if (work && typeof work === "object") {
                              return {
                                id: work.id || `notable-ref-${index}`,
                                title: work.title || "Untitled",
                                author: work.author || auth.name,
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
                              };
                            }
                            const matchedBook = (books || []).find(
                              (b) => b.title.toLowerCase().includes(String(work).toLowerCase()) || String(work).toLowerCase().includes(b.title.toLowerCase())
                            );
                            if (matchedBook) return matchedBook;
                            const colors = ["burgundy", "emerald", "navy", "saffron", "obsidian", "russet"];
                            const styles = ["classic", "vintage", "minimalist", "ornate"];
                            return {
                              id: `fallback-${auth.id}-${index}`,
                              title: String(work),
                              author: auth.name,
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
                            };
                          });

                          const combinedBooks = [...authBooks];
                          notableWorksResolved.forEach(b => {
                            if (!combinedBooks.some(cb => cb.title.toLowerCase() === b.title.toLowerCase())) {
                              combinedBooks.push(b);
                            }
                          });

                          return {
                            id: `author-${auth.id}`,
                            title: `Books by ${auth.name}`,
                            books: combinedBooks
                          };
                        })
                        .filter(cat => cat.books.length > 0);

                      // Sort other Contentful CMS categories alphabetically
                      const sortedOtherCategories = [...categories, ...authorCats].sort((a, b) => 
                        (a.title || "").localeCompare(b.title || "")
                      );
                      const customCats = [
                        ...(topPicks && topPicks.length > 0 ? [{ id: "top-picks", title: "Top Picks", books: topPicks }] : []),
                        ...(discoveryBooks && discoveryBooks.length > 0 ? [{ id: "discovery", title: "Discovery", books: discoveryBooks }] : []),
                        ...(bottomShelf && bottomShelf.length > 0 ? [{ id: "bottom-shelf", title: "Bottom Shelf", books: bottomShelf }] : []),
                      ];
                      const allCategories = [...customCats, ...sortedOtherCategories];
                      const validCategories = allCategories.filter(cat => cat.books && cat.books.length > 0);
                      const totalCategoryPages = Math.ceil(validCategories.length / categoriesPerPage);
                      const paginatedCategories = validCategories.slice(
                        (currentCategoryPage - 1) * categoriesPerPage,
                        currentCategoryPage * categoriesPerPage
                      );

                      return (
                        <>
                          {paginatedCategories.map((cat) => {
                            const normalizedCat = cat.title.toLowerCase();
                            const description = genreDescriptions[normalizedCat] || `Explore our handpicked selection of literary works categorized under ${cat.title}.`;
                            const hasMoreThan4 = cat.books.length > 4;
                            const displayBooks = hasMoreThan4 ? cat.books.slice(0, 4) : cat.books;
                            const isCollapsed = !!collapsedCategories[cat.id];

                            return (
                              <div key={cat.id} className="space-y-6 pb-8 border-b border-stone-200 last:border-0 text-left w-full">
                                <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                                  <h2 className="font-serif text-2xl sm:text-3xl font-black text-stone-900 tracking-tight uppercase">
                                    {cat.title}
                                  </h2>
                                  <button
                                    onClick={() => setCollapsedCategories(prev => ({ ...prev, [cat.id]: !prev[cat.id] }))}
                                    className="w-8 h-8 rounded-full border border-stone-300 hover:border-stone-900 hover:bg-stone-50 text-stone-700 hover:text-stone-900 transition-all duration-200 cursor-pointer flex items-center justify-center shadow-sm active:scale-95"
                                    title={isCollapsed ? "Expand" : "Collapse"}
                                  >
                                    {isCollapsed ? <Plus className="w-4 h-4 text-stone-600" /> : <Minus className="w-4 h-4 text-stone-600" />}
                                  </button>
                                </div>

                                {!isCollapsed && (
                                  <motion.div 
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="space-y-6"
                                  >
                                    <div className="space-y-2">
                                      <p className="text-xs sm:text-sm font-sans text-stone-600 leading-relaxed max-w-4xl">
                                        {description}
                                      </p>
                                    </div>

                                    <div className="flex gap-8 sm:gap-10 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-stone-300 w-full snap-x">
                                      {displayBooks.map((book) => (
                                        <div key={book.id} className="snap-start shrink-0">
                                          <BookCard review={book} viewMode="grid" />
                                        </div>
                                      ))}
                                      {/* Empty book card with a + to view more books */}
                                      {hasMoreThan4 && (
                                        <Link 
                                          to={`/category/${cat.id}`}
                                          className="snap-start shrink-0 w-[100px] h-[150px] sm:w-[130px] sm:h-[195px] flex flex-col items-center justify-center border-2 border-dashed border-stone-300 hover:border-orange-500 bg-stone-50 hover:bg-orange-50/20 text-stone-500 hover:text-orange-600 rounded-none transition-all duration-300 group cursor-pointer shadow-3xs"
                                        >
                                          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white group-hover:bg-orange-100 flex items-center justify-center border border-stone-200 group-hover:border-orange-300 shadow-3xs transition-all duration-300 mb-1">
                                            <Plus className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:rotate-90 text-stone-600" />
                                          </div>
                                          <span className="font-mono text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-center px-1">View More</span>
                                          <span className="text-[8px] sm:text-[9px] text-stone-400 mt-0.5 font-sans text-center">
                                            +{cat.books.length - 4} books
                                          </span>
                                        </Link>
                                      )}
                                    </div>
                                  </motion.div>
                                )}
                              </div>
                            );
                          })}

                          {/* Premium Categories Pagination Controls */}
                          {totalCategoryPages > 1 && (
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-12 pt-6 border-t border-stone-200 font-sans w-full">
                              <div className="text-xs text-stone-500 font-mono">
                                Showing <span className="font-bold text-stone-900">{Math.min(validCategories.length, (currentCategoryPage - 1) * categoriesPerPage + 1)}</span>–
                                <span className="font-bold text-stone-900">{Math.min(validCategories.length, currentCategoryPage * categoriesPerPage)}</span> of <span className="font-bold text-stone-900">{validCategories.length}</span> categories
                              </div>
                              
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  disabled={currentCategoryPage === 1}
                                  onClick={() => {
                                    setCurrentCategoryPage(p => Math.max(1, p - 1));
                                    window.scrollTo({ top: 0, behavior: "smooth" });
                                  }}
                                  className={`p-2.5 rounded-full border transition-all text-stone-600 hover:text-stone-950 disabled:opacity-30 disabled:pointer-events-none cursor-pointer ${
                                    currentCategoryPage === 1 ? "bg-stone-50 border-stone-100" : "bg-white hover:bg-stone-50 border-stone-200 hover:border-stone-300"
                                  }`}
                                  aria-label="Previous Page"
                                >
                                  <ChevronLeft className="w-4 h-4" />
                                </button>
                                
                                {Array.from({ length: totalCategoryPages }, (_, i) => i + 1).map(pageNum => {
                                  const isPageActive = currentCategoryPage === pageNum;
                                  return (
                                     <button
                                       key={pageNum}
                                       type="button"
                                       onClick={() => {
                                         setCurrentCategoryPage(pageNum);
                                         window.scrollTo({ top: 0, behavior: "smooth" });
                                       }}
                                       className={`w-9 h-9 rounded-full font-mono text-xs font-bold transition-all border shrink-0 cursor-pointer ${
                                         isPageActive
                                           ? "bg-stone-900 border-stone-900 text-white shadow-3xs"
                                           : "bg-white hover:bg-stone-50 border-stone-200 text-stone-600 hover:text-stone-950 hover:border-stone-300"
                                       }`}
                                     >
                                       {pageNum}
                                     </button>
                                  );
                                })}

                                <button
                                  type="button"
                                  disabled={currentCategoryPage === totalCategoryPages}
                                  onClick={() => {
                                    setCurrentCategoryPage(p => Math.min(totalCategoryPages, p + 1));
                                    window.scrollTo({ top: 0, behavior: "smooth" });
                                  }}
                                  className={`p-2.5 rounded-full border transition-all text-stone-600 hover:text-stone-950 disabled:opacity-30 disabled:pointer-events-none cursor-pointer ${
                                    currentCategoryPage === totalCategoryPages ? "bg-stone-50 border-stone-100" : "bg-white hover:bg-stone-100 border-stone-200 hover:border-stone-300"
                                  }`}
                                  aria-label="Next Page"
                                >
                                  <ChevronRight className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </motion.div>
                ) : (
                  <motion.div 
                    key="results-grid"
                    variants={itemVariants}
                    className="animate-fade-in w-full text-left flex flex-col items-center"
                  >
                    {/* Goodreads single category heading description if filtered by genre */}
                    {activeGenre !== "All Genres" && !searchQuery && (
                      <div className="w-full space-y-3 mb-8 pb-6 border-b border-stone-200">
                        <h2 className="font-serif text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
                          {activeGenre}
                        </h2>
                        <p className="text-xs sm:text-sm font-sans text-stone-600 leading-relaxed max-w-4xl">
                          {genreDescriptions[activeGenre.toLowerCase()] || `A handpicked collection of works under the ${activeGenre} category.`}
                        </p>
                        <h3 className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-[#be8873] pt-2">
                          NEW RELEASES TAGGED "{activeGenre.toUpperCase()}"
                        </h3>
                      </div>
                    )}

                    <BookGrid books={paginatedBooks} />

                    {/* Premium Pagination Controls */}
                    {totalPages > 1 && (
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-12 pt-6 border-t border-stone-200 font-sans w-full max-w-5xl">
                        <div className="text-xs text-stone-505 text-stone-500 font-mono">
                          Showing <span className="font-bold text-stone-900">{Math.min(sortedAndFilteredBooks.length, (currentPage - 1) * itemsPerPage + 1)}</span>–
                          <span className="font-bold text-stone-900">{Math.min(sortedAndFilteredBooks.length, currentPage * itemsPerPage)}</span> of <span className="font-bold text-stone-900">{sortedAndFilteredBooks.length}</span> titles
                        </div>
                        
                        <div className="flex items-center gap-1.5 w-full justify-center sm:w-auto">
                          <button
                            type="button"
                            disabled={currentPage === 1}
                            onClick={() => {
                              setCurrentPage(p => Math.max(1, p - 1));
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                            className={`p-2 sm:p-2.5 rounded-full border transition-all text-stone-600 hover:text-stone-950 disabled:opacity-30 disabled:pointer-events-none cursor-pointer shrink-0 ${
                              currentPage === 1 ? "bg-stone-50 border-stone-100" : "bg-white hover:bg-stone-50 border-stone-200 hover:border-stone-300"
                            }`}
                            aria-label="Previous Page"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          
                          <div className="flex items-center gap-1 overflow-x-auto max-w-[140px] min-[360px]:max-w-[170px] min-[400px]:max-w-[210px] sm:max-w-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden py-1 px-0.5 scroll-smooth">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => {
                              const isPageActive = currentPage === pageNum;
                              return (
                                 <button
                                   key={pageNum}
                                   type="button"
                                   onClick={() => {
                                     setCurrentPage(pageNum);
                                     window.scrollTo({ top: 0, behavior: "smooth" });
                                   }}
                                   className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full font-mono text-xs font-bold transition-all border shrink-0 cursor-pointer ${
                                     isPageActive
                                       ? "bg-stone-900 border-stone-900 text-white shadow-3xs"
                                       : "bg-white hover:bg-stone-50 border-stone-200 text-stone-600 hover:text-stone-950 hover:border-stone-300"
                                   }`}
                                 >
                                   {pageNum}
                                 </button>
                              );
                            })}
                          </div>

                          <button
                            type="button"
                            disabled={currentPage === totalPages}
                            onClick={() => {
                              setCurrentPage(p => Math.min(totalPages, p + 1));
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                            className={`p-2 sm:p-2.5 rounded-full border transition-all text-stone-600 hover:text-stone-950 disabled:opacity-30 disabled:pointer-events-none cursor-pointer shrink-0 ${
                              currentPage === totalPages ? "bg-stone-50 border-stone-100" : "bg-white hover:bg-stone-100 border-stone-200 hover:border-stone-300"
                            }`}
                            aria-label="Next Page"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Items per page selector */}
                        <div className="flex items-center gap-1.5 text-xs text-stone-500 font-sans">
                          <span>Per page:</span>
                          {[5, 10, 15, 25].map((size) => (
                            <button
                              key={size}
                              type="button"
                              onClick={() => {
                                setItemsPerPage(size);
                                setCurrentPage(1);
                              }}
                              className={`px-2 py-1 font-mono hover:text-stone-950 cursor-pointer rounded-sm ${
                                itemsPerPage === size 
                                  ? "text-orange-600 font-extrabold underline decoration-2 decoration-orange-500/50 underline-offset-4" 
                                  : "text-stone-400"
                              }`}
                            >
                              {size}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )
              ) : (
                <motion.div 
                  key="empty-state"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="py-20 border border-dashed border-stone-300 bg-stone-50/50 text-center space-y-4 rounded-2xl w-full"
                >
                  <div className="text-orange-500/60 text-3xl">🕭</div>
                  <div className="space-y-1">
                    <h4 className="font-serif text-lg font-bold text-stone-800">No Books Match Criteria</h4>
                    <p className="text-xs text-stone-500 font-sans">Try editing your keywords, side tabs or selected cycle filters.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setSearchParams({ g: "All Genres" });
                      setSortBy("default");
                      setActiveTab("all");
                      setSelectedSeries("All Series");
                      setSelectedAuthor("All Authors");
                    }}
                    className="bg-stone-900 hover:bg-orange-500 text-orange-400 hover:text-stone-950 transition-colors py-2.5 px-6 font-sans font-bold text-xs rounded-full cursor-pointer"
                  >
                    Reset Shelf Filters
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Sidebar / Side Tabs (Next to Books Catalogue) */}
          <div className="hidden">
            
            {/* Section 0: Quick Collapse Button for Desktop */}
            <div className="hidden lg:flex items-center justify-between pb-2 border-b border-stone-200 select-none">
              <span className="text-[10px] font-mono font-black uppercase tracking-widest text-[#be8873]">
                Filters & Sagas
              </span>
              <button
                type="button"
                onClick={() => setIsSidebarOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-900 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
                title="Hide Sidebar"
              >
                <ChevronRight className="w-4 h-4 text-orange-500" />
              </button>
            </div>

            {/* Section 1: Work Scope Type Navigation (Collapsible) */}
            <div className="space-y-2 text-left">
              <button
                type="button"
                onClick={() => setIsScopeCollapsed(!isScopeCollapsed)}
                className="w-full text-left flex items-center justify-between pb-1.5 border-b border-stone-200 select-none group cursor-pointer"
              >
                <span className="text-[10px] font-mono font-black uppercase tracking-widest text-[#be8873] flex items-center gap-1.5 font-sans font-extrabold group-hover:text-stone-950 transition-colors">
                  <BookOpen className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                  Scope of Inquiry
                </span>
                {isScopeCollapsed ? (
                  <ChevronDown className="w-3.5 h-3.5 text-stone-400 group-hover:text-stone-800 transition-colors" />
                ) : (
                  <ChevronUp className="w-3.5 h-3.5 text-stone-405 group-hover:text-stone-800 transition-colors" />
                )}
              </button>
              
              {!isScopeCollapsed && (
                <div className="flex flex-row lg:flex-col gap-1.5 overflow-x-auto lg:overflow-visible pb-1 lg:pb-0 scrollbar-none shrink-0 w-full animate-fade-in">
                  <button
                    type="button"
                    onClick={() => setActiveTab("all")}
                    className={`flex items-center justify-between gap-3 px-3.5 py-2.5 text-xs font-sans font-bold border transition-all cursor-pointer select-none rounded-xl shrink-0 ${
                      activeTab === "all"
                        ? "bg-stone-900 border-stone-900 text-white shadow-xs"
                        : "bg-white hover:bg-stone-100 border-stone-200 text-stone-700"
                    }`}
                  >
                    <span>All Publications</span>
                    <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full ${activeTab === 'all' ? 'bg-orange-600 text-white' : 'bg-stone-200 text-stone-600'}`}>
                      {books.filter(b => activeSegment === "reviews" ? bookHasReview(b) : !bookHasReview(b)).length}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("individual")}
                    className={`flex items-center justify-between gap-3 px-3.5 py-2.5 text-xs font-sans font-bold border transition-all cursor-pointer select-none rounded-xl shrink-0 ${
                      activeTab === "individual"
                        ? "bg-stone-900 border-stone-900 text-white shadow-xs"
                        : "bg-white hover:bg-stone-100 border-stone-200 text-stone-700"
                    }`}
                  >
                    <span>Standalone Books</span>
                    <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full ${activeTab === 'individual' ? 'bg-orange-600 text-white' : 'bg-stone-200 text-stone-600'}`}>
                      {books.filter(b => !b.is_series_review && (activeSegment === "reviews" ? bookHasReview(b) : !bookHasReview(b))).length}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("series")}
                    className={`flex items-center justify-between gap-3 px-3.5 py-2.5 text-xs font-sans font-bold border transition-all cursor-pointer select-none rounded-xl shrink-0 ${
                      activeTab === "series"
                        ? "bg-stone-900 border-stone-900 text-white shadow-xs"
                        : "bg-white hover:bg-stone-100 border-stone-200 text-stone-700"
                    }`}
                  >
                    <span>Series Reviews</span>
                    <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full ${activeTab === 'series' ? 'bg-orange-600 text-white' : 'bg-stone-200 text-stone-600'}`}>
                      {books.filter(b => !!b.is_series_review && (activeSegment === "reviews" ? bookHasReview(b) : !bookHasReview(b))).length}
                    </span>
                  </button>
                </div>
              )}
            </div>

            {/* Section 2: Book Series Cycles Filter (Collapsible) */}
            <div className="space-y-2 text-left">
              <button
                type="button"
                onClick={() => setIsSeriesCollapsed(!isSeriesCollapsed)}
                className="w-full text-left flex items-center justify-between pb-1.5 border-b border-stone-200 select-none group cursor-pointer"
              >
                <span className="text-[10px] font-mono font-black uppercase tracking-widest text-[#be8873] flex items-center gap-1.5 font-sans font-extrabold group-hover:text-stone-950 transition-colors">
                  <Tag className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                  Book Series & Cycles
                </span>
                {isSeriesCollapsed ? (
                  <ChevronDown className="w-3.5 h-3.5 text-stone-404 group-hover:text-stone-800 transition-colors" />
                ) : (
                  <ChevronUp className="w-3.5 h-3.5 text-stone-400 group-hover:text-stone-800 transition-colors" />
                )}
              </button>
              
              {!isSeriesCollapsed && (
                <div className="flex flex-row lg:flex-col gap-1.5 overflow-x-auto lg:overflow-visible pb-1 lg:pb-0 scrollbar-none shrink-0 w-full animate-fade-in max-h-[220px] lg:max-h-none overflow-y-auto pr-1">
                  <button
                    type="button"
                    onClick={() => setSelectedSeries("All Series")}
                    className={`flex items-center justify-between px-3 py-2 text-[11px] font-sans font-semibold border transition-all cursor-pointer select-none rounded-xl shrink-0 ${
                      selectedSeries === "All Series"
                        ? "bg-orange-55 shadow-3xs border-orange-200 text-orange-950 font-bold"
                        : "bg-white hover:bg-stone-100 border-stone-200 text-stone-600"
                    }`}
                  >
                    <span>All Sagas</span>
                  </button>
                  {availableSeries.map(seriesTitle => {
                    const count = books.filter(b => b.series === seriesTitle && (activeSegment === "reviews" ? bookHasReview(b) : !bookHasReview(b))).length;
                    return (
                      <button
                        key={seriesTitle}
                        type="button"
                        onClick={() => setSelectedSeries(seriesTitle)}
                        className={`flex items-center justify-between px-3 py-2 text-[11px] font-sans font-semibold border transition-all cursor-pointer select-none rounded-xl shrink-0 ${
                          selectedSeries === seriesTitle
                            ? "bg-orange-55 shadow-3xs border-orange-200 text-orange-950 font-bold"
                            : "bg-white hover:bg-stone-100 border-stone-200 text-stone-600"
                        }`}
                      >
                        <span className="truncate max-w-[150px] lg:max-w-none">{seriesTitle}</span>
                        <span className="text-[9px] font-mono bg-stone-200 text-stone-600 px-1.5 py-0.2 ml-1.5 rounded">
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Section 2.5: Filter by Author (Collapsible) */}
            <div className="space-y-2 text-left animate-fade-in">
              <button
                type="button"
                onClick={() => setIsAuthorCollapsed(!isAuthorCollapsed)}
                className="w-full text-left flex items-center justify-between pb-1.5 border-b border-stone-200 select-none group cursor-pointer"
              >
                <span className="text-[10px] font-mono font-black uppercase tracking-widest text-[#be8873] flex items-center gap-1.5 font-sans font-extrabold group-hover:text-stone-950 transition-colors">
                  <User className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                  Filter by Author
                </span>
                {isAuthorCollapsed ? (
                  <ChevronDown className="w-3.5 h-3.5 text-stone-400 group-hover:text-stone-800 transition-colors" />
                ) : (
                  <ChevronUp className="w-3.5 h-3.5 text-stone-400 group-hover:text-stone-800 transition-colors" />
                )}
              </button>
              
              {!isAuthorCollapsed && (
                <div className="flex flex-row lg:flex-col gap-1.5 overflow-x-auto lg:overflow-visible pb-1 lg:pb-0 scrollbar-none shrink-0 w-full animate-fade-in max-h-[220px] lg:max-h-none overflow-y-auto pr-1">
                  <button
                    type="button"
                    onClick={() => setSelectedAuthor("All Authors")}
                    className={`flex items-center justify-between px-3 py-2 text-[11px] font-sans font-semibold border transition-all cursor-pointer select-none rounded-xl shrink-0 ${
                      selectedAuthor === "All Authors"
                        ? "bg-orange-50/70 shadow-3xs border-orange-200 text-orange-950 font-bold"
                        : "bg-white hover:bg-stone-100 border-stone-200 text-stone-600"
                    }`}
                  >
                    <span>All Authors</span>
                  </button>
                  {availableAuthors.map(authorName => {
                    const count = books.filter(b => b.author === authorName && (activeSegment === "reviews" ? bookHasReview(b) : !bookHasReview(b))).length;
                    return (
                      <button
                        key={authorName}
                        type="button"
                        onClick={() => setSelectedAuthor(authorName)}
                        className={`flex items-center justify-between px-3 py-2 text-[11px] font-sans font-semibold border transition-all cursor-pointer select-none rounded-xl shrink-0 ${
                          selectedAuthor === authorName
                            ? "bg-orange-50/70 shadow-3xs border-orange-200 text-orange-950 font-bold"
                            : "bg-white hover:bg-stone-100 border-stone-200 text-stone-600"
                        }`}
                      >
                        <span className="truncate max-w-[150px] lg:max-w-none">{authorName}</span>
                        <span className="text-[9px] font-mono bg-stone-200 text-stone-650 px-1.5 py-0.2 ml-1.5 rounded">
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Section 3: Genre Categorization List on Desktop (Collapsible) */}
            <div className="space-y-2 text-left hidden lg:block">
              <button
                type="button"
                onClick={() => setIsGenreCollapsed(!isGenreCollapsed)}
                className="w-full text-left flex items-center justify-between pb-1.5 border-b border-stone-200 select-none group cursor-pointer"
              >
                <span className="text-[10px] font-mono font-black uppercase tracking-widest text-[#be8873] flex items-center gap-1.5 font-sans font-extrabold group-hover:text-stone-950 transition-colors">
                  <Sparkles className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                  Original Genres
                </span>
                {isGenreCollapsed ? (
                  <ChevronDown className="w-3.5 h-3.5 text-stone-400 group-hover:text-stone-800 transition-colors" />
                ) : (
                  <ChevronUp className="w-3.5 h-3.5 text-stone-400 group-hover:text-stone-800 transition-colors" />
                )}
              </button>
              
              {!isGenreCollapsed && (
                <div className="flex flex-wrap gap-1.5 max-h-[220px] overflow-y-auto pr-1 pt-1 animate-fade-in">
                  {genres.map((g) => {
                    const isActive = activeGenre === g;
                    return (
                      <button
                        key={g}
                        type="button"
                        onClick={() => handleGenreClick(g)}
                        className={`text-[11px] font-sans px-3 py-1.5 transition-all outline-none border cursor-pointer select-none rounded-full ${
                          isActive
                            ? "bg-stone-900 border-stone-900 text-white font-bold"
                            : "bg-white hover:bg-stone-100 border-stone-200 text-stone-600"
                        }`}
                      >
                        {g}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Modern Filter-&-Sort Backdrop-Blurred Modal Popup */}
      <AnimatePresence>
        {isFilterModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-md select-none">
            {/* Modal Container */}
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-stone-200 shadow-2xl max-w-xl w-full relative overflow-hidden rounded-2xl p-6 sm:p-8 text-stone-900"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-400 via-orange-600 to-yellow-600" />
              
              {/* Close button */}
              <button
                type="button"
                onClick={() => setIsFilterModalOpen(false)}
                className="absolute top-4 right-4 text-stone-400 hover:text-stone-900 transition-colors font-sans font-black text-sm p-1 cursor-pointer"
                aria-label="Close filters"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-6 text-left border-none">
                <div>
                  <h3 className="font-serif text-xl font-black text-stone-900 uppercase tracking-tight font-extrabold">
                    Filters & Sorting Options
                  </h3>
                  <p className="text-xs font-sans text-stone-400 uppercase tracking-widest mt-0.5">
                    Customize your catalog view preference below
                  </p>
                </div>

                {/* Sort Option Block */}
                <div className="space-y-2">
                  <label htmlFor="modal-reviews-sort" className="text-xs font-sans uppercase tracking-widest font-black text-stone-700 flex items-center gap-1.5 font-bold">
                    <ArrowUpDown className="w-3.5 h-3.5 text-orange-500 shrink-0" /> Sort Order
                  </label>
                  <select
                    id="modal-reviews-sort"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 focus:border-stone-900 focus:bg-white text-sm font-sans focus:outline-none transition-all cursor-pointer rounded-xl text-stone-800"
                  >
                    <option value="default">Default Catalog Order</option>
                    <option value="alphabet">🔤 Alphabetical (A-Z Title)</option>
                    <option value="author">✍ Sort by Author (A-Z)</option>
                    <option value="rating">★ Highest Book Rating</option>
                    <option value="series">🗂 Group Alphabetically by Series</option>
                    <option value="reactions">♥ Most Liked (Reactions)</option>
                    <option value="comments">💬 Most Discussed (Comments)</option>
                  </select>
                </div>

                {/* Author Select Block */}
                <div className="space-y-2 pt-1">
                  <label htmlFor="modal-reviews-author-filter" className="text-xs font-sans uppercase tracking-widest font-black text-stone-700 flex items-center gap-1.5 font-bold">
                    <User className="w-3.5 h-3.5 text-orange-500 shrink-0" /> Filter by Author
                  </label>
                  <select
                    id="modal-reviews-author-filter"
                    value={selectedAuthor}
                    onChange={(e) => setSelectedAuthor(e.target.value)}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 focus:border-stone-900 focus:bg-white text-sm font-sans focus:outline-none transition-all cursor-pointer rounded-xl text-stone-800"
                  >
                    <option value="All Authors">All Authors</option>
                    {availableAuthors.map((authorName) => (
                      <option key={authorName} value={authorName}>{authorName}</option>
                    ))}
                  </select>
                </div>

                {/* Scope of Publication (Modal Copy) */}
                <div className="space-y-2 pt-1">
                  <span className="text-xs font-sans uppercase tracking-widest font-black text-stone-700 block font-bold">
                    Scope Type
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {(["all", "individual", "series"] as const).map((tab) => (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => setActiveTab(tab)}
                        className={`py-2 px-3 text-xs font-sans rounded-xl border font-bold transition-all text-center uppercase cursor-pointer ${
                          activeTab === tab
                            ? "bg-stone-900 border-stone-900 text-white"
                            : "bg-stone-50 hover:bg-stone-100 text-stone-600 border-stone-200"
                        }`}
                      >
                        {tab === "all" ? "All" : tab === "individual" ? "Standalone" : "Series"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category Option Block */}
                <div className="space-y-3 pt-1">
                  <label className="text-xs font-sans uppercase tracking-widest font-black text-stone-700 flex items-center gap-1.5 font-bold">
                    <Tag className="w-3.5 h-3.5 text-orange-500 shrink-0" /> Genre Bookshelf
                  </label>
                  
                  <div className="flex flex-wrap gap-2 max-h-[120px] overflow-y-auto pr-1">
                    {genres.map((g) => {
                      const isActive = activeGenre === g;
                      return (
                        <button
                          key={g}
                          type="button"
                          onClick={() => handleGenreClick(g)}
                          className={`text-xs font-sans px-3.5 py-1.5 transition-all duration-150 text-left border cursor-pointer select-none flex items-center gap-2 rounded-full ${
                             isActive
                               ? "bg-stone-900 text-white border-stone-900 font-extrabold shadow-sm"
                               : "bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200 font-medium"
                          }`}
                        >
                          {g}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Confirm Settings Button */}
                <div className="flex justify-between items-center pt-4 border-t border-stone-150 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setSearchParams({ g: "All Genres" });
                      setSortBy("default");
                      setSelectedAuthor("All Authors");
                      setActiveTab("all");
                      setSelectedSeries("All Series");
                      setIsFilterModalOpen(false);
                    }}
                    className="text-stone-500 hover:text-stone-900 text-xs font-semibold uppercase tracking-wider cursor-pointer font-bold"
                  >
                    Clear All
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsFilterModalOpen(false)}
                    className="px-6 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-sans font-bold text-xs rounded-full cursor-pointer uppercase transition-all duration-100 shadow-xs"
                  >
                    Show Books ({sortedAndFilteredBooks.length})
                  </button>
                </div>

              </div>
            </motion.div>

            {/* Backdrop overlay listener to close */}
            <div className="absolute inset-0 -z-10 bg-transparent cursor-pointer" onClick={() => setIsFilterModalOpen(false)} />
          </div>
        )}
      </AnimatePresence>
    </Layout>
  );
}

export default Genre;
