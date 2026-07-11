import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BookOpen, ArrowRight, Share2, X } from "lucide-react";
import { motion } from "motion/react";
import Layout from "../components/layout/Layout";
import { useOriginalBooks, OriginalBook } from "../hooks/useOriginalBooks";
import { useHomepageConfig } from "../hooks/useHomepageConfig";
import { Book } from "../types";
import { useTopPicks } from "../hooks/useTopPicks";
import { useDiscovery } from "../hooks/useDiscovery";
import { OriginalBookSocialPreviewCard } from "../components/books/OriginalBookSocialPreviewCard";
import { BookCover } from "../components/books/BookCover";

const stylesMap: Record<string, { ring: string; border: string; hoverBorder: string; text: string; bg: string; textMuted: string; btnAccent: string }> = {
  burgundy: {
    ring: "group-hover:ring-rose-500/20",
    border: "border-rose-950/40",
    hoverBorder: "group-hover:border-rose-700/60",
    text: "text-rose-400 group-hover:text-rose-300",
    bg: "bg-[#4a151b]/15",
    textMuted: "text-rose-300/70",
    btnAccent: "border-rose-900/30 text-rose-300 hover:text-rose-200",
  },
  emerald: {
    ring: "group-hover:ring-emerald-500/20",
    border: "border-emerald-950/40",
    hoverBorder: "group-hover:border-emerald-700/60",
    text: "text-emerald-400 group-hover:text-emerald-300",
    bg: "bg-[#0f3425]/15",
    textMuted: "text-emerald-300/70",
    btnAccent: "border-emerald-900/40 text-emerald-300 hover:text-emerald-200",
  },
  navy: {
    ring: "group-hover:ring-blue-500/20",
    border: "border-blue-950/40",
    hoverBorder: "group-hover:border-blue-700/60",
    text: "text-sky-400 group-hover:text-sky-300",
    bg: "bg-[#0f1d30]/15",
    textMuted: "text-sky-300/70",
    btnAccent: "border-blue-900/40 text-sky-300 hover:text-sky-200",
  },
  saffron: {
    ring: "group-hover:ring-amber-500/20",
    border: "border-amber-955/20",
    hoverBorder: "group-hover:border-amber-600/60",
    text: "text-amber-400 group-hover:text-amber-300",
    bg: "bg-[#bd832a]/15",
    textMuted: "text-amber-300/70",
    btnAccent: "border-amber-900/30 text-amber-300 hover:text-amber-200",
  },
  obsidian: {
    ring: "group-hover:ring-stone-500/20",
    border: "border-stone-800",
    hoverBorder: "group-hover:border-stone-600",
    text: "text-stone-300 group-hover:text-stone-100",
    bg: "bg-[#111111]/45",
    textMuted: "text-stone-400",
    btnAccent: "border-stone-800 text-stone-300 hover:text-stone-100",
  },
  russet: {
    ring: "group-hover:ring-amber-700/20",
    border: "border-[#713f2a]/30",
    hoverBorder: "group-hover:border-[#713f2a]/60",
    text: "text-amber-500 group-hover:text-amber-400",
    bg: "bg-[#713f2a]/15",
    textMuted: "text-orange-200/70",
    btnAccent: "border-[#713f2a]/40 text-orange-200 hover:text-orange-100",
  },
};

export function OriginalBooks() {
  const navigate = useNavigate();
  const [selectedShareBook, setSelectedShareBook] = useState<OriginalBook | null>(null);
  const [selectedChapterIndex, setSelectedChapterIndex] = useState<number>(0);
  const { books, loading } = useOriginalBooks();
  const { config } = useHomepageConfig();
  const { topPicks } = useTopPicks();
  const { highlights } = useDiscovery();

  // Combine top picks and discovery for a unique row of selected book reviews
  const combinedReviews = React.useMemo(() => {
    const list: Book[] = [];
    const seenIds = new Set<string>();
    
    // Add top picks first
    for (const b of topPicks) {
      if (!seenIds.has(b.id)) {
        seenIds.add(b.id);
        list.push(b);
      }
    }
    // Add highlights
    for (const b of highlights) {
      if (!seenIds.has(b.id)) {
        seenIds.add(b.id);
        list.push(b);
      }
    }
    
    // Slice to 3 maximum elements for a premium desktop/mobile row setup
    return list.slice(0, 3);
  }, [topPicks, highlights]);

  // Helper to get color classes for beautiful procedural book spines/covers
  const getCoverColorClass = (colorName: string) => {
    switch (colorName) {
      case "burgundy": return "bg-[#541212] border-[#8a2222] text-[#f5ebd5]";
      case "emerald": return "bg-[#0b3c20] border-[#166436] text-[#e0efdf]";
      case "navy": return "bg-[#112240] border-[#1d3d75] text-[#e1ecfc]";
      case "saffron": return "bg-[#c48d1b] border-[#e2a82a] text-[#2b200b]";
      case "obsidian": return "bg-[#1a1a1a] border-[#333333] text-[#ebdcc5]";
      case "russet": return "bg-[#804218] border-[#a85a25] text-[#fdf6ee]";
      default: return "bg-[#541212] border-[#8a2222] text-[#f5ebd5]";
    }
  };

  return (
    <Layout fullWidth={true}>
      <div className="max-w-[1920px] mx-auto py-6 sm:py-12 px-4 sm:px-6 lg:px-8 text-left animate-fade-in text-stone-900">
        
        {/* Back to Home Navigation breadcrumb button */}
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-mono font-black uppercase tracking-widest text-[#be8873] hover:text-orange-600 transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
        
        {/* Page Header - Clean and minimal without background or flourishes */}
        <div className="relative pb-6 mb-10 border-b border-stone-200">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-4 max-w-2xl text-left">
              <div className="inline-flex items-center">
                <span className="font-sans text-[10.5px] font-black uppercase tracking-widest text-[#be8873]">
                  {config.scriptoriumTitle}
                </span>
              </div>
              
              <motion.h1 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-[#0b0a0a] tracking-tight uppercase leading-none"
              >
                {config.scriptoriumSubtitle}
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
                className="text-sm sm:text-base font-serif italic text-[#1a1817]/85 leading-relaxed pt-1 select-text"
              >
                {config.scriptoriumDescription}
              </motion.p>
              
              <div className="pt-2 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-stone-100 border border-stone-200 overflow-hidden flex items-center justify-center font-serif text-[11px] font-black text-stone-700 select-none shrink-0">
                  {config.heroImageUrl ? (
                    <img 
                      src={config.heroImageUrl} 
                      alt="" 
                      className="w-full h-full object-cover" 
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span>{config.curatorName ? config.curatorName.charAt(0) : "K"}</span>
                  )}
                </div>
                <span className="text-xs font-serif text-stone-500 font-medium">
                  {config.scriptoriumAuthor || `Curated and Authored by ${config.curatorName}`}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ==============================================
            MAIN BOOKS GRID 
            ============================================== */}
        <div className="mt-12">
          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center space-y-6 w-full max-w-md mx-auto animate-fade-in text-center">
              <div className="relative flex items-center justify-center w-12 h-12">
                <div className="absolute w-10 h-10 border-t-2 border-r-2 border-[#e07540] rounded-full animate-spin" />
              </div>
              <div className="space-y-1.5 text-center">
                <span className="block text-[11px] font-mono tracking-widest uppercase font-black text-[#e07540] animate-pulse">
                  Opening Archives
                </span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {books.map((book) => {
              const targetUrl = `/original-book/${book.slug || book.id}`;
              
              const handleCardClick = (e: React.MouseEvent) => {
                const target = e.target as HTMLElement;
                if (target.closest("button") || target.closest("a") || target.closest("input")) {
                  return;
                }
                navigate(targetUrl);
              };

              const accentColorStyles = stylesMap[book.coverColor] || stylesMap.burgundy;

              return (
                <div 
                  key={book.id}
                  onClick={handleCardClick}
                  className="group flex bg-[#faf8f5]/40 border border-stone-200 hover:border-[#be8873]/60 shadow-xs hover:shadow-md transition-all duration-300 relative overflow-hidden select-none text-left rounded-none cursor-pointer"
                >
                  {/* Left Cover Image */}
                  <div className="w-20 sm:w-28 overflow-hidden bg-stone-100 border-r border-stone-200/50 shrink-0">
                    {book.cover_url ? (
                      <img 
                        src={book.cover_url} 
                        alt={book.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 aspect-[3/4]"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full bg-stone-900 flex flex-col justify-between p-2 text-center text-white select-none">
                        <span className="text-[5px] sm:text-[6px] font-mono uppercase text-orange-400 tracking-widest block truncate">{book.genre}</span>
                        <span className="font-serif font-black text-[7px] sm:text-[8px] leading-tight uppercase block line-clamp-3 my-auto">{book.title}</span>
                        <span className="text-[5px] sm:text-[6px] font-mono text-stone-400 block truncate">By {book.author}</span>
                      </div>
                    )}
                  </div>

                  {/* Right Content */}
                  <div className="p-2 sm:p-4 flex flex-col justify-between flex-1 min-w-0">
                    <div className="space-y-0.5 sm:space-y-1">
                      <div className="flex flex-wrap items-center gap-1">
                        <span className="font-mono text-[7px] sm:text-[8px] tracking-wider uppercase font-extrabold bg-[#f5efe6] text-[#be8873] px-1 sm:px-1.5 py-0.5 inline-block">
                          {book.genre}
                        </span>
                      </div>
                      <h3 className="font-serif font-black text-[11px] sm:text-xs md:text-sm text-stone-900 group-hover:text-amber-800 transition-colors uppercase tracking-tight line-clamp-2">
                        {book.title}
                      </h3>
                      <p className="text-[9px] sm:text-[10px] font-sans italic text-stone-500">
                        by <span className="font-bold not-italic text-stone-700">{book.author}</span>
                      </p>
                      <p className="text-[10px] sm:text-[11px] text-stone-500 line-clamp-2 sm:line-clamp-3 font-sans leading-relaxed pt-0.5">
                        "{book.synopsis}"
                      </p>
                    </div>
                    <div className="flex items-center justify-between text-[8px] sm:text-[9px] font-mono text-stone-400 mt-1 sm:mt-2 border-t border-stone-100 pt-1 sm:pt-2">
                      <span>{book.chapters?.length || 0} Chapters</span>
                      <span className="text-[#be8873] group-hover:translate-x-0.5 transition-transform">Read &rarr;</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          )}
        </div>

      </div>

      {/* Original Book Share & Social Preview Modal */}
      {selectedShareBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/45 backdrop-blur-md animate-fade-in select-none">
          {/* Modal Container */}
          <div 
            className="bg-[#faf8f5] shadow-2xl max-w-4xl w-full relative overflow-hidden rounded-none p-6 sm:p-8 text-stone-900 text-left border border-stone-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Elegant header accent line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-400 via-orange-600 to-yellow-600" />
            
            {/* Close button in header */}
            <button
              onClick={() => setSelectedShareBook(null)}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-900 transition-colors font-sans font-black text-sm p-1 cursor-pointer z-10"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-6">
              <div>
                <h3 className="font-serif text-xl sm:text-2xl font-black text-stone-900 uppercase tracking-tight">
                  Manuscript Preview & Chapters
                </h3>
                <p className="text-xs font-mono text-[#be8873] uppercase tracking-wider mt-1">
                  Preview chapters and explore the table of contents before diving in
                </p>
              </div>

              {/* Grid content */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Left Side: Styled Book Preview and details */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="group flex bg-[#faf8f5]/40 border border-stone-200 hover:border-[#be8873]/60 shadow-xs hover:shadow-md transition-all duration-300 relative overflow-hidden select-none text-left rounded-none">
                    {/* Image container */}
                    {selectedShareBook.cover_url ? (
                      <div className="w-24 sm:w-28 overflow-hidden bg-stone-100 border-r border-stone-200/50 shrink-0">
                        <img 
                          src={selectedShareBook.cover_url} 
                          alt={selectedShareBook.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 aspect-[3/4]"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    ) : (
                      <div className="w-24 sm:w-28 overflow-hidden bg-stone-900 border-r border-stone-700 shrink-0 flex flex-col justify-between p-2.5 text-center text-white select-none">
                        <span className="text-[6px] font-mono uppercase text-orange-400 tracking-widest block truncate">{selectedShareBook.genre}</span>
                        <span className="font-serif font-black text-[8px] leading-tight uppercase block line-clamp-3 my-auto">{selectedShareBook.title}</span>
                        <span className="text-[6px] font-mono text-stone-400 block truncate">By {selectedShareBook.author}</span>
                      </div>
                    )}

                    {/* Info padding */}
                    <div className="p-3 sm:p-4 flex flex-col justify-between flex-1 min-w-0">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="font-mono text-[8px] tracking-wider uppercase font-extrabold bg-[#f5efe6] text-[#be8873] px-1.5 py-0.5 inline-block">
                            {selectedShareBook.genre}
                          </span>
                        </div>
                        <h3 className="font-serif font-black text-xs sm:text-sm text-stone-900 group-hover:text-amber-800 transition-colors uppercase tracking-tight line-clamp-2">
                          {selectedShareBook.title}
                        </h3>
                        <p className="text-[10px] font-sans italic text-stone-500">
                          by <span className="font-bold not-italic text-stone-700">{selectedShareBook.author}</span>
                        </p>
                        <p className="text-[11px] text-stone-500 line-clamp-3 font-sans leading-relaxed pt-1">
                          "{selectedShareBook.synopsis}"
                        </p>
                      </div>
                      <div className="flex items-center justify-between text-[9px] font-mono text-stone-400 mt-2 border-t border-stone-100 pt-2">
                        <span>{selectedShareBook.chapters?.length || 0} Chapters</span>
                        <span className="text-[#be8873] group-hover:translate-x-0.5 transition-transform">Manuscript &rarr;</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[9px] font-mono uppercase tracking-widest text-stone-400 font-extrabold block">
                      Social Card Preview
                    </span>
                    <OriginalBookSocialPreviewCard book={selectedShareBook} />
                  </div>
                </div>

                {/* Right Side: Interactive Table of Contents & Chapter Overview */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="border border-stone-200 bg-white p-5 space-y-4">
                    <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                      <span className="font-serif text-sm font-black uppercase tracking-wider text-stone-900">
                        Table of Contents
                      </span>
                      <span className="font-mono text-[9px] text-stone-400 uppercase tracking-widest">
                        {selectedShareBook.chapters.length} {selectedShareBook.chapters.length === 1 ? "Chapter" : "Chapters"}
                      </span>
                    </div>

                    {/* Scrollable Chapter List */}
                    <div className="max-h-40 overflow-y-auto pr-1 space-y-1.5 custom-scrollbar">
                      {selectedShareBook.chapters.map((chapter, idx) => {
                        const isSelected = selectedChapterIndex === idx;
                        return (
                          <button
                            key={chapter.id}
                            onClick={() => setSelectedChapterIndex(idx)}
                            className={`w-full text-left p-2.5 transition-all flex items-center justify-between rounded-none text-xs border ${
                              isSelected
                                ? "bg-orange-50/40 border-[#e07540]/50 text-stone-900 font-bold"
                                : "bg-stone-50/50 border-stone-200/60 hover:bg-stone-50 hover:border-stone-300 text-stone-700"
                            }`}
                          >
                            <span className="truncate pr-4 font-serif">{chapter.title}</span>
                            <span className="font-mono text-[8.5px] text-stone-400 shrink-0 uppercase tracking-wider">
                              {isSelected ? "Selected" : "View Overview"}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Selected Chapter Overview Panel */}
                    {selectedShareBook.chapters[selectedChapterIndex] && (
                      <div className="p-5 bg-white border border-[#e6dfd5] hover:border-[#8a5b25] transition-all duration-300 space-y-4 text-left relative overflow-hidden group">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-[#be8873]" />
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <span className="font-mono text-[8px] text-[#8a5b25] uppercase tracking-widest font-black bg-[#f5efe6] px-1.5 py-0.5">
                              Chapter Overview
                            </span>
                            <h4 className="font-serif font-black text-base text-stone-900 uppercase tracking-tight mt-1">
                              {selectedShareBook.chapters[selectedChapterIndex].title}
                            </h4>
                          </div>
                        </div>
                        <p className="text-xs font-serif text-stone-650 leading-relaxed italic line-clamp-4 select-text border-t border-stone-100 pt-3">
                          "{selectedShareBook.chapters[selectedChapterIndex].content}"
                        </p>
                        <div className="flex justify-end pt-3 border-t border-stone-100">
                          <Link
                            to={`/original-book/${selectedShareBook.slug || selectedShareBook.id}?chapter=${selectedChapterIndex + 1}`}
                            className="px-4 py-2 bg-stone-900 hover:bg-[#e07540] text-white font-mono text-[9px] font-black uppercase tracking-widest transition-colors inline-flex items-center gap-2 rounded-none shadow-[0_2px_0_#be8873] active:translate-y-[1px]"
                          >
                            Read this Chapter <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Close Button Footer */}
              <div className="flex justify-end pt-2 border-t border-stone-200/40">
                <button
                  onClick={() => setSelectedShareBook(null)}
                  className="px-5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-850 font-sans font-bold text-xs rounded-full cursor-pointer uppercase transition-all duration-100"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>

          {/* Click outside backdrop overlay to close */}
          <div className="absolute inset-0 -z-10 bg-transparent" onClick={() => setSelectedShareBook(null)} />
        </div>
      )}
    </Layout>
  );
}

export default OriginalBooks;
