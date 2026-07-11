import { useState, useEffect } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";
import { getVisitorFingerprint } from "../lib/visitor";

export interface ProgressCounts {
  want_to_read: number;
  reading: number;
  completed: number;
}

export function useBookProgress(bookId: string | undefined, initialRating?: number) {
  const [counts, setCounts] = useState<ProgressCounts>({
    want_to_read: 0,
    reading: 0,
    completed: 0,
  });
  const [userStatus, setUserStatus] = useState<string | null>(null);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [averageRating, setAverageRating] = useState<number | null>(initialRating || null);
  const [ratingCount, setRatingCount] = useState<number>(0);
  const [ratingDistribution, setRatingDistribution] = useState<Record<number, number>>({
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0
  });
  const [loading, setLoading] = useState(true);

  const fingerprint = getVisitorFingerprint();

  // Load status from local storage
  const loadLocalProgress = () => {
    if (!bookId) return;

    try {
      const savedProgress = localStorage.getItem("scriptorium_reading_progress");
      const progressMap = savedProgress ? JSON.parse(savedProgress) : {};
      const status = progressMap[bookId] || null;
      setUserStatus(status);

      // Load count cache or fallback to 0
      const savedCounts = localStorage.getItem(`progress_counts_${bookId}`);
      let countsObj: ProgressCounts = { want_to_read: 0, reading: 0, completed: 0 };
      if (savedCounts) {
        try {
          countsObj = JSON.parse(savedCounts);
        } catch (e) {
          console.error("Error parsing saved counts", e);
        }
      }

      // Ensure the user's selected status has at least 1 count!
      if (status === "Want to Read") countsObj.want_to_read = Math.max(1, countsObj.want_to_read);
      if (status === "Reading") countsObj.reading = Math.max(1, countsObj.reading);
      if (status === "Completed") countsObj.completed = Math.max(1, countsObj.completed);

      setCounts(countsObj);

      // Load user rating from local storage
      const savedUserRating = localStorage.getItem(`scriptorium_user_rating_${bookId}`);
      const userRatingVal = savedUserRating ? parseInt(savedUserRating, 10) : null;
      setUserRating(userRatingVal);

      // Load rating distribution from local storage
      const savedDist = localStorage.getItem(`rating_distribution_${bookId}`);
      if (savedDist) {
        try {
          setRatingDistribution(JSON.parse(savedDist));
        } catch (e) {
          console.error("Error parsing saved rating distribution", e);
        }
      } else {
        const initialDist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        if (userRatingVal && userRatingVal >= 1 && userRatingVal <= 5) {
          initialDist[userRatingVal as 1|2|3|4|5] = 1;
        }
        setRatingDistribution(initialDist);
      }

      // Load avg rating statistics
      const savedRatingStats = localStorage.getItem(`rating_stats_${bookId}`);
      if (savedRatingStats) {
        const { avg, count } = JSON.parse(savedRatingStats);
        setAverageRating(avg || initialRating || null);
        setRatingCount(count || 0);
      } else {
        setAverageRating(initialRating || null);
        setRatingCount(0);
      }
    } catch (e) {
      console.error("Error reading progress status", e);
    }
  };

  const fetchProgressFromSupabase = async () => {
    if (!bookId) return;
    setLoading(true);

    try {
      // Fetch all reaction rows for progress types and ratings for this book_id
      const { data, error } = await supabase
        .from("reactions")
        .select("reaction_type, fingerprint")
        .eq("content_key", bookId)
        .in("reaction_type", [
          "want_to_read", 
          "reading", 
          "completed",
          "rating_1",
          "rating_2",
          "rating_3",
          "rating_4",
          "rating_5"
        ]);

      if (error) throw error;

      const aggregated: ProgressCounts = {
        want_to_read: 0,
        reading: 0,
        completed: 0,
      };

      let myStatus: string | null = null;
      let myRating: number | null = null;
      let ratingSum = 0;
      let ratingsCountForBook = 0;
      const dist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

      if (data) {
        data.forEach((row: any) => {
          const type = row.reaction_type;
          
          if (type === "want_to_read" || type === "reading" || type === "completed") {
            const progressType = type as keyof ProgressCounts;
            aggregated[progressType]++;
            
            if (row.fingerprint === fingerprint) {
              if (type === "want_to_read") myStatus = "Want to Read";
              else if (type === "reading") myStatus = "Reading";
              else if (type === "completed") myStatus = "Completed";
            }
          } else if (type.startsWith("rating_")) {
            const ratingValue = parseInt(type.replace("rating_", ""), 10);
            if (!isNaN(ratingValue) && ratingValue >= 1 && ratingValue <= 5) {
              ratingSum += ratingValue;
              ratingsCountForBook++;
              dist[ratingValue]++;
              
              if (row.fingerprint === fingerprint) {
                myRating = ratingValue;
              }
            }
          }
        });
      }

      // Synchronize with local user status
      const savedProgress = localStorage.getItem("scriptorium_reading_progress");
      const progressMap = savedProgress ? JSON.parse(savedProgress) : {};
      const resolvedStatus = myStatus || (progressMap[bookId] || null);

      if (resolvedStatus) {
        setUserStatus(resolvedStatus);
        updateLocalStorageStatus(resolvedStatus);
        
        // Ensure the current user's status is always counted in the UI!
        if (resolvedStatus === "Want to Read") {
          aggregated.want_to_read = Math.max(1, aggregated.want_to_read);
        } else if (resolvedStatus === "Reading") {
          aggregated.reading = Math.max(1, aggregated.reading);
        } else if (resolvedStatus === "Completed") {
          aggregated.completed = Math.max(1, aggregated.completed);
        }
      } else {
        setUserStatus(null);
      }

      setCounts(aggregated);
      localStorage.setItem(`progress_counts_${bookId}`, JSON.stringify(aggregated));

      // Calculate averages and counts
      const calculatedAvg = ratingsCountForBook > 0 
        ? parseFloat((ratingSum / ratingsCountForBook).toFixed(1)) 
        : (initialRating || null);
        
      setAverageRating(calculatedAvg);
      setRatingCount(ratingsCountForBook);
      setRatingDistribution(dist);
      localStorage.setItem(`rating_distribution_${bookId}`, JSON.stringify(dist));
      
      const ratingStatsObj = { avg: calculatedAvg, count: ratingsCountForBook };
      localStorage.setItem(`rating_stats_${bookId}`, JSON.stringify(ratingStatsObj));

      // Synchronize path for ratings
      if (myRating !== null) {
        setUserRating(myRating);
        localStorage.setItem(`scriptorium_user_rating_${bookId}`, myRating.toString());
      } else {
        const savedUserRating = localStorage.getItem(`scriptorium_user_rating_${bookId}`);
        setUserRating(savedUserRating ? parseInt(savedUserRating, 10) : null);
      }
    } catch (err) {
      console.warn("Error fetching progress from Supabase, fallback to offline state:", err);
      loadLocalProgress();
    } finally {
      setLoading(false);
    }
  };

  const updateLocalStorageStatus = (status: string | null) => {
    if (!bookId) return;
    try {
      const savedProgress = localStorage.getItem("scriptorium_reading_progress");
      const progressMap = savedProgress ? JSON.parse(savedProgress) : {};
      if (status) {
        progressMap[bookId] = status;
      } else {
        delete progressMap[bookId];
      }
      localStorage.setItem("scriptorium_reading_progress", JSON.stringify(progressMap));
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (!bookId) return;

    // Listen for peer-updates across different lists (e.g. if updated on notable works, reflect on cards too)
    const handleSync = () => {
      loadLocalProgress();
      if (isSupabaseConfigured()) {
        fetchProgressFromSupabase();
      }
    };

    window.addEventListener("storage_progress_changed", handleSync);

    if (!isSupabaseConfigured()) {
      loadLocalProgress();
      setLoading(false);
    } else {
      fetchProgressFromSupabase();
    }

    return () => {
      window.removeEventListener("storage_progress_changed", handleSync);
    };
  }, [bookId]);

  const setProgress = async (newProgressName: "Want to Read" | "Reading" | "Completed" | null) => {
    if (!bookId) return;

    const previousStatus = userStatus;
    const previousType = previousStatus === "Want to Read" ? "want_to_read" : previousStatus === "Reading" ? "reading" : previousStatus === "Completed" ? "completed" : null;
    const newType = newProgressName === "Want to Read" ? "want_to_read" : newProgressName === "Reading" ? "reading" : newProgressName === "Completed" ? "completed" : null;

    // UI optimistic updates of counts
    const nextCounts = { ...counts };
    if (previousType) {
      nextCounts[previousType] = Math.max(0, nextCounts[previousType] - 1);
    }
    if (newType) {
      nextCounts[newType]++;
    }

    setCounts(nextCounts);
    setUserStatus(newProgressName);
    updateLocalStorageStatus(newProgressName);
    localStorage.setItem(`progress_counts_${bookId}`, JSON.stringify(nextCounts));

    // Force dispatch of custom storage event to synchronize other components instantly
    window.dispatchEvent(new Event("storage_progress_changed"));

    if (isSupabaseConfigured()) {
      try {
        // Enforce cleanup first by deleting previous progress clicks for this book and fingerprint
        await supabase
          .from("reactions")
          .delete()
          .eq("content_key", bookId)
          .eq("fingerprint", fingerprint)
          .in("reaction_type", ["want_to_read", "reading", "completed"]);

        if (newType) {
          // Insert the new reaction progress row
          const { error } = await supabase
            .from("reactions")
            .insert([{
              content_key: bookId,
              reaction_type: newType,
              fingerprint: fingerprint,
              created_at: new Date().toISOString()
            }]);

          if (error) throw error;
        }

        // Re-sync
        fetchProgressFromSupabase();
      } catch (err) {
        console.warn("Could not synchronize progress in Supabase:", err);
      }
    }
  };

  const setRating = async (newRating: number | null) => {
    if (!bookId) return;

    const savedDist = localStorage.getItem(`rating_distribution_${bookId}`);
    const currentDist = savedDist ? JSON.parse(savedDist) : { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    if (userRating && currentDist[userRating] > 0) {
      currentDist[userRating]--;
    }
    if (newRating) {
      currentDist[newRating] = (currentDist[newRating] || 0) + 1;
    }
    setRatingDistribution(currentDist);
    localStorage.setItem(`rating_distribution_${bookId}`, JSON.stringify(currentDist));

    setUserRating(newRating);

    if (newRating) {
      localStorage.setItem(`scriptorium_user_rating_${bookId}`, newRating.toString());
    } else {
      localStorage.removeItem(`scriptorium_user_rating_${bookId}`);
    }

    // Force dispatch of custom storage event to synchronize other components instantly
    window.dispatchEvent(new Event("storage_progress_changed"));

    if (isSupabaseConfigured()) {
      try {
        // Enforce cleanup first by deleting previous ratings for this book and fingerprint
        await supabase
          .from("reactions")
          .delete()
          .eq("content_key", bookId)
          .eq("fingerprint", fingerprint)
          .in("reaction_type", ["rating_1", "rating_2", "rating_3", "rating_4", "rating_5"]);

        if (newRating) {
          // Insert the new reaction progress row
          const { error } = await supabase
            .from("reactions")
            .insert([{
              content_key: bookId,
              reaction_type: `rating_${newRating}`,
              fingerprint: fingerprint,
              created_at: new Date().toISOString()
            }]);

          if (error) throw error;
        }

        // Re-sync
        fetchProgressFromSupabase();
      } catch (err) {
        console.warn("Could not synchronize rating in Supabase:", err);
      }
    } else {
      // Offline fallback: update local rating stats
      let ratingCountVal = newRating !== null ? 1 : 0;
      let calculatedAvg = newRating !== null ? newRating : (initialRating || null);
      
      setAverageRating(calculatedAvg);
      setRatingCount(ratingCountVal);
      
      localStorage.setItem(`rating_stats_${bookId}`, JSON.stringify({
        avg: calculatedAvg,
        count: ratingCountVal
      }));
    }
  };

  return {
    counts,
    userStatus,
    userRating,
    averageRating,
    ratingCount,
    ratingDistribution,
    loading,
    setProgress,
    setRating,
  };
}
