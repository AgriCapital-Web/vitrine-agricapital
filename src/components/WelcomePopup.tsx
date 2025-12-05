import { useEffect, useState } from "react";
import { X } from "lucide-react";
import posterImage from "@/assets/poster-agricapital.jpg";

const WelcomePopup = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasVisited = sessionStorage.getItem("hasVisitedAgriCapital");
    
    if (!hasVisited) {
      setIsOpen(true);
      sessionStorage.setItem("hasVisitedAgriCapital", "true");
    }
  }, []);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 z-[100000] flex items-center justify-center p-2 sm:p-4 animate-fade-in"
      onClick={() => setIsOpen(false)}
    >
      <div 
        className="relative bg-background rounded-xl shadow-2xl w-full max-w-[95vw] sm:max-w-[90vw] md:max-w-2xl lg:max-w-3xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
        style={{ maxHeight: 'calc(100vh - 2rem)' }}
      >
        {/* Close button */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute -top-2 -right-2 sm:top-3 sm:right-3 md:-top-3 md:-right-3 bg-agri-orange text-white rounded-full p-2 md:p-3 hover:bg-agri-orange/90 transition-all shadow-xl z-10 hover:scale-110 active:scale-95"
          aria-label="Fermer"
        >
          <X className="w-5 h-5 md:w-6 md:h-6" strokeWidth={3} />
        </button>
        
        {/* Image container with responsive sizing */}
        <div className="overflow-hidden rounded-xl">
          <img
            src={posterImage}
            alt="Bienvenue chez AgriCapital"
            className="w-full h-auto object-contain"
            style={{ maxHeight: 'calc(100vh - 6rem)' }}
          />
        </div>
        
        {/* Bottom close button for mobile */}
        <div className="sm:hidden p-3 bg-background border-t border-border rounded-b-xl">
          <button
            onClick={() => setIsOpen(false)}
            className="w-full py-2.5 bg-agri-orange text-white font-semibold rounded-lg hover:bg-agri-orange/90 transition-all active:scale-98 flex items-center justify-center gap-2 text-sm"
          >
            <X className="w-4 h-4" />
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomePopup;
