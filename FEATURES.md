# AI Battlefield - Features Overview

## 🎯 Core Concept
AI Battlefield is a gamified debate and critical thinking training platform that helps users improve their reasoning skills, track belief evolution, make calibrated predictions, and engage in structured debates with AI personas and other users.

---

## 🏆 User Profile & Progression

### Intellectual Resume
- **User Profile Stats**
  - Username, Level, XP
  - Total debates participated
  - Views changed (successful persuasions)
  - Calibration rank
  - Brier score (prediction accuracy)
  
- **Cognitive Skills Tracking**
  - Steel-manning (understanding opposing views)
  - Fact-checking ability
  - Logical reasoning
  - Calm communication
  - Cognitive flexibility
  - Each skill has a progress bar (0-100)

- **Achievements System**
  - Unlock achievements for milestones
  - "First Blood" - Win your first debate
  - "Truth Seeker" - Fact-check 10 claims
  - "Mind Changer" - Change someone's view
  - "Steel Master" - Master steel-manning
  - And many more...

---

## 🗣️ Debate Modes

### 1. 1v1 AI Debates
- **Persona Selection**
  - Choose from various AI personas with different personalities
  - Each persona has unique debate styles and expertise
  - Difficulty levels: Easy, Medium, Hard, Expert
  
- **Debate Features**
  - Real-time AI responses powered by Gemini
  - Steel-man level adjustment (AI adapts to your skill)
  - Fact-checking integration
  - Turn-based conversation
  - Debate topic selection

### 2. Group Debate Gym (Debate Rings)
- **Lobby System**
  - View all active group debates
  - Featured "Daily Debate" showcase
  - See participant counts for each debate
  - Join existing debates or start new ones
  
- **Live Group Debates**
  - Real-time messaging with Supabase Realtime
  - Multiple users + AI participants
  - Live participant count
  - Topic-focused discussions
  - Join/leave debates freely
  
- **Create New Debates**
  - Start your own debate ring
  - Set topic and parameters
  - Anonymous or public mode
  - Max participant limits

### 3. Zen Dojo (De-escalation Training)
- **Calm Communication Practice**
  - AI plays the role of an aggressive "troll"
  - Practice responding calmly to provocations
  - Real-time calm score tracking
  - Sentiment analysis on your responses
  - Progressive difficulty levels

---

## 📊 Belief Tracking System

### Belief Tracker
- **Track Your Views**
  - Record beliefs with confidence levels (0-100%)
  - Tag beliefs by category
  - Track evolution over time
  
- **Belief Changes**
  - Record when debates change your mind
  - Before/After confidence comparison
  - Reason for change documented
  - Visual evolution timeline
  
- **Statistics**
  - Total beliefs tracked
  - Views changed count
  - Average confidence change
  - Last debate impact
  
- **Visual Progress Bars**
  - Color-coded by change direction
  - Green = increased confidence
  - Red = decreased confidence
  - Relative timestamps (e.g., "2 days ago")

---

## 🎲 Prediction Market

### Make Predictions
- **Calibration Training**
  - Make predictions about future events
  - Set your confidence level (probability)
  - See community average probability
  
- **Prediction Types**
  - Binary outcomes (Yes/No)
  - Open vs resolved predictions
  - Resolution dates
  
- **Accuracy Tracking**
  - Brier score calculation (lower is better)
  - Calibration curve visualization
  - Compare with community predictions
  - Track prediction history

---

## 🧠 Cognitive Bias Detection

### Blind Spot Screen
- **Bias Tracking**
  - Automatic detection of cognitive biases in debates
  - Common biases tracked:
    - Confirmation bias
    - Ad hominem attacks
    - Strawman arguments
    - False dichotomy
    - Appeal to authority
    - And more...
    
- **Visual Feedback**
  - Bias cards with severity scores
  - Recent examples from your debates
  - Improvement trends over time
  - Educational resources for each bias

---

## 🤖 AI Integration (Gemini API)

### AI Personas
- **Diverse Personalities**
  - Different debate styles and approaches
  - Topic expertise variation
  - Adjustable difficulty levels
  
### AI Features
- **Dynamic Responses**
  - Context-aware replies
  - Personality-consistent arguments
  - Fact-checking capabilities
  - Steel-manning opponent positions
  
- **Rate Limiting**
  - Intelligent queue system
  - Max 6 AI requests per minute
  - Priority handling (user > periodic)
  
### AI Modes
- **Periodic AI (Group Debates)**
  - AI joins group debates automatically
  - Posts every 30 seconds (max)
  - Responds to recent conversation
  
- **Responsive AI (1v1 & Zen Dojo)**
  - Immediate responses to user input
  - Adaptive difficulty
  - Personalized training

---

## ⚡ Real-time Features

### Live Updates
- **Group Debate Messages**
  - Instant message delivery
  - Supabase Realtime subscriptions
  - Auto-scroll to latest messages
  - Typing indicators (planned)
  
- **Participant Tracking**
  - Live participant count updates
  - Join/leave notifications
  - Active user status

---

## 🎨 User Experience

### Premium Dark Theme
- **Modern Aesthetics**
  - Neon purple accents (#BB86FC)
  - Dark gradient backgrounds
  - Glassmorphism effects
  - Smooth animations
  
### Loading States
- Skeleton screens
- Activity indicators
- Progressive data loading

### Error Handling
- User-friendly error messages
- Graceful degradation
- Retry mechanisms

---

## 🔐 Security & Privacy

### Row Level Security (RLS)
- User data isolation
- Secure authentication with Supabase
- Protected API endpoints
- Privacy-first design

### Anonymous Debates (Optional)
- Optional anonymous mode for group debates
- Privacy masks for identity protection
- Separate anonymous vs public debates

---

## 📱 Platform Features

### Cross-Platform
- Built with React Native + Expo
- Works on iOS and Android
- Responsive design
- Offline-friendly (planned)

### Performance
- Optimized database queries
- Efficient real-time subscriptions
- Smart caching
- Low data usage

---

## 📈 Gamification Elements

### XP & Leveling System
- Earn XP from debates
- Level up for milestones
- Visual progress tracking

### Leaderboards (Planned)
- Calibration rankings
- Debate win rates
- Skill comparisons

### Streaks (Planned)
- Daily debate streaks
- Prediction accuracy streaks
- Calm communication streaks

---

## 🎯 Core Value Propositions

1. **Improve Critical Thinking** - Practice structured reasoning and argumentation
2. **Track Personal Growth** - See your cognitive skills improve over time
3. **Make Better Predictions** - Become more calibrated in your forecasts
4. **Change Your Mind** - Learn to update beliefs based on evidence
5. **Stay Calm** - Practice de-escalation and civil discourse
6. **Detect Biases** - Become aware of your own cognitive blind spots
7. **Engage with AI** - Debate with sophisticated AI personas
8. **Connect with Others** - Join real-time group debates

---

## 🚀 Upcoming Features

- Video debate mode
- Debate recordings and replays
- Custom AI persona creation
- Social sharing
- Debate tournaments
- Mentor matching
- Advanced analytics dashboard
- Mobile notifications
- Offline mode with sync

---

## 💡 Use Cases

- **Students**: Improve debate and critical thinking skills
- **Professionals**: Practice calm communication in conflicts
- **Forecasters**: Train prediction and calibration abilities
- **Intellectuals**: Track belief evolution and engage in high-quality discourse
- **Debaters**: Sharpen argumentation skills against AI opponents
- **Anyone**: Learn to think more clearly and rationally
