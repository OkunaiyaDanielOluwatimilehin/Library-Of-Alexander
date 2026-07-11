import React, { useState } from "react";
import { Book } from "../../types";
import { Copy, Check, Sparkles, Star, Heart } from "lucide-react";
import { useReactions } from "../../hooks/useReactions";
import { BookCover } from "./BookCover";
import { useBookProgress } from "../../hooks/useBookProgress";

interface SocialPreviewCardProps {
  key?: string | number;
  book: Book;
}

export function SocialPreviewCard({ book }: SocialPreviewCardProps): React.JSX.Element {
  const [copied, setCopied] = useState(false);
  const reviewSlugOrId = book.slug || book.id;
  const hasReview = !!(book.reviewText && 
    book.reviewText.trim().length > 0 && 
    !book.reviewText.toLowerCase().includes("no review analysis is published yet") &&
    !book.reviewText.toLowerCase().includes("no review text") &&
    !book.reviewText.toLowerCase().includes("no secondary detailed review text"));
  const targetPath = hasReview ? "review" : "book";
  const shareUrl = `${window.location.origin}/${targetPath}/${reviewSlugOrId}`;
  const currentHost = window.location.host || "readershub.com";
  const { reactions } = useReactions(book.id, book.reactions);
  const { counts, userStatus, userRating, averageRating } = useBookProgress(book.id, book.rating);

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-stone-50 border border-stone-200 p-5 relative overflow-hidden select-none space-y-4 rounded-none shadow-sm">
      <div className="space-y-3.5 text-left">
        <span className="text-[10px] uppercase font-mono tracking-widest text-stone-500 font-extrabold flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-orange-500" /> Live Social Card Preview
        </span>
 
        {/* Mock Social Feed Window */}
        <div className="bg-white border border-[#e2e8f0] rounded-none overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col md:flex-row">
          <div className="md:w-36 overflow-hidden relative shrink-0 border-b md:border-b-0 md:border-r border-[#e2e8f0] bg-stone-50 p-3 flex items-center justify-center">
            <BookCover 
              title={book.title} 
              author={book.author} 
              genre={typeof book.genre === "string" ? book.genre : Array.isArray(book.genre) ? (book.genre as string[]).join(", ") : "Literature"}
              color={book.coverColor} 
              style={book.coverStyle} 
              cover_url={book.cover_url}
              size="sm"
              hideTextOverlay={false}
            />
          </div>
 
          {/* Social Details text box underneath */}
          <div className="p-4 space-y-1 bg-white flex-1 flex flex-col justify-center">
            <span className="text-[11px] font-mono text-stone-400 block tracking-tight lowercase truncate">
              {currentHost} › {targetPath} › {reviewSlugOrId}
            </span>
            <h1 className="font-sans font-extrabold text-base text-stone-800 leading-tight">
              {book.title} | Book Review, Discussion & Opinions
            </h1>
            <p className="font-sans text-stone-700 text-sm leading-relaxed max-w-2xl text-justify mt-1">
              {book.summary || book.description || "Read reader reviews, recommendations, and discuss the deeper impacts of the book on our social sharing page."}
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-2">
              {userRating !== null ? (
                <span className="text-[10px] font-mono text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded-none border border-amber-200 flex items-center gap-1">
                  ⭐ {userRating}/5 (Your Rating)
                </span>
              ) : (
                averageRating !== null && (
                  <span className="text-[10px] font-mono text-stone-500 font-bold bg-stone-100 px-2 py-0.5 rounded-none border border-stone-200 flex items-center gap-1">
                    ⭐ {averageRating}/5
                  </span>
                )
              )}
              {userStatus && (
                <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-none border border-emerald-200 flex items-center gap-1 font-bold">
                  📖 {userStatus} (Status)
                </span>
              )}
              <span className="text-[10px] font-mono text-stone-600 bg-stone-100 px-2.5 py-0.5 rounded-none border border-stone-200 flex items-center gap-1.5 font-bold">
                <span>To Read ({counts.want_to_read ?? 0})</span>
                <span>Reading ({counts.reading ?? 0})</span>
                <span>Done ({counts.completed ?? 0})</span>
              </span>
              <span className="text-[10px] font-mono text-stone-400 font-bold bg-stone-100 px-2 py-0.5 rounded-none border border-stone-200 flex items-center gap-1.5">
                <span>❤️ {reactions.love || book.reactions?.love || 0}</span>
                <span>👍 {reactions.like || book.reactions?.agree || 0}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SocialPreviewCard;
