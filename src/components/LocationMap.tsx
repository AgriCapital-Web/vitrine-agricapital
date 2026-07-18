import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { MapPin, Navigation, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

declare global {
  interface Window {
    google: any;
    __agrcapInitMap?: () => void;
  }
}

// Coordonnées AgriCapital — Daloa, Côte d'Ivoire
const AGRICAPITAL_COORDS = { lat: 6.8770, lng: -6.4502 };
const ADDRESS_LABEL = "AgriCapital — Daloa, Côte d'Ivoire";

const BROWSER_KEY = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY as string | undefined;
const TRACKING_ID = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_TRACKING_ID as string | undefined;

let mapsLoaderPromise: Promise<void> | null = null;

function loadGoogleMaps(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("no window"));
  if (window.google?.maps?.Map) return Promise.resolve();
  if (mapsLoaderPromise) return mapsLoaderPromise;
  if (!BROWSER_KEY) return Promise.reject(new Error("missing browser key"));

  mapsLoaderPromise = new Promise<void>((resolve, reject) => {
    window.__agrcapInitMap = () => resolve();
    const script = document.createElement("script");
    const channel = TRACKING_ID ? `&channel=${encodeURIComponent(TRACKING_ID)}` : "";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${BROWSER_KEY}&loading=async&callback=__agrcapInitMap${channel}`;
    script.async = true;
    script.defer = true;
    script.onerror = () => reject(new Error("Impossible de charger Google Maps"));
    document.head.appendChild(script);
  });
  return mapsLoaderPromise;
}

const LocationMap = () => {
  const mapDivRef = useRef<HTMLDivElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadGoogleMaps()
      .then(() => {
        if (cancelled || !mapDivRef.current) return;
        const map = new window.google.maps.Map(mapDivRef.current, {
          center: AGRICAPITAL_COORDS,
          zoom: 14,
          mapTypeControl: true,
          streetViewControl: false,
          fullscreenControl: true,
          gestureHandling: "cooperative",
          styles: [
            { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
          ],
        });
        const marker = new window.google.maps.Marker({
          position: AGRICAPITAL_COORDS,
          map,
          title: ADDRESS_LABEL,
          animation: window.google.maps.Animation.DROP,
        });
        const info = new window.google.maps.InfoWindow({
          content: `<div style="font-family: system-ui, sans-serif; padding:4px 6px;">
              <strong style="color:#1a4d2e;">AgriCapital</strong><br/>
              <span style="color:#555;">Daloa, Côte d'Ivoire</span>
            </div>`,
        });
        marker.addListener("click", () => info.open({ anchor: marker, map }));
        info.open({ anchor: marker, map });
        setLoaded(true);
      })
      .catch((e) => setError(e?.message || "Erreur de chargement de la carte"));
    return () => {
      cancelled = true;
    };
  }, []);

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${AGRICAPITAL_COORDS.lat},${AGRICAPITAL_COORDS.lng}`;
  const viewUrl = `https://www.google.com/maps/search/?api=1&query=${AGRICAPITAL_COORDS.lat},${AGRICAPITAL_COORDS.lng}`;

  return (
    <Card className="overflow-hidden border-border">
      <div className="flex items-center justify-between gap-3 px-4 py-3 bg-card border-b border-border">
        <div className="flex items-center gap-2 min-w-0">
          <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
          <div className="min-w-0">
            <h3 className="font-semibold text-foreground text-sm truncate">Nous localiser</h3>
            <p className="text-xs text-muted-foreground truncate">{ADDRESS_LABEL}</p>
          </div>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Button asChild size="sm" variant="outline">
            <a href={directionsUrl} target="_blank" rel="noopener noreferrer">
              <Navigation className="w-4 h-4 mr-1" /> Itinéraire
            </a>
          </Button>
          <Button asChild size="sm" variant="ghost" className="hidden sm:inline-flex">
            <a href={viewUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4" />
            </a>
          </Button>
        </div>
      </div>
      <div className="relative w-full" style={{ aspectRatio: "16 / 9", minHeight: 320 }}>
        <div ref={mapDivRef} className="absolute inset-0 w-full h-full bg-muted" />
        {!loaded && !error && (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground bg-muted/60">
            Chargement de la carte…
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 text-center bg-muted">
            <MapPin className="w-6 h-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Carte indisponible. Ouvrir dans Google Maps :</p>
            <Button asChild size="sm" variant="outline">
              <a href={viewUrl} target="_blank" rel="noopener noreferrer">
                Voir sur Google Maps
              </a>
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

export default LocationMap;
