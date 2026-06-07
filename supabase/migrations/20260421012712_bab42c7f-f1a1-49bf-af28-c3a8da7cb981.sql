-- Roles enum and table
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Users view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(),'admin'));

-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  target_role TEXT,
  streak_days INT NOT NULL DEFAULT 0,
  last_active_date DATE,
  total_points INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles viewable by all" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Aptitude attempts
CREATE TABLE public.aptitude_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  topic TEXT NOT NULL,
  subtopic TEXT,
  difficulty TEXT NOT NULL,
  mode TEXT NOT NULL,
  total_questions INT NOT NULL,
  correct_count INT NOT NULL DEFAULT 0,
  accuracy NUMERIC(5,2) NOT NULL DEFAULT 0,
  total_time_sec INT NOT NULL DEFAULT 0,
  ideal_time_sec INT NOT NULL DEFAULT 0,
  ai_feedback JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.aptitude_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own aptitude select" ON public.aptitude_attempts FOR SELECT USING (auth.uid()=user_id);
CREATE POLICY "own aptitude insert" ON public.aptitude_attempts FOR INSERT WITH CHECK (auth.uid()=user_id);
CREATE POLICY "own aptitude update" ON public.aptitude_attempts FOR UPDATE USING (auth.uid()=user_id);

CREATE TABLE public.aptitude_question_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id UUID REFERENCES public.aptitude_attempts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  question_text TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_answer TEXT NOT NULL,
  selected_answer TEXT,
  is_correct BOOLEAN NOT NULL DEFAULT false,
  time_taken_sec INT NOT NULL DEFAULT 0,
  ideal_time_sec INT NOT NULL DEFAULT 60,
  explanation TEXT,
  shortcut TEXT,
  mistake_type TEXT,
  bookmarked BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.aptitude_question_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own qlog select" ON public.aptitude_question_logs FOR SELECT USING (auth.uid()=user_id);
CREATE POLICY "own qlog insert" ON public.aptitude_question_logs FOR INSERT WITH CHECK (auth.uid()=user_id);
CREATE POLICY "own qlog update" ON public.aptitude_question_logs FOR UPDATE USING (auth.uid()=user_id);

-- Coding attempts
CREATE TABLE public.coding_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  problem_title TEXT NOT NULL,
  problem_statement TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  topic TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'javascript',
  code TEXT NOT NULL,
  correctness_score INT NOT NULL DEFAULT 0,
  efficiency_score INT NOT NULL DEFAULT 0,
  complexity TEXT,
  ai_feedback JSONB,
  status TEXT NOT NULL DEFAULT 'attempted',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.coding_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own coding select" ON public.coding_attempts FOR SELECT USING (auth.uid()=user_id);
CREATE POLICY "own coding insert" ON public.coding_attempts FOR INSERT WITH CHECK (auth.uid()=user_id);
CREATE POLICY "own coding update" ON public.coding_attempts FOR UPDATE USING (auth.uid()=user_id);

-- HR sessions
CREATE TABLE public.hr_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  mode TEXT NOT NULL DEFAULT 'smart',
  target_role TEXT,
  transcript JSONB NOT NULL DEFAULT '[]'::jsonb,
  ai_feedback JSONB,
  fluency_score INT DEFAULT 0,
  confidence_score INT DEFAULT 0,
  content_score INT DEFAULT 0,
  overall_score INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.hr_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own hr select" ON public.hr_sessions FOR SELECT USING (auth.uid()=user_id);
CREATE POLICY "own hr insert" ON public.hr_sessions FOR INSERT WITH CHECK (auth.uid()=user_id);
CREATE POLICY "own hr update" ON public.hr_sessions FOR UPDATE USING (auth.uid()=user_id);

-- Company interviews
CREATE TABLE public.company_interviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  company_name TEXT NOT NULL,
  company_type TEXT NOT NULL,
  rounds JSONB NOT NULL DEFAULT '[]'::jsonb,
  current_round INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'in_progress',
  aptitude_score INT DEFAULT 0,
  coding_score INT DEFAULT 0,
  hr_content_score INT DEFAULT 0,
  communication_score INT DEFAULT 0,
  confidence_score INT DEFAULT 0,
  final_score INT DEFAULT 0,
  ai_report JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.company_interviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own ci select" ON public.company_interviews FOR SELECT USING (auth.uid()=user_id);
CREATE POLICY "own ci insert" ON public.company_interviews FOR INSERT WITH CHECK (auth.uid()=user_id);
CREATE POLICY "own ci update" ON public.company_interviews FOR UPDATE USING (auth.uid()=user_id);

-- Resume analyses
CREATE TABLE public.resume_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  file_name TEXT,
  file_path TEXT,
  raw_text TEXT,
  target_role TEXT,
  ats_score INT NOT NULL DEFAULT 0,
  skills_score INT DEFAULT 0,
  projects_score INT DEFAULT 0,
  experience_score INT DEFAULT 0,
  missing_keywords JSONB,
  suggestions JSONB,
  generated_questions JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.resume_analyses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own resume select" ON public.resume_analyses FOR SELECT USING (auth.uid()=user_id);
CREATE POLICY "own resume insert" ON public.resume_analyses FOR INSERT WITH CHECK (auth.uid()=user_id);
CREATE POLICY "own resume update" ON public.resume_analyses FOR UPDATE USING (auth.uid()=user_id);

-- Achievements
CREATE TABLE public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  badge_key TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_key)
);
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own ach select" ON public.achievements FOR SELECT USING (auth.uid()=user_id);
CREATE POLICY "own ach insert" ON public.achievements FOR INSERT WITH CHECK (auth.uid()=user_id);

-- Daily activity
CREATE TABLE public.daily_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  activity_date DATE NOT NULL,
  tests_taken INT NOT NULL DEFAULT 0,
  questions_attempted INT NOT NULL DEFAULT 0,
  time_spent_min INT NOT NULL DEFAULT 0,
  avg_score INT NOT NULL DEFAULT 0,
  UNIQUE(user_id, activity_date)
);
ALTER TABLE public.daily_activity ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own daily select" ON public.daily_activity FOR SELECT USING (auth.uid()=user_id);
CREATE POLICY "own daily insert" ON public.daily_activity FOR INSERT WITH CHECK (auth.uid()=user_id);
CREATE POLICY "own daily update" ON public.daily_activity FOR UPDATE USING (auth.uid()=user_id);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER profiles_updated BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER company_updated BEFORE UPDATE ON public.company_interviews
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile + role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email,'@',1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Indexes
CREATE INDEX idx_apt_user_date ON public.aptitude_attempts(user_id, created_at DESC);
CREATE INDEX idx_qlog_attempt ON public.aptitude_question_logs(attempt_id);
CREATE INDEX idx_coding_user ON public.coding_attempts(user_id, created_at DESC);
CREATE INDEX idx_hr_user ON public.hr_sessions(user_id, created_at DESC);
CREATE INDEX idx_ci_user ON public.company_interviews(user_id, created_at DESC);
CREATE INDEX idx_daily_user_date ON public.daily_activity(user_id, activity_date);