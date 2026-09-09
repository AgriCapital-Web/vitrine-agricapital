create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net with schema extensions;

select cron.unschedule(jobid) from cron.job where jobname = 'newsletter-daily-draft';

select cron.schedule(
  'newsletter-daily-draft',
  '0 8 * * *',
  $$
  select net.http_post(
    url := 'https://sxsolthkxfavimitoowy.supabase.co/functions/v1/newsletter-auto-send',
    headers := '{"Content-Type":"application/json","x-cron-secret":"ac_cron_7f3b91d2e5a84c60b17d4e2fa9c63b58"}'::jsonb,
    body := '{"trigger":"daily-draft"}'::jsonb
  );
  $$
);