import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, Calendar, User, Clock, ArrowRight, BookOpen, Scroll, Search, Sun, ChevronRight, Share2, Twitter, Linkedin, Mail, Link2, Check, ThumbsUp, Heart, Flame, MessageSquare, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import Layout from "../components/layout/Layout";
import { useHomepageConfig } from "../hooks/useHomepageConfig";

interface BlogPost {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  author: string;
  date: string;
  readTime: string;
  imageUrl: string;
  isFeatured?: boolean;
}

const DEFAULT_BLOG_POSTS: BlogPost[] = [
  {
    id: "post-1",
    title: "Lagos Flooding Causes: Why The City Floods Every Year",
    summary: "An in-depth investigation into the hydrological, infrastructural, and meteorological factors driving annual inundations in Nigeria's commercial capital.",
    content: "Lagos, a low-lying coastal city of over 20 million people, faces severe annual flooding. This article explores the root causes, from clogged drainage channels and rapid urbanization to rising sea levels and intense rainfalls.\n\nIn recent decades, structural blockages of major water transit corridors coupled with poor waste management systems have created severe hydraulic bottlenecks. When rain intensities exceed design parameters, water backs up directly into commercial and residential zones, halting transport grids and creating critical hazards for millions of citizens.",
    category: "Stories",
    author: "Alexander",
    date: "Jul 3, 2026",
    readTime: "6 min read",
    imageUrl: "https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&q=80&w=1200",
    isFeatured: true
  },
  {
    id: "post-2",
    title: "Is Risevest's Real Estate Plan Sharia-Compliant?",
    summary: "Analyzing the structural and financial alignment of fractional real estate investing under Islamic jurisprudence.",
    content: "Fractional property investment is growing rapidly. We analyze whether the rent-share and co-ownership model adheres strictly to Sharia guidelines.\n\nUnder classical Islamic finance, transactions must avoid riba (usury) and gharar (excessive uncertainty) while promoting genuine profit-and-loss sharing. We break down the exact contractual frameworks utilized by global fintech platforms to verify compliance, finding that asset-backed direct rentals generally align cleanly with ijara and musharakah principles.",
    category: "Finance",
    author: "Alexander",
    date: "Jun 28, 2026",
    readTime: "8 min read",
    imageUrl: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=600",
    isFeatured: true
  },
  {
    id: "post-3",
    title: "MoneyRise Weekly Briefing: SpaceX Goes To The Moon",
    summary: "Weekly financial and technological digest covering key planetary missions and commercial enterprise valuations.",
    content: "SpaceX's recent Starship test flight represents a monumental leap. We examine the commercial impacts and venture capital inflows.\n\nAs the costs of orbital delivery continue to plummet, a whole new economy of orbital logistics, satellite-based communication arrays, and deep-space raw material mining begins to emerge. This briefing covers the seed-stage startups capitalizing on the starship infrastructure layer.",
    category: "Newsletter",
    author: "Alexander",
    date: "Jul 1, 2026",
    readTime: "4 min read",
    imageUrl: "https://images.unsplash.com/photo-1516849841032-87cbac4d88f7?auto=format&fit=crop&q=80&w=600",
    isFeatured: false
  },
  {
    id: "post-4",
    title: "Risevest May 2026 Portfolio Performance Report",
    summary: "Comprehensive breakdown of yield metrics, asset allocations, and historical returns for global index tracking.",
    content: "A review of our asset performance across stocks, real estate, and fixed income classes during the month of May.\n\nOur dynamic indexes experienced strong tailwinds throughout May, driven by secular tech growth and stable yields from high-grade short-duration rental holdings. We detail the exact asset rebalancings executed by our algorithmic managers and provide localized macro forecasts for the upcoming financial quarter.",
    category: "Rise News",
    author: "Alexander",
    date: "May 31, 2026",
    readTime: "5 min read",
    imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=600",
    isFeatured: false
  },
  {
    id: "post-5",
    title: "Classical Translation Methods in Medieval Scriptoriums",
    summary: "How monastic libraries and scribes preserved ancient Hellenic literature through rigorous translation standards.",
    content: "The preservation of classical manuscripts relied on a highly disciplined network of translators working in medieval scriptoriums.\n\nScribes spent decades cross-referencing fragmentary Greek scrolls with Syriac, Arabic, and Latin manuscripts. We investigate the scholarly discipline, inks, and binding techniques that guaranteed high textual fidelity across centuries of replication.",
    category: "Education",
    author: "Alexander",
    date: "May 15, 2026",
    readTime: "12 min read",
    imageUrl: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&q=80&w=600",
    isFeatured: false
  },
  {
    id: "post-6",
    title: "The Silent Dialogue: Reading Across Millennia",
    summary: "Exploring the cognitive and emotional resonance of engaging with long-dead authors through their preserved texts.",
    content: "To read a text written three thousand years ago is to engage in a silent, unidirectional conversation that transcends time.\n\nBy examining old marginalia and personal correspondence, we reveal how the psychological boundaries of readers have remained remarkably stable across human history.",
    category: "Stories",
    author: "Alexander",
    date: "May 10, 2026",
    readTime: "9 min read",
    imageUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=600",
    isFeatured: false
  }
];

export function getBlogPostSlug(post: { id: string; slug?: string; title?: string }): string {
  if (post.slug) return post.slug;
  if (post.title) {
    return post.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  }
  return post.id;
}

function ShareBlock({ post }: { post: BlogPost }) {
  const [copied, setCopied] = useState(false);
  const shareUrl = window.location.href;
  const shareTitle = post.title;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTwitterShare = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(`Read "${shareTitle}" on Scriptorium:`)}`;
    window.open(twitterUrl, "_blank", "noopener,noreferrer");
  };

  const handleLinkedinShare = () => {
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(linkedinUrl, "_blank", "noopener,noreferrer");
  };

  const handleEmailShare = () => {
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(`I thought you'd find this interesting:\n\n${shareTitle}\n${shareUrl}`)}`;
    window.location.href = mailtoUrl;
  };

  return (
    <div className="flex flex-col gap-3">
      <button
        onClick={handleCopy}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-stone-200 hover:border-[#e07540] text-stone-700 hover:text-stone-900 transition-colors rounded-none font-mono text-[11px] font-bold uppercase tracking-wider cursor-pointer active:scale-98"
      >
        <span className="flex items-center gap-2">
          {copied ? <Check className="w-3.5 h-3.5 text-green-600 animate-pulse" /> : <Link2 className="w-3.5 h-3.5" />}
          {copied ? "Link Copied!" : "Copy Post Link"}
        </span>
        <span className="text-[9px] text-stone-400 uppercase">url</span>
      </button>

      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={handleTwitterShare}
          className="flex flex-col items-center justify-center p-3 bg-white border border-stone-200 hover:border-[#e07540] text-stone-600 hover:text-[#1da1f2] transition-colors rounded-none cursor-pointer group active:scale-95"
          title="Share to Twitter / X"
        >
          <Twitter className="w-4 h-4 mb-1 group-hover:scale-110 transition-transform" />
          <span className="text-[9px] font-mono tracking-wider font-semibold">TWITTER</span>
        </button>

        <button
          onClick={handleLinkedinShare}
          className="flex flex-col items-center justify-center p-3 bg-white border border-stone-200 hover:border-[#e07540] text-stone-600 hover:text-[#0a66c2] transition-colors rounded-none cursor-pointer group active:scale-95"
          title="Share to LinkedIn"
        >
          <Linkedin className="w-4 h-4 mb-1 group-hover:scale-110 transition-transform" />
          <span className="text-[9px] font-mono tracking-wider font-semibold">LINKEDIN</span>
        </button>

        <button
          onClick={handleEmailShare}
          className="flex flex-col items-center justify-center p-3 bg-white border border-stone-200 hover:border-[#e07540] text-stone-600 hover:text-amber-600 transition-colors rounded-none cursor-pointer group active:scale-95"
          title="Share via Email"
        >
          <Mail className="w-4 h-4 mb-1 group-hover:scale-110 transition-transform" />
          <span className="text-[9px] font-mono tracking-wider font-semibold">EMAIL</span>
        </button>
      </div>
    </div>
  );
}

interface Reactions {
  like: number;
  love: number;
  fire: number;
  clap: number;
}

const DEFAULT_REACTIONS: Reactions = {
  like: 12,
  love: 8,
  fire: 5,
  clap: 15
};

interface Comment {
  id: string;
  author: string;
  content: string;
  date: string;
}

const DEFAULT_COMMENTS: Record<string, Comment[]> = {
  "post-1": [
    {
      id: "c1",
      author: "Chidi N.",
      content: "Excellent breakdown of the hydrological challenges. The drainage systems are indeed severely outdated for a city experiencing this scale of growth.",
      date: "Jul 4, 2026"
    },
    {
      id: "c2",
      author: "Folake A.",
      content: "We need more real enforcement on waste management. Solid waste is a massive factor in clogging the drainage channels.",
      date: "Jul 5, 2026"
    }
  ],
  "post-2": [
    {
      id: "c1",
      author: "Ibrahim K.",
      content: "Very comprehensive analysis. The distinction between ijara and pure lending is critical for modern Islamic finance. Thanks for this write-up.",
      date: "Jun 29, 2026"
    }
  ]
};

export function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewPost, setPreviewPost] = useState<BlogPost | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeFeaturedIndex, setActiveFeaturedIndex] = useState(0);
  const { config } = useHomepageConfig();
  const navigate = useNavigate();
  const { slug } = useParams<{ slug?: string }>();

  const selectedPost = slug 
    ? posts.find(p => getBlogPostSlug(p) === slug || p.id === slug) || null 
    : null;

  const [shareOpen, setShareOpen] = useState(false);
  const [reactions, setReactions] = useState<Reactions>(DEFAULT_REACTIONS);
  const [userReactions, setUserReactions] = useState<Record<string, boolean>>({});
  const [isSeriesRatingHovered, setIsSeriesRatingHovered] = useState(false);
  const [hoveredSeriesReaction, setHoveredSeriesReaction] = useState<string | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newCommentName, setNewCommentName] = useState("");
  const [newCommentText, setNewCommentText] = useState("");
  const [categoryPage, setCategoryPage] = useState(1);
  const categoriesPerPage = 5;

  useEffect(() => {
    if (selectedPost) {
      setShareOpen(false);
      const savedReactions = localStorage.getItem(`blog_reactions_${selectedPost.id}`);
      if (savedReactions) {
        try {
          setReactions(JSON.parse(savedReactions));
        } catch (e) {
          setReactions({ ...DEFAULT_REACTIONS });
        }
      } else {
        const seed = selectedPost.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const seeded = {
          like: (seed % 15) + 5,
          love: (seed % 10) + 3,
          fire: (seed % 8) + 2,
          clap: (seed % 12) + 4,
        };
        setReactions(seeded);
        localStorage.setItem(`blog_reactions_${selectedPost.id}`, JSON.stringify(seeded));
      }

      const savedUserReactions = localStorage.getItem(`user_reactions_${selectedPost.id}`);
      if (savedUserReactions) {
        try {
          setUserReactions(JSON.parse(savedUserReactions));
        } catch (e) {
          setUserReactions({});
        }
      } else {
        setUserReactions({});
      }

      const savedComments = localStorage.getItem(`blog_comments_${selectedPost.id}`);
      if (savedComments) {
        try {
          setComments(JSON.parse(savedComments));
        } catch (e) {
          setComments([]);
        }
      } else {
        const seeded = DEFAULT_COMMENTS[selectedPost.id] || [];
        setComments(seeded);
        localStorage.setItem(`blog_comments_${selectedPost.id}`, JSON.stringify(seeded));
      }
    }
  }, [selectedPost]);

  const handleReact = (type: keyof Reactions) => {
    if (!selectedPost) return;
    const previousReaction = Object.keys(userReactions).find(k => userReactions[k]) as keyof Reactions | undefined;
    const nextReactions = { ...reactions };
    const nextUserReactions: Record<string, boolean> = {};

    if (previousReaction) {
      if (previousReaction === type) {
        nextReactions[previousReaction] = Math.max(0, nextReactions[previousReaction] - 1);
      } else {
        nextReactions[previousReaction] = Math.max(0, nextReactions[previousReaction] - 1);
        nextReactions[type]++;
        nextUserReactions[type] = true;
      }
    } else {
      nextReactions[type]++;
      nextUserReactions[type] = true;
    }

    setReactions(nextReactions);
    setUserReactions(nextUserReactions);

    localStorage.setItem(`blog_reactions_${selectedPost.id}`, JSON.stringify(nextReactions));
    localStorage.setItem(`user_reactions_${selectedPost.id}`, JSON.stringify(nextUserReactions));
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPost || !newCommentName.trim() || !newCommentText.trim()) return;

    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      author: newCommentName.trim(),
      content: newCommentText.trim(),
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    };

    const updatedComments = [...comments, newComment];
    setComments(updatedComments);
    setNewCommentName("");
    setNewCommentText("");

    localStorage.setItem(`blog_comments_${selectedPost.id}`, JSON.stringify(updatedComments));
  };

  const setSelectedPost = (post: BlogPost | null) => {
    if (post) {
      navigate(`/blog/${getBlogPostSlug(post)}`);
    } else {
      navigate("/blog");
    }
  };

  const [blogInfo, setBlogInfo] = useState({
    title: "MONEYRISE BRIEFINGS",
    subtitle: "Knowledge & Research Archive",
    description: "Investigations, economic research papers, and stories curated directly from the Scriptorium."
  });

  // Fetch local blog-info.md content
  useEffect(() => {
    async function fetchBlogInfo() {
      try {
        const res = await fetch("/api/cms/blog-info");
        if (res.ok) {
          const json = await res.json();
          setBlogInfo(json);
        }
      } catch (err) {
        console.warn("Failed to fetch blog-info.md content:", err);
      }
    }
    fetchBlogInfo();
  }, []);

  // Live clock WAT timezone calculation
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatClockTime = () => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const dayName = days[currentTime.getDay()];
    const monthName = months[currentTime.getMonth()];
    const dateNum = currentTime.getDate();
    const year = currentTime.getFullYear();
    const timeStr = currentTime.toLocaleTimeString("en-US", { hour12: false });
    return `${dayName}, ${monthName} ${dateNum}, ${year}  •  ${timeStr} WAT`;
  };

  useEffect(() => {
    async function fetchPosts() {
      try {
        const res = await fetch("/api/cms/blog");
        if (res.ok) {
          const json = await res.json();
          const fetchedPosts = json.data || [];
          setPosts(fetchedPosts);
        } else {
          setPosts([]);
        }
      } catch (err) {
        console.warn("Failed to fetch blog posts:", err);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, []);

  const categories = ["All", ...Array.from(new Set(posts.map(p => p.category).filter(Boolean)))];

  const filteredPosts = selectedCategory === "All" 
    ? posts 
    : posts.filter(p => p.category === selectedCategory);

  const displayFeaturedPosts = posts.filter(p => p.isFeatured).length > 0
    ? posts.filter(p => p.isFeatured)
    : (posts.length > 0 ? [posts[0]] : []);

  // Auto-rotate featured carousel
  useEffect(() => {
    if (displayFeaturedPosts.length <= 1) return;
    const interval = setInterval(() => {
      setActiveFeaturedIndex((prev) => (prev + 1) % displayFeaturedPosts.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [displayFeaturedPosts.length]);  return (
    <Layout fullWidth={true}>
      <div className="w-full text-stone-900 min-h-screen pb-24 font-sans select-none text-left">
        
        {/* Constrained Header Area */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 pt-6">
          {/* Back to Home Navigation breadcrumb button */}
          <div className="mb-6">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-xs font-mono font-black uppercase tracking-widest text-[#be8873] hover:text-orange-600 transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
          
          {/* Page Header */}
          <div className="relative pb-4 mb-8 border-b border-stone-200">
            {/* Dynamic categories list in the header - styled as right-aligned nav links */}
            {!selectedPost && (
              <div className="flex items-center justify-end gap-6 overflow-x-auto py-2 no-scrollbar w-full">
                {categories.map((cat) => (
                  <Link
                    key={cat}
                    to="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setSelectedCategory(cat);
                      setCategoryPage(1);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className={`font-mono text-[10.5px] sm:text-[11px] uppercase tracking-widest transition-all duration-150 cursor-pointer whitespace-nowrap pb-1 border-b-2 active:scale-95 ${
                      selectedCategory === cat
                        ? "border-orange-500 text-orange-600 font-extrabold"
                        : "border-transparent text-stone-500 hover:text-orange-600 active:text-orange-700 font-bold"
                    }`}
                  >
                    {cat}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Breadcrumb Container for Subviews */}
          <div className="mt-2 flex items-center justify-between">
            {selectedPost ? (
              <>
                <button 
                  onClick={() => setSelectedPost(null)}
                  className="inline-flex items-center gap-2 text-xs font-mono text-[#e07540] hover:text-stone-900 font-semibold uppercase tracking-widest transition-all duration-200 cursor-pointer border-0 bg-transparent"
                >
                  <ChevronLeft className="w-4 h-4 text-[#e07540]" /> Back to Stories
                </button>
                
                {/* Share Dropdown on Top Right */}
                <div className="relative">
                  <button 
                    onClick={() => setShareOpen(!shareOpen)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#faf8f5] hover:bg-stone-100 border border-stone-200 text-stone-700 hover:text-stone-900 transition-colors rounded-none font-mono text-[11px] font-bold uppercase tracking-wider cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5 text-[#be8873]" />
                    <span>Share</span>
                  </button>
                  {shareOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white border border-stone-200 shadow-xl p-4 z-40 animate-fade-in rounded-none">
                      <h4 className="font-mono text-[10px] uppercase tracking-widest text-[#be8873] font-black border-b border-stone-200 pb-2 mb-3">
                        Share This Essay
                      </h4>
                      <ShareBlock post={selectedPost} />
                    </div>
                  )}
                </div>
              </>
            ) : null}
          </div>
        </div>

        {selectedPost ? (
          /* ==============================================
              SINGLE BLOG POST DETAIL VIEW (ROUNDED-NONE)
              ============================================== */
          <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-12 md:px-16 lg:px-24 mt-4 text-left">
            <motion.article 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8 text-stone-900"
            >
              <div className="space-y-4 max-w-5xl">
                <span className="font-mono text-xs uppercase tracking-widest text-[#e07540] font-extrabold inline-block">
                  {selectedPost.category}
                </span>
                <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-stone-950 uppercase">
                  {selectedPost.title}
                </h1>
                
                <div className="flex flex-wrap gap-4 text-xs font-mono text-stone-500 pt-2 border-y border-stone-200 py-3">
                  <span className="flex items-center gap-1.5 font-bold text-stone-700">
                    <User className="w-3.5 h-3.5 text-[#be8873]" /> BY {selectedPost.author.toUpperCase()}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#be8873]" /> {selectedPost.date}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#be8873]" /> {selectedPost.readTime}
                  </span>
                </div>
              </div>

              {selectedPost.imageUrl && (
                <div className="w-full h-64 sm:h-96 md:h-[28rem] lg:h-[35rem] overflow-hidden rounded-none shadow-sm border border-stone-200">
                  <img 
                    src={selectedPost.imageUrl} 
                    alt="" 
                    className="w-full h-full object-cover filter brightness-[98%]" 
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}

              {/* Single Column Layout (No sidebar, optimal reading width) */}
              <div className="w-full max-w-[1920px] mx-auto space-y-12 pt-4">
                <div className="font-serif text-stone-850 text-base sm:text-lg lg:text-xl leading-relaxed whitespace-pre-line space-y-6 w-full max-w-[1920px] mx-auto">
                  {selectedPost.content}
                </div>

                {/* Reactions Section */}
                <div className="border-y border-stone-200 py-8 text-center select-none">
                  <h4 className="font-mono text-[10px] uppercase tracking-widest text-[#be8873] font-black mb-1.5">
                    How do you react to this essay?
                  </h4>
                  
                  {/* Centered Reaction Buttons - Interactive Pulling Stack */}
                  <div className="flex justify-center select-none pt-2 pb-4">
                    <div 
                      className="relative flex items-center justify-start h-16 transition-all duration-350 ease-out" 
                      style={{ 
                        width: isSeriesRatingHovered 
                          ? "212px" 
                          : (Object.keys(userReactions).find(k => userReactions[k]) ? "48px" : "96px") 
                      }}
                      onMouseEnter={() => setIsSeriesRatingHovered(true)}
                      onMouseLeave={() => {
                        setIsSeriesRatingHovered(false);
                        setHoveredSeriesReaction(null);
                      }}
                    >
                      {(["like", "love", "fire", "clap"] as const).map((type, index) => {
                        const isSelected = !!userReactions[type];
                        const count = (reactions && reactions[type]) || 0;
                        const emojiMap: Record<string, string> = {
                          like: "👍",
                          love: "❤️",
                          fire: "🔥",
                          clap: "👏"
                        };
                        const labelMap: Record<string, string> = {
                          like: "Like",
                          love: "Love",
                          fire: "Fire",
                          clap: "Clap"
                        };

                        const activeReaction = Object.keys(userReactions).find(k => userReactions[k]);
                        let animateX = 0;
                        let animateScale = 1;
                        let animateOpacity = 1;
                        let pointerEvents: "auto" | "none" = "auto";
                        
                        if (isSeriesRatingHovered) {
                          animateX = index * 52;
                          animateScale = hoveredSeriesReaction === type ? 1.35 : 1.0;
                          animateOpacity = 1;
                        } else {
                          if (!activeReaction) {
                            animateX = index * 16;
                            animateScale = 1.0;
                            animateOpacity = 0.5 + (index * 0.12);
                          } else {
                            if (isSelected) {
                              animateX = 0;
                              animateScale = 1.15;
                              animateOpacity = 1;
                            } else {
                              animateX = 0;
                              animateScale = 0.5;
                              animateOpacity = 0;
                              pointerEvents = "none";
                            }
                          }
                        }
                        
                        return (
                          <motion.button
                            key={type}
                            type="button"
                            style={{ pointerEvents }}
                            animate={{ x: animateX, scale: animateScale, opacity: animateOpacity }}
                            transition={{ type: "spring", stiffness: 320, damping: 24 }}
                            onClick={() => handleReact(type)}
                            onMouseEnter={() => setHoveredSeriesReaction(type)}
                            className={`absolute left-0 w-12 h-12 rounded-full flex items-center justify-center text-2xl cursor-pointer bg-white border shadow-sm transition-colors duration-150 select-none ${
                              isSelected 
                                ? "border-[#be8873] bg-orange-50/50 shadow-md z-20" 
                                : "border-stone-200 hover:border-stone-450 z-10"
                            }`}
                            title={labelMap[type]}
                          >
                            <span className="relative">
                              {emojiMap[type]}
                            </span>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>

                  {Object.keys(userReactions).find(k => userReactions[k]) && (
                    <div className="animate-fade-in mt-1">
                      <span className="text-[10px] font-mono text-emerald-850 bg-emerald-50/60 border border-emerald-100 px-3 py-1 uppercase tracking-wider font-extrabold inline-block">
                        Active Reaction: {Object.keys(userReactions).find(k => userReactions[k])?.toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Comments Section */}
                <div className="space-y-6 pt-2">
                  <h3 className="font-serif text-lg font-black uppercase tracking-tight text-stone-950 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-[#be8873]" /> Discussion ({comments.length})
                  </h3>

                  {/* List of comments */}
                  <div className="space-y-4">
                    {comments.length === 0 ? (
                      <p className="text-xs font-serif text-stone-500 italic">No comments yet. Start the discussion below.</p>
                    ) : (
                      comments.map((comment) => (
                        <div key={comment.id} className="p-4 bg-[#faf8f5] border border-stone-200 rounded-none text-left space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-mono font-bold text-stone-800 uppercase">{comment.author}</span>
                            <span className="text-[10px] font-mono text-stone-400">{comment.date}</span>
                          </div>
                          <p className="text-xs sm:text-sm font-serif text-stone-700 leading-relaxed whitespace-pre-line">
                            {comment.content}
                          </p>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add comment form */}
                  <form onSubmit={handleAddComment} className="border border-stone-200 p-4 bg-white rounded-none space-y-4 text-left">
                    <h4 className="font-mono text-[10px] uppercase tracking-widest text-stone-500 font-bold border-b border-stone-100 pb-2">
                      Add a Comment
                    </h4>
                    
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-[10px] font-mono uppercase tracking-wider text-stone-500 mb-1">
                          Your Name
                        </label>
                        <input
                          type="text"
                          required
                          value={newCommentName}
                          onChange={(e) => setNewCommentName(e.target.value)}
                          className="w-full px-3 py-2 bg-stone-50 border border-stone-200 focus:border-[#be8873] focus:outline-none text-xs rounded-none font-sans"
                          placeholder="e.g. Alexander S."
                        />
                      </div>
                      
                      <div>
                        <label className="block text-[10px] font-mono uppercase tracking-wider text-stone-500 mb-1">
                          Comment
                        </label>
                        <textarea
                          required
                          rows={3}
                          value={newCommentText}
                          onChange={(e) => setNewCommentText(e.target.value)}
                          className="w-full px-3 py-2 bg-stone-50 border border-stone-200 focus:border-[#be8873] focus:outline-none text-xs rounded-none font-serif leading-relaxed"
                          placeholder="Share your thoughts about this research briefing..."
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-1">
                      <button
                        type="submit"
                        className="px-5 py-2.5 bg-stone-900 text-stone-100 hover:bg-[#be8873] hover:text-white transition-colors font-mono font-bold text-[10px] uppercase tracking-widest cursor-pointer rounded-none border-0"
                      >
                        Submit Comment
                      </button>
                    </div>
                  </form>
                </div>

                {/* Related Articles Section inside the main content area */}
                {posts.filter(p => p.id !== selectedPost.id).length > 0 && (
                  <div className="space-y-6 pt-8 border-t border-stone-200">
                    <h3 className="font-serif text-lg font-black uppercase tracking-tight text-stone-950 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-[#be8873]" /> Related stories
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {posts
                        .filter(p => p.id !== selectedPost.id)
                        .sort((a, b) => {
                          const aSame = a.category === selectedPost.category ? 1 : 0;
                          const bSame = b.category === selectedPost.category ? 1 : 0;
                          return bSame - aSame;
                        })
                        .slice(0, 2)
                        .map((post) => (
                          <div 
                            key={post.id} 
                            onClick={() => {
                              setSelectedPost(post);
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                            className="bg-[#faf8f5] hover:bg-stone-50 border border-stone-200 p-4 rounded-none cursor-pointer transition-colors space-y-2 group"
                          >
                            <span className="text-[10px] font-mono uppercase tracking-widest text-[#be8873] font-bold block">
                              {post.category}
                            </span>
                            <h4 className="font-serif text-sm font-bold text-stone-900 group-hover:text-[#e07540] transition-colors uppercase leading-snug">
                              {post.title}
                            </h4>
                            <p className="text-xs font-serif text-stone-500 line-clamp-2">
                              {post.summary}
                            </p>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.article>
          </div>
        ) : (
          /* ==============================================
              BLOG ARCHIVE MASTER VIEW (CAROUSEL & SECTIONS)
              ============================================== */
          <div className="w-full space-y-8 animate-fade-in">
            
            {/* ==============================================
                1. FEATURED CAROUSEL SECTION
                ============================================== */}
            {selectedCategory === "All" && displayFeaturedPosts.length > 0 && (
              <div className="w-full mt-4">
                <div className="relative w-full aspect-[2/1] sm:aspect-[21/9] bg-stone-100 overflow-hidden rounded-none border-y border-stone-200 group">
                  {/* Active carousel slide image */}
                  <div className="absolute inset-0 w-full h-full select-none pointer-events-none">
                    {displayFeaturedPosts[activeFeaturedIndex]?.imageUrl && (
                      <img 
                        src={displayFeaturedPosts[activeFeaturedIndex].imageUrl} 
                        alt="" 
                        className="w-full h-full object-cover transition-all duration-700 ease-in-out group-hover:scale-101 filter brightness-[85%]"
                        referrerPolicy="no-referrer"
                      />
                    )}
                    {/* Linear gradient shade overlay at the bottom */}
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent z-10" />
                  </div>

                  {/* Slider Content Block */}
                  <div className="absolute bottom-0 inset-x-0 z-20 pb-4 sm:pb-10 md:pb-12 px-4 sm:px-6 md:px-8">
                    <div className="max-w-5xl mx-auto flex flex-col items-start text-left space-y-1.5 sm:space-y-4 mt-[8px] mb-[15px] w-full">
                      <span className="font-mono text-[9px] sm:text-[10px] tracking-widest text-[#e07540] font-extrabold uppercase">
                        Featured • {displayFeaturedPosts[activeFeaturedIndex]?.category}
                      </span>
                      
                      <h2 
                        onClick={() => setSelectedPost(displayFeaturedPosts[activeFeaturedIndex])}
                        className="font-serif text-xl sm:text-4xl md:text-5xl font-black text-white leading-tight uppercase cursor-pointer hover:text-[#e07540] transition-colors tracking-tight line-clamp-2"
                      >
                        {displayFeaturedPosts[activeFeaturedIndex]?.title}
                      </h2>

                      <p className="text-xs sm:text-sm font-serif text-stone-200 leading-relaxed max-w-xl line-clamp-2 pt-1 hidden sm:block">
                        {displayFeaturedPosts[activeFeaturedIndex]?.summary}
                      </p>

                      <div className="pt-2">
                        <button 
                          onClick={() => setSelectedPost(displayFeaturedPosts[activeFeaturedIndex])}
                          className="inline-flex items-center gap-1.5 text-[10.5px] font-mono tracking-widest uppercase text-white font-extrabold border-b-2 border-[#e07540] pb-1 hover:text-[#e07540] hover:border-white transition-all cursor-pointer bg-transparent border-0 px-0"
                        >
                          Read Article <ArrowRight className="w-3.5 h-3.5 text-[#e07540]" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Sliding Arrows */}
                  {displayFeaturedPosts.length > 1 && (
                    <>
                      <button 
                        onClick={() => setActiveFeaturedIndex((prev) => (prev - 1 + displayFeaturedPosts.length) % displayFeaturedPosts.length)}
                        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 bg-stone-950/70 hover:bg-[#e07540] hover:text-white text-white flex items-center justify-center border border-stone-800 rounded-none cursor-pointer opacity-0 group-hover:opacity-100 transition-all duration-300"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => setActiveFeaturedIndex((prev) => (prev + 1) % displayFeaturedPosts.length)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 bg-stone-950/70 hover:bg-[#e07540] hover:text-white text-white flex items-center justify-center border border-stone-800 rounded-none cursor-pointer opacity-0 group-hover:opacity-100 transition-all duration-300"
                      >
                        <ChevronLeft className="w-5 h-5 rotate-180" />
                      </button>
                    </>
                  )}

                  {/* Horizontal indicators */}
                  {displayFeaturedPosts.length > 1 && (
                    <div className="absolute bottom-4 right-6 sm:right-10 z-30 flex gap-2">
                      {displayFeaturedPosts.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveFeaturedIndex(idx)}
                          className={`h-1.5 transition-all duration-300 cursor-pointer rounded-none border-0 ${
                            activeFeaturedIndex === idx ? "w-8 bg-[#e07540]" : "w-2.5 bg-white/45 hover:bg-white/70"
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Constrained Container for other sections */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 space-y-12 pb-12">
              {/* ==============================================
                  2. RECENT STORIES SECTION (GRID)
                  ============================================== */}
              {selectedCategory === "All" && (
                <div className="space-y-5">
                  <h3 className="font-serif font-black text-[18px] text-stone-950 text-left tracking-tight uppercase">
                    Recent stories
                  </h3>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-5 justify-items-center">
                    {posts
                      .filter(p => !displayFeaturedPosts.includes(p)) // Exclude current featured pool
                      .slice(0, 6)
                      .map((post) => (
                        <div 
                          key={post.id}
                          onClick={() => setSelectedPost(post)}
                          className="group flex flex-col bg-white/40 backdrop-blur-xs border border-stone-200/80 hover:border-[#be8873]/40 transition-all duration-355 relative select-none text-left rounded-none cursor-pointer p-3 w-full max-w-[220px] sm:w-[220px] h-[240px] shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_30px_rgba(190,136,115,0.08)] hover:-translate-y-0.5 gap-2.5 sm:gap-3"
                        >
                          {/* Image banner with square edge */}
                          <div className="w-full h-[100px] sm:h-[110px] overflow-hidden bg-stone-100 border border-stone-200/60 relative rounded-none shrink-0">
                            <img 
                              src={post.imageUrl} 
                              alt="" 
                              className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500 rounded-none mt-[-2px]"
                              referrerPolicy="no-referrer"
                            />
                          </div>

                          {/* Title details */}
                          <div className="pt-0.5 flex-1 flex flex-col justify-between min-w-0">
                            <h4 className="font-serif font-bold text-[12px] sm:text-[14px] text-stone-900 group-hover:text-[#e07540] transition-colors text-left leading-[17px] sm:leading-[20px] mt-[-8px] mb-[3px] pb-[-5px] line-clamp-3">
                              {post.title}
                            </h4>
                            <div className="mt-auto pt-1">
                              <span className="block w-full text-center text-[9px] sm:text-[10px] font-mono tracking-wider uppercase py-1.5 px-3 bg-orange-500 text-black group-hover:bg-stone-900 group-hover:text-white transition-all rounded-none font-bold">
                                Read
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* ==============================================
                  3. SECTION BY SECTION CATEGORIES
                  ============================================== */}
              {selectedCategory === "All" && (
                <div className="mt-16 space-y-12">
                  {(() => {
                    const actualCategoriesList = categories.filter(cat => cat !== "All" && posts.some(p => p.category === cat));
                    const totalCategoryPages = Math.ceil(actualCategoriesList.length / categoriesPerPage);
                    const paginatedCats = actualCategoriesList.slice(
                      (categoryPage - 1) * categoriesPerPage,
                      categoryPage * categoriesPerPage
                    );

                    return (
                      <>
                        {paginatedCats.map((category) => {
                          const allCategoryPosts = posts.filter(p => p.category === category);
                          const hasMore = allCategoryPosts.length > 7;
                          const categoryPosts = hasMore ? allCategoryPosts.slice(0, 7) : allCategoryPosts.slice(0, 8);
                          if (categoryPosts.length === 0) return null;

                          return (
                            <div key={category} className="space-y-4 border-b border-stone-200 pb-8 last:border-0 last:pb-0">
                              {/* Section Header */}
                              <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                                <h4 className="font-serif font-black text-[16px] uppercase tracking-widest text-[#be8873]">
                                  {category}
                                </h4>
                              </div>

                              {/* Stories Grid */}
                              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-5 justify-items-center">
                                {categoryPosts.map((post) => (
                                  <div 
                                    key={post.id}
                                    onClick={() => setSelectedPost(post)}
                                    className="group flex flex-col bg-white/40 backdrop-blur-xs border border-stone-200/80 hover:border-[#be8873]/40 transition-all duration-355 relative select-none text-left rounded-none cursor-pointer p-3 w-full max-w-[220px] sm:w-[220px] h-[240px] shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_30px_rgba(190,136,115,0.08)] hover:-translate-y-0.5 gap-2.5 sm:gap-3"
                                  >
                                    {/* Image banner with square edge */}
                                    <div className="w-full h-[100px] sm:h-[110px] overflow-hidden bg-stone-100 border border-stone-200/60 relative rounded-none shrink-0">
                                      <img 
                                        src={post.imageUrl} 
                                        alt="" 
                                        className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500 rounded-none mt-[-2px]"
                                        referrerPolicy="no-referrer"
                                      />
                                    </div>

                                    {/* Title details */}
                                    <div className="pt-0.5 flex-1 flex flex-col justify-between min-w-0">
                                      <h5 className="font-serif font-bold text-[12px] sm:text-[14px] text-stone-900 group-hover:text-[#e07540] transition-colors text-left leading-[17px] sm:leading-[20px] mt-[-8px] mb-[3px] pb-[-5px] line-clamp-3">
                                        {post.title}
                                      </h5>
                                      <div className="mt-auto pt-1">
                                        <span className="block w-full text-center text-[9px] sm:text-[10px] font-mono tracking-wider uppercase py-1.5 px-3 bg-orange-500 text-black group-hover:bg-stone-900 group-hover:text-white transition-all rounded-none font-bold">
                                          Read
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                ))}

                                {/* View More Card styled like a card */}
                                {hasMore && (
                                  <div 
                                    onClick={() => {
                                      setSelectedCategory(category);
                                      window.scrollTo({ top: 0, behavior: "smooth" });
                                    }}
                                    className="group flex flex-col items-center justify-center bg-white/30 hover:bg-white/70 border border-dashed border-[#be8873]/50 hover:border-[#be8873] transition-all duration-355 relative select-none text-center rounded-none cursor-pointer p-4 w-full max-w-[220px] sm:w-[220px] h-[240px] shadow-[0_2px_8px_rgba(0,0,0,0.01)] hover:shadow-[0_12px_30px_rgba(190,136,115,0.08)] hover:-translate-y-0.5 gap-2"
                                  >
                                  <div className="w-10 h-10 rounded-full border border-stone-200 flex items-center justify-center bg-white group-hover:border-[#be8873] group-hover:scale-105 transition-all duration-300">
                                    <ArrowRight className="w-4 h-4 text-stone-500 group-hover:text-[#e07540] transition-colors" />
                                  </div>
                                  <div className="space-y-1">
                                    <span className="font-mono text-[10px] font-black uppercase tracking-widest text-[#be8873] group-hover:text-[#e07540] transition-colors block">
                                      View More
                                    </span>
                                    <span className="font-serif text-xs text-stone-500 block leading-tight">
                                      Read more {category}
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}

                      {/* Categories Pagination Controls */}
                      {totalCategoryPages > 1 && (
                        <div className="flex items-center justify-center gap-4 pt-8 border-t border-stone-200 select-none">
                          <button
                            disabled={categoryPage === 1}
                            onClick={() => {
                              setCategoryPage(prev => Math.max(1, prev - 1));
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                            className="px-4 py-2 bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-mono font-bold uppercase tracking-wider rounded-none cursor-pointer flex items-center gap-1"
                          >
                            ← Previous
                          </button>
                          <span className="font-mono text-xs text-stone-600">
                            Page {categoryPage} of {totalCategoryPages}
                          </span>
                          <button
                            disabled={categoryPage === totalCategoryPages}
                            onClick={() => {
                              setCategoryPage(prev => Math.min(totalCategoryPages, prev + 1));
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                            className="px-4 py-2 bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-mono font-bold uppercase tracking-wider rounded-none cursor-pointer flex items-center gap-1"
                          >
                            Next →
                          </button>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            )}

            {/* ==============================================
                4. SPECIFIC CATEGORY FILTERED VIEW
                ============================================== */}
            {selectedCategory !== "All" && (
              <div className="mt-10 space-y-8">
                <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                  <h3 className="font-mono text-xs font-black uppercase tracking-widest text-[#be8873]">
                    Category: {selectedCategory}
                  </h3>
                  <span className="font-mono text-[9.5px] text-stone-500 uppercase tracking-widest">
                    {filteredPosts.length} {filteredPosts.length === 1 ? "Article" : "Articles"} Found
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-5 justify-items-center">
                  {filteredPosts.map((post) => (
                    <div 
                      key={post.id}
                      onClick={() => setSelectedPost(post)}
                      className="group flex flex-col bg-white/40 backdrop-blur-xs border border-stone-200/80 hover:border-[#be8873]/40 transition-all duration-355 relative select-none text-left rounded-none cursor-pointer p-3 w-full max-w-[220px] sm:w-[220px] h-[240px] shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_30px_rgba(190,136,115,0.08)] hover:-translate-y-0.5 gap-2.5 sm:gap-3"
                    >
                      {/* Image banner with square edge */}
                      <div className="w-full h-[100px] sm:h-[110px] overflow-hidden bg-stone-100 border border-stone-200/60 relative rounded-none shrink-0">
                        <img 
                          src={post.imageUrl} 
                          alt="" 
                          className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500 rounded-none mt-[-2px]"
                          referrerPolicy="no-referrer"
                        />
                      </div>

                      {/* Title details */}
                      <div className="pt-0.5 flex-1 flex flex-col justify-between min-w-0">
                        <h4 className="font-serif font-bold text-[12px] sm:text-[14px] text-stone-900 group-hover:text-[#e07540] transition-colors text-left leading-[17px] sm:leading-[20px] mt-[-8px] mb-[3px] pb-[-5px] line-clamp-3">
                          {post.title}
                        </h4>
                        <div className="mt-auto pt-1">
                          <span className="block w-full text-center text-[9px] sm:text-[10px] font-mono tracking-wider uppercase py-1.5 px-3 bg-orange-500 text-black group-hover:bg-stone-900 group-hover:text-white transition-all rounded-none font-bold">
                            Read
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            </div>
          </div>
        )}
      </div>

      {/* Modern, elegant Quick Preview Modal Popup (Strictly rounded-none) */}
      {previewPost && (
        <div className="fixed inset-0 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border border-stone-200 max-w-lg w-full rounded-none overflow-hidden shadow-2xl flex flex-col relative">
            <button 
              onClick={() => setPreviewPost(null)}
              className="absolute top-3 right-3 bg-stone-900 hover:bg-[#e07540] text-white p-2 rounded-none transition-all cursor-pointer z-10 border-0"
              title="Close Preview"
            >
              <ChevronLeft className="w-4 h-4 rotate-180" />
            </button>

            {previewPost.imageUrl && (
              <div className="h-48 sm:h-56 overflow-hidden relative rounded-none">
                <img 
                  src={previewPost.imageUrl} 
                  alt="" 
                  className="w-full h-full object-cover filter brightness-[95%] rounded-none"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute bottom-3 left-3 bg-stone-900/90 text-[8.5px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-none border border-stone-800 text-stone-100">
                  Preview Card
                </div>
              </div>
            )}

            <div className="p-6 space-y-4 text-left">
              <div className="space-y-1.5">
                <span className="font-mono text-[9px] bg-stone-100 text-[#be8873] px-2.5 py-0.5 border border-stone-200 rounded-none uppercase tracking-widest font-extrabold inline-block">
                  {previewPost.category}
                </span>
                <h3 className="font-serif text-lg sm:text-xl font-extrabold text-stone-900 uppercase tracking-tight leading-snug">
                  {previewPost.title}
                </h3>
                <div className="flex gap-3 text-[10px] font-mono text-stone-500 border-t border-stone-200 pt-2">
                  <span>By {previewPost.author}</span>
                  <span>•</span>
                  <span>{previewPost.date}</span>
                  <span>•</span>
                  <span>{previewPost.readTime}</span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-stone-700 font-serif leading-relaxed">
                {previewPost.summary}
              </p>

              <div className="flex justify-end gap-2 pt-2 border-t border-stone-200">
                <button 
                  onClick={() => setPreviewPost(null)}
                  className="px-4 py-2 border border-stone-200 hover:border-stone-400 text-stone-600 bg-transparent font-mono text-[10px] uppercase font-bold tracking-widest rounded-none transition-colors cursor-pointer"
                >
                  Close
                </button>
                <button 
                  onClick={() => {
                    setSelectedPost(previewPost);
                    setPreviewPost(null);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="px-4 py-2 bg-[#e07540] hover:bg-stone-900 text-white font-mono text-[10px] uppercase font-bold tracking-widest rounded-none transition-colors cursor-pointer border-0"
                >
                  Read Full Essay
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default Blog;
