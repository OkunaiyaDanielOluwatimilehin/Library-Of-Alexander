import React from "react";
import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import { Book, getBookSlug } from "../../types";

interface ReviewCardProps {
  key?: string | number;
  book: Book;
}

export function ReviewCard({ book }: ReviewCardProps): React.JSX.Element {
  const userRatingStr = localStorage.getItem(`scriptorium_user_rating_${book.id}`);
  const savedStats = localStorage.getItem(`rating_stats_${book.id}`);
  let displayRating: number | null = null;
  if (savedStats) {
    try {
      const parsed = JSON.parse(savedStats);
      if (parsed?.avg !== null && parsed?.avg !== undefined) {
        displayRating = Math.round(parsed.avg);
      }
    } catch (_) {}
  }
  if (displayRating === null && userRatingStr !== null) {
    displayRating = Number(userRatingStr);
  }

  const hasReview = !!(book.reviewText && 
    book.reviewText.trim().length > 0 && 
    !book.reviewText.toLowerCase().includes("no review analysis is published yet") &&
    !book.reviewText.toLowerCase().includes("no review text") &&
    !book.reviewText.toLowerCase().includes("no secondary detailed review text"));
  const targetUrl = hasReview ? `/review/${getBookSlug(book)}` : `/book/${getBookSlug(book)}`;

  return (
    <div className="bg-white border border-[#e5e1d8] rounded-3xl p-6 shadow-xs flex flex-col justify-between hover:shadow-md transition-all duration-300">
      <div className="space-y-4">
        <div className="flex flex-wrap justify-between items-center gap-2">
          <div className="flex flex-wrap gap-1">
            {(typeof book.genre === "string" ? book.genre : Array.isArray(book.genre) ? (book.genre as string[]).join(", ") : String(book.genre || "General Literature")).split(/[,;|]+/).map((g: string) => g.trim()).filter(Boolean).map((g: string, idx: number) => (
              <span key={idx} className="text-[9px] font-mono uppercase bg-amber-50 border border-amber-100 text-amber-800 px-2 py-0.5 rounded">
                {g}
              </span>
            ))}
          </div>
          {displayRating !== null && (
            <div className="flex text-amber-500 text-xs">
              {Array.from({ length: displayRating }).map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-current" />
              ))}
            </div>
          )}
        </div>

        <blockquote className="font-serif text-sm text-neutral-800 leading-relaxed italic border-l-2 border-amber-800/30 pl-3">
          "{book.summary}"{" "}
          <Link to={targetUrl} className="text-amber-800 hover:text-amber-950 font-bold whitespace-nowrap text-xs ml-1">
            Read summary...
          </Link>
        </blockquote>

        <p className="font-serif text-xs text-neutral-500 line-clamp-4 leading-relaxed">
          {book.reviewText}{" "}
          <Link to={targetUrl} className="text-amber-800 hover:text-amber-950 font-bold whitespace-nowrap ml-1">
            Read more...
          </Link>
        </p>
      </div>

      <div className="mt-6 pt-4 border-t border-neutral-100 flex justify-between items-center">
        <div>
          <h5 className="font-serif text-sm font-bold text-neutral-900 line-clamp-1">{book.title}</h5>
          <p className="text-[10px] text-neutral-400 font-mono italic">by {book.author}</p>
        </div>
        <Link
          to={targetUrl}
          className="text-[10px] font-mono font-bold uppercase tracking-wide text-amber-800 hover:text-amber-950"
        >
          Explore →
        </Link>
      </div>
    </div>
  );
}
export default ReviewCard;
