import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

import Home from "../pages/Home";
import Book from "../pages/Book";
import Genre from "../pages/Genre";
import Review from "../pages/Review";
import Author from "../pages/Author";
import OriginalBooks from "../pages/OriginalBooks";
import ReadOriginalBook from "../pages/ReadOriginalBook";
import Disclaimer from "../pages/Disclaimer";
import Blog from "../pages/Blog";
import CategoryDetail from "../pages/CategoryDetail";


function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      // Wait slightly for DOM to render if navigating from another page
      const id = hash.replace("#", "");
      const timer = setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
      return () => clearTimeout(timer);
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);

  return null;
}

export function AppRoutes() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* Core Scriptorium Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/book/:id" element={<Book />} />
        <Route path="/genre" element={<Genre />} />
        <Route path="/books" element={<Genre />} />
        <Route path="/reviews" element={<Genre />} />
        <Route path="/review/:id" element={<Review />} />
        <Route path="/author/:name" element={<Author />} />
        <Route path="/author" element={<Author />} />
        <Route path="/original-books" element={<OriginalBooks />} />
        <Route path="/original-book/:id" element={<ReadOriginalBook />} />
        <Route path="/disclaimer" element={<Disclaimer />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<Blog />} />
        <Route path="/category/:id" element={<CategoryDetail />} />


        {/* Fallback to index */}
        <Route path="*" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
