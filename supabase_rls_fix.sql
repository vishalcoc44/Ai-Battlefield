-- Supplementary RLS Policies for Missing Tables
-- Run this after the main schema

-- ============================================================================
-- PERSONAS (Public Read)
-- ============================================================================
ALTER TABLE personas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active personas" ON personas FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Service role can manage personas" ON personas FOR ALL USING (auth.role() = 'service_role');

-- ============================================================================
-- ACHIEVEMENTS (Public Read)
-- ============================================================================
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
-- Policy already exists from main schema, but ensuring it's enabled

-- ============================================================================
-- ANONYMOUS MASKS (Public Read)
-- ============================================================================
ALTER TABLE anonymous_masks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view available masks" ON anonymous_masks FOR SELECT USING (is_available = TRUE);
CREATE POLICY "Service role can manage masks" ON anonymous_masks FOR ALL USING (auth.role() = 'service_role');

-- ============================================================================
-- USER MASK SELECTIONS (User Private)
-- ============================================================================
ALTER TABLE user_mask_selections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own mask selections" ON user_mask_selections FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own mask selections" ON user_mask_selections FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- GROUP DEBATE PARTICIPANTS (Participants can view)
-- ============================================================================
ALTER TABLE group_debate_participants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view participants in active debates" ON group_debate_participants FOR SELECT 
  USING (debate_id IN (SELECT id FROM group_debates WHERE status = 'active'));
CREATE POLICY "Users can join debates" ON group_debate_participants FOR INSERT 
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave debates" ON group_debate_participants FOR UPDATE 
  USING (auth.uid() = user_id);

-- ============================================================================
-- DE-ESCALATION RESPONSES (User Private)
-- ============================================================================
ALTER TABLE deescalation_responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own de-escalation responses" ON deescalation_responses FOR SELECT 
  USING (session_id IN (SELECT id FROM deescalation_sessions WHERE user_id = auth.uid()));
CREATE POLICY "Users can create responses in their sessions" ON deescalation_responses FOR INSERT 
  WITH CHECK (session_id IN (SELECT id FROM deescalation_sessions WHERE user_id = auth.uid()));
