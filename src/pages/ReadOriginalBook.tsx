import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { 
  ChevronLeft, BookOpen, Clock, Calendar, ArrowLeft, ArrowRight,
  Eye, EyeOff, MessageSquare, Menu, X, Check, Settings,
  ThumbsUp, Heart, Flame, Zap, Scale, Share2
} from "lucide-react";
import { motion } from "motion/react";
import Layout from "../components/layout/Layout";
import { useOriginalBooks } from "../hooks/useOriginalBooks";
import { useComments } from "../hooks/useComments";
import { useReactions } from "../hooks/useReactions";
import { ChapterSocialPreviewCard } from "../components/books/ChapterSocialPreviewCard";
import { OriginalBookSocialPreviewCard } from "../components/books/OriginalBookSocialPreviewCard";

export function ReadOriginalBook() {
  const { id } = useParams<{ id: string }>();
  const { books, loading } = useOriginalBooks();
  
  // Find the exact original book matching the parameter
  const book = books.find((b) => b.id === id || (b.slug && b.slug === id));

  // States for reading comfort
  const [activeChapterIndex, setActiveChapterIndex] = useState(-1);

  const { comments, addComment, errorMsg } = useComments(book && activeChapterIndex >= 0 ? `${book.id}_chapter_${activeChapterIndex}` : undefined);
  const { reactions, userReaction, react } = useReactions(book && activeChapterIndex >= 0 ? `${book.id}_chapter_${activeChapterIndex}` : undefined);
  const [fontSize, setFontSize] = useState<"base" | "lg" | "xl">("lg");
  const [isSerif, setIsSerif] = useState(true);
  const [isFinished, setIsFinished] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isDiscussionExpanded, setIsDiscussionExpanded] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isBookShareModalOpen, setIsBookShareModalOpen] = useState(false);
  const [isChapterRatingHovered, setIsChapterRatingHovered] = useState(false);
  const [hoveredChapterReaction, setHoveredChapterReaction] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Comment state
  const [authorName, setAuthorName] = useState("");
  const [newCommentText, setNewCommentText] = useState("");

  const handleAddCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || !book) return;

    try {
      await addComment(authorName.trim(), newCommentText.trim());
      setAuthorName("");
      setNewCommentText("");
    } catch (_) {
      // Handled globally
    }
  };

  // Load chapter from URL query params
  useEffect(() => {
    if (book) {
      const urlParams = new URLSearchParams(window.location.search);
      const chParam = urlParams.get("chapter");
      if (chParam) {
        const parsedCh = parseInt(chParam) - 1;
        if (parsedCh >= 0 && parsedCh < book.chapters.length) {
          setActiveChapterIndex(parsedCh);
          return;
        }
      }
      setActiveChapterIndex(-1); // Default to Table of Contents list!
      setCurrentPage(1);
    }
  }, [book]);

  // Keep the browser query param updated when changing chapters
  useEffect(() => {
    if (book) {
      const url = new URL(window.location.href);
      if (activeChapterIndex >= 0) {
        url.searchParams.set("chapter", (activeChapterIndex + 1).toString());
      } else {
        url.searchParams.delete("chapter");
      }
      window.history.replaceState(null, "", url.toString());
    }
  }, [activeChapterIndex, book]);

  // Reading progress scroll tracker
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(progress);
      } else {
        setScrollProgress(0);
      }
    };

    window.addEventListener("scroll", handleScroll);
    // Initial call to set correctly on fresh mount
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [activeChapterIndex]);

  // Comprehensive anti-copying, anti-selection, anti-printing, and event-protection
  useEffect(() => {
    const preventAction = (e: Event) => {
      e.preventDefault();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent Ctrl+C / Cmd+C (Copy)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
        e.preventDefault();
      }
      // Prevent Ctrl+X / Cmd+X (Cut)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'x') {
        e.preventDefault();
      }
      // Prevent Ctrl+S / Cmd+S (Save page)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
      }
      // Prevent Ctrl+U / Cmd+U (View Source)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'u') {
        e.preventDefault();
      }
      // Prevent Ctrl+A / Cmd+A (Select All)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a') {
        e.preventDefault();
      }
      // Prevent F12 (DevTools)
      if (e.key === 'F12') {
        e.preventDefault();
      }
    };

    document.addEventListener("contextmenu", preventAction);
    document.addEventListener("copy", preventAction);
    document.addEventListener("cut", preventAction);
    document.addEventListener("selectstart", preventAction);
    document.addEventListener("keydown", handleKeyDown);

    // Inject styles targeting selection blockers and print blocking
    const styleElement = document.createElement("style");
    styleElement.id = "original-anti-copy-styles";
    styleElement.innerHTML = `
      @media print {
        body { display: none !important; }
      }
      * {
        -webkit-touch-callout: none !important;
        -webkit-user-select: none !important;
        -khtml-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        user-select: none !important;
      }
      ::selection {
        background: transparent !important;
        color: inherit !important;
      }
      ::-moz-selection {
        background: transparent !important;
        color: inherit !important;
      }
    `;
    document.head.appendChild(styleElement);

    return () => {
      document.removeEventListener("contextmenu", preventAction);
      document.removeEventListener("copy", preventAction);
      document.removeEventListener("cut", preventAction);
      document.removeEventListener("selectstart", preventAction);
      document.removeEventListener("keydown", handleKeyDown);
      const styleNode = document.getElementById("original-anti-copy-styles");
      if (styleNode) {
        styleNode.remove();
      }
    };
  }, []);

  const changeChapter = (index: number) => {
    if (book && index >= 0 && index < book.chapters.length) {
      setActiveChapterIndex(index);
      localStorage.setItem(`last_read_chapter_${book.id}`, index.toString());
      setIsFinished(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
      setIsSidebarOpen(false); // Close sidebar on selection
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="py-36 flex flex-col items-center justify-center space-y-6 w-full max-w-md mx-auto animate-fade-in text-center">
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
              Opening Manuscript
            </span>
            <span className="block text-xs font-serif text-stone-500 italic">
              Unrolling scriptorium scroll and loading pages...
            </span>
          </div>
        </div>
      </Layout>
    );
  }

  if (!book) {
    return (
      <Layout>
        <div className="max-w-xl mx-auto py-24 text-center space-y-6">
          <h2 className="font-serif text-3xl font-extrabold text-parchment-950">Manuscript Not Found</h2>
          <p className="text-sm font-mono text-parchment-500 uppercase">the scroll has turned to dust</p>
          <Link 
            to="/original-books" 
            className="inline-flex bg-orange-500 hover:bg-orange-600 text-black font-mono font-bold text-xs px-5 py-2.5 uppercase tracking-wide cursor-pointer"
          >
            Back to Original Books
          </Link>
        </div>
      </Layout>
    );
  }

  const activeChapter = book.chapters[activeChapterIndex];

  // Helper classes for sizing
  const getFontSizeClass = () => {
    switch (fontSize) {
      case "base": return "text-sm md:text-base leading-relaxed";
      case "lg": return "text-base md:text-lg lg:text-xl leading-loose";
      case "xl": return "text-lg md:text-xl lg:text-2xl leading-loose font-medium";
      default: return "text-base md:text-lg lg:text-xl leading-loose";
    }
  };

  return (
    <Layout>
      {/* Background with real texture aspect — warm ivory/cream book color */}
      <div className="bg-[#fbfcfa] min-h-screen pb-24 text-stone-900 border-t border-stone-200/40 relative">
        
        {/* UPPER STATUS BAR (FIXED NAV COMPANION WITH READING PROGRESS BAR) */}
        <div className="sticky top-0 z-40 bg-[#faf8f5]/95 backdrop-blur-md border-b border-stone-200/60 py-3.5 px-4 sm:px-6 lg:px-8 relative">
          
          {/* Scroll progress bar at the very top of reader companion */}
          <div className="absolute bottom-0 left-0 w-full h-[3px] bg-stone-100">
            <div 
              className="h-full bg-orange-500 transition-all duration-150 ease-out"
              style={{ width: `${scrollProgress}%` }}
            />
          </div>

          <div className="max-w-[1920px] mx-auto flex items-center justify-between w-full px-4 xl:px-0">
            {activeChapterIndex >= 0 ? (
              <button
                onClick={() => setActiveChapterIndex(-1)}
                className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-widest text-[#be8873] hover:text-[#0b0a0a] font-bold bg-transparent border-none cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" /> Table of Contents
              </button>
            ) : (
              <Link 
                to="/original-books" 
                className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-widest text-[#be8873] hover:text-[#0b0a0a] font-bold"
              >
                <ChevronLeft className="w-4 h-4" /> Exit Reader
              </Link>
            )}

            {/* Book directory toolbar */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsBookShareModalOpen(true)}
                className="p-2 text-[#be8873] hover:text-orange-600 hover:bg-stone-50 cursor-pointer rounded-none border border-stone-200 bg-white inline-flex items-center gap-1.5 px-3 text-[10px] uppercase font-mono font-black transition-all"
                title="Share Book"
              >
                <Share2 className="w-3.5 h-3.5 shrink-0" /> Share Book
              </button>
            </div>
          </div>
        </div>

        {/* BOOK READ VIEW CONTAINER */}
        <div className="max-w-[1920px] w-full mx-auto px-4 sm:px-6 xl:px-0 pt-6 sm:pt-12 space-y-12">
          {activeChapterIndex === -1 ? null : (
            /* INTRODUCTORY TITLE BOX FOR READ MODE */
            <header className="text-center space-y-4 border-b border-stone-200/60 pb-8 animate-fade-in">
              <div className="space-y-1.5">
                <p className="text-[10px] font-mono tracking-widest text-[#be8873] uppercase font-black">
                  {book.genre}
                </p>
                <h1 
                  className="font-serif text-[#1a1817] font-extrabold tracking-tight text-3xl sm:text-4xl md:text-5xl lg:text-5xl"
                >
                  {book.title}
                </h1>
              </div>
              
              <div className="flex flex-col items-center justify-center gap-3.5 text-stone-500 uppercase">
                <span style={{ fontSize: "16px", fontWeight: "bold", fontFamily: "Roboto, sans-serif" }}>By {book.author}</span>
              </div>
            </header>
          )}

          {/* MAIN PROSE MANUSCRIPT CORE */}
          <main className="bg-transparent border-none shadow-none px-6 py-10 sm:p-14 md:p-16 relative max-w-[1920px] w-full mx-auto">

            {activeChapterIndex >= 0 && activeChapter ? (
              <article className="space-y-10">
                {/* Chapter Title & Reading Info */}
                <div className="border-b border-stone-150 pb-5 space-y-2 text-center">
                  <h2 className="font-serif text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900 uppercase">
                    {activeChapter.title}
                  </h2>
                  <div className="flex flex-wrap items-center justify-center gap-3 text-[10px] font-mono uppercase text-stone-400">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {Math.max(1, Math.ceil((activeChapter.content || "").split(/\s+/).filter(Boolean).length / 200))} Min Read
                    </span>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {new Date(activeChapter.publishedAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Main Text columns - highly clean typeset styling */}
                <div 
                  className={`text-[#1c1a19] space-y-7 text-justify tracking-wide leading-relaxed selection:bg-orange-100 selection:text-orange-900 ${
                    isSerif ? "font-serif" : "font-sans"
                  } ${getFontSizeClass()}`}
                >
                  {/* Dropcap for premium literary aesthetic */}
                  <div className="prose-content whitespace-pre-line first-letter:text-6xl first-letter:font-serif first-letter:font-black first-letter:float-left first-letter:mr-2.5 first-letter:leading-none first-letter:text-stone-900 animate-fade-in">
                    {activeChapter.content.split("\n\n").map((para, idx) => (
                      <p key={idx} className="indent-0 sm:indent-8 first:indent-0 leading-relaxed text-justify mb-5">
                        {para}
                      </p>
                    ))}
                  </div>
                </div>

                {/* Interactive Feedback & Reactions for chapter */}
                <div className="pt-8 border-t border-stone-150 space-y-6 text-center select-none bg-stone-50/20 p-5 sm:p-6 md:p-8">
                  <div className="space-y-1.5 font-sans">
                    <span className="text-xs sm:text-sm uppercase tracking-widest text-[#be8873] font-bold block">
                      How do you rate this chapter?
                    </span>
                  </div>
                  
                  {/* Reaction Buttons - Interactive Pulling Stack */}
                  <div className="flex justify-center select-none pt-2 pb-4">
                    <div 
                      className="relative flex items-center justify-start h-16 transition-all duration-350 ease-out" 
                      style={{ 
                        width: isChapterRatingHovered 
                          ? "316px" 
                          : (userReaction !== null ? "48px" : "132px") 
                      }}
                      onMouseEnter={() => setIsChapterRatingHovered(true)}
                      onMouseLeave={() => {
                        setIsChapterRatingHovered(false);
                        setHoveredChapterReaction(null);
                      }}
                    >
                      {(["like", "love", "fire", "smash", "mid", "pass"] as const).map((type, index) => {
                        const isSelected = userReaction === type;
                        const count = (reactions && reactions[type]) || 0;
                        const emojiMap: Record<string, string> = {
                          like: "👍",
                          love: "❤️",
                          fire: "🔥",
                          smash: "⚡",
                          mid: "😐",
                          pass: "🥱"
                        };
                        const labelMap: Record<string, string> = {
                          like: "Like",
                          love: "Love",
                          fire: "Fire",
                          smash: "Smash",
                          mid: "Mid",
                          pass: "Pass"
                        };

                        // Framer Motion properties depending on hover or selection status
                        let animateX = 0;
                        let animateScale = 1;
                        let animateOpacity = 1;
                        let pointerEvents: "auto" | "none" = "auto";
                        
                        if (isChapterRatingHovered) {
                          animateX = index * 52;
                          animateScale = hoveredChapterReaction === type ? 1.35 : 1.0;
                          animateOpacity = 1;
                        } else {
                          if (userReaction === null) {
                            // Overlapping card stack representation
                            animateX = index * 16;
                            animateScale = 1.0;
                            // Staggered stacked opacity
                            animateOpacity = 0.5 + (index * 0.08);
                          } else {
                            // Rating is selected: collapsed state
                            if (isSelected) {
                              animateX = 0;
                              animateScale = 1.15;
                              animateOpacity = 1;
                            } else {
                              animateX = 0;
                              animateScale = 0.5;
                              animateOpacity = 0;
                              pointerEvents = "none";
                            }
                          }
                        }
                        
                        return (
                          <motion.button
                            key={type}
                            type="button"
                            style={{ pointerEvents }}
                            animate={{ x: animateX, scale: animateScale, opacity: animateOpacity }}
                            transition={{ type: "spring", stiffness: 320, damping: 24 }}
                            onClick={() => react(type)}
                            onMouseEnter={() => setHoveredChapterReaction(type)}
                            className={`absolute left-0 w-12 h-12 rounded-full flex items-center justify-center text-2xl cursor-pointer bg-white border shadow-sm transition-colors duration-150 select-none ${
                              isSelected 
                                ? "border-amber-500 bg-amber-50/50 shadow-md z-20" 
                                : "border-stone-200/90 hover:border-stone-400 z-10"
                            }`}
                            title={`${labelMap[type]} (${count})`}
                          >
                            <span className="relative">
                              {emojiMap[type]}
                              {count > 0 && (
                                <span className="absolute -bottom-2 -right-2 bg-[#be8873] text-white text-[9px] font-mono leading-none px-1 py-0.5 rounded-full font-black scale-90">
                                  {count}
                                </span>
                              )}
                            </span>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Share button underneath reactions */}
                  <div className="pt-2 flex flex-col items-center gap-2">
                    {userReaction !== null && (
                      <span className="text-[11px] font-mono text-emerald-850 bg-emerald-50/60 border border-emerald-100 px-3 py-1 uppercase tracking-wider font-extrabold flex items-center gap-1">
                        Active Rating: {userReaction.toUpperCase()}
                      </span>
                    )}
                    <button
                      onClick={() => setIsShareModalOpen(true)}
                      className="px-6 py-2.5 border border-[#be8873] bg-stone-900 hover:bg-white text-white hover:text-stone-900 cursor-pointer transition-all text-xs uppercase font-mono tracking-widest font-black inline-flex items-center gap-2 shadow-[0_2px_0_#be8873] active:translate-y-[1px] rounded-none"
                    >
                      <Share2 className="w-4 h-4 shrink-0" /> Share Chapter
                    </button>
                  </div>
                </div>

                {/* Footer simple pagination */}
                <div className="pt-6 border-t border-stone-150 flex items-center justify-between text-xs font-mono text-stone-500">
                  <button
                    disabled={activeChapterIndex === 0}
                    onClick={() => changeChapter(activeChapterIndex - 1)}
                    className="inline-flex items-center gap-2 bg-stone-900 border border-stone-900 text-white hover:bg-orange-500 hover:text-stone-950 disabled:bg-stone-50 disabled:text-stone-300 disabled:border-stone-100 transition-colors font-mono uppercase text-[11px] font-black px-5 py-2.5 tracking-wider cursor-pointer select-none rounded-none"
                  >
                    <ArrowLeft className="w-4 h-4" /> Previous
                  </button>

                  <span className="font-mono text-[11.5px] font-black text-[#be8873] uppercase tracking-widest py-2.5 px-6 select-none">
                    Chapter {activeChapterIndex + 1} of {book.chapters.length}
                  </span>

                  <button
                    disabled={activeChapterIndex === book.chapters.length - 1}
                    onClick={() => changeChapter(activeChapterIndex + 1)}
                    className="inline-flex items-center gap-2 bg-stone-900 border border-stone-900 text-white hover:bg-orange-500 hover:text-stone-950 disabled:bg-stone-50 disabled:text-stone-300 disabled:border-stone-100 transition-colors font-mono uppercase text-[11px] font-black px-5 py-2.5 tracking-wider cursor-pointer select-none rounded-none"
                  >
                    Next <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

              </article>
            ) : (
              <div className="space-y-8 animate-fade-in select-none">
                {book.chapters.length > 0 ? (
                  (() => {
                    const ITEMS_PER_PAGE = 8;
                    const totalPages = Math.ceil(book.chapters.length / ITEMS_PER_PAGE);
                    const displayedChapters = book.chapters.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
                    
                    return (
                      <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {displayedChapters.map((ch, relativeIdx) => {
                            const idx = (currentPage - 1) * ITEMS_PER_PAGE + relativeIdx;
                            const minRead = Math.max(1, Math.ceil((ch.content || "").split(/\s+/).filter(Boolean).length / 200));
                            const resolvedImgUrl = ch.image_url || book.cover_url || "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600";
                            const cleanTitle = ch.title.replace(/^chapter\s+\d+:\s*/i, "");

                            return (
                              <div 
                                key={ch.id} 
                                onClick={() => changeChapter(idx)}
                                className="group flex bg-[#faf8f5]/40 border border-stone-200 hover:border-[#be8873]/60 shadow-xs hover:shadow-md transition-all duration-300 relative overflow-hidden select-none text-left rounded-none cursor-pointer"
                              >
                                {/* Image container */}
                                <div className="w-24 sm:w-28 overflow-hidden bg-stone-100 border-r border-stone-200/50 shrink-0 relative">
                                  <img 
                                    src={resolvedImgUrl} 
                                    alt={ch.title} 
                                    className="w-full h-full object-cover grayscale-35 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500 aspect-[3/4]"
                                    referrerPolicy="no-referrer"
                                  />
                                  <div className="absolute inset-x-0 bottom-0 bg-black/60 p-1">
                                    <span className="block text-[9px] font-mono font-bold text-white uppercase text-center tracking-wider">
                                      Chapter {idx + 1}
                                    </span>
                                  </div>
                                </div>

                                {/* Info padding */}
                                <div className="p-3 sm:p-4 flex flex-col justify-between flex-1 min-w-0">
                                  <div className="space-y-1">
                                    <div className="flex flex-wrap items-center gap-2 text-[9px] font-mono uppercase text-[#be8873] font-bold">
                                      <span>{minRead} min read</span>
                                      <span>•</span>
                                      <span>{new Date(ch.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                                    </div>
                                    <h3 className="font-serif font-black text-xs sm:text-sm text-stone-900 group-hover:text-[#e07540] transition-colors uppercase tracking-tight line-clamp-2">
                                      {cleanTitle}
                                    </h3>
                                    <p className="text-[11px] text-stone-500 line-clamp-3 font-sans leading-relaxed">
                                      "{ch.content.replace(/\s+/g, " ").substring(0, 220).trim()}..."
                                    </p>
                                  </div>
                                  <div className="flex items-center justify-between text-[9px] font-mono text-stone-400 mt-2 border-t border-stone-100 pt-2">
                                    <span>{minRead} min read</span>
                                    <span className="text-[#be8873] group-hover:translate-x-0.5 transition-transform">Read &rarr;</span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Pagination controls */}
                        {totalPages > 1 && (
                          <div className="flex items-center justify-between pt-6 border-t border-stone-200 text-xs font-mono">
                            <button
                              disabled={currentPage === 1}
                              onClick={(e) => {
                                e.stopPropagation();
                                setCurrentPage(prev => Math.max(1, prev - 1));
                              }}
                              className="inline-flex items-center gap-2 bg-stone-900 border border-stone-900 text-white hover:bg-[#be8873] hover:text-stone-950 disabled:bg-stone-50 disabled:text-stone-300 disabled:border-stone-100 transition-colors font-mono uppercase text-[11px] font-black px-4 py-2 cursor-pointer select-none rounded-none"
                            >
                              <ArrowLeft className="w-3.5 h-3.5" /> Prev Page
                            </button>
                            <span className="font-mono text-stone-500">
                              Page {currentPage} of {totalPages}
                            </span>
                            <button
                              disabled={currentPage === totalPages}
                              onClick={(e) => {
                                e.stopPropagation();
                                setCurrentPage(prev => Math.min(totalPages, prev + 1));
                              }}
                              className="inline-flex items-center gap-2 bg-stone-900 border border-stone-900 text-white hover:bg-[#be8873] hover:text-stone-950 disabled:bg-stone-50 disabled:text-stone-300 disabled:border-stone-100 transition-colors font-mono uppercase text-[11px] font-black px-4 py-2 cursor-pointer select-none rounded-none"
                            >
                              Next Page <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })()
                ) : (
                  <div className="text-center py-20 space-y-4">
                    <BookOpen className="w-12 h-12 text-[#be8873]/30 mx-auto" strokeWidth={1} />
                    <p className="font-serif text-base italic text-stone-500">
                      This work is preparing for translation. Check back for fresh chapters shortly.
                    </p>
                  </div>
                )}
              </div>
            )}
          </main>

          {/* READER DIALOGUE & SCHOLAR NOTES PANEL (COMMENTS) */}
          {activeChapterIndex >= 0 && (
            <section id="scholastic-discussion-panel" className="bg-white border border-stone-200 p-6 sm:p-10 space-y-8 text-left shadow-xs">
              <div className="border-b border-stone-200 pb-3 flex justify-between items-center">
                <h3 className="font-serif text-lg font-bold text-stone-900 flex items-center gap-2">
                  <MessageSquare className="w-4.5 h-4.5 text-orange-600" /> Discussion (Chapter {activeChapterIndex + 1})
                </h3>
                <span className="text-[10px] font-mono uppercase bg-stone-50 px-2.5 py-1 text-stone-400 border border-stone-150 font-bold block">
                  {comments.length} Section Notes
                </span>
              </div>

              {/* Read comment section */}
              <div 
                className={`space-y-5 transition-all duration-550 ease-in-out pr-2 relative ${
                  isDiscussionExpanded ? "max-h-none" : "max-h-[260px] overflow-hidden"
                }`}
              >
                {comments.length > 0 ? (
                comments.map((comment) => (
                  <div key={comment.id} className="flex gap-4 p-4 hover:bg-stone-50 transition-colors border border-transparent hover:border-stone-100 rounded-xl">
                    <div className="w-8 h-8 rounded-full bg-orange-100 border border-orange-200 text-orange-800 flex items-center justify-center font-sans text-xs font-bold shrink-0">
                      {comment.author.charAt(0).toUpperCase()}
                    </div>
                    <div className="space-y-1.5 flex-1">
                      <div className="flex justify-between items-center text-[11px] font-mono text-stone-400">
                        <span className="font-bold text-stone-800 font-sans">{comment.author}</span>
                        <span>{comment.timestamp}</span>
                      </div>
                      <p className="text-xs sm:text-sm font-sans text-stone-700 leading-relaxed text-left whitespace-pre-line">
                        {comment.text}
                      </p>
                    </div>
                  </div>
                ))
              ) : null}

              {/* Elegant gradient overlay when masked */}
              {!isDiscussionExpanded && comments.length > 2 && (
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none" />
              )}
            </div>

            {/* Dynamic expansion trigger button */}
            {comments.length > 2 && (
              <div className="text-center pt-2 pb-1">
                <button
                  type="button"
                  onClick={() => setIsDiscussionExpanded(!isDiscussionExpanded)}
                  className="px-6 py-2.5 border border-stone-200 hover:border-stone-900 bg-white hover:bg-stone-50/90 text-stone-700 hover:text-stone-950 font-sans font-semibold text-xs rounded-full cursor-pointer transition-all inline-flex items-center gap-1.5 shadow-2xs hover:shadow-xs select-none"
                >
                  {isDiscussionExpanded ? "Collapse Discussion" : "Read Full Discussion"}
                </button>
              </div>
            )}

            {/* Post comment form */}
            <form onSubmit={handleAddCommentSubmit} className="space-y-4 pt-4 border-t border-stone-200/80">
              <h4 className="text-[11px] font-mono uppercase tracking-widest text-[#be8873] font-black">
                Pin Your Observation
              </h4>
              
              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-250 text-red-700 text-xs font-mono rounded-none">
                  ⚠️ {errorMsg}
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <input
                  type="text"
                  placeholder="Your Name / Title"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className="md:col-span-1 p-2.5 bg-stone-50 border border-stone-200 hover:border-stone-300 focus:border-stone-900 rounded-none text-xs font-serif text-stone-800 focus:outline-none transition-colors"
                  required
                />
                <input
                  type="text"
                  required
                  placeholder="Share a thoughtful annotation or reflection on this chapter..."
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  className="md:col-span-3 p-2.5 bg-stone-50 border border-stone-200 hover:border-stone-300 focus:border-stone-900 rounded-none text-xs font-serif text-stone-800 focus:outline-none transition-colors"
                />
              </div>
              
              <div className="text-right">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-stone-900 hover:bg-orange-550 hover:text-[#0b0a0a] active:scale-95 text-orange-400 font-mono font-black text-xs tracking-widest cursor-pointer transition-all uppercase rounded-none"
                >
                  Submit
                </button>
              </div>
            </form>
          </section>
          )}

        </div>

        {/* ==============================================
            SIDEBAR DRAWER — BOOK CHAPTERS INDEX 
            ============================================== */}
        {isSidebarOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-stone-900/35 backdrop-blur-xs transition-opacity" 
              onClick={() => setIsSidebarOpen(false)}
            />

            <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
              <div className="w-screen max-w-xs bg-[#faf8f5] border-l border-stone-200 shadow-xl flex flex-col">
                <div className="p-5 border-b border-stone-250 flex items-center justify-between bg-white">
                  <span className="font-mono text-[11px] font-extrabold tracking-wider text-orange-700 uppercase">
                    Table of Contents
                  </span>
                  <button 
                    onClick={() => setIsSidebarOpen(false)}
                    className="p-1 text-stone-400 hover:text-stone-900 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-mono text-stone-400 uppercase tracking-widest">CHAPTER LISTING</p>
                    <div className="flex flex-col gap-1">
                      {book.chapters.map((ch, idx) => (
                        <button
                          key={ch.id}
                          onClick={() => changeChapter(idx)}
                          className={`text-left font-serif text-[13px] p-3 transition-all border-l-2 cursor-pointer leading-snug w-full ${
                            activeChapterIndex === idx 
                              ? "bg-white border-orange-500 font-bold text-stone-950 shadow-xs" 
                              : "border-transparent hover:bg-stone-100/60 text-stone-600"
                          }`}
                        >
                          <div className="text-[10px] font-mono font-medium text-stone-400 mb-0.5">Chapter {idx + 1}</div>
                          {ch.title}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-4 border-t border-stone-200 bg-stone-50/55 text-center">
                  <Link 
                    to="/original-books"
                    className="text-[10px] font-mono tracking-widest font-black text-[#be8873] hover:text-stone-900 uppercase inline-flex items-center gap-1.5"
                  >
                    <BookOpen className="w-3.5 h-3.5" /> All Manuscripts
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Chapter Share & Social Preview Modal Popup */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/45 backdrop-blur-xl animate-fade-in select-none">
          {/* Modal Container */}
          <div 
            className="bg-white shadow-2xl max-w-2xl w-full relative overflow-hidden rounded-none p-6 sm:p-8 text-stone-900"
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
                  Share Chapter
                </h3>
                <p className="text-xs font-mono text-stone-400 uppercase tracking-wider mt-1">
                  Preview how this chapter appears when shared on social platforms
                </p>
              </div>

              {/* Render the social preview card inside the popup */}
              <div className="border border-stone-100 bg-stone-50/50 p-2 rounded-none">
                <ChapterSocialPreviewCard book={book} chapter={activeChapter} chapterIndex={activeChapterIndex} />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setIsShareModalOpen(false)}
                  className="px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-850 font-sans font-bold text-xs rounded-full cursor-pointer uppercase transition-all duration-100 shadow-2xs"
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

      {/* Book Share & Social Preview Modal Popup */}
      {isBookShareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/45 backdrop-blur-xl animate-fade-in select-none">
          {/* Modal Container */}
          <div 
            className="bg-white shadow-2xl max-w-2xl w-full relative overflow-hidden rounded-none p-6 sm:p-8 text-stone-900"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Elegant header accent line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-400 via-orange-600 to-yellow-600" />
            
            {/* Close button in header */}
            <button
              onClick={() => setIsBookShareModalOpen(false)}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-900 transition-colors font-sans font-black text-sm p-1 cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-6 text-left">
              <div>
                <h3 className="font-serif text-xl sm:text-2xl font-black text-stone-900 uppercase tracking-tight">
                  Share Original Book
                </h3>
                <p className="text-xs font-mono text-stone-400 uppercase tracking-wider mt-1">
                  Preview how this manuscript appears when shared on social platforms
                </p>
              </div>

              {/* Render the social preview card inside the popup */}
              <div className="border border-stone-100 bg-stone-50/50 p-2 rounded-none">
                <OriginalBookSocialPreviewCard book={book} />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setIsBookShareModalOpen(false)}
                  className="px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-850 font-sans font-bold text-xs rounded-full cursor-pointer uppercase transition-all duration-100 shadow-2xs"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>

          {/* Click outside backdrop overlay to close */}
          <div className="absolute inset-0 -z-10 bg-transparent" onClick={() => setIsBookShareModalOpen(false)} />
        </div>
      )}
    </Layout>
  );
}

export default ReadOriginalBook;
