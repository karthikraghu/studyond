# Thesis Compass – The Ultimate Thesis Journey Co-Pilot

**Developed for the ETH Start Hack Hackathon**

## The Problem
For many students, entering the thesis phase feels like stepping into a void. The leap from structured coursework to self-directed research is daunting. Finding the right **Topic**, **Academic Supervisor**, and an exciting **Company Partner** is often a fragmented, overwhelming process. Once the topic is secured, managing drafts, milestones, and maintaining momentum during the writing phase is equally challenging.

## The Solution: Thesis Compass
**Thesis Compass** is an intelligent, autonomous platform designed to act as a lifelong "co-pilot" from the moment a student thinks "I am starting my thesis" to the triumphant "I am handing it in."

By integrating sophisticated multi-factor matching algorithms with a proactive, autonomous AI agent interface, Thesis Compass curates the ultimate "Golden Triangle" for every student: **The Student + The Supervisor + The Corporate Partner, united by the Perfect Topic.**

---

## 🎯 Key Features & MVP Highlights

### 1. Zero-Friction Intelligent Onboarding
Instead of filling out endless forms, students simply upload their CV (`.pdf`) or connect their GitHub/LinkedIn. The system extracts their skills, past project experience, and academic trajectory. 
- **Priority Ranking:** Students rank what matters most (e.g., *Sustainability, High Compensation, Academic Excellence*). 
- **State Awareness:** The system adapts if a student already has a topic or is exploring from scratch.

### 2. The "Golden Triangle" Matching Engine
Our proprietary scoring algorithm (simulating a RAG/Vector Embedding approach on the frontend) evaluates thousands of data points across mock datasets (`topics.json`, `experts.json`, `companies.json`).
- **Semantic Expertise Match:** How well the student’s skills align with the topic requirements.
- **Priority Fit:** Does the company or supervisor align with the student's top-ranked values (e.g., an ESG-focused student matching with a GreenTech company)?
- **GitHub Bonus:** Students who have shipped code related to a topic receive an algorithmic edge.
- **Explainable AI:** Every match includes a "Why this matches you" breakdown.

### 3. A Dashboard with an "Autonomous Agent"
Thesis Compass doesn't just wait for queries; it acts proactively. 
- **Proactive Notifications:** If a new company joins the network that matches a student's unfulfilled priority, the AI agent instantly flags it and **drafts an introductory email** on the student's behalf. 

### 4. Interactive Discovery Ecosystem
The platform extends beyond static lists:
- **Organizations Gallery (`/organizations`):** A premium visual directory of corporate partners eager for thesis collaboration. It explicitly highlights *why* a company is a strong cultural/technical fit for the logged-in student.
- **Academic Experts (`/experts`):** Connecting researchers and students based on mutual theoretical interests.

### 5. The End-to-End Project Workspace
Once a topic is secured, the platform transforms from a "search engine" into an **Execution Workspace** (`/chat`).
- **Milestone Timeline:** Tracks progress from Proposal to Mid-Term down to Hand-In.
- **Draft & Feedback Hub:** Students can upload raw chapter drafts. The built-in AI reviewer scans structure, tone, and plagiarism risk, giving instant feedback (e.g., "Consider adding more recent citations in section 2.4").
- **Triumphant Submission:** The journey ends when the student clicks the final "Hand In Final Thesis" button.

---

## 🛠 Tech Stack

- **Framework:** React 18 + Vite
- **Styling:** Tailwind CSS + Framer Motion (for fluid micro-animations and premium UI feel)
- **Routing:** React Router DOM
- **State Management:** Zustand (Handling the unified `StudentProfile` across the app)
- **Icons:** Lucide React
- **UI Components:** Customized Radix UI / shadcn/ui variants (`components/ui/*`)

---

## 🚀 How to Run Locally

1. **Clone the repository.**
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Start the development server:**
   ```bash
   npm run dev
   ```
4. **View the app:** Open your browser and navigate to `http://localhost:5173`.

---

## 💡 How We Addressed the Judge's Criteria

* *"A co-pilot from 'I am starting my thesis' to 'I am handing it in'."* 
  * **Addressed via:** The intelligent `/onboarding` flow leading straight into the split-view `/workspace` milestone manager.
* *"Help with finding a topic or supervisor."*
  * **Addressed via:** The `matching-engine.ts` algorithms natively ranking topics and highlighting relevant experts.
* *"A proactive, autonomous agent."*
  * **Addressed via:** The interactive HomePage Agent Notification banner that acts on the user's behalf (drafting intros while they were away).
* *"Company integrations."*
  * **Addressed via:** The highly engaging `OrganizationsPage` highlighting real-world corporate partner projects.

---
*Built with ❤️ for Start Hack.*
