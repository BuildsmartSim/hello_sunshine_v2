-- Migration: Add missing compliance fields to profiles table

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS mailing_list_optin BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS waiver_accepted BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS terms_accepted BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS waiver_accepted_at TIMESTAMPTZ;
