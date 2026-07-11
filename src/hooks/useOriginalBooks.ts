import { useState, useEffect } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";

export interface Chapter {
  id: string;
  title: string;
  content: string;
  publishedAt: string;
  image_url?: string;
}

export interface OriginalBook {
  id: string;
  slug?: string;
  title: string;
  author: string;
  synopsis: string;
  genre: string;
  coverColor: string;
  coverStyle: string;
  chapters: Chapter[];
  createdAt: string;
  cover_url?: string;
}

export const DEFAULT_ORIGINAL_BOOKS: OriginalBook[] = [
  {
    id: "the-saffron-parchment",
    slug: "the-saffron-parchment",
    title: "The Saffron Parchment",
    author: "Alexander",
    synopsis: "An exquisite exploration of parchment-making techniques and their relation to ancient administrative archives throughout the Bronze Age.",
    genre: "Historical Monograph",
    coverColor: "saffron",
    coverStyle: "vintage",
    cover_url: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=600",
    createdAt: "2026-06-01T00:00:00.000Z",
    chapters: [
      {
        id: "chapter-1-saffron",
        title: "Chapter 1: The Art of Preserving Wisdom",
        content: "Writing on clay and parchment shaped early civilizational dialogues. Through custom tanning and saffron dye infusions, authors created documents designed to persist beyond dynasties. Our search for these early manuscripts reveals that the physical medium of preservation is inextricably bound to the permanence of the thought contained within.",
        publishedAt: "2026-06-01T00:00:00.000Z",
        image_url: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=600"
      },
      {
        id: "chapter-2-saffron",
        title: "Chapter 2: Scribes of Persepolis",
        content: "In the dusty chambers of royal archives, clay gave way to skin. Each skin represented not only an animal harvested, but a record of complex trade arrangements, poetic records, and royal declarations. The craftsmanship of these scribes remains legendary.",
        publishedAt: "2026-06-02T00:00:00.000Z",
        image_url: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&q=80&w=600"
      }
    ]
  },
  {
    id: "labyrinth-of-senses",
    slug: "labyrinth-of-senses",
    title: "Labyrinth of Senses",
    author: "Alexander",
    synopsis: "A philosophical narrative following a silent traveler tracing lost geometries inside an abandoned bibliotheca.",
    genre: "Philosophical Fiction",
    coverColor: "navy",
    coverStyle: "classic",
    cover_url: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&q=80&w=600",
    createdAt: "2026-05-20T00:00:00.000Z",
    chapters: [
      {
        id: "chapter-1-labyrinth",
        title: "Chapter 1: The Portal of Whispers",
        content: "His footfalls echoed in the silence of the library vaults. The pillars rose like frozen sentinels, holding up a sky of crumbling stone frescos inside the ancient repository. He knew that somewhere within these thousands of dust-laden corridors lay the original manuscripts of the Library of Alexander's lost translation keys. Every breath was a soft sigh of ancient air.",
        publishedAt: "2026-05-20T00:00:00.000Z",
        image_url: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&q=80&w=600"
      }
    ]
  }
];

export function useOriginalBooks() {
  const [books, setBooks] = useState<OriginalBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [isContentful, setIsContentful] = useState(false);
  const [cmsError, setCmsError] = useState<string | null>(null);

  const fetchOriginalBooks = async () => {
    setLoading(true);
    try {
      let fetchedBooks: OriginalBook[] = [];
      const dbConfigured = isSupabaseConfigured();

      if (dbConfigured) {
        const { data, error: sbErr } = await supabase
          .from("original_books")
          .select("*")
          .order("created_at", { ascending: false });

        if (!sbErr && data) {
          fetchedBooks = data.map((row: any) => ({
            id: row.id,
            slug: row.slug || row.id,
            title: row.title,
            author: row.author || "Alexander",
            synopsis: row.synopsis || "",
            genre: row.genre || "Original Work",
            coverColor: row.cover_color || "navy",
            coverStyle: row.cover_style || "classic",
            chapters: Array.isArray(row.chapters) ? row.chapters : [],
            createdAt: row.created_at || new Date().toISOString(),
            cover_url: row.cover_url
          }));
        } else if (sbErr) {
          console.warn("Supabase original_books fetch warning:", sbErr.message);
        }
      }

      // Fallback to Express backend or raw mockup list
      if (fetchedBooks.length === 0) {
        try {
          const response = await fetch("/api/cms/original-books");
          if (response.ok) {
            const json = await response.json();
            setIsContentful(json.isContentful || false);
            setCmsError(json.error || null);
            fetchedBooks = json.data || [];
          }
        } catch (_) {}
      }

      // Merge with custom offline elements
      const saved = localStorage.getItem("original_books_overrides");
      if (saved) {
        try {
          const overrides: OriginalBook[] = JSON.parse(saved);
          const overrideMap = new Map(fetchedBooks.map(b => [b.id, b]));
          overrides.forEach(b => {
            if (!overrideMap.has(b.id)) {
              fetchedBooks.push(b);
            }
          });
        } catch (_) {}
      }

      setBooks(fetchedBooks);
    } catch (err: any) {
      console.warn("Error processing original books dataset:", err);
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOriginalBooks();
  }, []);

  const saveBooksList = async (newList: OriginalBook[]) => {
    setBooks(newList);
    localStorage.setItem("original_books_overrides", JSON.stringify(newList));
  };

  const createBook = async (title: string, author: string, synopsis: string, genre: string, coverColor: string, coverStyle: string) => {
    const slugVal = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const newBook: OriginalBook = {
      id: slugVal + `-${Date.now().toString().slice(-4)}`,
      slug: slugVal,
      title,
      author: author || "Alexander",
      synopsis,
      genre: genre || "Original Work",
      coverColor: coverColor || "navy",
      coverStyle: coverStyle || "classic",
      chapters: [],
      createdAt: new Date().toISOString()
    };

    if (isSupabaseConfigured()) {
      try {
        const dbRow = {
          id: newBook.id,
          title: newBook.title,
          slug: newBook.slug,
          author: newBook.author,
          synopsis: newBook.synopsis,
          genre: newBook.genre,
          cover_color: newBook.coverColor,
          cover_style: newBook.coverStyle,
          chapters: newBook.chapters,
          cover_url: newBook.cover_url
        };

        const { error: sbErr } = await supabase
          .from("original_books")
          .upsert([dbRow]);
        if (sbErr) throw sbErr;
      } catch (err: any) {
        console.warn("Supabase original_books insertion failure:", err.message);
      }
    }

    const updated = [newBook, ...books];
    await saveBooksList(updated);
    return newBook;
  };

  const addChapter = async (bookId: string, chapterTitle: string, content: string) => {
    let targetBook: OriginalBook | null = null;
    const updated = books.map((book) => {
      if (book.id === bookId) {
        const nextChapterNum = book.chapters.length + 1;
        const newChapter: Chapter = {
          id: `chapter-${nextChapterNum}-${Date.now().toString().slice(-4)}`,
          title: chapterTitle.startsWith("Chapter") ? chapterTitle : `Chapter ${nextChapterNum}: ${chapterTitle}`,
          content,
          publishedAt: new Date().toISOString()
        };
        targetBook = {
          ...book,
          chapters: [...book.chapters, newChapter]
        };
        return targetBook;
      }
      return book;
    });

    if (isSupabaseConfigured() && targetBook) {
      try {
        const dbRow = {
          id: (targetBook as OriginalBook).id,
          title: (targetBook as OriginalBook).title,
          slug: (targetBook as OriginalBook).slug,
          author: (targetBook as OriginalBook).author,
          synopsis: (targetBook as OriginalBook).synopsis,
          genre: (targetBook as OriginalBook).genre,
          cover_color: (targetBook as OriginalBook).coverColor,
          cover_style: (targetBook as OriginalBook).coverStyle,
          chapters: (targetBook as OriginalBook).chapters,
          cover_url: (targetBook as OriginalBook).cover_url
        };

        const { error: sbErr } = await supabase
          .from("original_books")
          .upsert([dbRow]);
        if (sbErr) throw sbErr;
      } catch (err: any) {
        console.warn("Supabase original_books update chapter error:", err.message);
      }
    }

    await saveBooksList(updated);
  };

  const deleteBook = async (bookId: string) => {
    if (isSupabaseConfigured()) {
      try {
        const { error: sbErr } = await supabase
          .from("original_books")
          .delete()
          .eq("id", bookId);
        if (sbErr) throw sbErr;
      } catch (err: any) {
        console.warn("Supabase original_books delete error:", err.message);
      }
    }

    const updated = books.filter(b => b.id !== bookId);
    await saveBooksList(updated);
  };

  return {
    books,
    loading,
    createBook,
    addChapter,
    deleteBook,
    refresh: fetchOriginalBooks
  };
}
