import React from "react";
import { Link } from "react-router-dom";
import { Star, Layers } from "lucide-react";
import { Book, SeriesBook, getBookSlug } from "../../types";
import { BookCover } from "./BookCover";

interface SeriesCollectionProps {
  seriesBooks: (string | SeriesBook)[];
  seriesTitle?: string;
  allBooks: Book[];
  parentBookTitle?: string;
}

export function SeriesCollection({
  seriesBooks,
  seriesTitle,
  allBooks,
  parentBookTitle
}: SeriesCollectionProps) {
  if (!seriesBooks || seriesBooks.length === 0) {
    return null;
  }

  return (
    <div className="p-6 bg-stone-50 border border-stone-200 mt-10 space-y-5 rounded-none">
      <div className="border-b border-stone-200 pb-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
        <div>
          <h5 className="text-[10px] uppercase font-mono tracking-widest font-black text-[#be8873] flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[#e07540]" />
            Volumes in {seriesTitle ? `"${seriesTitle}"` : "this Series"}
          </h5>
          <p className="text-[11px] font-sans text-stone-500 mt-1">
            Check out the compiled series catalog of standalone individual cover editions and critiques.
          </p>
        </div>
        <span className="shrink-0 text-[10px] font-mono font-bold bg-stone-200 text-stone-700 px-2 py-0.5 rounded-none uppercase">
          {seriesBooks.length} {seriesBooks.length === 1 ? "Volume" : "Volumes"}
        </span>
      </div>

      {/* Horizontal horizontal-scrolling row of beautiful book preview cards */}
      <div className="flex flex-row overflow-x-auto pb-4 gap-5 scrollbar-thin scrollbar-thumb-stone-300 scrollbar-track-transparent">
        {seriesBooks.map((item, idx) => {
          const isString = typeof item === "string";
          const bookTitle = isString ? item : item.title;
          const bookAuthor = isString ? undefined : item.author;
          const bookRating = isString ? undefined : item.rating;
          const bookSynopsis = isString ? undefined : item.synopsis;
          const bookCoverUrl = isString ? undefined : item.coverUrl;
          const hasCmsReview = isString ? false : !!item.hasReview;
          const itemBookNumber = isString ? undefined : item.bookNumber;
          const bookGenre = isString ? undefined : item.genre;

          // Find if this book exists in our system catalog
          const matchedBook = (() => {
            if (!allBooks) return null;
            const clean = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
            const target = clean(bookTitle);
            
            // Link matches
            let matched = allBooks.find(b => clean(b.title) === target || (b.slug && clean(b.slug) === target));
            if (matched) return matched;
            
            // Substring matches
            matched = allBooks.find(b => {
              const bTitle = clean(b.title);
              return bTitle.includes(target) || target.includes(bTitle);
            });
            return matched || null;
          })();

          const bookCoverToShow = bookCoverUrl || matchedBook?.cover_url;
          
          const hasReview = !!(matchedBook && matchedBook.reviewText && 
            matchedBook.reviewText.trim().length > 0 && 
            !matchedBook.reviewText.toLowerCase().includes("no review analysis is published yet") &&
            !matchedBook.reviewText.toLowerCase().includes("no review text") &&
            !matchedBook.reviewText.toLowerCase().includes("no secondary detailed review text"));

          const targetUrl = matchedBook ? (hasReview ? `/review/${getBookSlug(matchedBook)}` : `/book/${getBookSlug(matchedBook)}`) : "";

          const bookNumberVal = itemBookNumber || matchedBook?.bookNumber;
          const bookNumberLabel = bookNumberVal 
            ? (typeof bookNumberVal === "number" || !isNaN(Number(bookNumberVal)) ? `Vol. ${bookNumberVal}` : String(bookNumberVal))
            : `Vol. ${idx + 1}`;

          return (
            <div 
              key={idx} 
              className="bg-white border border-stone-200/80 hover:border-[#e07540]/60 p-4 shadow-sm hover:shadow-md transition-all duration-300 w-64 shrink-0 flex flex-col justify-between group rounded-none font-sans"
            >
              <div className="space-y-3">
                {/* 1. Show the image directly */}
                <div className="flex justify-center">
                  <div className="w-24 h-36 shrink-0 shadow-xs border border-stone-200 bg-stone-100 overflow-hidden relative select-none transform group-hover:scale-[1.02] transition-transform duration-300">
                    {bookCoverToShow ? (
                      <img 
                        src={bookCoverToShow} 
                        alt={bookTitle} 
                        className="w-full h-full object-cover grayscale-[10%] group-hover:grayscale-0 transition-all duration-300"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <BookCover
                        title={bookTitle}
                        author={bookAuthor || matchedBook?.author || "Unknown Scholar"}
                        genre={bookGenre || matchedBook?.genre}
                        color={matchedBook?.coverColor || "burgundy"}
                        style={matchedBook?.coverStyle || "classic"}
                        size="full"
                        hideTextOverlay={true}
                      />
                    )}
                  </div>
                </div>

                {/* 2. Rating & Volume Label Badge row */}
                <div className="flex items-center justify-between gap-1.5 border-b border-stone-100 pb-2">
                  <span className="text-[9px] font-mono font-black bg-stone-100 text-stone-600 px-1.5 py-0.5 uppercase tracking-wider rounded-none">
                    {bookNumberLabel}
                  </span>
                </div>

                {/* 3. Title & Author */}
                <div className="space-y-1 text-left">
                  <h4 className="font-serif font-black text-xs text-stone-950 uppercase tracking-tight line-clamp-2 leading-tight group-hover:text-[#e07540] transition-colors">
                    {bookTitle}
                  </h4>
                  <p className="text-[10px] font-mono text-stone-400 uppercase tracking-wider">
                    by{" "}
                    {(bookAuthor || matchedBook?.author) ? (
                      <span className="font-bold normal-case text-stone-605 inline">
                        {bookAuthor || matchedBook?.author}
                      </span>
                    ) : (
                      <span className="font-bold">Scholar Team</span>
                    )}
                  </p>
                </div>

                {/* 4. Description Excerpt */}
                <p className="text-[11px] text-[#706a60] leading-relaxed font-sans italic text-left">
                  "{(bookSynopsis || matchedBook?.summary || matchedBook?.description || "This installment presents critical commentaries and standalone catalog notes under curation.").substring(0, 55)}..."
                </p>
              </div>

              {/* 5. Read study/critique action trigger */}
              {matchedBook && (
                <Link
                  to={targetUrl}
                  className="pt-2.5 border-t border-stone-100 mt-2.5 text-[#e07540] hover:text-amber-800 font-extrabold tracking-wider uppercase transition-colors text-[10px] font-mono text-left block"
                >
                  {hasReview ? "Read Study →" : "Read Info →"}
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
