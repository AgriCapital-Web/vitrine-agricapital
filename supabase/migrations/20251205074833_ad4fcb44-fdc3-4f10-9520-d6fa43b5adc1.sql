-- Create storage bucket for testimonial photos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('testimonial-photos', 'testimonial-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for testimonial photos
CREATE POLICY "Anyone can upload testimonial photos" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'testimonial-photos');

CREATE POLICY "Anyone can view testimonial photos" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'testimonial-photos');

CREATE POLICY "Admins can delete testimonial photos" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'testimonial-photos');

-- Add status and agricapital_subscriber columns to testimonials table
ALTER TABLE public.testimonials 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'other',
ADD COLUMN IF NOT EXISTS is_agricapital_subscriber BOOLEAN DEFAULT false;

-- Update existing rows to have default values
UPDATE public.testimonials 
SET status = 'other', is_agricapital_subscriber = false 
WHERE status IS NULL;