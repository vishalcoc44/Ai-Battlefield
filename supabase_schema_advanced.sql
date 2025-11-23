-- AI Battlefield - Production Database Schema
-- This schema supports all features in the app with scalability in mind

-- ============================================================================
-- PROFILES & USER DATA
-- ============================================================================

-- Enhanced profiles table (extends existing)
DO $$ 
BEGIN
  -- Level and XP
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='level') THEN
    ALTER TABLE profiles ADD COLUMN level INTEGER DEFAULT 1;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='xp') THEN
    ALTER TABLE profiles ADD COLUMN xp INTEGER DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='total_debates') THEN
    ALTER TABLE profiles ADD COLUMN total_debates INTEGER DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='views_changed') THEN
    ALTER TABLE profiles ADD COLUMN views_changed INTEGER DEFAULT 0;
  END IF;
  
  -- Calibration/Prediction stats
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='brier_score') THEN
    ALTER TABLE profiles ADD COLUMN brier_score FLOAT DEFAULT 0.5;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='calibration_rank') THEN
    ALTER TABLE profiles ADD COLUMN calibration_rank TEXT DEFAULT 'Novice';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='total_predictions') THEN
    ALTER TABLE profiles ADD COLUMN total_predictions INTEGER DEFAULT 0;
  END IF;
  
  -- De-escalation stats
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='calm_score') THEN
    ALTER TABLE profiles ADD COLUMN calm_score FLOAT DEFAULT 0.5;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='total_training_sessions') THEN
    ALTER TABLE profiles ADD COLUMN total_training_sessions INTEGER DEFAULT 0;
  END IF;
  
  -- Metadata
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='rank_percentile') THEN
    ALTER TABLE profiles ADD COLUMN rank_percentile INTEGER;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='is_verified') THEN
    ALTER TABLE profiles ADD COLUMN is_verified BOOLEAN DEFAULT FALSE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='public_resume_url') THEN
    ALTER TABLE profiles ADD COLUMN public_resume_url TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='updated_at') THEN
    ALTER TABLE profiles ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END $$;


-- ============================================================================
-- COGNITIVE SKILLS
-- ============================================================================

CREATE TABLE IF NOT EXISTS cognitive_skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL, -- 'Steel-manning', 'De-escalation', 'Fact-checking', 'Cognitive Flex'
  level INTEGER DEFAULT 0 CHECK (level >= 0 AND level <= 100),
  color TEXT DEFAULT '#4CAF50',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, skill_name)
);

CREATE INDEX IF NOT EXISTS idx_cognitive_skills_user ON cognitive_skills(user_id);

-- ============================================================================
-- ACHIEVEMENTS & BADGES
-- ============================================================================

CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL, -- 'mind_changer', 'peacemaker', 'truth_seeker'
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL, -- Material icon name
  requirement_type TEXT NOT NULL, -- 'belief_changes', 'debates_resolved', 'sources_verified'
  requirement_count INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON user_achievements(user_id);

-- ============================================================================
-- BELIEF TRACKING
-- ============================================================================

CREATE TABLE IF NOT EXISTS beliefs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  topic TEXT NOT NULL,
  icon TEXT DEFAULT 'lightbulb', -- Material icon name
  initial_confidence FLOAT CHECK (initial_confidence >= 0 AND initial_confidence <= 1),
  current_confidence FLOAT CHECK (current_confidence >= 0 AND current_confidence <= 1),
  status TEXT CHECK (status IN ('shifted', 'shattered', 'reinforced', 'evolving')),
  last_debate_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_beliefs_user ON beliefs(user_id);
CREATE INDEX IF NOT EXISTS idx_beliefs_updated ON beliefs(updated_at DESC);

-- Detailed belief change history
CREATE TABLE IF NOT EXISTS belief_changes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  belief_id UUID REFERENCES beliefs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  topic TEXT NOT NULL,
  before_stance TEXT,
  after_stance TEXT,
  confidence_before FLOAT,
  confidence_after FLOAT,
  debate_id UUID, -- Reference to what triggered the change
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_belief_changes_user ON belief_changes(user_id);
CREATE INDEX IF NOT EXISTS idx_belief_changes_belief ON belief_changes(belief_id);

-- ============================================================================
-- PERSONAS
-- ============================================================================

CREATE TABLE IF NOT EXISTS personas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  topic TEXT,
  avatar_url TEXT,
  description TEXT,
  difficulty TEXT CHECK (difficulty IN ('Easy', 'Medium', 'Hard', 'Extreme')),
  personality_prompt TEXT NOT NULL, -- For AI generation
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_personas_active ON personas(is_active);

-- ============================================================================
-- 1v1 DEBATES
-- ============================================================================

CREATE TABLE IF NOT EXISTS debates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  persona_id UUID REFERENCES personas(id) ON DELETE SET NULL,
  topic TEXT NOT NULL,
  steel_man_level FLOAT DEFAULT 0.5 CHECK (steel_man_level >= 0 AND steel_man_level <= 1),
  status TEXT CHECK (status IN ('active', 'ended', 'paused')) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_debates_user ON debates(user_id);
CREATE INDEX IF NOT EXISTS idx_debates_status ON debates(status);

CREATE TABLE IF NOT EXISTS debate_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  debate_id UUID REFERENCES debates(id) ON DELETE CASCADE,
  sender_type TEXT CHECK (sender_type IN ('user', 'ai')),
  content TEXT NOT NULL,
  fact_check_result JSONB, -- {verified: bool, sources: [...]}
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_debate_messages_debate ON debate_messages(debate_id, created_at);

-- ============================================================================
-- GROUP DEBATES
-- ============================================================================

CREATE TABLE IF NOT EXISTS group_debates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic TEXT NOT NULL,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status TEXT CHECK (status IN ('active', 'closed', 'archived')) DEFAULT 'active',
  max_participants INTEGER DEFAULT 10,
  is_anonymous BOOLEAN DEFAULT FALSE, -- For "The Void" mode
  is_featured BOOLEAN DEFAULT FALSE, -- For "Daily Debate"
  intensity_level TEXT CHECK (intensity_level IN ('Low', 'Medium', 'High', 'Extreme')),
  category TEXT, -- 'Technology', 'Politics', 'Space', etc.
  ends_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_group_debates_status ON group_debates(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_group_debates_featured ON group_debates(is_featured) WHERE is_featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_group_debates_anonymous ON group_debates(is_anonymous) WHERE is_anonymous = TRUE;

CREATE TABLE IF NOT EXISTS group_debate_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  debate_id UUID REFERENCES group_debates(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  anonymous_mask_id UUID, -- Reference to selected mask if anonymous
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  left_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(debate_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_group_debate_participants_debate ON group_debate_participants(debate_id);
CREATE INDEX IF NOT EXISTS idx_group_debate_participants_user ON group_debate_participants(user_id);

CREATE TABLE IF NOT EXISTS group_debate_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  debate_id UUID REFERENCES group_debates(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  sender_name TEXT NOT NULL, -- Display name (could be masked)
  sender_type TEXT CHECK (sender_type IN ('user', 'ai', 'system')) DEFAULT 'user',
  content TEXT NOT NULL,
  reply_to_id UUID REFERENCES group_debate_messages(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_group_debate_messages_debate ON group_debate_messages(debate_id, created_at DESC);

-- ============================================================================
-- ANONYMOUS MODE (THE VOID)
-- ============================================================================

CREATE TABLE IF NOT EXISTS anonymous_masks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL, -- 'Neon Fox', 'Cyber Monk', etc.
  avatar_url TEXT NOT NULL,
  color TEXT NOT NULL,
  is_available BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS user_mask_selections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  mask_id UUID REFERENCES anonymous_masks(id) ON DELETE CASCADE,
  debate_id UUID REFERENCES group_debates(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, debate_id)
);

-- ============================================================================
-- COGNITIVE BIAS DETECTION
-- ============================================================================

CREATE TABLE IF NOT EXISTS cognitive_biases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  bias_type TEXT NOT NULL, -- 'confirmation', 'ad_hominem', 'sunk_cost', etc.
  bias_name TEXT NOT NULL, -- Display name
  score FLOAT CHECK (score >= 0 AND score <= 1),
  color TEXT DEFAULT '#FF5252',
  description TEXT,
  example_text TEXT, -- Recent instance
  debate_id UUID, -- Which debate it was detected in
  detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cognitive_biases_user ON cognitive_biases(user_id, detected_at DESC);
CREATE INDEX IF NOT EXISTS idx_cognitive_biases_type ON cognitive_biases(bias_type);

-- ============================================================================
-- DE-ESCALATION TRAINING
-- ============================================================================

CREATE TABLE IF NOT EXISTS deescalation_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  scenario_type TEXT NOT NULL, -- 'angry_troll', 'bad_faith', etc.
  initial_calm_score FLOAT,
  final_calm_score FLOAT,
  responses_count INTEGER DEFAULT 0,
  positive_responses INTEGER DEFAULT 0,
  negative_responses INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_deescalation_sessions_user ON deescalation_sessions(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS deescalation_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES deescalation_sessions(id) ON DELETE CASCADE,
  user_response TEXT NOT NULL,
  ai_prompt TEXT NOT NULL,
  sentiment_analysis JSONB, -- {calm_words: [], aggressive_words: [], score: float}
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- PREDICTIONS & CALIBRATION
-- ============================================================================

CREATE TABLE IF NOT EXISTS predictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  category TEXT NOT NULL, -- 'Technology', 'Politics', 'Space', etc.
  probability FLOAT CHECK (probability >= 0 AND probability <= 1),
  community_probability FLOAT, -- Average of all users
  deadline TIMESTAMP WITH TIME ZONE NOT NULL,
  resolved BOOLEAN DEFAULT FALSE,
  outcome BOOLEAN, -- TRUE if event occurred, FALSE if not, NULL if unresolved
  brier_score FLOAT, -- Calculated after resolution
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_predictions_user ON predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_predictions_deadline ON predictions(deadline);
CREATE INDEX IF NOT EXISTS idx_predictions_resolved ON predictions(resolved);

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Profiles (already has RLS from existing schema)

-- Cognitive Skills
ALTER TABLE cognitive_skills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own skills" ON cognitive_skills FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own skills" ON cognitive_skills FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own skills" ON cognitive_skills FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User Achievements
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own achievements" ON user_achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Public can view all achievements" ON achievements FOR SELECT USING (TRUE);

-- Beliefs
ALTER TABLE beliefs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own beliefs" ON beliefs FOR ALL USING (auth.uid() = user_id);

-- Belief Changes
ALTER TABLE belief_changes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own belief changes" ON belief_changes FOR SELECT USING (auth.uid() = user_id);

-- Debates & Messages
ALTER TABLE debates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own debates" ON debates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own debates" ON debates FOR INSERT WITH CHECK (auth.uid() = user_id);

ALTER TABLE debate_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view messages in their debates" ON debate_messages FOR SELECT 
  USING (debate_id IN (SELECT id FROM debates WHERE user_id = auth.uid()));
CREATE POLICY "Users can create messages in their debates" ON debate_messages FOR INSERT 
  WITH CHECK (debate_id IN (SELECT id FROM debates WHERE user_id = auth.uid()));

-- Group Debates (public read, authenticated write)
ALTER TABLE group_debates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active group debates" ON group_debates FOR SELECT USING (status = 'active');
CREATE POLICY "Authenticated users can create group debates" ON group_debates FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

ALTER TABLE group_debate_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view group debate messages" ON group_debate_messages FOR SELECT USING (TRUE);
CREATE POLICY "Authenticated users can send messages" ON group_debate_messages FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Cognitive Biases
ALTER TABLE cognitive_biases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own biases" ON cognitive_biases FOR SELECT USING (auth.uid() = user_id);

-- De-escalation Sessions
ALTER TABLE deescalation_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own sessions" ON deescalation_sessions FOR ALL USING (auth.uid() = user_id);

-- Predictions
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own predictions" ON predictions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create predictions" ON predictions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- TRIGGERS & FUNCTIONS
-- ============================================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_beliefs_updated_at BEFORE UPDATE ON beliefs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cognitive_skills_updated_at BEFORE UPDATE ON cognitive_skills
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Calculate community probability average
CREATE OR REPLACE FUNCTION update_community_probability()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE predictions
  SET community_probability = (
    SELECT AVG(probability)
    FROM predictions
    WHERE question = NEW.question AND resolved = FALSE
  )
  WHERE question = NEW.question;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_community_prob_after_insert AFTER INSERT ON predictions
  FOR EACH ROW EXECUTE FUNCTION update_community_probability();

-- ============================================================================
-- SEED DATA
-- ============================================================================

-- Insert default personas
INSERT INTO personas (name, topic, avatar_url, description, difficulty, personality_prompt) VALUES
('Thomas Sowell (2025)', 'Welfare & Economics', 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Thomas_Sowell_2013.jpg/220px-Thomas_Sowell_2013.jpg', 'Facts over feelings. Expect rigorous economic analysis.', 'Hard', 'You are Thomas Sowell in 2025. Respond with rigorous economic analysis and empirical data. Challenge emotional arguments with facts.'),
('Richard Dawkins', 'Existence of God', 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Richard_Dawkins_Cooper_Union_2010.jpg/220px-Richard_Dawkins_Cooper_Union_2010.jpg', 'Unapologetic rationalism and evolutionary biology.', 'Hard', 'You are Richard Dawkins. Use evolutionary biology and scientific reasoning to defend atheism. Be direct and uncompromising.'),
('The Devil''s Advocate', 'Any Topic', 'https://cdn-icons-png.flaticon.com/512/190/190609.png', 'The smartest living expert who disagrees with you.', 'Extreme', 'You are the strongest possible opponent to the user''s position. Use the most compelling arguments against their view.')
ON CONFLICT DO NOTHING;

-- Insert default anonymous masks
INSERT INTO anonymous_masks (name, avatar_url, color) VALUES
('Neon Fox', 'https://i.pravatar.cc/150?img=50', '#FF5252'),
('Cyber Monk', 'https://i.pravatar.cc/150?img=51', '#4CAF50'),
('Void Walker', 'https://i.pravatar.cc/150?img=52', '#BB86FC'),
('Data Ghost', 'https://i.pravatar.cc/150?img=53', '#2196F3')
ON CONFLICT DO NOTHING;

-- Insert predefined achievements
INSERT INTO achievements (code, title, description, icon, requirement_type, requirement_count) VALUES
('mind_changer', 'Mind Changer', 'Changed 5 core beliefs', 'brain', 'belief_changes', 5),
('peacemaker', 'Peacemaker', 'Resolved 10 heated debates', 'handshake', 'debates_resolved', 10),
('truth_seeker', 'Truth Seeker', 'Verified 50 sources', 'check-decagram', 'sources_verified', 50)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- REALTIME SETUP
-- ============================================================================

-- Enable realtime for group debates
ALTER PUBLICATION supabase_realtime ADD TABLE group_debate_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE group_debate_participants;
ALTER PUBLICATION supabase_realtime ADD TABLE group_debates;
