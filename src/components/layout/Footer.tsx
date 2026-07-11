import React from "react";
import { Link } from "react-router-dom";
import { ArrowUp } from "lucide-react";

export function Footer() {
  const logoText = "LIBRARY OF ALEXANDER";
  const footerDescription =
    '"Reading is a sacred act of guided dreaming." — A modern digital library dedicated to lifting the heavy dust off forgotten masterworks, reviewing timeless ideas, and capturing original manuscripts.';

  const navLinks = [
    { title: "Home", url: "/" },
    { title: "Top Picks", url: "/#top-picks-section" },
    { title: "Discovery", url: "/#discovery-section" },
    { title: "Bottom Shelf", url: "/#bottom-shelf-section" },
    { title: "Library Collection", url: "/books" },
    { title: "Blog", url: "/blog" },
    { title: "Authors", url: "/author" },
    { title: "Original Books", url: "/original-books" },
    { title: "Disclaimer", url: "/disclaimer" },
  ];

  return (
    <footer id="library-footer" className="w-full bg-parchment-100 text-parchment-900 mt-24 border-t border-parchment-300 font-sans relative overflow-hidden">
      {/* Decorative Top Border Accent */}
      <div className="h-[2px] bg-gradient-to-r from-orange-400 via-[#be8873] to-orange-400 opacity-60 w-full" />

      <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-12 md:px-16 lg:px-20 py-12 md:py-16 bg-gradient-to-br from-parchment-50 via-parchment-100 to-parchment-200/70 border-t border-parchment-200/50 shadow-inner">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-center md:text-left mb-10 pb-10 border-b border-parchment-300/40">
          {/* Column 1: Library Identity & Philosophy */}
          <div className="space-y-4 flex flex-col items-center md:items-start">
            <span className="text-[#845748] font-serif text-base sm:text-lg font-black tracking-widest uppercase select-none">
              {logoText}
            </span>
            <p className="text-xs font-serif italic text-parchment-800/85 leading-relaxed max-w-sm">
              {footerDescription}
            </p>
          </div>

          {/* Column 2: Directory Map / General Nav */}
          <div className="space-y-4 pt-1 flex flex-col items-center md:items-start w-full">
            <h4 className="text-[11px] font-mono font-black uppercase text-[#a46d5b] tracking-widest">
              DIRECTORY MAP
            </h4>
            <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-xs font-serif w-full max-w-xs md:max-w-none justify-items-start md:justify-items-start mx-auto md:mx-0 pl-8 sm:pl-16 md:pl-0">
              {navLinks.map((link, idx) => (
                <Link
                  key={idx}
                  to={link.url}
                  className="text-parchment-800 hover:text-orange-600 transition-all hover:translate-x-1 duration-150 inline-block font-medium"
                >
                  {link.title}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Footer bottom with copyrights */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <div className="text-[10px] font-mono tracking-widest text-[#a46d5b] uppercase text-center">
            © {new Date().getFullYear()} Library of Alexander. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
