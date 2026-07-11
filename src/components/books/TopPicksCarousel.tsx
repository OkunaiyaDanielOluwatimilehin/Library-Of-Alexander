import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Book, getBookSlug } from "../../types";
import { BookCover } from "./BookCover";
import { ChevronLeft, ChevronRight, Star, Quote, ArrowRight, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface TopPicksCarouselProps {
  books: Book[];
}

export function TopPicksCarousel({ books }: TopPicksCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Auto-play timer when not hovering
  useEffect(() => {
    if (books.length <= 1 || isHovered) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % books.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [books, isHovered]);

  if (!books || books.length === 0) return null;

  const currentBook = books[activeIndex];
  const totalBooks = books.length;

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIndex((prev) => (prev - 1 + totalBooks) % totalBooks);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIndex((prev) => (prev + 1) % totalBooks);
  };

  // Build target URL
  const targetUrl = currentBook.reviewText 
    ? `/review/${getBookSlug(currentBook)}` 
    : `/book/${getBookSlug(currentBook)}`;

  // Star ratings
  const renderStars = (rating: number = 5) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating) ? "text-amber-400 fill-amber-400" : "text-stone-600"
        }`}
      />
    ));
  };

  // Animation variants
  const slideVariants = {
    initial: { opacity: 0, x: 40 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" } },
    exit: { opacity: 0, x: -40, transition: { duration: 0.4, ease: "easeIn" } },
  };

  return (
    <div
      id="top-picks-carousel-container"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="w-full relative bg-stone-950 border border-stone-850 text-stone-100 rounded-2xl overflow-hidden shadow-2xl mb-12"
    >
      {/* Background ambient light effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header Banner */}
      <div className="px-6 pt-6 pb-2 flex items-center justify-between border-b border-stone-900/60">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
          <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-extrabold">
            Featured Scholarly Top Picks
          </span>
        </div>
        <div className="text-[10px] font-mono text-stone-400 tracking-wider">
          <span className="text-amber-400 font-bold">{activeIndex + 1}</span> of <span className="font-bold">{totalBooks}</span>
        </div>
      </div>

      <div className="p-6 md:p-10 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentBook.id}
            variants={slideVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center"
          >
            {/* Left Column: Book Cover Display with elegant stand */}
            <div className="md:col-span-4 flex flex-col items-center justify-center relative">
              <div className="relative group/cover transform hover:scale-[1.02] transition-transform duration-300">
                {/* Book Cover Frame Shadow */}
                <div className="absolute -inset-1.5 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-lg blur-md opacity-75 group-hover/cover:opacity-100 transition-opacity pointer-events-none" />
                
                {/* Cover Component */}
                <BookCover
                  title={currentBook.title}
                  author={currentBook.author}
                  genre={currentBook.genre || "Literature"}
                  color={currentBook.coverColor || "burgundy"}
                  style={currentBook.coverStyle || "classic"}
                  size="lg"
                  cover_url={currentBook.cover_url || (currentBook as any).coverImage || (currentBook as any).coverImg}
                />
              </div>

              {/* Cover pedestal reflections */}
              <div className="w-32 h-1.5 bg-stone-900/60 rounded-full mt-4 blur-xs border border-stone-800/40" />
            </div>

            {/* Right Column: Book Details */}
            <div className="md:col-span-8 flex flex-col justify-center space-y-5 text-left md:pr-4">
              <div className="space-y-2">
                {/* Stars and Series label */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-1">{renderStars(currentBook.rating)}</div>
                  {currentBook.series && (
                    <span className="px-2.5 py-0.5 bg-amber-950/40 text-amber-300 border border-amber-900/30 text-[9px] font-mono uppercase tracking-wider rounded-md">
                      {currentBook.series}
                    </span>
                  )}
                </div>

                <h3 className="font-serif text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight pt-1">
                  {currentBook.title}
                </h3>
                <p className="text-xs sm:text-sm font-sans text-stone-400">
                  by <span className="font-bold text-amber-100 font-serif text-sm sm:text-base">{currentBook.author}</span>
                </p>
              </div>

              {/* Elegant Quote Block or Review text excerpt */}
              {((currentBook.quotes && currentBook.quotes.length > 0) || currentBook.reviewText) && (
                <div className="relative pl-5 py-1 border-l-2 border-amber-500/60 bg-stone-900/30 rounded-r-lg max-w-2xl">
                  <Quote className="absolute -left-1.5 -top-3 w-6 h-6 text-amber-500/10 fill-amber-500/5 rotate-180" />
                  <p className="text-xs sm:text-sm font-sans text-stone-300 italic leading-relaxed line-clamp-3">
                    {currentBook.quotes && currentBook.quotes.length > 0 
                      ? currentBook.quotes[0] 
                      : currentBook.reviewText?.replace(/[#*`_]/g, "")}
                  </p>
                </div>
              )}

              {/* Book Metadata Badge Row */}
              <div className="flex flex-wrap gap-4 text-[10px] font-mono text-stone-400 py-1">
                {currentBook.rating && (
                  <div>
                    RATING: <span className="text-amber-400 font-bold">{currentBook.rating} / 5</span>
                  </div>
                )}
                {currentBook.reactions && (
                  <div>
                    ENGAGEMENT: <span className="text-stone-200 font-bold">{Object.keys(currentBook.reactions || {}).length || 0} Reacts</span>
                  </div>
                )}
                {currentBook.genre && (
                  <div>
                    GENRE: <span className="text-stone-200 font-bold uppercase">{currentBook.genre}</span>
                  </div>
                )}
              </div>

              {/* Call To Action Buttons */}
              <div className="pt-2 flex flex-wrap gap-3 items-center">
                <Link
                  to={targetUrl}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-stone-950 font-mono text-xs font-black uppercase tracking-wider rounded-md transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer transform hover:scale-[1.02] active:scale-95"
                >
                  <span>Read Full Curation Review</span>
                  <ArrowRight className="w-4 h-4 text-stone-950" />
                </Link>
                
                {currentBook.series && (
                  <Link
                    to={`/genre?g=${encodeURIComponent(currentBook.genre || "")}`}
                    className="inline-flex items-center gap-2 px-5 py-3 bg-transparent border border-stone-750 hover:border-stone-500 text-stone-300 hover:text-white font-mono text-xs font-bold uppercase tracking-wider rounded-md transition-all duration-300 cursor-pointer active:scale-95"
                  >
                    Explore {currentBook.genre} Catalog
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Arrows and Dot Indicators */}
      <div className="px-6 py-4 bg-stone-950/90 border-t border-stone-900/60 flex items-center justify-between">
        {/* Previous/Next Manual Navigation */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handlePrev}
            className="w-8 h-8 rounded-full border border-stone-800 hover:border-stone-600 bg-stone-900/40 hover:bg-stone-900/90 text-stone-400 hover:text-white flex items-center justify-center transition-all cursor-pointer active:scale-90"
            aria-label="Previous Featured Pick"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="w-8 h-8 rounded-full border border-stone-800 hover:border-stone-600 bg-stone-900/40 hover:bg-stone-900/90 text-stone-400 hover:text-white flex items-center justify-center transition-all cursor-pointer active:scale-90"
            aria-label="Next Featured Pick"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Circular dots selection */}
        <div className="flex items-center gap-2">
          {books.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 cursor-pointer ${
                activeIndex === index
                  ? "bg-amber-400 w-6"
                  : "bg-stone-700 hover:bg-stone-500"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
