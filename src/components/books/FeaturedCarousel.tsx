import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Book, getBookSlug } from "../../types";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface FeaturedCarouselProps {
  topPicks: Book[];
  discoveryBooks: Book[];
  bottomShelf: Book[];
}

interface SlideItem {
  id: string;
  book: Book;
  categoryType: "top-pick" | "discovery" | "bottom-shelf";
  rank?: number;
  bgClass: string;
  titleLabel: string;
  badgeLabel: string;
  accentColor: string;
}

export function FeaturedCarousel({ topPicks, discoveryBooks, bottomShelf }: FeaturedCarouselProps) {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(1); // 1 = next, -1 = prev
  const [isHovered, setIsHovered] = useState(false);

  const slides = React.useMemo(() => {
    const list: SlideItem[] = [];

    // 1. Top Picks (exactly ranks 1 to 5)
    const top5 = topPicks.slice(0, 5);
    top5.forEach((book, idx) => {
      const rank = book.top_pick_order ?? (book as any).topPickOrder ?? (idx + 1);
      list.push({
        id: `top-pick-${book.id}`,
        book,
        categoryType: "top-pick",
        rank,
        bgClass: "bg-slate-950",
        titleLabel: "TOP PICKS",
        badgeLabel: `Rank #${rank} Top Pick`,
        accentColor: "#4ecdc4",
      });
    });

    // 2. Discovery (first 2 books from highlights)
    const discovery2 = discoveryBooks.slice(0, 2);
    discovery2.forEach((book) => {
      list.push({
        id: `discovery-${book.id}`,
        book,
        categoryType: "discovery",
        bgClass: "bg-deep-purple",
        titleLabel: "DISCOVERY",
        badgeLabel: "Discovery Spotlight",
        accentColor: "#fffc31",
      });
    });

    // 3. Bottom Shelf (first 2 books from bottom shelf)
    const bottom2 = bottomShelf.slice(0, 2);
    bottom2.forEach((book) => {
      list.push({
        id: `bottom-shelf-${book.id}`,
        book,
        categoryType: "bottom-shelf",
        bgClass: "bg-[#2a0133]",
        titleLabel: "THE BOTTOM SHELF",
        badgeLabel: "Curated Hidden Gem",
        accentColor: "#fffc31",
      });
    });

    return list;
  }, [topPicks, discoveryBooks, bottomShelf]);

  // Autoplay (slower speed: 12 seconds)
  useEffect(() => {
    if (slides.length <= 1 || isHovered) return;
    const interval = setInterval(() => {
      setDirection(1);
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, 12000);
    return () => clearInterval(interval);
  }, [slides, isHovered]);

  if (slides.length === 0) return null;

  const currentSlide = slides[activeIndex];
  const currentBook = currentSlide.book;
  const hasReview = !!(currentBook.reviewText && !currentBook.reviewText.toLowerCase().includes("no review text"));
  const targetUrl = hasReview 
    ? `/review/${getBookSlug(currentBook)}` 
    : `/book/${getBookSlug(currentBook)}`;

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDirection(-1);
    setActiveIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDirection(1);
    setActiveIndex((prev) => (prev + 1) % slides.length);
  };

  // Setup gradient overlays based on type to match homepage sections perfectly
  const getOverlayClass = () => {
    if (currentSlide.categoryType === "top-pick") {
      return "bg-slate-950/85 md:bg-transparent md:bg-gradient-to-r md:from-slate-950 md:via-slate-950/95 md:to-transparent";
    }
    if (currentSlide.categoryType === "discovery") {
      return "bg-deep-purple/85 md:bg-transparent md:bg-gradient-to-r md:from-deep-purple md:via-deep-purple/95 md:to-transparent";
    }
    return "bg-[#2a0133]/85 md:bg-transparent md:bg-gradient-to-r md:from-[#2a0133] md:via-[#2a0133]/95 md:to-transparent";
  };

  // Motion variants for sliding horizontal transition
  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 300 : -300,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (dir: number) => ({
      zIndex: 0,
      x: dir < 0 ? 300 : -300,
      opacity: 0
    })
  };

  return (
    <div
      id="books-featured-carousel-root"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative w-full max-w-[1920px] overflow-hidden shadow-2xl mb-12 border-y border-white/5 rounded-none"
    >
      <section className={`w-full py-20 md:py-28 ${currentSlide.bgClass} text-white relative overflow-hidden transition-colors duration-500`}>
        {/* Background Ambient Blur */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none z-10" />

        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentSlide.id}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.3 }
            }}
            className="w-full h-full"
          >
            {/* Background Cover Image on Right with gradient left effect */}
            <div className="absolute right-0 top-0 bottom-0 w-full md:w-[60%] h-full z-0">
              <div className={`absolute inset-0 z-10 ${getOverlayClass()}`} />
              {currentBook.cover_url && (
                <img
                  src={currentBook.cover_url}
                  alt=""
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover select-none pointer-events-none absolute inset-0 opacity-85"
                />
              )}
            </div>

            {/* Content on Left / Stacks on mobile */}
            <div className="max-w-[1920px] mx-auto px-4 sm:px-12 md:px-16 lg:px-20 relative z-20">
              <div className="w-full md:max-w-[80%] flex flex-col items-start text-left space-y-3">
                
                {/* Book Title */}
                <h1
                  className="font-display text-3xl sm:text-4xl md:text-[50px] md:leading-[52px] font-bold tracking-tight text-white text-left uppercase"
                >
                  <Link to={targetUrl} className="hover:text-yellow transition-colors cursor-pointer">
                    {currentBook.title}
                  </Link>
                </h1>

                {/* Author Title (Under the book title, no 'by', larger font size) */}
                <div 
                  className="font-display text-xl sm:text-2xl md:text-3xl italic font-bold tracking-wide uppercase text-left" 
                  style={{ color: currentSlide.categoryType === "top-pick" ? "#4ecdc4" : "#fffc31" }}
                >
                  <span className="font-black border-b border-white/20">{currentBook.author}</span>
                </div>

                {/* Book Description / Summary */}
                <p className="text-sm sm:text-base font-sans text-stone-200/90 leading-relaxed font-light tracking-wide max-w-3xl text-left line-clamp-3 pt-2">
                  "{(currentBook.summary || currentBook.description || "").replace(/[#*`_]/g, "")}"
                </p>

              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </section>

      {/* Manual Arrow Buttons and Slide Indicators Overlay */}
      <div className="absolute bottom-6 right-6 sm:right-12 md:right-16 lg:right-20 z-30 flex items-center gap-6">
        {/* Nav Arrows */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrev}
            className="w-10 h-10 rounded-full border border-white/15 hover:border-white/40 bg-black/40 hover:bg-black/80 text-white flex items-center justify-center transition-all cursor-pointer active:scale-90"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="w-10 h-10 rounded-full border border-white/15 hover:border-white/40 bg-black/40 hover:bg-black/80 text-white flex items-center justify-center transition-all cursor-pointer active:scale-90"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Indicator dots */}
        <div className="hidden sm:flex items-center gap-2 bg-black/30 px-3 py-2 rounded-full border border-white/5">
          {slides.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 cursor-pointer ${
                activeIndex === index
                  ? "bg-yellow w-5"
                  : "bg-white/40 hover:bg-white"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
