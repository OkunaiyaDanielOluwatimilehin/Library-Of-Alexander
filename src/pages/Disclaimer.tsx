import React from "react";
import Layout from "../components/layout/Layout";
import { ShieldCheck, ArrowLeft, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

export function Disclaimer() {
  React.useEffect(() => {
    document.title = "Disclaimer | Library of Alexander";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <Layout fullWidth={true}>
      <div className="pt-8 sm:pt-12 pb-16 animate-fade-in text-left max-w-[1920px] w-full px-4 sm:px-12 md:px-16 lg:px-20 mx-auto text-parchment-950 font-sans">
        
        {/* Navigation & Go Back */}
        <div className="flex justify-between items-center border-b border-stone-200/80 pb-5 mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-[10px] font-mono tracking-widest text-[#be8873] hover:text-orange-600 transition-colors uppercase font-black"
          >
            <ArrowLeft className="w-4 h-4 text-orange-500" /> Back to Home
          </Link>
          <span className="text-[10px] font-mono uppercase bg-orange-100 text-[#7c2d12] px-3 py-1 border border-orange-200 font-bold tracking-widest">
            Scholastic Charter
          </span>
        </div>

        {/* Content Frame */}
        <div className="w-full relative overflow-hidden py-4">
          {/* Accent decoration bars */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-400 via-orange-600 to-yellow-600" />
          
          <div className="space-y-10">
            {/* Header Identity */}
            <div className="text-center space-y-3.5 border-b border-stone-200 pb-8">
              <div className="inline-flex p-3 bg-orange-50 border border-orange-200 text-orange-600 rounded-none mb-1">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h1 className="font-serif text-2xl sm:text-3.5xl font-black text-stone-900 tracking-tight uppercase leading-tight">
                Legal & Copyright Alignment
              </h1>
              <p className="font-mono text-[10px] tracking-widest text-stone-500 uppercase font-bold">
                Intellectual Integrity and Creative Respect Charter
              </p>
            </div>

            {/* Markdown Translation */}
            <div className="font-serif text-stone-800 text-sm sm:text-base leading-relaxed space-y-6">
              
              <h2 className="text-lg sm:text-xl font-bold text-stone-900 tracking-tight uppercase border-b border-dashed border-stone-200 pb-2">
                Copyright & Content Respect Disclaimer
              </h2>

              <p>
                This website exists to discuss, review, and analyze books while respecting the rights of authors, publishers, and copyright holders.
              </p>

              <p>
                All books, excerpts, cover images, trademarks, and related intellectual property remain the property of their respective owners. Any references, quotations, or images used on this site are included solely for the purposes of review, commentary, criticism, education, or discussion.
              </p>

              <div className="p-5 bg-orange-50/50 border-l-4 border-orange-500 my-4 text-stone-850">
                This website does not host, distribute, reproduce, or provide unauthorized copies of books in any format. We do not share, promote, or link to websites that offer copyrighted books for free download without proper authorization from the copyright holder.
              </div>

              <p>
                We strongly support authors, publishers, and the creative work involved in producing books. Readers are encouraged to obtain books through legitimate channels, including authorized retailers, publishers, libraries, and licensed platforms.
              </p>

              <p>
                User-generated content, comments, or submissions that request, promote, distribute, or link to unauthorized copies of books may be removed without notice. The sharing of pirated or copyright-infringing materials is not permitted on this website.
              </p>

              <p>
                If you are a copyright holder and believe that any content on this website infringes upon your rights, please contact us directly so the matter can be reviewed and addressed promptly.
              </p>

              <p className="font-serif italic text-stone-600 bg-stone-50 p-4 border border-stone-200 text-xs sm:text-sm">
                By using this website, you acknowledge and agree to respect applicable copyright laws and the intellectual property rights of authors, publishers, and content creators.
              </p>
            </div>

            {/* Bottom Scriptorium seal description */}
            <div className="border-t border-stone-200 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-stone-500">
              <span className="tracking-widest uppercase text-[9px] font-black text-[#be8873] flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-orange-500" /> Custodian Library Archives
              </span>
              <span>Updated: June 2026</span>
            </div>

          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Disclaimer;
