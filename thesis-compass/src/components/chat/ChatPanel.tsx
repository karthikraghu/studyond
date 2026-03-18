/**
 * ChatPanel — Placeholder for the conversational interface (PRD 6.5.1)
 *
 * This will eventually be the primary interface for Thesis Compass,
 * using the Vercel AI SDK for streaming chat with tool use.
 * For now, it's a well-designed placeholder that shows the chat layout.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, Bot, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useThesisStore } from '@/store/useThesisStore';

// Sample messages to demonstrate the conversational UI
const sampleMessages = [
  {
    id: '1',
    role: 'assistant' as const,
    content: "Hey! 👋 Welcome to Thesis Compass. I'm your AI thesis companion — here to help you manage, plan, and network throughout your thesis journey.\n\nLet's figure out where you are. Have you already found a topic you want to work on?",
  },
];

// Quick reply chips — pre-composed responses (PRD 6.5.1)
const quickReplies = [
  "Just exploring",
  "I have a topic idea",
  "I have a topic + supervisor",
  "I'm already writing",
];

export function ChatPanel() {
  const [messages, setMessages] = useState<{id: string, role: 'assistant' | 'user', content: string}[]>(sampleMessages as any);
  const [inputValue, setInputValue] = useState('');
  const context = useThesisStore((s) => s.context);

  const handleSendMessage = (text?: string) => {
    const messageText = text || inputValue;
    if (!messageText.trim()) return;

    // Add user message
    const userMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: messageText,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');

    // Simulate AI response after a brief delay
    setTimeout(() => {
      const aiResponse = {
        id: (Date.now() + 1).toString(),
        role: 'assistant' as const,
        content: getSimulatedResponse(messageText, context?.currentStage),
      };
      setMessages((prev) => [...prev, aiResponse]);
    }, 800);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-border">
        <div className="w-8 h-8 rounded-full bg-ai flex items-center justify-center">
          <Bot className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="ds-label text-foreground">Thesis Compass</p>
          <p className="ds-caption text-muted-foreground flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            Online • Guide Mode
          </p>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-auto px-6 py-4 space-y-4">
        <AnimatePresence mode="popLayout">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className={`flex gap-3 ${
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-full bg-ai flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </div>
              )}
              <div
                className={`max-w-[75%] px-4 py-3 rounded-2xl ds-body whitespace-pre-line ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-md'
                    : 'bg-muted text-foreground rounded-bl-md'
                }`}
              >
                {msg.content}
              </div>
              {msg.role === 'user' && (
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <User className="w-3.5 h-3.5 text-foreground" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Quick reply chips — shown when there are few messages */}
        {messages.length <= 2 && (
          <motion.div
            className="flex flex-wrap gap-2 pt-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
          >
            {quickReplies.map((reply) => (
              <Button
                key={reply}
                variant="outline"
                size="sm"
                className="rounded-full text-sm border-border hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors"
                onClick={() => handleSendMessage(reply)}
              >
                {reply}
              </Button>
            ))}
          </motion.div>
        )}
      </div>

      {/* Input area */}
      <div className="px-6 py-4 border-t border-border">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Ask Compass anything about your thesis journey..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1 h-11 rounded-full px-4"
          />
          <Button
            size="icon"
            className="w-11 h-11 rounded-full bg-ai hover:opacity-90 transition-opacity"
            onClick={() => handleSendMessage()}
            disabled={!inputValue.trim()}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="ds-caption text-muted-foreground text-center mt-2">
          Thesis Compass helps you organize — never writes for you.
        </p>
      </div>
    </div>
  );
}

/**
 * Simulated response generator for the prototype.
 * In production, this would be replaced by the Vercel AI SDK
 * streaming the Companion Agent's response.
 */
function getSimulatedResponse(userMessage: string, _stage?: string): string {
  const lower = userMessage.toLowerCase();

  if (lower.includes('exploring') || lower.includes('just exploring')) {
    return "Great! Exploration is the most exciting part. 🎯\n\nLet me help you discover what's out there. I have access to 7,500+ thesis topics from 185+ companies.\n\nTo get started, what field interests you most? For example:\n• Data Science & AI\n• Sustainability\n• Business Strategy\n• Engineering\n• Healthcare";
  }

  if (lower.includes('topic idea') || lower.includes('have a topic')) {
    return "Awesome! You're ahead of the game. 📝\n\nTell me a bit about your topic idea — even a rough direction works. I'll match it against our database of topics and find:\n\n1. Similar company topics you might not have considered\n2. Supervisors whose research aligns\n3. Experts available for interviews\n\nWhat's your topic about?";
  }

  if (lower.includes('supervisor') || lower.includes('topic + supervisor')) {
    return "You're in great shape! Having both a topic and supervisor means we can jump straight to planning. 📋\n\nI'll help you:\n• Generate a milestone timeline based on your deadline\n• Identify methodology approaches\n• Find interview partners for your research\n\nWhen is your thesis deadline?";
  }

  if (lower.includes('writing') || lower.includes('already writing')) {
    return "You're in the home stretch! 🏁\n\nI'll focus on keeping you organized and on track:\n• Deadline countdown and submission checklist\n• Feedback cycle tracking with your supervisor\n• Last-minute expert connections if needed\n\nWhen is your submission date?";
  }

  return "That's really helpful context! I'm building a picture of where you are and what you need.\n\nBased on what you've shared, I can help with several things. What would you like to explore first?\n\n• Browse matching topics\n• Find a supervisor\n• Build a timeline\n• Connect with experts";
}
