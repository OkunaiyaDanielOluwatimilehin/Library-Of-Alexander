import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { BookOpen, Map, Sparkles, Star, Tag, Compass, Layers, Milestone, Info, ArrowRight, X, ArrowUp } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Layout from "../components/layout/Layout";
import HeroWrapper from "../components/hero/HeroWrapper";
import BookCard from "../components/books/BookCard";
import BookGrid from "../components/books/BookGrid";
import { BookCover } from "../components/books/BookCover";
import { useTopPicks } from "../hooks/useTopPicks";
import { useBottomShelf } from "../hooks/useBottomShelf";
import { useDiscovery } from "../hooks/useDiscovery";
import { useAuthorSpotlight } from "../hooks/useAuthorSpotlight";
import { useBooks } from "../hooks/useBooks";
import { useOriginalBooks } from "../hooks/useOriginalBooks";
import { getAuthorSlug, getBookSlug, BookCoverColor, BookCoverStyle } from "../types";

export function Home() {
  const navigate = useNavigate();
  const handleSectionClick = (url: string) => (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest("button") || target.closest("a") || target.closest("input")) {
      return;
    }
    navigate(url);
  };
  const { books } = useBooks();
  const [showLatestAlert, setShowLatestAlert] = React.useState(true);
  const { topPicks } = useTopPicks();
  const { bottomShelf } = useBottomShelf();
  const { highlights } = useDiscovery();
  const { spotlight } = useAuthorSpotlight();
  const { books: originalBooks } = useOriginalBooks();

  const latestChapterInfo = React.useMemo(() => {
    if (!originalBooks || originalBooks.length === 0) return null;
    const items: Array<{ book: any; chapter: any; date: number }> = [];
    originalBooks.forEach((book) => {
      if (book.chapters && book.chapters.length > 0) {
        book.chapters.forEach((ch) => {
          items.push({
            book,
            chapter: ch,
            date: ch.publishedAt ? new Date(ch.publishedAt).getTime() : new Date(book.createdAt).getTime()
          });
        });
      }
    });
    if (items.length === 0) return null;
    items.sort((a, b) => b.date - a.date);
    return items[0];
  }, [originalBooks]);

  // Discovery Carousel State and Hook connection
  const [activeCarouselIdx, setActiveCarouselIdx] = React.useState(0);
  const [isDiscoveryExpanded, setIsDiscoveryExpanded] = React.useState(false);
  const [isBottomShelfExpanded, setIsBottomShelfExpanded] = React.useState(false);
  const [showDiscoverySection, setShowDiscoverySection] = React.useState(true);
  const [topPicksIdx, setTopPicksIdx] = React.useState(0);
  const [isTopPickExpanded, setIsTopPickExpanded] = React.useState(false);

  const topPickCarouselBooks = React.useMemo(() => {
    return topPicks.slice(0, 5);
  }, [topPicks]);

  // Split out the primary books for showcasing
  const topPickBook = topPickCarouselBooks[topPicksIdx] || topPicks[0];
  const primaryHiddenGem = bottomShelf[0]; // Hidden Gem selection

  const hasTopPickReview = !!(topPickBook && topPickBook.reviewText && 
    topPickBook.reviewText.trim().length > 0 && 
    !topPickBook.reviewText.toLowerCase().includes("no review analysis") &&
    !topPickBook.reviewText.toLowerCase().includes("no review text") &&
    !topPickBook.reviewText.toLowerCase().includes("no secondary detailed review text"));

  const hasHiddenGemReview = !!(primaryHiddenGem && primaryHiddenGem.reviewText && 
    primaryHiddenGem.reviewText.trim().length > 0 && 
    !primaryHiddenGem.reviewText.toLowerCase().includes("no review analysis") &&
    !primaryHiddenGem.reviewText.toLowerCase().includes("no review text") &&
    !primaryHiddenGem.reviewText.toLowerCase().includes("no secondary detailed review text"));

  const topPickUrl = topPickBook ? (hasTopPickReview ? `/review/${getBookSlug(topPickBook)}` : `/book/${getBookSlug(topPickBook)}`) : "";
  const hiddenGemUrl = primaryHiddenGem ? (hasHiddenGemReview ? `/review/${getBookSlug(primaryHiddenGem)}` : `/book/${getBookSlug(primaryHiddenGem)}`) : "";

  const carouselBooks = React.useMemo(() => {
    return highlights || [];
  }, [highlights]);

  // Reset expansion state when slide changes
  React.useEffect(() => {
    setIsDiscoveryExpanded(false);
  }, [activeCarouselIdx]);

  React.useEffect(() => {
    setIsTopPickExpanded(false);
  }, [topPicksIdx]);

  React.useEffect(() => {
    if (carouselBooks.length <= 1) return;
    if (isDiscoveryExpanded) return; // Prevent rotation while user is exploring/reading long text
    const interval = setInterval(() => {
      setActiveCarouselIdx((prev) => (prev + 1) % carouselBooks.length);
    }, 12000);
    return () => clearInterval(interval);
  }, [carouselBooks.length, isDiscoveryExpanded]);

  // Automatic transition for Top Picks Carousel Ranks #1 - #5 (considerable speed: 7000ms)
  React.useEffect(() => {
    if (topPickCarouselBooks.length <= 1) return;
    if (isTopPickExpanded) return; // Prevent rotation while user is exploring/reading long text
    const interval = setInterval(() => {
      setTopPicksIdx((prev) => (prev + 1) % topPickCarouselBooks.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [topPickCarouselBooks.length, isTopPickExpanded]);

  const discoveryBook = carouselBooks[activeCarouselIdx];

  const hasDiscoveryReview = !!(discoveryBook && discoveryBook.reviewText && 
    discoveryBook.reviewText.trim().length > 0 && 
    !discoveryBook.reviewText.toLowerCase().includes("no review analysis") &&
    !discoveryBook.reviewText.toLowerCase().includes("no review text") &&
    !discoveryBook.reviewText.toLowerCase().includes("no secondary detailed review text"));
  const discoveryUrl = discoveryBook ? (hasDiscoveryReview ? `/review/${getBookSlug(discoveryBook)}` : `/book/${getBookSlug(discoveryBook)}`) : "";

  // Shared Animation Variants for staggered headers
  const textContainerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1
      }
    }
  };

  const textItemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { 
      opacity: 1, 
      y: 0, 
      transition: { type: "spring", stiffness: 60, damping: 15 } 
    }
  };

  return (
    <Layout fullWidth={true}>
      <div className="space-y-0 pb-16 animate-fade-in w-full max-w-[1920px] mx-auto bg-white rounded-none text-left">
        
        {/* TOP ALERT BANNER (UNDER NAV) */}
        {latestChapterInfo && showLatestAlert && (
          <section 
            id="latest-original-chapter-section" 
            className="w-full relative bg-stone-950 text-white py-2.5 sm:py-3 px-3 sm:px-8 border-b border-l-4 border-l-amber-500 md:border-l-0 border-stone-800 overflow-hidden z-40 select-none animate-fade-in mt-2 sm:mt-6 mb-4 sm:mb-8"
          >
            {/* Background book cover image as atmospheric visual layer */}
            {latestChapterInfo.book.cover_url && (
              <div className="absolute inset-0 z-0 pointer-events-none select-none">
                <img 
                  src={latestChapterInfo.book.cover_url} 
                  alt="" 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover opacity-20 filter blur-xs scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-stone-950/95 via-stone-950/85 to-stone-950/95" />
              </div>
            )}
            
            <div className="relative z-10 max-w-[1920px] mx-auto px-1 sm:px-6 md:px-12 lg:px-16 flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 min-w-0">
                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Desktop Alert Badge */}
                  <span className="hidden md:inline-flex items-center gap-1.5 font-mono text-[9px] bg-amber-500 text-stone-950 px-2.5 py-1 uppercase tracking-widest font-black shadow-xs select-none">
                    <span className="w-1.5 h-1.5 rounded-full bg-stone-950 animate-pulse" />
                    New Chapter Published
                  </span>
                  
                  {/* Mobile version of Badge */}
                  <span className="md:hidden inline-flex items-center gap-1 font-mono text-[9px] bg-amber-500 text-stone-950 px-1.5 py-0.5 uppercase tracking-widest font-black shadow-xs select-none">
                    <span className="w-1 h-1 rounded-full bg-stone-950 animate-pulse" />
                    NEW
                  </span>
                </div>

                <p className="text-[11px] sm:text-xs md:text-sm font-sans text-stone-200/95 leading-snug">
                  <span className="font-bold text-white">"{latestChapterInfo.chapter.title}"</span> <span>from the manuscript <span className="font-serif italic text-amber-400 font-semibold">"{latestChapterInfo.book.title}"</span> by {latestChapterInfo.book.author} is now available.</span>
                </p>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-2 shrink-0">
                <Link 
                  to={`/original-book/${latestChapterInfo.book.slug || latestChapterInfo.book.id}`}
                  className="inline-flex items-center gap-1 bg-[#be8873] hover:bg-[#a97561] text-white px-2.5 py-1 sm:px-4 sm:py-2 font-mono text-[9px] sm:text-[11px] font-bold uppercase tracking-wider transition-all duration-200 active:scale-95 shadow-sm rounded-none whitespace-nowrap"
                >
                  <span>Read Now</span>
                  <ArrowRight className="w-2.5 h-2.5 text-current" />
                </Link>

                {/* Dismiss Button */}
                <button
                  type="button"
                  onClick={() => setShowLatestAlert(false)}
                  className="p-1 text-stone-400 hover:text-white hover:bg-white/10 transition-colors duration-150 rounded-none cursor-pointer border border-transparent hover:border-stone-700"
                  aria-label="Dismiss alert"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </section>
        )}

        {/* SECTION 1: HERO CONTAINER (LIGHT SOLID) */}
        <section id="hero-wrapper" className="w-full bg-orange-50/50">
          <HeroWrapper 
            topPicks={topPicks} 
            highlights={highlights} 
            bottomShelf={bottomShelf} 
            spotlight={spotlight}
          />
        </section>

        {/* Divider / Gap between Hero and Top Picks */}
        <div className="w-full py-12 bg-white flex items-center justify-center">
          <div className="w-[95%] h-[3px] bg-gradient-to-r from-transparent via-stone-200 to-transparent" />
        </div>

        {/* SECTION 2: FEATURED TOP PICKS */}
        {topPickBook && (
          <section 
            id="top-picks-section" 
            onClick={handleSectionClick(topPickUrl)}
            className="py-6 sm:py-10 md:py-12 bg-slate-950 text-white relative overflow-hidden cursor-pointer hover:bg-opacity-95 transition-all duration-300"
          >
            {/* background Cover Image on Right with gradient left effect */}
            <div className="absolute right-0 top-0 bottom-0 w-full md:w-[60%] h-full z-0">
              <div 
                className="absolute inset-0 bg-slate-950/45 md:bg-transparent md:bg-gradient-to-r md:from-slate-950 md:via-slate-950/65 md:to-slate-950/10 z-10"
              />
              {topPickBook.cover_url && (
                <AnimatePresence mode="wait">
                  <motion.img 
                    key={topPickBook.id}
                    src={topPickBook.cover_url} 
                    alt="" 
                    referrerPolicy="no-referrer"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.95 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.7 }}
                    className="w-full h-full object-cover select-none pointer-events-none absolute inset-0"
                  />
                </AnimatePresence>
              )}
            </div>

            {/* Showcase Container */}
            <div className="max-w-[1920px] mx-auto px-4 sm:px-12 md:px-16 lg:px-20 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-12 relative z-20">
              {/* Content on Left / Stacks on mobile */}
              <div 
                key={topPickBook.id}
                className="w-full md:max-w-[60%] flex flex-col items-start text-left space-y-2.5 sm:space-y-4 group"
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={topPickBook.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 12 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    className="space-y-2.5 sm:space-y-4 flex flex-col items-start text-left w-full"
                  >
                    {/* Section Title with Model 6 Genre label linkage */}
                    <div className="flex flex-col items-start gap-1 sm:gap-2 pt-1 sm:pt-4">
                      <span 
                        className="font-display font-mono tracking-widest text-[#4ecdc4] font-bold uppercase block text-left text-xl sm:text-[36px] sm:leading-[36px]"
                      >
                        TOP PICKS
                      </span>
                    </div>

                    <h1 
                      className="font-display text-3xl sm:text-4xl md:text-[45px] md:leading-[48px] font-bold tracking-tight text-white group-hover:text-yellow transition-colors leading-tight uppercase text-left decoration-transparent"
                    >
                      <Link to={topPickUrl}>{topPickBook.title}</Link>
                    </h1>
                    
                    <h2 
                      className="font-display text-[18px] italic text-strong-cyan font-bold tracking-wide uppercase mt-1 text-left"
                    >
                      by{" "}
                      <span className="text-strong-cyan font-black border-b border-teal-400/30">
                        {topPickBook.author}
                      </span>
                    </h2>
                    
                    <p 
                      className="text-sm sm:text-base font-sans text-stone-200/90 leading-relaxed font-light tracking-wide max-w-xl text-left"
                    >
                      {(() => {
                        const fullText = topPickBook.summary || topPickBook.description || "";
                        if (fullText.length <= 140) {
                          return `"${fullText}"`;
                        }
                        if (isTopPickExpanded) {
                          return (
                            <>
                              "{fullText}"{" "}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setIsTopPickExpanded(false);
                                }}
                                className="text-yellow hover:underline cursor-pointer ml-1.5 font-bold inline-block text-xs uppercase"
                              >
                                Show Less
                              </button>
                            </>
                          );
                        } else {
                          return (
                            <>
                              "{fullText.slice(0, 140)}..."{" "}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setIsTopPickExpanded(true);
                                }}
                                className="text-[#4ecdc4] hover:text-yellow hover:underline cursor-pointer ml-1.5 font-bold inline-block text-xs uppercase"
                              >
                                Read More
                              </button>
                            </>
                          );
                        }
                      })()}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </section>
        )}

        {/* Divider / Gap between Top Picks and Author Spotlight */}
        <div className="w-full py-12 bg-white flex items-center justify-center">
          <div className="w-[95%] h-[3px] bg-gradient-to-r from-transparent via-stone-200 to-transparent" />
        </div>

        {/* SECTION 4: AUTHOR SPOTLIGHT (Moved after Top Picks) */}
        {spotlight && (
          <section id="author-spotlight-section" className="py-6 sm:py-10 md:py-12 bg-dusk-blue text-white relative overflow-hidden">
            {/* background Cover Image on Right with gradient left effect */}
            <div className="absolute right-0 top-0 bottom-0 w-full md:w-[60%] h-full z-0">
              <div 
                className="absolute inset-0 bg-dusk-blue/85 md:bg-transparent md:bg-gradient-to-r md:from-dusk-blue md:via-dusk-blue/95 md:to-transparent z-10"
              />
              {spotlight.image_url && (
                <AnimatePresence mode="wait">
                  <motion.img 
                    key={spotlight.id}
                    src={spotlight.image_url} 
                    alt="" 
                    referrerPolicy="no-referrer"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.8 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.7 }}
                    className="w-full h-full object-cover select-none pointer-events-none absolute inset-0"
                  />
                </AnimatePresence>
              )}
            </div>

            {/* Showcase Container */}
            <div className="max-w-[1920px] mx-auto px-4 sm:px-12 md:px-16 lg:px-20 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-12 relative z-20">
              <div className="w-full md:max-w-[60%] flex flex-col items-start text-left space-y-2.5 sm:space-y-4 group">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={spotlight.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 12 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    className="space-y-2.5 sm:space-y-4 flex flex-col items-start text-left w-full"
                  >
                    <div className="flex flex-col items-start gap-1 sm:gap-2 pt-1 sm:pt-4">
                      <span 
                        className="font-display font-mono tracking-widest text-[#4ecdc4] font-bold uppercase block text-left text-xl sm:text-[36px] sm:leading-[36px]"
                      >
                        SPOTLIGHT
                      </span>
                    </div>

                    <h1 className="font-display text-4xl sm:text-5xl md:text-[55px] md:leading-[52px] font-bold tracking-tight text-white group-hover:text-yellow transition-colors leading-tight uppercase text-left decoration-transparent">
                      <Link to={`/author/${getAuthorSlug(spotlight)}`}>{spotlight.name}</Link>
                    </h1>

                    <p className="text-sm sm:text-base font-sans text-stone-200/90 leading-relaxed font-light tracking-wide max-w-xl text-left">
                      {spotlight.bio.length > 225 ? spotlight.bio.substring(0, 225).trim() + "..." : spotlight.bio}
                    </p>

                    <div className="pt-2">
                      <Link 
                        to={`/author/${getAuthorSlug(spotlight)}`}
                        className="inline-flex items-center gap-2 bg-yellow hover:bg-white text-slate-950 px-5 py-2.5 font-mono font-black text-[11px] tracking-wider uppercase transition-all shadow-md active:scale-95 duration-150 border border-yellow hover:border-white"
                      >
                        <span>Read Biography</span>
                        <ArrowRight className="w-4 h-4 text-slate-950" />
                      </Link>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </section>
        )}

        {/* Divider / Gap between Author Spotlight and Discovery */}
        <div className="w-full py-12 bg-white flex items-center justify-center">
          <div className="w-[95%] h-[3px] bg-gradient-to-r from-transparent via-stone-200 to-transparent" />
        </div>

        {/* SECTION 3: FEATURED DISCOVERY SECTION */}
        {discoveryBook && showDiscoverySection && (
          <>
            <section 
              id="discovery-section" 
              onClick={handleSectionClick(discoveryUrl)}
              className="py-6 sm:py-10 md:py-12 bg-deep-purple text-white relative overflow-hidden cursor-pointer hover:bg-opacity-95 transition-all duration-300"
            >
              {/* background Cover Image on Right with gradient left effect */}
              <div className="absolute right-0 top-0 bottom-0 w-full md:w-[60%] h-full z-0">
                <div 
                  className="absolute inset-0 bg-deep-purple/45 md:bg-transparent md:bg-gradient-to-r md:from-deep-purple md:via-deep-purple/65 md:to-deep-purple/10 z-10"
                />
                {discoveryBook.cover_url && (
                  <AnimatePresence mode="wait">
                    <motion.img 
                      key={discoveryBook.id}
                      src={discoveryBook.cover_url} 
                      alt="" 
                      referrerPolicy="no-referrer"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.95 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.7 }}
                      className="w-full h-full object-cover select-none pointer-events-none absolute inset-0"
                    />
                  </AnimatePresence>
                )}
              </div>

              {/* Showcase Container */}
              <div className="max-w-[1920px] mx-auto px-4 sm:px-12 md:px-16 lg:px-20 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-12 relative z-20">
                {/* Content on Left / Stacks on mobile */}
                <div 
                  key={discoveryBook.id}
                  className="w-full md:max-w-[60%] flex flex-col items-start text-left space-y-2.5 sm:space-y-4 group"
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={discoveryBook.id}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 12 }}
                      transition={{ duration: 0.5, ease: "easeInOut" }}
                      className="space-y-2.5 sm:space-y-4 flex flex-col items-start text-left w-full"
                    >
                      {/* Section Title with Model 6 Genre label linkage */}
                      <div className="flex flex-col items-start gap-1 sm:gap-2 pt-1 sm:pt-4">
                        <span 
                          className="font-display font-mono tracking-widest text-[#4ecdc4] font-bold uppercase block text-left text-xl sm:text-[36px] sm:leading-[36px]"
                        >
                          DISCOVERY
                        </span>
                      </div>

                      <h1 
                        className="font-display text-3xl sm:text-4xl md:text-[45px] md:leading-[48px] font-bold tracking-tight text-white group-hover:text-yellow transition-colors leading-tight uppercase text-left decoration-transparent"
                      >
                        <Link to={discoveryUrl}>{discoveryBook.title}</Link>
                      </h1>
                      
                      <h2 
                        className="font-display text-[18px] italic text-strong-cyan font-bold tracking-wide uppercase mt-1 text-left"
                      >
                        by{" "}
                        <span className="text-strong-cyan font-black border-b border-teal-400/30">
                          {discoveryBook.author}
                        </span>
                      </h2>
                      
                      <p 
                        className="text-sm sm:text-base font-sans text-stone-200/90 leading-relaxed font-light tracking-wide max-w-xl text-left"
                      >
                        {(() => {
                          const fullText = discoveryBook.description || discoveryBook.summary || "";
                          if (fullText.length <= 140) {
                            return `"${fullText}"`;
                          }
                          if (isDiscoveryExpanded) {
                            return (
                              <>
                                "{fullText}"{" "}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setIsDiscoveryExpanded(false);
                                  }}
                                  className="text-yellow hover:underline cursor-pointer ml-1.5 font-bold inline-block text-xs uppercase"
                                >
                                  Show Less
                                </button>
                              </>
                            );
                          } else {
                            return (
                              <>
                                "{fullText.slice(0, 140)}..."{" "}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setIsDiscoveryExpanded(true);
                                  }}
                                  className="text-[#4ecdc4] hover:text-yellow hover:underline cursor-pointer ml-1.5 font-bold inline-block text-xs uppercase"
                                >
                                  Read More
                                </button>
                              </>
                            );
                          }
                        })()}
                      </p>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </section>

            {/* Divider / Gap between Discovery and Bottom Shelf */}
            <div className="w-full py-12 bg-white flex items-center justify-center">
              <div className="w-[95%] h-[3px] bg-gradient-to-r from-transparent via-stone-200 to-transparent" />
            </div>
          </>
        )}

        {/* SECTION 5: THE BOTTOM SHELF & CURATED HIDDEN GEMS */}
        {bottomShelf.length > 0 && (
          <section 
            id="bottom-shelf-section" 
            onClick={handleSectionClick(hiddenGemUrl)}
            className="py-6 sm:py-10 md:py-12 bg-[#2a0133] text-white relative overflow-hidden cursor-pointer hover:bg-opacity-95 transition-all duration-300"
          >
            {/* background Cover Image on Right with gradient left effect */}
            {primaryHiddenGem && (
              <>
                <div className="absolute right-0 top-0 bottom-0 w-full md:w-[60%] h-full z-0">
                  <div 
                    className="absolute inset-0 bg-[#2a0133]/45 md:bg-transparent md:bg-gradient-to-r md:from-[#2a0133] md:via-[#2a0133]/65 md:to-[#2a0133]/10 z-10"
                  />
                  {primaryHiddenGem.cover_url && (
                    <AnimatePresence mode="wait">
                      <motion.img 
                        key={primaryHiddenGem.id}
                        src={primaryHiddenGem.cover_url} 
                        alt="" 
                        referrerPolicy="no-referrer"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.95 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.7 }}
                        className="w-full h-full object-cover select-none pointer-events-none absolute inset-0"
                      />
                    </AnimatePresence>
                  )}
                </div>

                {/* Showcase Container */}
                <div className="max-w-[1920px] mx-auto px-4 sm:px-12 md:px-16 lg:px-20 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-12 relative z-20">
                  <div className="w-full md:max-w-[60%] flex flex-col items-start text-left space-y-2.5 sm:space-y-4 group">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={primaryHiddenGem.id}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 12 }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                        className="space-y-2.5 sm:space-y-4 flex flex-col items-start text-left w-full"
                      >
                        <div className="flex flex-col items-start gap-1 sm:gap-2 pt-1 sm:pt-4">
                          <span 
                            className="font-display font-mono tracking-widest text-[#4ecdc4] font-bold uppercase block text-left text-xl sm:text-[36px] sm:leading-[36px]"
                          >
                            BOTTOM SHELF
                          </span>
                        </div>

                        <h1 className="font-display text-4xl sm:text-5xl md:text-[55px] md:leading-[52px] font-bold tracking-tight text-white group-hover:text-yellow transition-colors leading-tight uppercase text-left decoration-transparent">
                          <Link to={hiddenGemUrl}>{primaryHiddenGem.title}</Link>
                        </h1>

                        <h2 className="font-display text-[18px] italic text-strong-cyan font-bold tracking-wide uppercase mt-1 text-left">
                          by{" "}
                          <span className="text-strong-cyan font-black border-b border-teal-400/30">
                            {primaryHiddenGem.author}
                          </span>
                        </h2>

                        <p className="text-sm sm:text-base font-sans text-stone-200/90 leading-relaxed font-light tracking-wide max-w-xl text-left">
                          {(() => {
                            const fullText = primaryHiddenGem.summary || primaryHiddenGem.description || "";
                            if (fullText.length <= 140) {
                              return `"${fullText}"`;
                            }
                            if (isBottomShelfExpanded) {
                              return (
                                <>
                                  "{fullText}"{" "}
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      setIsBottomShelfExpanded(false);
                                    }}
                                    className="text-yellow hover:underline cursor-pointer ml-1.5 font-bold inline-block text-xs uppercase"
                                  >
                                    Show Less
                                  </button>
                                </>
                              );
                            } else {
                              return (
                                <>
                                  "{fullText.slice(0, 140)}..."{" "}
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      setIsBottomShelfExpanded(true);
                                    }}
                                    className="text-[#4ecdc4] hover:text-yellow hover:underline cursor-pointer ml-1.5 font-bold inline-block text-xs uppercase"
                                  >
                                    Read More
                                  </button>
                                </>
                              );
                            }
                          })()}
                        </p>
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>
              </>
            )}
          </section>
        )}

      </div>
    </Layout>
  );
}

export default Home;
