import { useState, useEffect } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";
import { AuthorDiscovery } from "../types";

const INITIAL_SPOTLIGHT: AuthorDiscovery = {
  id: "jorge-luis-borges",
  name: "Jorge Luis Borges",
  bio: "An Argentine short-story writer, essayist, poet and translator, and a key figure in Spanish-language and international literature. His best-known books compile short stories interconnected by philosophical themes, mirrors, labyrinths, and dreams.",
  notable_works: ["The Aleph", "Ficciones", "Labyrinths"],
  spotlight_quote: "I have always imagined that Paradise will be a kind of library.",
  image_url: "https://images.unsplash.com/photo-1544947950-fa07a98d237f",
  website_url: "https://www.borgescenter.pitt.edu",
  socials_url: "https://www.goodreads.com/author/show/11927.Jorge_Luis_Borges",
  buy_books_url: "https://www.amazon.com/Jorge-Luis-Borges/e/B000AP9HQA",
  twitter_url: "https://twitter.com/BorgesSociety",
  social_media_handle: "@BorgesSociety"
};

export function useAuthorSpotlight() {
  const [spotlight, setSpotlight] = useState<AuthorDiscovery | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSpotlight() {
      try {
        const response = await fetch("/api/cms/author-spotlight");
        if (response.ok) {
          const json = await response.json();
          if (json.isContentful) {
            setSpotlight(json.data);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn("Express spotlight fetch failed, loading fallback channel", err);
      }

      const saved = localStorage.getItem("author_spotlight");
      if (saved) {
        try {
          setSpotlight(JSON.parse(saved));
        } catch (_) {
          setSpotlight(null);
        }
      } else {
        setSpotlight(null);
      }

      if (!isSupabaseConfigured()) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("config")
          .select("*")
          .eq("id", "author_spotlight")
          .single();

        if (!error && data) {
          setSpotlight(data.value);
        }
      } catch (_) {
      } finally {
        setLoading(false);
      }
    }

    loadSpotlight();
  }, []);

  return {
    spotlight,
    loading
  };
}

export default useAuthorSpotlight;
