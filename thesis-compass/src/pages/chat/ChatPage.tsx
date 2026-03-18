/**
 * ChatPage — AI Chat as a standalone page.
 *
 * Previously, the chat lived directly on the dashboard.
 * Now it's a dedicated page accessible from:
 * - The "Let AI Find Your Perfect Topic" card on the home page
 * - The sidebar (if added to navigation later)
 *
 * This keeps the architecture flexible — the chat is a page like
 * any other, not baked into the layout.
 */

import { ChatPanel } from '@/components/chat/ChatPanel';

export default function ChatPage() {
  return (
    <div className="h-full flex flex-col">
      <ChatPanel />
    </div>
  );
}
