import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Layout } from "../components/layout/Layout";
import { motion } from "motion/react";
import { ChevronLeft, BookOpen } from "lucide-react";
import BookGrid from "../components/books/BookGrid";
import { useTopPicks } from "../hooks/useTopPicks";
import { useBottomShelf } from "../hooks/useBottomShelf";
import { useDiscovery } from "../hooks/useDiscovery";
import { getBookSlug } from "../types";

export default function CategoryDetail() {
  const { id } = useParams<{ id: string }>();
  const { topPicks } = useTopPicks();
  const { bottomShelf } = useBottomShelf();
  const { discoveryBooks } = useDiscovery();
  const [category, setCategory] = useState<{ id: string; title: string; books: any[] } | null>(null);
  const [loading, setLoading] = useState(true);

  const bookHasReview = (b: any): boolean => {
    return !!(b.reviewText && 
      b.reviewText.trim().length > 0 && 
      !b.reviewText.toLowerCase().includes("no review analysis is published yet") &&
      !b.reviewText.toLowerCase().includes("no review text") &&
      !b.reviewText.toLowerCase().includes("no secondary detailed review text"));
  };

  useEffect(() => {
    if (id === "top-picks") {
      const sortedPicks = [...topPicks].sort((a: any, b: any) => {
        const aOrder = a.top_pick_order ?? a.topPickOrder ?? a.rank ?? 999;
        const bOrder = b.top_pick_order ?? b.topPickOrder ?? b.rank ?? 999;
        return Number(aOrder) - Number(bOrder);
      });
      setCategory({
        id: "top-picks",
        title: "Top Picks",
        books: sortedPicks
      });
      setLoading(false);
      return;
    }
    if (id === "bottom-shelf") {
      setCategory({
        id: "bottom-shelf",
        title: "Bottom Shelf",
        books: bottomShelf
      });
      setLoading(false);
      return;
    }
    if (id === "discovery") {
      setCategory({
        id: "discovery",
        title: "Discovery",
        books: discoveryBooks
      });
      setLoading(false);
      return;
    }

    let active = true;
    const fetchCategoryDetail = async () => {
      try {
        const response = await fetch("/api/cms/categories");
        if (response.ok) {
          const json = await response.json();
          if (active && json.data) {
            const matched = json.data.find((c: any) => c.id === id);
            if (matched) {
              setCategory(matched);
            }
          }
        }
      } catch (err) {
        console.warn("Failed to fetch category detail:", err);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchCategoryDetail();
    return () => { active = false; };
  }, [id, topPicks, bottomShelf, discoveryBooks]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
  };

  return (
    <Layout>
      <main className="min-h-screen bg-stone-50/30 text-stone-900 pb-20 pt-6 sm:pt-12 w-full">
        <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-12 md:px-16 lg:px-20 space-y-8">
          
          {/* Breadcrumb & Navigation */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 pb-4">
            <Link
              to="/genre"
              className="inline-flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-wider text-stone-500 hover:text-stone-950 transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Back to Categories
            </Link>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 space-y-3">
              <div className="w-8 h-8 rounded-full border-2 border-stone-200 border-t-stone-800 animate-spin" />
              <span className="font-mono text-xs uppercase tracking-wider text-stone-500">Loading Collection...</span>
            </div>
          ) : !category ? (
            <div className="text-center py-24 space-y-4">
              <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center mx-auto text-stone-400">
                <BookOpen className="w-6 h-6" />
              </div>
              <h2 className="font-serif text-2xl font-bold text-stone-800">Category Not Found</h2>
              <p className="text-sm font-sans text-stone-500 max-w-md mx-auto">
                We could not locate this category space. It may have been removed or contains no active titles.
              </p>
              <div className="pt-2">
                <Link
                  to="/genre"
                  className="inline-flex items-center gap-2 bg-stone-900 hover:bg-stone-850 text-white px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-widest transition-colors shadow-sm"
                >
                  Return to Categories
                </Link>
              </div>
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="space-y-10"
            >
              {/* Category Page Header */}
              <motion.div variants={itemVariants} className="space-y-3 border-b border-stone-200 pb-6 text-left">
                <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-stone-900 uppercase">
                  {category.title}
                </h1>
                <p className="text-sm sm:text-base font-sans text-stone-600 leading-relaxed max-w-4xl">
                  Browse the comprehensive catalog of our handpicked releases inside the custom <strong>{category.title}</strong> archive. All entries are sorted in natural alphabetic and sequential order.
                </p>
              </motion.div>

              {/* Books Grid/List area */}
              <motion.div variants={itemVariants} className="w-full text-left">
                {category.id === "top-picks" ? (
                  <div className="w-full overflow-x-auto border border-stone-200 bg-white shadow-3xs rounded-none">
                    <table className="w-full text-left border-collapse min-w-[600px]">
                      <thead>
                        <tr className="bg-stone-50 border-b border-stone-200 text-xs font-mono uppercase tracking-wider text-stone-500">
                          <th className="py-4 px-6 font-black text-center w-24">Rank</th>
                          <th className="py-4 px-6 font-black">Book Cover & Title</th>
                          <th className="py-4 px-6 font-black">Author</th>
                          <th className="py-4 px-6 font-black">Genre</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-150">
                        {category.books.map((book, idx) => {
                          const rank = book.top_pick_order ?? book.topPickOrder ?? book.rank ?? (idx + 1);
                          const bookSlug = getBookSlug(book);
                          const hasReview = bookHasReview(book);
                          const targetUrl = hasReview ? `/review/${bookSlug}` : `/book/${bookSlug}`;

                          return (
                            <tr key={book.id} className="hover:bg-stone-50/50 transition-colors group">
                              {/* Rank column with styled badge for 1-5 */}
                              <td className="py-5 px-6 text-center align-middle">
                                {rank === 1 ? (
                                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 text-amber-800 font-extrabold text-sm border border-amber-300 shadow-3xs">
                                    1
                                  </span>
                                ) : rank === 2 ? (
                                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-800 font-extrabold text-sm border border-slate-300 shadow-3xs">
                                    2
                                  </span>
                                ) : rank === 3 ? (
                                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 text-orange-900 font-extrabold text-sm border border-orange-300 shadow-3xs">
                                    3
                                  </span>
                                ) : rank === 4 ? (
                                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-stone-100 text-stone-850 font-extrabold text-sm border border-stone-300 shadow-3xs">
                                    4
                                  </span>
                                ) : rank === 5 ? (
                                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-stone-50 text-stone-700 font-extrabold text-sm border border-stone-250 shadow-3xs">
                                    5
                                  </span>
                                ) : (
                                  <span className="font-mono text-stone-500 font-bold text-sm">
                                    #{rank}
                                  </span>
                                )}
                              </td>
                              
                              {/* Book Cover and Title */}
                              <td className="py-5 px-6 align-middle">
                                <div className="flex items-center gap-4">
                                  <div className="w-[90px] h-[120px] shrink-0 bg-stone-950 border border-stone-200 overflow-hidden shadow-2xl">
                                    {book.cover_url ? (
                                      <img 
                                        src={book.cover_url} 
                                        alt="" 
                                        referrerPolicy="no-referrer"
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center bg-stone-900 text-[10px] text-stone-500 font-mono text-center px-1">
                                        No Cover
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    <Link 
                                      to={targetUrl}
                                      className="font-serif text-base font-black text-stone-900 hover:text-orange-600 transition-colors block leading-snug"
                                    >
                                      {book.title}
                                    </Link>
                                  </div>
                                </div>
                              </td>

                              {/* Author */}
                              <td className="py-5 px-6 align-middle">
                                <span className="font-sans text-sm font-semibold text-stone-700 italic">
                                  {book.author}
                                </span>
                              </td>

                              {/* Genre */}
                              <td className="py-5 px-6 align-middle">
                                <span className="font-sans text-sm font-medium text-stone-600">
                                  {typeof book.genre === "string"
                                    ? book.genre.split(/[,;/|]+/).slice(0, 3).join(", ").trim()
                                    : Array.isArray(book.genre)
                                      ? book.genre.slice(0, 3).join(", ")
                                      : String(book.genre || "N/A")}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <BookGrid books={category.books} />
                )}
              </motion.div>
            </motion.div>
          )}

        </div>
      </main>
    </Layout>
  );
}
