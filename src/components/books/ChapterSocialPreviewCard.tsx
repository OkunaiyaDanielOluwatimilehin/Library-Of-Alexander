import React, { useState } from "react";
import { OriginalBook, Chapter } from "../../hooks/useOriginalBooks";
import { Copy, Check, Sparkles, Clock, Calendar, BookOpen } from "lucide-react";
import { BookCover } from "./BookCover";

interface ChapterSocialPreviewCardProps {
  book: OriginalBook;
  chapter: any; // Using any or Chapter to avoid strict interface mismatches
  chapterIndex: number;
}

export function ChapterSocialPreviewCard({ book, chapter, chapterIndex }: ChapterSocialPreviewCardProps): React.JSX.Element {
  const [copied, setCopied] = useState(false);
  const chNumber = chapterIndex + 1;
  const shareUrl = `${window.location.origin}/original-book/${book.slug || book.id}?chapter=${chNumber}`;
  const currentHost = window.location.host || "readershub.com";

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getExcerpt = (text: string) => {
    if (!text) return "Read details, critiques and deep dive commentary for this release.";
    const plain = text.replace(/[\n\r]+/g, " ").trim();
    if (plain.length <= 150) return plain;
    return `${plain.slice(0, 150)}...`;
  };

  return (
    <div className="bg-stone-50 border border-stone-200 p-5 relative overflow-hidden select-none space-y-4 rounded-none shadow-sm">
      <div className="absolute top-0 right-0 p-1 font-mono text-[8px] bg-stone-100 border-l border-b border-stone-200 text-stone-500 uppercase tracking-widest pointer-events-none rounded-none">
        Link Preview
      </div>
      
      <div className="space-y-3.5 text-left">
        <span className="text-[10px] uppercase font-mono tracking-widest text-[#be8873] font-black flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-orange-500" /> Live Social Card Preview
        </span>
 
        {/* Mock Social Feed Window */}
        <div className="bg-white border border-[#e2e8f0] rounded-none overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col md:flex-row">
          {/* Cover image area */}
          <div className="md:w-36 overflow-hidden relative shrink-0 border-b md:border-b-0 md:border-r border-[#e2e8f0] bg-stone-50 p-3 flex items-center justify-center">
            {book.cover_url ? (
              <img 
                src={book.cover_url} 
                alt={book.title} 
                className="w-24 h-36 object-cover border border-stone-200/80 shadow-xs"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-24 h-36 bg-stone-900 flex flex-col justify-between p-2.5 text-center text-white border border-stone-700">
                <span className="text-[7.5px] font-mono uppercase text-orange-400 tracking-widest block truncate">{book.genre}</span>
                <span className="font-serif font-black text-[10px] leading-tight uppercase block line-clamp-3 my-auto">{book.title}</span>
                <span className="text-[7.5px] font-mono text-stone-400 block truncate">By {book.author}</span>
              </div>
            )}
          </div>
 
          {/* Social Details text box */}
          <div className="p-4 space-y-1 bg-white flex-1 flex flex-col justify-center">
            <span className="text-[11px] font-mono text-stone-400 block tracking-tight lowercase truncate">
              {currentHost} › original-book › {book.slug || book.id} › ch-{chNumber}
            </span>
            <h1 className="font-sans font-extrabold text-sm sm:text-base text-stone-800 leading-tight">
              Chapter {chNumber}: {chapter?.title || `Untitled Section`} | {book.title}
            </h1>
            <p className="font-serif text-xs text-stone-500 line-clamp-3 leading-relaxed mt-1">
              "{getExcerpt(chapter?.content)}"
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <span className="text-[10px] font-mono text-orange-700 font-extrabold bg-orange-50 px-2 py-0.5 rounded-none border border-orange-200 flex items-center gap-1">
                <BookOpen className="w-3 h-3 text-orange-500" /> Chapter {chNumber} of {book.chapters?.length || 1}
              </span>
              <span className="text-[10px] font-mono text-stone-500 font-bold bg-stone-100 px-2 py-0.5 rounded-none border border-stone-200 flex items-center gap-1">
                <Clock className="w-3 h-3 text-stone-400" /> {Math.max(1, Math.ceil((chapter?.content || "").split(/\s+/).filter(Boolean).length / 200))} min read
              </span>
            </div>
          </div>
        </div>

        {/* Share URl Copy Block */}
        <div className="space-y-1.5 pt-1">
          <label className="text-[9px] font-mono uppercase tracking-widest text-stone-500 font-extrabold block">
            Direct Shareable URL:
          </label>
          <div className="flex bg-white border border-stone-250 font-mono text-xs text-stone-800 rounded-none overflow-hidden shadow-xs">
            <input 
              type="text"
              readOnly
              value={shareUrl}
              className="p-2.5 truncate flex-1 text-stone-500 select-all outline-none bg-stone-50/50"
            />
            <button
              onClick={handleCopy}
              className="px-4 bg-stone-900 text-orange-400 hover:bg-orange-500 hover:text-stone-950 font-extrabold text-[10px] uppercase font-mono tracking-widest transition-colors flex items-center gap-1.5 cursor-pointer border-l border-stone-200"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-green-400 shrink-0" /> Copied
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 shrink-0" /> Copy Link
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChapterSocialPreviewCard;
