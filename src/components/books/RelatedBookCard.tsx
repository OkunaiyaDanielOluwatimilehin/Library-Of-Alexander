import React from "react";
import { Link } from "react-router-dom";
import { Book, getBookSlug } from "../../types";

interface RelatedBookCardProps {
  key?: string | number;
  relatedBook: Book;
}

export function RelatedBookCard({ relatedBook }: RelatedBookCardProps): React.JSX.Element {
  const relatedSlug = getBookSlug(relatedBook);

  const hasReview = !!(relatedBook.reviewText && 
    relatedBook.reviewText.trim().length > 0 && 
    !relatedBook.reviewText.toLowerCase().includes("no review analysis is published yet") &&
    !relatedBook.reviewText.toLowerCase().includes("no review text") &&
    !relatedBook.reviewText.toLowerCase().includes("no secondary detailed review text"));

  const targetUrl = hasReview ? `/review/${relatedSlug}` : `/book/${relatedSlug}`;

  // Process genres, limited to maximum 3
  const genres = (typeof relatedBook.genre === "string" 
    ? relatedBook.genre 
    : Array.isArray(relatedBook.genre) 
      ? (relatedBook.genre as string[]).join(", ") 
      : String(relatedBook.genre || "General Literature")
  ).split(/[,;|]+/).map(g => g.trim()).filter(Boolean).slice(0, 3);

  // Cover background style (or fallback placeholder color)
  const coverBgStyle = relatedBook.cover_url 
    ? { backgroundImage: `url(${relatedBook.cover_url})` }
    : { backgroundColor: relatedBook.coverColor || "#1e1b18" };

  return (
    <Link 
      to={targetUrl} 
      className="bg-white border border-[#e6dfd5] hover:border-[#8a5b25] rounded-none shadow-sm hover:shadow-md transition-all duration-300 flex flex-row items-stretch select-none overflow-hidden h-[190px] w-full font-sans text-stone-900 hover:no-underline group"
    >
      {/* 40% Book Image / Cover part with linear gradient overlay to the right */}
      <div 
        className="w-[40%] bg-cover bg-center relative shrink-0 overflow-hidden" 
        style={coverBgStyle}
      >
        {/* Soft layout overlay gradient to blend into the rest (60% right content has white or soft cream bg) */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-white/5 to-white" />
        
        {/* Dynamic decorative Spine styling on the left to indicate a book binding */}
        <div className="absolute left-0 top-0 bottom-0 w-2.5 bg-black/35 border-r border-white/15 backdrop-blur-xs" />
      </div>

      {/* 60% Content / Metadata part */}
      <div className="w-[60%] p-4 flex flex-col justify-between text-left relative z-10 bg-white">
        <div className="space-y-1">
          {/* Top Genre list limit of 3 tags */}
          <div className="flex flex-wrap gap-1 mb-1">
            {genres.map((g, idx) => (
              <span 
                key={idx}
                className="font-mono text-[8px] tracking-wider uppercase font-extrabold bg-[#f5efe6] text-[#8a5b25] px-1.5 py-0.5"
              >
                {g}
              </span>
            ))}
          </div>

          <h4 className="font-serif text-sm font-black text-stone-900 group-hover:text-[#e07540] transition-colors uppercase tracking-tight leading-snug line-clamp-2">
            {relatedBook.title}
          </h4>
          <p className="text-[10px] sm:text-[11px] font-sans italic text-stone-500">
            by <span className="font-bold not-italic text-stone-700">{relatedBook.author}</span>
          </p>
        </div>

        <p className="text-[11px] sm:text-xs font-sans leading-relaxed text-stone-650 line-clamp-3 italic mt-1 pr-1">
          "{relatedBook.summary || relatedBook.description || "In-depth literary commentary is prepared for this volume."}"
        </p>
      </div>
    </Link>
  );
}

export default RelatedBookCard;
