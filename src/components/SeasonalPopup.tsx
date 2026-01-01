import { useMemo } from "react";
import WelcomePopup from "./WelcomePopup";
import NewYearPopup from "./NewYearPopup";

/**
 * SeasonalPopup - Affiche le popup approprié selon la période
 * - Du 1er janvier au 31 janvier: Popup Nouvel An 2026
 * - Le reste de l'année: Popup de bienvenue standard
 */
const SeasonalPopup = () => {
  const isNewYearPeriod = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); // 0-indexed (janvier = 0)
    const day = now.getDate();
    
    // Période Nouvel An: du 1er janvier au 31 janvier
    // Pour 2026: du 1er janvier 2026 00:00 au 31 janvier 2026 23:59
    if (year === 2026 && month === 0) {
      // Janvier 2026
      return true;
    }
    
    // Pour les tests en décembre 2025 (optionnel, à retirer en production)
    // if (year === 2025 && month === 11 && day >= 25) {
    //   return true;
    // }
    
    return false;
  }, []);

  // Afficher le popup Nouvel An si on est en janvier 2026
  if (isNewYearPeriod) {
    return <NewYearPopup />;
  }
  
  // Sinon afficher le popup de bienvenue standard
  return <WelcomePopup />;
};

export default SeasonalPopup;
