-- Create invoice_drafts table
CREATE TABLE IF NOT EXISTS public.invoice_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id UUID NOT NULL,
  client_id UUID,
  invoice_number TEXT,
  issue_date DATE,
  due_date DATE,
  currency TEXT DEFAULT 'USD',
  tax_rate NUMERIC DEFAULT 0,
  notes TEXT,
  template_id TEXT,
  signature TEXT,
  items JSONB DEFAULT '[]'::jsonb,
  type TEXT DEFAULT 'invoice',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.invoice_drafts ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to select their own drafts
CREATE POLICY "Users can view their own drafts"
  ON public.invoice_drafts
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy to allow users to insert their own drafts
CREATE POLICY "Users can insert their own drafts"
  ON public.invoice_drafts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy to allow users to update their own drafts
CREATE POLICY "Users can update their own drafts"
  ON public.invoice_drafts
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy to allow users to delete their own drafts
CREATE POLICY "Users can delete their own drafts"
  ON public.invoice_drafts
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS invoice_drafts_user_id_idx ON public.invoice_drafts (user_id);
CREATE INDEX IF NOT EXISTS invoice_drafts_type_idx ON public.invoice_drafts (type);
CREATE INDEX IF NOT EXISTS invoice_drafts_updated_at_idx ON public.invoice_drafts (updated_at DESC);
