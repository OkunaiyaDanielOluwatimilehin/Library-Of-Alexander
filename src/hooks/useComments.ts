import { useState, useEffect } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";
import { Comment } from "../types";

export function useComments(contentKey: string | undefined) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const getLocalComments = (): Comment[] => {
    if (!contentKey) return [];
    const saved = localStorage.getItem(`comments_${contentKey}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Comment[];
        return parsed.map(c => {
          let commentText = c.text || "";
          let isReview = c.isReview || false;
          let ratingValue = c.rating;

          if (commentText.startsWith("[REVIEW]")) {
            isReview = true;
            commentText = commentText.substring("[REVIEW]".length).trim();
          } else if (commentText.startsWith("[REVIEW:")) {
            const closeBracket = commentText.indexOf("]");
            if (closeBracket > -1) {
              isReview = true;
              const ratingStr = commentText.substring("[REVIEW:".length, closeBracket);
              ratingValue = parseInt(ratingStr);
              commentText = commentText.substring(closeBracket + 1).trim();
            }
          }
          return {
            ...c,
            text: commentText,
            isReview,
            rating: ratingValue
          };
        });
      } catch (_) {}
    }
    return [
      { id: "1", reviewId: contentKey, author: "Sofia G.", text: "I totally agree about the pacing in the second act!", timestamp: "Live updates", created_at: new Date(Date.now() - 86450000).toISOString() },
      { id: "2", reviewId: contentKey, author: "Honorius of Thebes", text: "This book review beautifully parses the underlying architecture.", timestamp: "3 days ago", created_at: new Date(Date.now() - 3 * 86450000).toISOString() }
    ];
  };

  const fetchComments = async () => {
    if (!contentKey) {
      setComments([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    if (!isSupabaseConfigured()) {
      setComments(getLocalComments());
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("comments")
        .select("*")
        .eq("content_key", contentKey)
        .order("created_at", { ascending: true });

      if (error) throw error;

      if (data) {
        // Map database columns to UI Comment interfaces
        const mapped: Comment[] = data.map((row: any) => {
          let commentText = row.comment || "";
          let isReview = false;
          let ratingValue = undefined;

          if (commentText.startsWith("[REVIEW]")) {
            isReview = true;
            commentText = commentText.substring("[REVIEW]".length).trim();
          } else if (commentText.startsWith("[REVIEW:")) {
            const closeBracket = commentText.indexOf("]");
            if (closeBracket > -1) {
              isReview = true;
              const ratingStr = commentText.substring("[REVIEW:".length, closeBracket);
              ratingValue = parseInt(ratingStr);
              commentText = commentText.substring(closeBracket + 1).trim();
            }
          }

          return {
            id: row.id,
            reviewId: row.content_key,
            author: row.name || "Anonymous",
            text: commentText,
            isReview,
            rating: ratingValue,
            timestamp: new Date(row.created_at).toLocaleDateString("en-US", { 
              month: "short", 
              day: "numeric", 
              hour: "2-digit", 
              minute: "2-digit" 
            }),
            created_at: row.created_at
          };
        });
        setComments(mapped);
        localStorage.setItem(`comments_${contentKey}`, JSON.stringify(mapped));
      } else {
        setComments(getLocalComments());
      }
    } catch (err) {
      console.warn("Could not load comments from Supabase, supplying offline/cached storage:", err);
      setComments(getLocalComments());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [contentKey]);

  const addComment = async (authorName: string, text: string, isReviewCol?: boolean, ratingCol?: number) => {
    if (!contentKey) return;
    setErrorMsg(null);

    // ── ANTI-SPAM PROTECTION RULE check ──
    const lastCommentTimeKey = `last_comment_time_${contentKey}`;
    const commentCountKey = `comment_count_session_${contentKey}`;
    
    const lastCommentTime = localStorage.getItem(lastCommentTimeKey);
    const now = Date.now();
    
    // Cooldown check (15 seconds)
    if (lastCommentTime) {
      const diff = now - parseInt(lastCommentTime);
      if (diff < 15000) {
        const remaining = Math.ceil((15000 - diff) / 1000);
        const err = `Please wait ${remaining} seconds before adding another comment.`;
        setErrorMsg(err);
        throw new Error(err);
      }
    }

    // Session limit check (max 6 comments per content key per session to prevent spam bots)
    const sessionCount = parseInt(localStorage.getItem(commentCountKey) || "0");
    if (sessionCount >= 6) {
      const err = "You have reached the maximum number of comment submissions allowed per session to prevent spam.";
      setErrorMsg(err);
      throw new Error(err);
    }

    const cleanAuthor = authorName.trim() || "Anonymous";

    let finalCommentText = text.trim();
    if (isReviewCol) {
      if (typeof ratingCol === "number" && ratingCol > 0) {
        finalCommentText = `[REVIEW:${ratingCol}] ${finalCommentText}`;
      } else {
        finalCommentText = `[REVIEW] ${finalCommentText}`;
      }
    }

    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      reviewId: contentKey,
      author: cleanAuthor,
      text: text.trim(),
      isReview: isReviewCol,
      rating: ratingCol,
      timestamp: "Just now",
      created_at: new Date().toISOString()
    };

    // Optimistic state updates
    const nextComments = [...comments, newComment];
    setComments(nextComments);
    const localStorageComments = [...comments, { ...newComment, text: finalCommentText }];
    localStorage.setItem(`comments_${contentKey}`, JSON.stringify(localStorageComments));
    
    // Update rate limiting timestamps
    localStorage.setItem(lastCommentTimeKey, now.toString());
    localStorage.setItem(commentCountKey, (sessionCount + 1).toString());

    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase
          .from("comments")
          .insert([{
            content_key: contentKey,
            name: cleanAuthor,
            comment: finalCommentText,
            created_at: newComment.created_at
          }]);
        if (error) throw error;
        
        // Re-sync comments list with remote db
        fetchComments();
      } catch (err: any) {
        console.warn("Could not insert comment into Supabase database:", err);
      }
    }

    return newComment;
  };

  return {
    comments,
    loading,
    errorMsg,
    addComment,
    refresh: fetchComments
  };
}

export default useComments;
