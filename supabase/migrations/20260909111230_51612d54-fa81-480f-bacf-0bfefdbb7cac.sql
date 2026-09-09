-- 1) Testimonials: hide email column from public/authenticated direct access
REVOKE SELECT ON public.testimonials FROM anon, authenticated;
GRANT SELECT (id, first_name, last_name, testimonial, photo_url, approved, status, is_agricapital_subscriber, created_at, updated_at)
  ON public.testimonials TO anon, authenticated;

-- 2) Revoke anon SELECT on non-public tables
REVOKE SELECT ON
  public.contact_messages,
  public.dataroom_access_logs,
  public.dataroom_comments,
  public.dataroom_download_links,
  public.dataroom_intents,
  public.dataroom_publications,
  public.dataroom_review_comments,
  public.dataroom_sessions,
  public.dataroom_signatories,
  public.dataroom_versions,
  public.email_campaigns,
  public.email_events,
  public.email_logs,
  public.email_signatures,
  public.email_templates,
  public.news_submissions,
  public.newsletter_sends,
  public.newsletter_subscribers,
  public.partnership_requests,
  public.visitor_contacts,
  public.waitlist_submissions
FROM anon;
