import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

// Persistent domain for tracking - always use www.agricapital.ci
const TRACKING_DOMAIN = "www.agricapital.ci";

const getVisitorId = (): string => {
  let visitorId = localStorage.getItem('visitor_id');
  if (!visitorId) {
    visitorId = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    localStorage.setItem('visitor_id', visitorId);
  }
  return visitorId;
};

// Get visitor's geolocation using IP-based service
const getGeolocation = async (): Promise<{ country: string; city: string; latitude: number; longitude: number } | null> => {
  try {
    // Use ipapi.co for free IP geolocation
    const response = await fetch('https://ipapi.co/json/', { 
      signal: AbortSignal.timeout(5000) // 5 second timeout
    });
    
    if (!response.ok) return null;
    
    const data = await response.json();
    
    return {
      country: data.country_name || 'Unknown',
      city: data.city || 'Unknown',
      latitude: data.latitude || 0,
      longitude: data.longitude || 0
    };
  } catch (error) {
    // Fallback - don't block tracking if geolocation fails
    console.log('Geolocation service unavailable');
    return null;
  }
};

export const usePageTracking = () => {
  const location = useLocation();

  useEffect(() => {
    const trackVisit = async () => {
      // Don't track admin pages
      if (location.pathname.startsWith('/admin')) return;

      try {
        // Get geolocation data
        const geoData = await getGeolocation();
        
        await supabase.from('page_visits').insert({
          page_path: location.pathname,
          visitor_id: getVisitorId(),
          user_agent: navigator.userAgent,
          referrer: document.referrer || null,
          domain: TRACKING_DOMAIN,
          country: geoData?.country || null,
          city: geoData?.city || null,
          latitude: geoData?.latitude || null,
          longitude: geoData?.longitude || null,
        });
      } catch (error) {
        // Silently fail - don't affect user experience
        console.error('Error tracking page visit:', error);
      }
    };

    trackVisit();
  }, [location.pathname]);
};

export default usePageTracking;
