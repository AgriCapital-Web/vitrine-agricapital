import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useVisitorCount = () => {
  const [totalVisitors, setTotalVisitors] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchVisitorCount = async () => {
      try {
        const { data, error } = await supabase.rpc('get_public_visitor_count' as never, {} as never);
        if (!error && typeof data === 'number' && isMounted) {
          setTotalVisitors(data);
        }
      } catch (error) {
        console.error("Error fetching visitor count:", error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchVisitorCount();

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

    const interval = window.setInterval(fetchVisitorCount, 15000);

    return () => {
      isMounted = false;
      window.clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, []);

  return { totalVisitors, isLoading };
};

export default useVisitorCount;

