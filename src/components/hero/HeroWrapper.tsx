import React from "react";
import { motion } from "motion/react";
import { BookOpen } from "lucide-react";
import { useHomepageConfig } from "../../hooks/useHomepageConfig";

export function HeroWrapper() {
  const { config } = useHomepageConfig();

  // Retrieve portrait background image URL
  const profileImageUrl = (config?.heroImageUrl && config.heroImageUrl.trim() !== "") 
    ? config.heroImageUrl 
    : "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=1200";

  // Staggered animation containers for a flawless entry
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1]
      }
    }
  };

  const greetingWords = "Hi, my name is Alexander,".split(" ");

  return (
    <div 
      id="alexander-hero" 
      className="w-full relative bg-dusk-blue flex items-center p-6 sm:p-10 md:p-12 lg:p-16 overflow-hidden select-text border-b border-dusk-blue/40 min-h-[400px] md:h-[400px] h-auto py-12 md:py-0"
    >
      {/* Background Image on Right with Dusk-Blue Gradient Overlay */}
      <div className="absolute right-0 top-0 bottom-0 w-full md:w-[50%] h-full z-0 overflow-hidden">
        <motion.img
          initial={{ scale: 1.15, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.75 }}
          transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
          src={profileImageUrl}
          alt="Alexander"
          className="w-full h-full object-cover object-right select-none pointer-events-none"
          referrerPolicy="no-referrer"
        />
        {/* Intentionally mapped gradient: fully solid left (dusk blue) transition to transparent */}
        <div className="absolute inset-0 bg-gradient-to-r from-dusk-blue via-dusk-blue/95 via-dusk-blue/60 to-transparent z-10" />
      </div>

      {/* Primary Content Container */}
      <div className="max-w-5xl w-full relative z-20">
        
        {/* Text Content */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-start text-left space-y-7 select-text"
        >

          {/* Tier 1: Bold display layout heading text inline as specified */}
          <div className="w-full overflow-hidden">
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-5.5xl text-white tracking-tight leading-normal max-w-3xl">
              <motion.span
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 95, damping: 14, delay: 0.1 }}
                className="inline-block font-medium text-white/90 mr-3"
              >
                Hi, my name is
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 95, damping: 14, delay: 0.3 }}
                className="inline-block font-black text-yellow tracking-tighter border-b-4 border-yellow/30"
              >
                Alexander
              </motion.span>
            </h1>
          </div>

          {/* Tier 2 & 3: Consolidated beautifully styled paragraphs using Poppins/Roboto consistency */}
          <motion.div
            variants={itemVariants}
            className="space-y-5 text-sm sm:text-base md:text-lg text-white/90 font-sans leading-relaxed font-normal max-w-2xl"
          >
            <p>
              and welcome to my library—a space I created to share my love of books and the stories I’ve experienced through reading. The goal of this site is simple: to highlight the kinds of books I read, help spark a love for reading in you, and make it easier for you to discover your next great read.
            </p>
            <p>
              You can explore any book that interests you on the Reviews page, and if you’d like, you can also check out my original works on the Original Books page. I hope you find this space helpful as you search for your next read.
            </p>
          </motion.div>

        </motion.div>

      </div>
    </div>
  );
}

export default HeroWrapper;
