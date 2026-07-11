import React, { ReactNode, useState, useEffect } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { ArrowUp } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface LayoutProps {
  children: ReactNode;
  fullWidth?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function Layout({ children, fullWidth = false, className = "", style }: LayoutProps) {
  const customBg = style?.backgroundColor;
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (typeof window !== "undefined") {
        if (window.scrollY > 300) {
          setShowScrollTop(true);
        } else {
          setShowScrollTop(false);
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div 
      style={style}
      className={`min-h-screen ${customBg ? "" : "bg-parchment-50"} text-parchment-950 flex flex-col font-sans selection:bg-orange-200 selection:text-parchment-950 leading-normal transition-all duration-700 ease-in-out overflow-x-hidden ${fullWidth ? "" : "p-4 sm:p-6 md:p-8"} ${className} max-w-[1920px] mx-auto w-full`}
    >
      {/* Primary Layout Frame */}
      <div className={`w-full mx-auto flex-1 flex flex-col ${fullWidth ? "max-w-[1920px]" : "max-w-7xl"}`}>
        <div className={fullWidth ? "px-4 sm:px-6 md:px-8 pt-4 sm:pt-6" : ""}>
          <Navbar />
        </div>
        <main className="flex-1 w-full flex flex-col">
          {children}
        </main>

        <div className={fullWidth ? "px-4 sm:px-6 md:px-8 pb-4 sm:pb-6" : ""}>
          <Footer />
        </div>
      </div>

      {/* Floating Back to Top Big Arrow Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            key="scroll-to-top"
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            transition={{ duration: 0.2 }}
            type="button"
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-50 flex items-center justify-center w-12 h-12 md:w-14 md:h-14 bg-[#e07540] hover:bg-amber-700 text-white rounded-full border border-amber-600 cursor-pointer shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 active:translate-y-0"
            title="Scroll to Top"
          >
            <ArrowUp className="w-6 h-6 md:w-7 md:h-7 text-white animate-pulse" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
export default Layout;
