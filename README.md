# FinLearn AI

## Inspiration
We noticed a huge gap in how financial literacy is taught — it's often dull, generic, and disconnected from the real financial decisions people make every day. Most tools feel like textbooks, not companions. We wanted to change that.  
We envisioned **FinLearn AI** as a daily, personalized financial learning hub — one that makes understanding finance engaging, relevant, and actionable. We were inspired by how people already consume bite-sized content (like social media reels or news notifications) and thought: *why can’t learning money be just as intuitive and habit-forming?*

## What it does
**FinLearn AI** is a personalized financial literacy companion that empowers users to:  
📚 Learn daily from AI-curated news articles, simplified into actionable lessons.  
🧠 Understand tough financial terms via smart tooltips.  
📈 Track a personalized watchlist for crypto and stocks.  
🔥 Build a learning habit with streaks and quizzes.

## How we built it

**Frontend**  
- **Next.js + TypeScript**: For a fast, secure, and scalable web app.  
- **Tailwind CSS**: To design a responsive and clean UI quickly.  
- **Framer Motion**: For fluid animations that enhance user engagement.  
- **Redux**: To manage global state (preferences, watchlist, streaks).

**Backend & Infrastructure**  
- **Python + FastAPI**: To build a high-performance backend for APIs and business logic.  

**Firebase**  
- **Auth** for secure login and user identity  
- **Firestore** to store user progress, preferences, and goals  

**AI & Content Layer**  
- **Perplexity AI API**:  
  - Fetches and simplifies news articles  
  - Generates customized financial tips and learning modules  
  - Powers personalized story-based lessons using real-world data

## Challenges we ran into
🧠 **Crafting Truly Personalized Learning**  
Generating AI-powered content that felt genuinely personalized to each user’s goals and preferences required thoughtful formatting and adaptation.  

📚 **Explaining Financial Jargon in Context**  
Implementing tooltips for dynamically highlighted financial terms within AI-generated content demanded a robust, non-intrusive parsing system.  

🎯 **Turning Passive Learning into Action**  
Bridging the gap between learning and goal-setting involved designing intuitive flows that motivated users to immediately act on new financial knowledge.  

🔄 **Real-Time Data Integration**  
Syncing real-time crypto and stock data with user watchlists while maintaining performance required optimized fetching and smart caching strategies.

## Accomplishments that we're proud of
- Built a full-stack AI-driven learning platform that makes finance practical and engaging  
- Integrated Perplexity SONAR APIs for real-time content transformation from finance news  
- Created a fully responsive, animated UI with Framer Motion + Tailwind  
- Developed intelligent goal-tracking and progress feedback systems  
- Made finance more approachable for users who previously found it intimidating or boring

## What we learned
🧩 **Gaps in Existing Financial Apps**  
We learned that most financial apps fail to connect education with real-world action, leaving users unmotivated and underserved.

🤖 **Working with Perplexity AI API**  
We discovered that while Perplexity SONAR APIs provides rich content, its limitations around structure and latency required us to build fallback systems and formatting layers to maintain quality.

📈 **Personalization is More Than Preferences**  
We realized that meaningful personalization must evolve with user behavior — like article interactions, quiz results, and goal completions — not rely solely on static inputs.

⚙️ **Micro-Interactions Drive Macro Habits**  
Small design elements like tooltips, streaks, and nudges significantly boosted engagement and helped users build consistent financial habits.

## What's next for FinLearn
📱 Launch a mobile app using React Native to extend accessibility  
🧑‍🤝‍🧑 Add community challenges where users can learn and grow together  
💬 Introduce a chat-based AI assistant for finance-related queries in real time  
🔐 Build goal-driven learning tracks like “Debt-Free Journey” or “First-Time Investor”  
🏦 Integrate with budgeting tools and allow real-time sync with bank/UPI data

## Team
- **Bhavya Jain** - [LinkedIN](https://www.linkedin.com/in/bhavya-jain-26552b159/)  
- **Athul** - [LinkedIN](https://www.linkedin.com/in/athul-b-139009243/)  
- **Rohan Singla** - [@rohanBuilds](https://x.com/rohanBuilds)

## Hackathon
FinLearn AI was developed as part of the Perplexity AI Hackathon.

## License
This project is licensed under the [MIT License](LICENSE).
