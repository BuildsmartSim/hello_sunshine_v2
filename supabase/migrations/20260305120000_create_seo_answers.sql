CREATE TABLE public.seo_answers (
    question_key text PRIMARY KEY,
    answer text NOT NULL DEFAULT '',
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.seo_answers ENABLE ROW LEVEL SECURITY;

-- Allow read access for authenticated admins
CREATE POLICY "Allow admins to read seo answers" ON public.seo_answers
    FOR SELECT
    TO authenticated
    USING (
        (auth.jwt() ->> 'email') IN (
            'hello@hellosunshinesauna.co.uk',
            'jh.crossbart@gmail.com'
        )
    );

-- Allow insert/update access for authenticated admins
CREATE POLICY "Allow admins to insert and update seo answers" ON public.seo_answers
    FOR ALL
    TO authenticated
    USING (
        (auth.jwt() ->> 'email') IN (
            'hello@hellosunshinesauna.co.uk',
            'jh.crossbart@gmail.com'
        )
    )
    WITH CHECK (
        (auth.jwt() ->> 'email') IN (
            'hello@hellosunshinesauna.co.uk',
            'jh.crossbart@gmail.com'
        )
    );

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_seo_answers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_seo_answers_updated_at
    BEFORE UPDATE ON public.seo_answers
    FOR EACH ROW
    EXECUTE FUNCTION update_seo_answers_updated_at();
