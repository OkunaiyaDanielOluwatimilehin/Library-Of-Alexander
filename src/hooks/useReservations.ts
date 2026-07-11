import { useState, useEffect } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";

export function useReservations(bookId: string | undefined) {
  const [reservationCount, setReservationCount] = useState<number>(0);
  const [hasReserved, setHasReserved] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Fallback seed calculation for placeholder aesthetics
  const getSeededReservations = (id: string): number => {
    return (Math.abs(id.charCodeAt(0) * 7 + (id.charCodeAt(1) || 0) * 3) % 18) + 3;
  };

  const loadLocalReservations = () => {
    if (!bookId) return;
    const savedCount = localStorage.getItem(`reservations_count_${bookId}`);
    if (savedCount !== null) {
      setReservationCount(parseInt(savedCount, 10) || 0);
    } else {
      const seeded = getSeededReservations(bookId);
      setReservationCount(seeded);
      localStorage.setItem(`reservations_count_${bookId}`, seeded.toString());
    }

    const savedStatus = localStorage.getItem(`user_has_reserved_${bookId}`);
    setHasReserved(savedStatus === "true");
  };

  const fetchReservationsFromSupabase = async () => {
    if (!bookId) return;
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("reservations")
        .select("reservation_count")
        .eq("book_id", bookId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setReservationCount(data.reservation_count);
        localStorage.setItem(`reservations_count_${bookId}`, data.reservation_count.toString());
      } else {
        // Seed default record if none exists yet
        const seedValue = getSeededReservations(bookId);
        setReservationCount(seedValue);
        localStorage.setItem(`reservations_count_${bookId}`, seedValue.toString());
        
        // Try creating single initial entry silently
        await supabase
          .from("reservations")
          .insert([{ book_id: bookId, reservation_count: seedValue }])
          .select();
      }

      const savedStatus = localStorage.getItem(`user_has_reserved_${bookId}`);
      setHasReserved(savedStatus === "true");
    } catch (_) {
      loadLocalReservations();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!bookId) {
      setLoading(false);
      return;
    }

    if (!isSupabaseConfigured()) {
      loadLocalReservations();
      setLoading(false);
      return;
    }

    fetchReservationsFromSupabase();
  }, [bookId]);

  const reserve = async () => {
    if (!bookId) return;

    const nextReserved = !hasReserved;
    const offset = nextReserved ? 1 : -1;
    const nextCount = Math.max(0, reservationCount + offset);

    // Optimistic UI updates
    setReservationCount(nextCount);
    setHasReserved(nextReserved);
    if (nextReserved) {
      localStorage.setItem(`user_has_reserved_${bookId}`, "true");
    } else {
      localStorage.removeItem(`user_has_reserved_${bookId}`);
    }
    localStorage.setItem(`reservations_count_${bookId}`, nextCount.toString());

    if (isSupabaseConfigured()) {
      try {
        // Fetch or create to make sure record exists first
        const { data: check } = await supabase
          .from("reservations")
          .select("reservation_count")
          .eq("book_id", bookId)
          .maybeSingle();

        if (check) {
          await supabase
            .from("reservations")
            .update({ reservation_count: nextCount })
            .eq("book_id", bookId);
        } else {
          await supabase
            .from("reservations")
            .insert([{ book_id: bookId, reservation_count: nextCount }]);
        }
      } catch (err) {
        console.warn("Could not sync reservation in Supabase:", err);
      }
    }
  };

  return {
    reservationCount,
    hasReserved,
    loading,
    reserve,
    refresh: isSupabaseConfigured() ? fetchReservationsFromSupabase : loadLocalReservations
  };
}

export default useReservations;
