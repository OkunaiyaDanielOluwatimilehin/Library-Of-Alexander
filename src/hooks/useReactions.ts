import { useState, useEffect } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";
import { getVisitorFingerprint } from "../lib/visitor";

export interface ReactionCounts {
  like: number;
  love: number;
  fire: number;
  smash: number;
  pass: number;
  mid: number;
}

export function useReactions(contentKey: string | undefined, initialReactions?: any) {
  const [reactions, setReactions] = useState<ReactionCounts>({
    like: 0,
    love: 0,
    fire: 0,
    smash: 0,
    pass: 0,
    mid: 0
  });
  const [userReaction, setUserReaction] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fingerprint = getVisitorFingerprint();

  // Query standard mapped reactions for our books if specified in CMS
  const getSeededReactions = (key: string): ReactionCounts => {
    if (initialReactions) {
      return {
        like: Number(initialReactions.agree || initialReactions.like || 0),
        love: Number(initialReactions.love || 0),
        fire: Number(initialReactions.insightful || initialReactions.fire || 0),
        smash: Number(initialReactions.bookmark || initialReactions.smash || 0),
        pass: Number(initialReactions.pass || 0),
        mid: Number(initialReactions.mid || 0)
      };
    }
    return { like: 0, love: 0, fire: 0, smash: 0, pass: 0, mid: 0 };
  };

  const loadLocalReactions = () => {
    if (!contentKey) return;
    
    // Load local counts
    const savedCounts = localStorage.getItem(`reactions_counts_${contentKey}`);
    let counts: ReactionCounts;
    if (savedCounts) {
      try {
        counts = JSON.parse(savedCounts);
      } catch (_) {
        counts = getSeededReactions(contentKey);
      }
    } else {
      counts = getSeededReactions(contentKey);
      localStorage.setItem(`reactions_counts_${contentKey}`, JSON.stringify(counts));
    }
    setReactions(counts);

    // Load local user reaction choice
    const savedUserReaction = localStorage.getItem(`user_reaction_${contentKey}`);
    setUserReaction(savedUserReaction);
  };

  const fetchReactionsFromSupabase = async () => {
    if (!contentKey) return;
    setLoading(true);

    try {
      // Fetch all reaction rows for this content_key to aggregate them
      const { data, error } = await supabase
        .from("reactions")
        .select("reaction_type, fingerprint")
        .eq("content_key", contentKey);

      if (error) throw error;

      const aggregated: ReactionCounts = {
        like: 0,
        love: 0,
        fire: 0,
        smash: 0,
        pass: 0,
        mid: 0
      };

      let myReaction: string | null = null;

      if (data) {
        data.forEach((row: any) => {
          const type = row.reaction_type as keyof ReactionCounts;
          if (aggregated[type] !== undefined) {
            aggregated[type]++;
          }
          if (row.fingerprint === fingerprint) {
            myReaction = row.reaction_type;
          }
        });
      }

      setReactions(aggregated);
      setUserReaction(myReaction);
      
      // Cache locally
      localStorage.setItem(`reactions_counts_${contentKey}`, JSON.stringify(aggregated));
      if (myReaction) {
        localStorage.setItem(`user_reaction_${contentKey}`, myReaction);
      } else {
        localStorage.removeItem(`user_reaction_${contentKey}`);
      }
    } catch (err) {
      console.warn("Error fetching reactions from Supabase, fallback to offline state:", err);
      loadLocalReactions();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!contentKey) return;

    if (!isSupabaseConfigured()) {
      loadLocalReactions();
      setLoading(false);
      return;
    }

    fetchReactionsFromSupabase();
  }, [contentKey]);

  useEffect(() => {
    if (!contentKey || !initialReactions) return;
    const savedCounts = localStorage.getItem(`reactions_counts_${contentKey}`);
    if (!savedCounts) {
      const counts: ReactionCounts = {
        like: Number(initialReactions.agree || initialReactions.like || 0),
        love: Number(initialReactions.love || 0),
        fire: Number(initialReactions.insightful || initialReactions.fire || 0),
        smash: Number(initialReactions.bookmark || initialReactions.smash || 0),
        pass: Number(initialReactions.pass || 0),
        mid: Number(initialReactions.mid || 0)
      };
      setReactions(counts);
      localStorage.setItem(`reactions_counts_${contentKey}`, JSON.stringify(counts));
    }
  }, [contentKey, initialReactions]);

  const react = async (type: keyof ReactionCounts) => {
    if (!contentKey) return;

    // Check if the user is changing their reaction or adding a new one
    const previousReaction = userReaction;
    
    // UI optimistic updates
    const nextReactions = { ...reactions };
    if (previousReaction) {
      if (previousReaction === type) {
        // Toggle off the same reaction
        nextReactions[previousReaction as keyof ReactionCounts] = Math.max(0, nextReactions[previousReaction as keyof ReactionCounts] - 1);
        setUserReaction(null);
        localStorage.removeItem(`user_reaction_${contentKey}`);
      } else {
        // Change feedback reaction type
        nextReactions[previousReaction as keyof ReactionCounts] = Math.max(0, nextReactions[previousReaction as keyof ReactionCounts] - 1);
        nextReactions[type]++;
        setUserReaction(type);
        localStorage.setItem(`user_reaction_${contentKey}`, type);
      }
    } else {
      // First time feedback
      nextReactions[type]++;
      setUserReaction(type);
      localStorage.setItem(`user_reaction_${contentKey}`, type);
    }

    setReactions(nextReactions);
    localStorage.setItem(`reactions_counts_${contentKey}`, JSON.stringify(nextReactions));

    if (isSupabaseConfigured()) {
      try {
        if (previousReaction === type) {
          // Delete row (toggle off)
          await supabase
            .from("reactions")
            .delete()
            .eq("content_key", contentKey)
            .eq("fingerprint", fingerprint);
        } else {
          // If they already reacted before, we delete the old first to enforce single reaction
          if (previousReaction) {
            await supabase
              .from("reactions")
              .delete()
              .eq("content_key", contentKey)
              .eq("fingerprint", fingerprint);
          }
          
          // Insert the new reaction row
          const { error } = await supabase
            .from("reactions")
            .insert([{
              content_key: contentKey,
              reaction_type: type,
              fingerprint: fingerprint,
              created_at: new Date().toISOString()
            }]);
          
          if (error) throw error;
        }
        
        // Re-sync to verify counts are strictly aligned
        fetchReactionsFromSupabase();
      } catch (err) {
        console.warn("Could not synchronize reaction in Supabase:", err);
      }
    }
  };

  return {
    reactions,
    userReaction,
    loading,
    react,
    refresh: isSupabaseConfigured() ? fetchReactionsFromSupabase : loadLocalReactions
  };
}

export default useReactions;
