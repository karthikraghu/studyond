# Thesis Compass

## Description
Thesis Compass is an intelligent co-pilot designed to guide university students through their entire thesis journey. From the initial stages of finding the perfect topic, academic supervisor, and corporate partner, to managing the execution phase through milestone tracking and automated feedback, the platform acts as a unified, proactive assistant. Built for the ETH Start Hack Hackathon, it eliminates the friction of starting and completing an academic thesis.

## How It Works (Technical Overview)
- **Frontend Architecture**: Built with React 18, Vite, and React Router DOM. State is managed centrally via Zustand, providing seamless profile and matching context across the app. Styling combines Tailwind CSS and Framer Motion for a fluid, highly responsive user interface.
- **Backend & AI Architecture**: The backend (server.ts) runs on Express and utilizes the Vercel AI SDK with LangChain to harness Claude/Anthropic models for reasoning and text generation.
- **Smart Matching Engine & Vector Database**: Implements a multi-factor ranking algorithm that evaluates datasets containing topics, academic experts, and company partners. It uses Pinecone as a Vector Database to align student skills (extracted from CVs via server-side parsing) and priorities with optimal opportunities through semantic searches, surfacing an explainable "match score."
- **Proactive AI Integration**: Features an autonomous agent layer that proactively alerts users to new alignments and drafts out introductory emails. The system seamlessly handles heavy document extraction (handling PDFs) and integrates functions to pull relevant contextual literature dynamically.
- **Execution Workspace**: A dynamic dashboard replacing static discovery tools, managing stateful milestones from proposal to final hand-in, complete with UI components from Radix UI and shadcn/ui.

