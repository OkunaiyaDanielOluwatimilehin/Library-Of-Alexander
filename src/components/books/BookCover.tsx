import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { BookCoverColor, BookCoverStyle } from "../../types";

interface BookCoverProps {
  title: string;
  author: string;
  genre?: string;
  color: BookCoverColor;
  style: BookCoverStyle;
  size?: "sm" | "md" | "md-lg" | "lg" | "full";
  cover_url?: string;
  hideTextOverlay?: boolean;
  customImgStyle?: React.CSSProperties;
  customStyle?: React.CSSProperties;
}

export function BookCover({
  title,
  author,
  genre = "Literature",
  color,
  style,
  size = "md",
  cover_url,
  hideTextOverlay = false,
  customImgStyle,
  customStyle,
}: BookCoverProps) {
  const colorMap: Record<BookCoverColor, { bg: string; text: string; border: string; highlight: string }> = {
    burgundy: {
      bg: "bg-[#4a151b]",
      text: "text-[#f3e9dc]",
      border: "border-[#d4af37]",
      highlight: "bg-[#641a22]",
    },
    emerald: {
      bg: "bg-[#0f3425]",
      text: "text-[#d4af37]",
      border: "border-[#d4af37]",
      highlight: "bg-[#164a35]",
    },
    navy: {
      bg: "bg-[#0f1d30]",
      text: "text-[#e9f1f7]",
      border: "border-[#b0c4de]",
      highlight: "bg-[#172b46]",
    },
    saffron: {
      bg: "bg-[#bd832a]",
      text: "text-[#1e1301]",
      border: "border-[#5c3e03]",
      highlight: "bg-[#d09438]",
    },
    obsidian: {
      bg: "bg-[#111111]",
      text: "text-[#dfbe6b]",
      border: "border-[#dfbe6b]",
      highlight: "bg-[#222222]",
    },
    russet: {
      bg: "bg-[#713f2a]",
      text: "text-[#f9f2e7]",
      border: "border-[#d4af37]",
      highlight: "bg-[#8c4f35]",
    },
  };

  const selectedColor = colorMap[color] || colorMap.burgundy;

  const sizeClasses: Record<NonNullable<BookCoverProps["size"]>, string> = {
    sm: "w-28 h-40 text-xs shadow-md",
    md: "w-44 h-64 text-sm shadow-xl",
    "md-lg": "w-56 h-80 sm:w-64 sm:h-96 text-base shadow-2xl",
    lg: "w-72 sm:w-80 h-104 sm:h-112 text-lg shadow-2xl",
    full: "w-full h-full text-xs shadow-md",
  };

  const imageUrls = typeof cover_url === "string"
    ? cover_url.split(/[,;|]+/).map((url) => url.trim()).filter((url) => url.length > 0 && url !== "null" && url !== "undefined")
    : Array.isArray(cover_url as any)
    ? (cover_url as any as string[]).filter((url) => typeof url === "string" && url.trim().length > 0)
    : cover_url
    ? [cover_url]
    : [];

  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  // Automatic automatic carousel rotation
  useEffect(() => {
    if (imageUrls.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentImgIndex((prev) => (prev === imageUrls.length - 1 ? 0 : prev + 1));
    }, 4500); // cycle every 4.5s
    return () => clearInterval(interval);
  }, [imageUrls.length]);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setCurrentImgIndex((prev) => (prev === 0 ? imageUrls.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setCurrentImgIndex((prev) => (prev === imageUrls.length - 1 ? 0 : prev + 1));
  };

  if (imageUrls.length > 0) {
    const hasTransparentBg = customStyle?.backgroundColor === "transparent";
    return (
      <div
        className={`relative rounded-none overflow-hidden transition-transform duration-500 ease-out flex flex-col justify-end ${hideTextOverlay ? "p-0" : "p-4"} cursor-pointer hover:shadow-2xl hover:-translate-y-1 ${sizeClasses[size]} border-l-8 border-black/40 bg-transparent group`}
        style={{
          boxShadow: "5px 5px 15px rgba(0,0,0,0.3)",
          ...customStyle,
        }}
      >
        <img
          src={imageUrls[currentImgIndex]}
          alt={`${title} - Cover ${currentImgIndex + 1}`}
          className="absolute inset-0 w-full h-full object-cover grayscale-35 group-hover:grayscale-0 transition-all duration-300"
          referrerPolicy="no-referrer"
          style={customImgStyle}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/15" />

        {/* Info overlay on top of background image */}
        {!hideTextOverlay && (
          <div className="relative z-10 flex flex-col justify-end h-full text-left space-y-1 pointer-events-none mb-2">
            <span className="text-[10px] uppercase tracking-widest text-orange-400 font-bold font-mono">
              {genre}
            </span>
            <h3 className="font-serif font-black text-xs sm:text-sm text-stone-100 leading-tight uppercase group-hover:text-amber-400 transition-colors">
              {title}
            </h3>
            <p className="font-serif italic text-[10px] sm:text-xs text-stone-300">
              by {author}
            </p>
          </div>
        )}

        {/* Carousel controls shown if there are multiple images */}
        {imageUrls.length > 1 && (
          <>
            {/* Left arrow */}
            <button
              onClick={handlePrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/60 hover:bg-orange-500 hover:text-black hover:scale-105 text-white flex items-center justify-center transition-all cursor-pointer opacity-80 hover:opacity-100 border border-white/10 z-25"
              aria-label="Previous image"
              title="Previous cover image"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Right arrow */}
            <button
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/60 hover:bg-orange-500 hover:text-black hover:scale-105 text-white flex items-center justify-center transition-all cursor-pointer opacity-80 hover:opacity-100 border border-white/10 z-25"
              aria-label="Next image"
              title="Next cover image"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Pagination Dots */}
            <div className="absolute bottom-2.5 left-0 right-0 flex justify-center gap-1.5 z-25">
              {imageUrls.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setCurrentImgIndex(idx);
                  }}
                  className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                    idx === currentImgIndex ? "bg-orange-500 w-4" : "bg-white/40 hover:bg-white"
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div
      className={`relative rounded-none overflow-hidden preserve-3d transition-transform duration-500 ease-out flex flex-col justify-between p-4 cursor-pointer hover:shadow-2xl hover:-translate-y-1 ${sizeClasses[size]} ${selectedColor.bg} ${selectedColor.text} border-l-8 border-black/40`}
      style={{
        boxShadow: "5px 5px 15px rgba(0,0,0,0.3), inset 2px 0 0 rgba(255,255,255,0.1), inset -2px -2px 10px rgba(0,0,0,0.3)",
        ...customStyle,
      }}
    >
      <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-r from-black/30 via-transparent to-white/10" />

      <div className="absolute inset-0 opacity-[0.04] mix-blend-overlay bg-repeat pointer-events-none" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />

      {style === "classic" && (
        <div className={`absolute inset-2 border-2 ${selectedColor.border} opacity-80 pointer-events-none`} />
      )}

      {style === "vintage" && (
        <>
          <div className={`absolute inset-2 border ${selectedColor.border} opacity-80 pointer-events-none`} />
          <div className={`absolute inset-3 border-2 ${selectedColor.border} opacity-50 pointer-events-none`} />
        </>
      )}

      {style === "ornate" && (
        <div className={`absolute inset-2.5 border-2 ${selectedColor.border} opacity-80 pointer-events-none rounded-sm`}>
          <div className={`absolute -top-1 -left-1 w-2.5 h-2.5 border-r border-b ${selectedColor.border}`} />
          <div className={`absolute -top-1 -right-1 w-2.5 h-2.5 border-l border-b ${selectedColor.border}`} />
          <div className={`absolute -bottom-1 -left-1 w-2.5 h-2.5 border-r border-t ${selectedColor.border}`} />
          <div className={`absolute -bottom-1 -right-1 w-2.5 h-2.5 border-l border-t ${selectedColor.border}`} />
        </div>
      )}

      <div className="relative z-10 flex flex-col items-center text-center mt-2">
        <span className="text-[10px] uppercase tracking-widest opacity-60 font-mono mb-2">
          {genre}
        </span>
        <h3 className={`font-serif font-bold tracking-tight leading-tight ${size === "sm" ? "text-xs mt-1" : size === "lg" ? "text-xl mt-4" : "text-base mt-2"}`}>
          {title}
        </h3>
      </div>

      <div className="relative z-10 flex justify-center py-2 opacity-80">
        {style === "ornate" || style === "vintage" ? (
          <div className={`w-8 h-8 rounded-full border-2 ${selectedColor.border} flex items-center justify-center`}>
            <span className="text-xs font-serif italic">A</span>
          </div>
        ) : style === "classic" ? (
          <div className={`w-6 h-6 border ${selectedColor.border} rotate-45 flex items-center justify-center`}>
            <div className={`w-3 h-3 bg-current rotate-45 opacity-60`} />
          </div>
        ) : (
          <div className={`w-1.5 h-8 bg-current opacity-40 rounded-full`} />
        )}
      </div>

      <div className="relative z-10 flex flex-col items-center text-center mb-2">
        <div className={`w-10 h-[1px] bg-current opacity-30 mb-2`} />
        <span className="font-serif italic text-[11px] opacity-80">
          {author}
        </span>
      </div>
    </div>
  );
}
export default BookCover;
