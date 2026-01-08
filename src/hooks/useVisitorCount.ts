import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useVisitorCount = () => {
  const [totalVisitors, setTotalVisitors] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchVisitorCount = async () => {
      try {
        const { count, error } = await supabase
          .from("page_visits")
          .select("visitor_id", { count: "exact", head: true });
        
        if (!error && count !== null) {
          setTotalVisitors(count);
        }
      } catch (error) {
        console.error("Error fetching visitor count:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVisitorCount();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('visitor-count')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'page_visits' },
        () => {
          setTotalVisitors(prev => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { totalVisitors, isLoading };
};

export default useVisitorCount;
