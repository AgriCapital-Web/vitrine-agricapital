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
      className="fixed inset-0 bg-black/60 z-[100000] flex items-center justify-center p-4 animate-fade-in"
      onClick={() => setIsOpen(false)}
    >
      <div 
        className="relative bg-background rounded-xl shadow-2xl w-full max-w-[90vw] md:max-w-2xl lg:max-w-3xl max-h-[90vh] overflow-auto animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button - More visible on all devices */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-3 right-3 md:-top-2 md:-right-2 bg-agri-orange text-white rounded-full p-2 md:p-3 hover:bg-agri-orange/90 transition-all shadow-xl z-10 hover:scale-110 active:scale-95"
          aria-label="Fermer"
        >
          <X className="w-5 h-5 md:w-6 md:h-6" strokeWidth={3} />
        </button>
        
        {/* Mobile close bar */}
        <div className="md:hidden absolute top-0 left-0 right-0 bg-gradient-to-b from-black/50 to-transparent h-16 rounded-t-xl flex items-start justify-end p-3 pointer-events-none">
          <span className="text-white/80 text-xs font-medium mr-12 mt-1">Appuyez pour fermer</span>
        </div>
        
        <div className="overflow-hidden rounded-xl">
          <img
            src={posterImage}
            alt="Bienvenue chez AgriCapital"
            className="w-full h-auto"
          />
        </div>
        
        {/* Bottom close button for mobile */}
        <div className="md:hidden p-4 bg-background border-t border-border">
          <button
            onClick={() => setIsOpen(false)}
            className="w-full py-3 bg-agri-orange text-white font-semibold rounded-lg hover:bg-agri-orange/90 transition-all active:scale-98 flex items-center justify-center gap-2"
          >
            <X className="w-5 h-5" />
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomePopup;
