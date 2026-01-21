# AI Battlefield - Development Task List

## Phase 1: Database Setup ✅ COMPLETE
- [x] Design comprehensive database schema
- [x] Create Supabase tables with proper relationships
- [x] Set up Row Level Security (RLS) policies
- [x] Add indexes for performance
- [x] Seed initial data (personas, achievements)

## Phase 2: Service Layer ✅ COMPLETE
- [x] Create `profileService.ts` for user profiles
- [x] Create `beliefService.ts` for belief tracking
- [x] Create `predictionService.ts` for predictions
- [x] Create `groupDebateService.ts` for group debates
- [x] Create `gemini.ts` for AI integration

## Phase 3: Screen Integration ✅ COMPLETE
### Core Screens
- [x] Recreate `BeliefTrackerScreen.tsx` with database integration
- [x] Recreate `IntellectualResumeScreen.tsx` with database integration
- [x] Integrate `PredictionScreen.tsx` with predictions service
- [x] Integrate `BlindSpotScreen.tsx` with cognitive biases

### Debate Screens
- [x] Integrate `GroupDebateLobbyScreen.tsx` with group debates
- [x] Integrate `GroupDebateScreen.tsx` with realtime messages
- [x] Integrate `DebateScreen.tsx` (1v1) with debates table
- [x] Integrate `DeEscalationScreen.tsx` with training sessions

### Profile & Home
- [x] Update `HomeScreen.tsx` to fetch real profile stats
- [x] Update `PersonaSelectionScreen.tsx` to fetch personas from DB

## Phase 4: AI Integration (Gemini API)
- [ ] Create `rateLimiter.ts` (6 req/min queue system)
- [ ] Implement AI responses in `DebateScreen.tsx`
- [ ] Implement AI troll in `DeEscalationScreen.tsx`
- [ ] Add periodic AI messages in `GroupDebateScreen.tsx`
- [ ] Implement cognitive bias detection
- [ ] Add belief change tracking after debates

## Phase 5: Real-time Features
- [x] Set up Supabase Realtime subscriptions
- [x] Implement real-time messages in `GroupDebateScreen.tsx`
- [ ] Add real-time participant count updates
- [ ] Test multi-user real-time functionality

## Phase 6: Testing & Verification
- [ ] Test all CRUD operations
- [ ] Verify RLS policies work correctly
- [ ] Test on Android device
- [ ] Test on iOS device
- [ ] Performance testing
- [ ] Fix any bugs or issues

## Phase 7: Polish & Optimization
- [ ] Add error handling and user feedback
- [ ] Optimize database queries
- [ ] Add loading states everywhere
- [ ] Improve UI/UX based on testing
- [ ] Add analytics tracking
- [ ] Final code cleanup

---

## Current Progress: Phase 3 (100% Complete) ✅

**Completed Screens (10/10):**
1. ✅ BeliefTrackerScreen - Beliefs + stats + evolution
2. ✅ IntellectualResumeScreen - Profile + skills + achievements
3. ✅ HomeScreen - Real profile stats
4. ✅ PersonaSelectionScreen - Database personas
5. ✅ GroupDebateLobbyScreen - Active debates list
6. ✅ GroupDebateScreen - Real-time messages
7. ✅ PredictionScreen - Predictions + Brier score + calibration
8. ✅ BlindSpotScreen - Cognitive biases detection
9. ✅ DebateScreen (1v1) - AI debates + fact-checking + steel-man
10. ✅ DeEscalationScreen (Zen Dojo) - Calm training + sentiment analysis

**Next: Phase 4 - AI Integration & Real-time Features**

---

## Notes
- All service layer functions include proper error handling
- RLS policies ensure users can only access their own data
- Real-time subscriptions properly clean up on unmount
- Loading states implemented for all data fetching
