import React, { useState, useEffect } from "react";
import { Link, NavLink, useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, Search } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchValue, setSearchValue] = useState(searchParams.get("q") || "");

  // Sync state if URL changes externally
  useEffect(() => {
    setSearchValue(searchParams.get("q") || "");
  }, [searchParams]);

  const handleSearchChange = (val: string) => {
    setSearchValue(val);
    
    const isCatalog = ["/books", "/genre", "/reviews"].includes(location.pathname);
    if (isCatalog) {
      const newParams = new URLSearchParams(searchParams);
      if (val) {
        newParams.set("q", val);
      } else {
        newParams.delete("q");
      }
      setSearchParams(newParams);
    } else {
      if (val) {
        navigate(`/books?q=${encodeURIComponent(val)}`);
      } else {
        navigate("/books");
      }
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-parchment-50/90 border-b border-parchment-200 transition-all duration-350">
      <div 
        className="max-w-[1920px] w-full px-4 sm:px-12 md:px-16 lg:px-20 py-4 flex items-center justify-between mx-auto relative"
        style={{ paddingLeft: "50px", paddingRight: "50px", paddingTop: "10px", paddingBottom: "10px" }}
      >
        
        {/* Brand Identity / Responsive Font Sizing - Centered on Mobile, Left on Desktop */}
        <div className="absolute left-1/2 -translate-x-1/2 lg:static lg:left-auto lg:translate-x-0 flex items-center shrink-0 z-10">
          <Link 
            to="/" 
            className="text-[13px] xs:text-[15px] sm:text-base md:text-lg font-serif font-extrabold tracking-widest text-[#121110] hover:text-orange-600 transition-colors uppercase select-none"
          >
            Library of Alexander
          </Link>
        </div>

        {/* Desktop Navigation Links & Compact Search - Right-aligned */}
        <div 
          className="flex items-center gap-4 sm:gap-5 xl:gap-6 lg:flex-1 lg:justify-end lg:ml-[30px] lg:w-[900px] lg:pl-0 lg:mr-[-50px]"
          style={{ marginLeft: "60px" }}
        >
          {/* Desktop Navigation Links - Flat Layout */}
          <div className="hidden lg:flex gap-5 xl:gap-6 items-center text-[10px] font-mono font-bold uppercase tracking-widest text-[#121110]">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `transition-all pb-1 border-b-2 hover:text-orange-600 ${
                  isActive && !location.hash ? "border-orange-500 text-orange-600 font-extrabold" : "border-transparent"
                }`
              }
            >
              Home
            </NavLink>

            <Link
              to="/#top-picks-section"
              className={`transition-all pb-1 border-b-2 hover:text-orange-600 ${
                location.hash === "#top-picks-section" ? "border-orange-500 text-orange-600 font-extrabold" : "border-transparent"
              }`}
            >
              Top Picks
            </Link>

            <Link
              to="/#discovery-section"
              className={`transition-all pb-1 border-b-2 hover:text-orange-600 ${
                location.hash === "#discovery-section" ? "border-orange-500 text-orange-600 font-extrabold" : "border-transparent"
              }`}
            >
              Discovery
            </Link>

            <Link
              to="/#bottom-shelf-section"
              className={`transition-all pb-1 border-b-2 hover:text-orange-600 ${
                location.hash === "#bottom-shelf-section" ? "border-orange-500 text-orange-600 font-extrabold" : "border-transparent"
              }`}
            >
              Bottom Shelf
            </Link>

            <NavLink
              to="/books"
              className={({ isActive }) =>
                `transition-all pb-1 border-b-2 hover:text-orange-600 ${
                  isActive ? "border-orange-500 text-orange-600 font-extrabold" : "border-transparent"
                }`
              }
            >
              Library Collection
            </NavLink>

            <NavLink
              to="/blog"
              className={({ isActive }) =>
                `transition-all pb-1 border-b-2 hover:text-orange-600 ${
                  isActive ? "border-orange-500 text-orange-600 font-extrabold" : "border-transparent"
                }`
              }
            >
              Blog
            </NavLink>

            <NavLink
              to="/author"
              className={({ isActive }) =>
                `transition-all pb-1 border-b-2 hover:text-orange-600 ${
                  isActive ? "border-orange-500 text-orange-600 font-extrabold" : "border-transparent"
                }`
              }
            >
              Authors
            </NavLink>

            <NavLink
              to="/original-books"
              className={({ isActive }) =>
                `transition-all px-3 py-1.5 text-[9.5px] font-mono font-black uppercase tracking-widest border rounded-none transition-colors duration-250 ${
                  isActive 
                    ? "bg-stone-900 border-stone-900 text-white" 
                    : "bg-orange-500 border-orange-500 text-black hover:bg-stone-900 hover:border-stone-900 hover:text-white"
                }`
              }
            >
              Original Books
            </NavLink>
          </div>

          {/* Dynamic Global Search on Nav - Compact circular style */}
          <div className="hidden sm:flex items-center relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Search className="w-3.5 h-3.5 text-stone-400" />
            </div>
            <input
              type="text"
              placeholder="Search..."
              value={searchValue}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-28 md:w-36 focus:w-48 pl-8 pr-7 py-1.5 bg-stone-100/60 hover:bg-stone-100 focus:bg-white border border-stone-200/80 focus:border-stone-900 text-[11px] font-sans focus:outline-none transition-all duration-300 rounded-full placeholder-stone-405 text-stone-800"
            />
            {searchValue && (
              <button
                onClick={() => handleSearchChange("")}
                className="absolute right-2.5 top-2.5 text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Mobile menu trigger with 44px touch target optimization */}
        <div className="flex lg:hidden items-center z-20">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="w-9 h-9 flex items-center justify-center text-[#121110] hover:text-orange-600 transition-all cursor-pointer border-none bg-transparent outline-none"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Menu expanded area with high fidelity motion */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="lg:hidden border-t border-parchment-200 bg-[#fcfaf7] overflow-hidden text-left"
          >
            <div className="px-6 py-5 space-y-2.5 font-mono text-[11px] uppercase tracking-wider text-stone-800">
              {/* Mobile Search Input */}
              <div className="relative pb-3 mb-2 border-b border-stone-200/50">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none pb-3">
                  <Search className="w-3.5 h-3.5 text-stone-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search catalog..."
                  value={searchValue}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 bg-stone-100 hover:bg-stone-50 border border-stone-200 text-xs font-sans focus:outline-none transition-all rounded-lg text-stone-800"
                />
                {searchValue && (
                  <button
                    onClick={() => handleSearchChange("")}
                    className="absolute right-2.5 top-2.5 text-[9px] font-mono text-stone-450 hover:text-stone-700 font-extrabold"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <Link
                to="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-2.5 border-b border-stone-200/40 hover:text-orange-600 transition-colors uppercase font-bold"
              >
                Home
              </Link>

              <Link
                to="/#top-picks-section"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-2.5 border-b border-stone-200/40 hover:text-orange-600 transition-colors uppercase font-bold text-[#be8873]"
              >
                Top Picks
              </Link>

              <Link
                to="/#discovery-section"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-2.5 border-b border-stone-200/40 hover:text-orange-600 transition-colors uppercase font-bold text-[#be8873]"
              >
                Discovery
              </Link>

              <Link
                to="/#bottom-shelf-section"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-2.5 border-b border-stone-200/40 hover:text-orange-600 transition-colors uppercase font-bold text-[#be8873]"
              >
                Bottom Shelf
              </Link>

              <Link
                to="/books"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-2.5 border-b border-stone-200/40 hover:text-orange-600 transition-colors uppercase"
              >
                Library Collection
              </Link>

              <Link
                to="/blog"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-2.5 border-b border-stone-200/40 hover:text-orange-600 transition-colors uppercase font-bold"
              >
                Blog
              </Link>

              <Link
                to="/author"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-2.5 border-b border-stone-200/40 hover:text-orange-600 transition-colors uppercase font-bold"
              >
                Authors
              </Link>
              
              <div className="pt-2">
                <Link
                  to="/original-books"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-center py-2.5 px-4 bg-orange-500 hover:bg-stone-900 text-black hover:text-white transition-all font-mono font-black uppercase tracking-widest text-[10px]"
                >
                  Original Books
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

export default Navbar;
