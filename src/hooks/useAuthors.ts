import { useState, useEffect } from "react";
import { AuthorDiscovery } from "../types";

const FALLBACK_AUTHORS: AuthorDiscovery[] = [
  {
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
    social_media_handle: "@BorgesSociety",
    did_you_know: "Borges was appointed Director of the National Library of Argentina in 1955, at which point he was almost completely blind. He famously remarked on God's irony of granting him '800,000 books and at the same time darkness.'",
    fun_facts: [
      "He never won the Nobel Prize, despite being nominated repeatedly for decades. He once said, 'Not granting me the Nobel Prize has become a Scandinavian tradition.'",
      "He co-authored detective stories under the pseudonym H. Bustos Domecq.",
      "He loved cats and frequently wrote about them in his poetry; his own cat was named Beppo, after a character in Lord Byron's poetry."
    ]
  },
  {
    id: "albert-camus",
    name: "Albert Camus",
    bio: "An Algerian-born French philosopher, author, dramatist, and journalist who won the Nobel Prize in Literature in 1957. He is known for his philosophy of the Absurd, exploring the human search for meaning in a meaningless universe.",
    notable_works: ["The Stranger", "The Myth of Sisyphus", "The Plague"],
    spotlight_quote: "In the midst of winter, I found there was, within me, an invincible summer.",
    image_url: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80&w=400",
    website_url: "https://www.nobelprize.org/laureates/1957/camus-facts",
    socials_url: "https://www.goodreads.com/author/show/9578.Albert_Camus",
    buy_books_url: "https://www.amazon.com/Albert-Camus/e/B000AQ3D8S",
    twitter_url: "https://twitter.com/AlbertCamus_FR",
    social_media_handle: "@AlbertCamus_FR",
    did_you_know: "Camus was a passionate football (soccer) goalkeeper. He played for Racing Universitaire d'Alger and once famously declared, 'All that I know most surely about morality and obligations, I owe to football.'",
    fun_facts: [
      "He was the second-youngest recipient of the Nobel Prize in Literature at age 44, only Rudyard Kipling being younger.",
      "He chose a pet cat named Cigarette as his quiet writing-room companion.",
      "The train ticket found in Camus's pocket after his fatal car crash was an unused route; he had accepted a last-minute car ride back to Paris with his publisher companions instead."
    ]
  },
  {
    id: "franz-kafka",
    name: "Franz Kafka",
    bio: "A German-language novelist and short-story writer, widely regarded as one of the major figures of 20th-century literature. His work fuses elements of realism and the fantastic, typically featuring isolated protagonists facing surreal or bizarre bureaucratic obstacles.",
    notable_works: ["Metamorphosis", "The Trial", "The Castle"],
    spotlight_quote: "A book must be the axe for the frozen sea within us.",
    image_url: "https://images.unsplash.com/photo-1474932430478-367db2683bfc?auto=format&fit=crop&q=80&w=400",
    website_url: "https://www.kafka.org",
    socials_url: "https://www.goodreads.com/author/show/5223.Franz_Kafka",
    buy_books_url: "https://www.amazon.com/Franz-Kafka/e/B000APYI02",
    twitter_url: "https://twitter.com/Kafka_Society",
    social_media_handle: "@Kafka_Society",
    did_you_know: "Kafka ordered his close friend Max Brod to burn all his literary manuscripts upon his death. Brod famously disobeyed his friend's wishes, publishing masterpieces like 'The Trial' and 'The Castle' that would otherwise have been lost forever.",
    fun_facts: [
      "Kafka was an ardent vegetarian, teetotaler, and raw-foodist long before it was modernly popular.",
      "He worked as a meticulous safety insurance officer at the Worker's Accident Insurance Institute for the Kingdom of Bohemia, authoring highly praised industrial safety manuals.",
      "He had a deeply complex relationship with his father, culminating in a 100-page unsent Letter to Father expressing his feelings of profound childhood inadequacy."
    ]
  }
];

export function useAuthors() {
  const [authors, setAuthors] = useState<AuthorDiscovery[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAuthors() {
      try {
        const response = await fetch("/api/cms/authors");
        if (response.ok) {
          const json = await response.json();
          if (json.isContentful && Array.isArray(json.data) && json.data.length > 0) {
            setAuthors(json.data);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn("Express authors fetch failed, loading fallback channel", err);
      }

      // Check localStorage fallback
      const saved = localStorage.getItem("author_spotlights");
      if (saved) {
        try {
          setAuthors(JSON.parse(saved));
        } catch (_) {
          setAuthors([]);
        }
      } else {
        setAuthors([]);
      }
      setLoading(false);
    }

    loadAuthors();
  }, []);

  return {
    authors,
    loading
  };
}

export default useAuthors;
