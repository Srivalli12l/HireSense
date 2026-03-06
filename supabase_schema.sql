-- ROBUST DATABASE SCHEMA (CLEAN SLATE VERSION)
-- Use this if you are getting "relation does not exist" errors.
-- WARNING: This will DELETE existing data in these tables.

-- 0. Drop existing triggers and tables with CASCADE to handle all dependencies
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP TABLE IF EXISTS applications_matches CASCADE;
DROP TABLE IF EXISTS matches CASCADE;
DROP TABLE IF EXISTS jobs CASCADE;
DROP TABLE IF EXISTS resumes CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- 1. Profiles Table
CREATE TABLE profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role TEXT CHECK (role IN ('candidate', 'recruiter')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- 2. Resumes Table
CREATE TABLE resumes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
    file_path TEXT,
    parsed_data JSONB,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Candidates can view own resume" ON resumes FOR SELECT USING (auth.uid() = candidate_id);
CREATE POLICY "Recruiters can view all resumes" ON resumes FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'recruiter')
);
CREATE POLICY "Candidates can upsert own resume" ON resumes FOR ALL USING (auth.uid() = candidate_id);

-- 3. Jobs Table
CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recruiter_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    required_skills TEXT[] NOT NULL,
    salary_range TEXT,
    location TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Jobs are viewable by everyone" ON jobs FOR SELECT USING (true);
CREATE POLICY "Recruiters can manage own jobs" ON jobs FOR ALL USING (auth.uid() = recruiter_id);

-- 4. Applications & Matches Table
CREATE TABLE applications_matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE NOT NULL,
    match_score INTEGER,
    status TEXT DEFAULT 'matched' CHECK (status IN ('matched', 'pending', 'applied')),
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(candidate_id, job_id)
);

ALTER TABLE applications_matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own matches" ON applications_matches FOR SELECT USING (
    auth.uid() = candidate_id OR 
    EXISTS (SELECT 1 FROM jobs WHERE id = job_id AND recruiter_id = auth.uid())
);
CREATE POLICY "Authenticated users can insert matches" ON applications_matches FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can update matches" ON applications_matches FOR UPDATE USING (auth.uid() IS NOT NULL);

-- 5. Auto-Profile Creation Logic
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'role');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
