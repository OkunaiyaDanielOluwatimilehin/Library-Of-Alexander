import React from "react";
import { Book } from "../../types";
import { BookCard } from "./BookCard";
import { motion } from "motion/react";

interface BookGridProps {
  books: Book[];
  viewMode?: "grid" | "list";
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      type: "spring", 
      stiffness: 100, 
      damping: 16 
    } 
  },
};

export function BookGrid({ books }: BookGridProps) {
  if (books.length === 0) {
    return (
      <div className="p-12 text-center bg-parchment-50 border border-dashed border-parchment-200 rounded-none space-y-3">
        <p className="font-serif text-parchment-500 text-sm">No book reviews found matching your criteria.</p>
        <p className="text-[10px] text-parchment-400 font-mono">Try clearing your filters or searching for something else.</p>
      </div>
    );
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 sm:gap-x-8 gap-y-12 pt-2 w-full max-w-6xl mx-auto justify-items-center justify-center"
    >
      {books.map((book) => (
        <motion.div key={book.id} variants={itemVariants} className="flex justify-center">
          <BookCard review={book} viewMode="grid" />
        </motion.div>
      ))}
    </motion.div>
  );
}
export default BookGrid;
