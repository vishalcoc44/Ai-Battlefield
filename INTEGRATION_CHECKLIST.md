# Backend & AI Integration Plan

## Overview
This plan details the systematic integration of Supabase backend and Gemini AI into all AI Battlefield screens. Each phase builds on the previous one.

---

## Phase 3: Screen Integration (Current Focus)

### Priority Order
Screens are ordered by complexity (simplest first) to build momentum and catch issues early.

---

### 3.1 BeliefTrackerScreen ⭐ PRIORITY 1
**Complexity:** Low  
**Services:** `beliefService.ts`

**Implementation:**
1. Import `useAuth`, `getUserBeliefs`, `getBeliefStats`
2. Add state: `beliefs`, `stats`, `loading`
3. Fetch data on mount with `useEffect`
4. Transform beliefs to add UI metadata (color, change %, relative time)
5. Replace mock `BELIEFS` array with real data
6. Add loading state with spinner
7. Add empty state when no beliefs exist

**Data Flow:**
```
User Login → Fetch beliefs → Transform for UI → Display cards
```

**Files to Modify:**
- `src/screens/BeliefTrackerScreen.tsx`

---

### 3.2 IntellectualResumeScreen ⭐ PRIORITY 2
**Complexity:** Low-Medium  
**Services:** `profileService.ts`

**Implementation:**
1. Import `getUserProfile`, `getUserSkills`, `getUserAchievements`, `initializeDefaultSkills`
2. Add state: `profile`, `skills`, `achievements`, `loading`
3. Fetch all data in parallel with `Promise.all`
4. Initialize default skills if none exist
5. Replace mock data:
   - `SKILLS` → `skills` state
   - `ACHIEVEMENTS` → `achievements` state
   - Hardcoded name/stats → `profile` data
6. Display real level, XP, total debates, views changed

**Data Flow:**
```
User Login → Fetch profile + skills + achievements → Display resume
```

**Files to Modify:**
- `src/screens/IntellectualResumeScreen.tsx`

---

### 3.3 HomeScreen
**Complexity:** Low  
**Services:** `profileService.ts`

**Implementation:**
1. Import `getUserProfile`
2. Fetch profile on mount
3. Display real stats:
   - Username
   - Level & XP
   - Total debates
   - Views changed
4. Keep existing navigation intact

**Files to Modify:**
- `src/screens/HomeScreen.tsx`

---

### 3.4 PredictionScreen
**Complexity:** Medium  
**Services:** `predictionService.ts`

**Implementation:**
1. Import prediction service functions
2. Fetch user's predictions and open predictions
3. Implement create prediction functionality
4. Display community probability vs user probability
5. Show Brier score and calibration rank
6. Add prediction resolution UI (admin/test only)

**Data Flow:**
```
User creates prediction → Save to DB → Calculate community avg → Display
Prediction resolves → Calculate Brier score → Update user profile
```

**Files to Modify:**
- `src/screens/PredictionScreen.tsx`

---

### 3.5 PersonaSelectionScreen
**Complexity:** Low  
**Services:** Direct Supabase query

**Implementation:**
1. Fetch personas from `personas` table
2. Filter by `is_active = true`
3. Replace hardcoded persona array
4. Display avatar, name, topic, difficulty

**Files to Modify:**
- `src/screens/PersonaSelectionScreen.tsx`

---

### 3.6 GroupDebateLobbyScreen
**Complexity:** Medium  
**Services:** `groupDebateService.ts`

**Implementation:**
1. Import `getActiveGroupDebates`, `getFeaturedDebate`, `createGroupDebate`
2. Fetch active debates on mount
3. Fetch featured debate separately
4. Display participant count for each debate
5. Implement "Start New Ring" functionality
6. Navigate to `GroupDebateScreen` with debate ID

**Files to Modify:**
- `src/screens/GroupDebateLobbyScreen.tsx`

---

### 3.7 GroupDebateScreen
**Complexity:** High  
**Services:** `groupDebateService.ts`

**Implementation:**
1. Import message and participant functions
2. Fetch messages on mount
3. Join debate as participant
4. Implement send message functionality
5. **Set up real-time subscription** (Phase 5)
6. Display user messages vs AI messages differently
7. Leave debate on unmount

**Data Flow:**
```
Join debate → Fetch messages → Subscribe to realtime → Send/receive messages
```

**Files to Modify:**
- `src/screens/GroupDebateScreen.tsx`

---

### 3.8 DebateScreen (1v1)
**Complexity:** Medium  
**Services:** Direct Supabase + `gemini.ts`

**Implementation:**
1. Create debate record on mount
2. Fetch/save messages to `debate_messages`
3. Generate AI responses with Gemini
4. Save fact-check results to message
5. Track steel-man level changes

**Files to Modify:**
- `src/screens/DebateScreen.tsx`

---

### 3.9 DeEscalationScreen (Zen Dojo)
**Complexity:** Medium  
**Services:** Direct Supabase + `gemini.ts`

**Implementation:**
1. Create training session on mount
2. Generate "troll" responses with Gemini
3. Analyze user responses for calm words
4. Update calm score based on sentiment
5. Save session results on completion

**Files to Modify:**
- `src/screens/DeEscalationScreen.tsx`

---

### 3.10 BlindSpotScreen
**Complexity:** Low  
**Services:** Direct Supabase query

**Implementation:**
1. Fetch cognitive biases for user
2. Display bias cards with scores
3. Show recent examples
4. Group by bias type

**Files to Modify:**
- `src/screens/BlindSpotScreen.tsx`

---

## Phase 4: AI Integration

### 4.1 Rate Limiter Service
**File:** `src/services/rateLimiter.ts`

**Implementation:**
```typescript
- Track API calls with timestamps
- Queue system (priority: user > periodic)
- Max 6 requests per minute
- Delay non-critical requests
- Return "AI is thinking..." state
```

---

### 4.2 Zen Dojo AI (DeEscalationScreen)
**Frequency:** 1 response per user input (user-paced)

**Implementation:**
1. Generate provocative "troll" message with Gemini
2. User responds
3. Analyze response for calm/aggressive words
4. Update calm score
5. Generate next troll message based on user's tone

---

### 4.3 Group Debate AI (GroupDebateScreen)
**Frequency:** Every 30 seconds max (2 messages/min per debate)

**Implementation:**
1. Set interval timer (30s)
2. Check rate limiter
3. Generate AI response based on recent messages
4. Save as `sender_type: 'ai'`
5. Broadcast via realtime

---

### 4.4 1v1 Debate AI (DebateScreen)
**Frequency:** After each user message (user-paced)

**Implementation:**
1. User sends message
2. Generate AI response with persona personality
3. Adjust steel-man level
4. Fact-check claims (optional)
5. Save both messages

---

### 4.5 Cognitive Bias Detection
**Screens:** All debate screens

**Implementation:**
1. Analyze user messages with Gemini
2. Detect bias types (confirmation, ad hominem, etc.)
3. Save to `cognitive_biases` table
4. Display in BlindSpotScreen

---

### 4.6 Belief Change Tracking
**Screens:** All debate screens

**Implementation:**
1. Prompt user after debate: "Did this change your view?"
2. Record before/after confidence
3. Save to `belief_changes` table
4. Update `beliefs` table
5. Increment `views_changed` in profile

---

## Phase 5: Real-time Features

### 5.1 Group Debate Messages
**Implementation:**
1. Subscribe to `group_debate_messages` on mount
2. Filter by `debate_id`
3. Append new messages to state
4. Auto-scroll to bottom
5. Unsubscribe on unmount

---

### 5.2 Participant Count
**Implementation:**
1. Subscribe to `group_debate_participants`
2. Count active participants (`left_at IS NULL`)
3. Update UI badge
4. Show join/leave notifications

---

## Phase 6: Testing Checklist

### Database Tests
- [x] Create profile on signup (Supabase Auth handles this)
- [x] Fetch user-specific data only (RLS policies active)
- [x] Create/update beliefs (BeliefTrackerScreen integrated)
- [x] Create/fetch predictions (PredictionScreen integrated with create functionality)
- [x] Join/leave group debates (GroupDebate screens integrated)
- [x] Send/receive messages (GroupDebate messaging works)

### AI Tests
- [ ] Rate limiter prevents >6 req/min (not implemented yet)
- [ ] AI responds in Zen Dojo (DeEscalationScreen needs AI integration)
- [ ] AI responds periodically in group debates (needs implementation)
- [ ] AI uses persona personality in 1v1 (DebateScreen needs AI integration)
- [ ] Bias detection works (needs implementation)
- [ ] Belief changes save correctly (needs implementation)

### Real-time Tests
- [x] Messages appear instantly (GroupDebateScreen has realtime messaging)
- [ ] Participant count updates live (needs implementation)
- [ ] Multiple users can chat simultaneously (needs testing with multiple devices)
- [x] Subscription cleanup on unmount (implemented in GroupDebateScreen)

### Device Tests
- [ ] Test on Android device
- [ ] Test on iOS device
- [ ] Test offline behavior
- [ ] Test network reconnection

---

## Technical Notes

### Environment Variables Required
```
EXPO_PUBLIC_SUPABASE_URL=your_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_key
EXPO_PUBLIC_GEMINI_API_KEY=your_key
```

### Common Patterns

**Loading State:**
```tsx
if (loading) {
  return <ActivityIndicator />;
}
```

**Error Handling:**
```tsx
try {
  const data = await service();
} catch (error) {
  console.error(error);
  // Show error toast
}
```

**Real-time Subscription:**
```tsx
useEffect(() => {
  const subscription = subscribeToMessages(debateId, handleNewMessage);
  return () => subscription.unsubscribe();
}, [debateId]);
```

---

## Success Criteria

✅ All screens display real data from Supabase  
✅ AI responds appropriately in all modes  
✅ Rate limiting prevents API overuse  
✅ Real-time updates work smoothly  
✅ RLS prevents data leaks  
✅ App works on actual devices  
✅ No console errors or warnings
