import { useState, useEffect } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";
import { getVisitorFingerprint } from "../lib/visitor";

export function useRecommendations(contentKey: string | undefined) {
  const [recommendCount, setRecommendCount] = useState<number>(0);
  const [userRecommended, setUserRecommended] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  const fingerprint = getVisitorFingerprint();

  // Clean recommendations - start from 0 to represent real database entries and interactions
  const getSeededRecommendations = (key: string): number => {
    return 0;
  };

  const loadLocalRecommendations = () => {
    if (!contentKey) return;
    
    // Load local count
    const savedCount = localStorage.getItem(`recommend_count_${contentKey}`);
    let count: number;
    if (savedCount) {
      count = parseInt(savedCount, 10) || 0;
    } else {
      count = getSeededRecommendations(contentKey);
      localStorage.setItem(`recommend_count_${contentKey}`, count.toString());
    }
    setRecommendCount(count);

    // Load local user recommend states
    const savedUserRec = localStorage.getItem(`user_recommended_${contentKey}`);
    setUserRecommended(savedUserRec === "true");
  };

  const fetchRecommendationsFromSupabase = async () => {
    if (!contentKey) return;
    setLoading(true);

    try {
      // Query count of recommendations for this content_key
      const { data, error } = await supabase
        .from("recommendations")
        .select("fingerprint")
        .eq("content_key", contentKey);

      if (error) throw error;

      let count = getSeededRecommendations(contentKey);
      let userRec = false;

      if (data) {
        // We add local items tracking
        const dbFingerprints = data.map((row: any) => row.fingerprint);
        
        // Count database rows as unique recommendations. If any DB recommendations exist, we append them to the base or use DB count.
        // Let's combine the seeded recommendations with unique DB entries to ensure it maintains pre-seed values + DB increments
        const uniqueDBFingerprintsCount = dbFingerprints.length;
        userRec = dbFingerprints.includes(fingerprint);
        
        // If user has recommended in DB, or anyone else has, we show seeded + DB count (avoid double-counting user)
        count = getSeededRecommendations(contentKey) + uniqueDBFingerprintsCount;
        
        // If local user recommended but it hasn't synced or vice-versa, ensure alignment
        if (userRec) {
          // If the user already recommended, let's keep it accurate
        }
      }

      setRecommendCount(count);
      setUserRecommended(userRec);
      
      // Sync local storage cache
      localStorage.setItem(`recommend_count_${contentKey}`, count.toString());
      localStorage.setItem(`user_recommended_${contentKey}`, userRec ? "true" : "false");
    } catch (err) {
      console.warn("Error fetching recommendations from Supabase, fallback to offline state:", err);
      loadLocalRecommendations();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!contentKey) return;

    if (!isSupabaseConfigured()) {
      loadLocalRecommendations();
      setLoading(false);
      return;
    }

    fetchRecommendationsFromSupabase();
  }, [contentKey]);

  const toggleRecommend = async () => {
    if (!contentKey) return;

    const nextState = !userRecommended;
    const nextCount = nextState ? recommendCount + 1 : Math.max(0, recommendCount - 1);

    // UI Optimistic updates
    setUserRecommended(nextState);
    setRecommendCount(nextCount);
    localStorage.setItem(`recommend_count_${contentKey}`, nextCount.toString());
    localStorage.setItem(`user_recommended_${contentKey}`, nextState ? "true" : "false");

    if (isSupabaseConfigured()) {
      try {
        if (!nextState) {
          // Delete recommend entry from Supabase
          await supabase
            .from("recommendations")
            .delete()
            .eq("content_key", contentKey)
            .eq("fingerprint", fingerprint);
        } else {
          // Insert recommend entry to Supabase
          const { error } = await supabase
            .from("recommendations")
            .insert([{
              content_key: contentKey,
              fingerprint: fingerprint,
              created_at: new Date().toISOString()
            }]);
          
          if (error) throw error;
        }
        
        // Refetch to perfectly sync counts
        fetchRecommendationsFromSupabase();
      } catch (err) {
        console.warn("Could not synchronize recommendation in Supabase:", err);
      }
    }
  };

  return {
    recommendCount,
    userRecommended,
    loading,
    toggleRecommend,
    refresh: isSupabaseConfigured() ? fetchRecommendationsFromSupabase : loadLocalRecommendations
  };
}

export default useRecommendations;
