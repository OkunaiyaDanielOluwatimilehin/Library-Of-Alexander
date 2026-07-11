import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Book, getBookSlug } from "../../types";
import { BookCover } from "./BookCover";
import { useReactions } from "../../hooks/useReactions";
import { useComments } from "../../hooks/useComments";
import { useBookProgress } from "../../hooks/useBookProgress";
import { Bookmark, BookOpen, Check } from "lucide-react";

interface BookCardProps {
  key?: string | number;
  review: Book;
  onSelect?: () => void;
  numberBadge?: number;
  viewMode?: "grid" | "list";
  style?: React.CSSProperties;
  className?: string;
  customCoverStyle?: React.CSSProperties;
  customCoverImgStyle?: React.CSSProperties;
  minimalGrid?: boolean;
}

export function BookCard({ 
  review, 
  onSelect, 
  numberBadge, 
  viewMode, 
  style, 
  className,
  customCoverStyle,
  customCoverImgStyle,
  minimalGrid
}: BookCardProps): React.JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  const { reactions, react } = useReactions(review.id, review.reactions);
  const { comments } = useComments(review.id);

  const commentsCount = comments.length;
  const isFromGenre = location.pathname.startsWith("/genre");
  const linkState = isFromGenre ? { from: "categories" } : undefined;
  const reviewSlug = getBookSlug(review);

  // Dynamic color matching based on actual BookCover color definition
  const coverColor = review.coverColor || "burgundy";
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

  const currentStyles = stylesMap[coverColor] || stylesMap.burgundy;

  // Footnotes / stats line
  const hasReview = !!(review.reviewText && 
    review.reviewText.trim().length > 0 && 
    !review.reviewText.toLowerCase().includes("no review analysis is published yet") &&
    !review.reviewText.toLowerCase().includes("no review text") &&
    !review.reviewText.toLowerCase().includes("no secondary detailed review text"));

  const isCardReview = hasReview || !!review.is_series_review;

  const { counts, userStatus, setProgress, averageRating } = useBookProgress(
    review.id, 
    isCardReview ? review.rating : undefined
  );

  const targetUrl = hasReview ? `/review/${reviewSlug}` : `/book/${reviewSlug}`;

  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.closest("button") || target.closest("a") || target.closest("input")) {
      return;
    }
    navigate(targetUrl, { state: linkState });
  };

  const isGrid = viewMode === "grid";

  return (
    <div
      onClick={handleCardClick}
      className={isGrid 
        ? `relative group bg-slate-950 border border-slate-800 transition-all duration-350 hover:shadow-2xl hover:shadow-black/60 rounded-none cursor-pointer flex flex-col justify-end w-[100px] h-[150px] sm:w-[130px] sm:h-[195px] ${className || ""}`
        : `relative group bg-slate-950 border transition-all duration-350 hover:shadow-2xl hover:shadow-black/40 flex flex-col sm:flex-row p-5 sm:p-6 gap-5 items-center sm:items-stretch cursor-pointer text-left focus-within:ring-2 ${currentStyles.border} ${currentStyles.hoverBorder} ${currentStyles.ring} ${className || ""}`
      }
      style={{
        ...style,
        width: isGrid ? undefined : "auto",
        height: isGrid ? undefined : "auto",
      }}
    >
      {/* Number Badge Indicator */}
      {numberBadge && (
        <div className={`absolute -top-9 sm:-top-11 left-2 sm:left-4 z-30 bg-yellow text-slate-950 font-mono text-xs sm:text-sm font-black px-3 py-1.5 sm:px-4 sm:py-2 shadow-2xl border-2 border-slate-900 flex items-center gap-1.5 uppercase select-none ${
          numberBadge >= 2 && numberBadge <= 5 ? "scale-110 sm:scale-120 border-amber-400 shadow-amber-500/30" : "scale-100 sm:scale-105"
        }`}>
          <span className="opacity-80 tracking-wider">RANK</span>
          <span className="text-xs sm:text-sm text-yellow bg-slate-950 px-2 py-0.5 ml-0.5 rounded-none font-bold">#{numberBadge}</span>
        </div>
      )}

      {isGrid ? (
        <>
          {/* Full Cover background */}
          <div className="absolute inset-0 w-full h-full z-0 select-none pointer-events-none">
            <BookCover
              title={review.title}
              author={review.author}
              genre={review.genre}
              color={review.coverColor}
              style={review.coverStyle}
              size="full"
              cover_url={review.cover_url}
              hideTextOverlay={true}
              customStyle={{
                width: "100%",
                height: "100%",
                borderStyle: "none",
                backgroundColor: "transparent",
                ...customCoverStyle
              }}
              customImgStyle={{
                width: "100%",
                height: "100%",
                borderStyle: "none",
                backgroundColor: "transparent",
                ...customCoverImgStyle
              }}
            />
          </div>

          {/* Gradient Overlay */}
          {!minimalGrid && (
            <div className="absolute inset-x-0 bottom-0 h-4/5 bg-gradient-to-t from-slate-950 via-slate-950/85 to-transparent z-10 pointer-events-none" />
          )}

          {/* Title and Author Overlay details */}
          {!minimalGrid && (
            <div className="relative z-20 p-2 sm:p-2.5 flex flex-col justify-end w-full text-left space-y-0.5">
              <span className="text-[7px] sm:text-[8px] font-mono tracking-wider text-[#4ecdc4] uppercase font-black">
                {(typeof review.genre === "string" ? review.genre : Array.isArray(review.genre) ? (review.genre as string[]).join(", ") : String(review.genre || "Fiction")).split(/[,;|]+/)[0].trim()}
              </span>
              <h3 className="font-sans font-black text-[9px] sm:text-[11px] text-stone-100 uppercase tracking-tight line-clamp-2 leading-tight group-hover:text-yellow transition-colors">
                {review.title}
              </h3>
              <span className="text-[8px] sm:text-[9.5px] text-stone-200 font-bold block tracking-tight truncate leading-none mt-0.5">
                {review.author}
              </span>
            </div>
          )}
        </>
      ) : (
        <>
          {/* Cover Image or Procedural Cover - set to full-height of the parent card */}
          <div className="shrink-0 flex items-center justify-center sm:self-stretch sm:flex sm:items-stretch">
            <Link to={targetUrl} state={linkState} className="block select-none pointer-events-auto sm:h-full">
              <BookCover
                title={review.title}
                author={review.author}
                genre={review.genre}
                color={review.coverColor}
                style={review.coverStyle}
                size="full"
                cover_url={review.cover_url}
                hideTextOverlay={true}
                customStyle={{
                  width: "160px",
                  height: "240px",
                  borderStyle: "none",
                  backgroundColor: "transparent",
                  ...customCoverStyle
                }}
                customImgStyle={{
                  width: "160px",
                  height: "240px",
                  borderStyle: "none",
                  backgroundColor: "transparent",
                  ...customCoverImgStyle
                }}
              />
            </Link>
          </div>

          {/* Description / metadata details */}
          <div 
            className="flex-1 flex flex-col justify-between min-w-0 md:pt-1"
            style={{
              paddingTop: "0px",
              height: "auto",
            }}
          >
            <div className="space-y-2 w-full" style={{ paddingTop: "0px" }}>
              {/* Genre Tag + Title & Author */}
              <div className="space-y-1 w-full text-left bg-slate-900/30 border border-slate-900/50 p-4 rounded-lg">
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {(typeof review.genre === "string" ? review.genre : Array.isArray(review.genre) ? (review.genre as string[]).join(", ") : String(review.genre || "General Literature")).split(/[,;|]+/).map((g: string) => g.trim()).filter(Boolean).slice(0, 3).map((g: string, idx: number) => (
                    <span key={idx} className="text-[9px] font-mono tracking-widest text-[#4ecdc4] uppercase font-black bg-slate-950/80 border border-[#4ecdc4]/20 px-2.5 py-0.5 rounded-none">
                      {g}
                    </span>
                  ))}
                  {review.bookNumber && (
                    <span className="text-[9px] font-mono tracking-widest text-amber-400 uppercase font-black bg-slate-950/80 border border-amber-400/20 px-2.5 py-0.5 rounded-none">
                      Vol. {review.bookNumber}
                    </span>
                  )}
                </div>
                <h3 
                  className="font-display font-black text-white group-hover:text-yellow transition-colors tracking-tight uppercase line-clamp-1 text-xl sm:text-2xl mt-1.5"
                  style={{
                    fontSize: "26px",
                    lineHeight: "30px",
                    marginBottom: "12px",
                    marginTop: "12px",
                  }}
                >
                  {review.title}
                </h3>
                <p 
                  className="text-xs text-white/75 font-sans italic w-full truncate"
                  style={{
                    fontSize: "14px",
                    marginBottom: "0px",
                    paddingTop: "0px",
                    paddingBottom: "0px",
                  }}
                >
                  by{" "}
                  <span 
                    className="font-bold not-italic text-white"
                    style={{
                      fontSize: "14px",
                      marginBottom: "0px",
                      paddingBottom: "0px",
                    }}
                  >
                    {review.author}
                  </span>
                </p>
              </div>

              {(() => {
                const rawText = review.summary || (review as any).synopsis || "";
                const maxLength = 120;
                const shouldTruncate = rawText.length > maxLength;
                const truncatedText = shouldTruncate ? rawText.slice(0, maxLength).trim() + "..." : rawText;
                return (
                  <p 
                    className="text-xs text-white/80 font-sans leading-relaxed font-normal pt-0.5"
                    style={{
                      fontSize: "15px",
                      lineHeight: "21px",
                      paddingTop: "2px",
                      paddingBottom: "2px",
                      marginBottom: "16px",
                      height: "auto",
                      overflow: "hidden"
                    }}
                  >
                    {truncatedText}{" "}
                    <Link to={targetUrl} state={linkState} className="text-[#4ecdc4] hover:text-yellow font-mono text-[11px] font-bold uppercase tracking-wider whitespace-nowrap cursor-pointer inline-flex items-center gap-1 mt-1 ml-1">
                      Read more &rarr;
                    </Link>
                  </p>
                );
              })()}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
export default BookCard;

