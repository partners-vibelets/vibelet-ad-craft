import { useState, useCallback } from 'react';

export interface AssistantMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const RAG_RESPONSES: Record<string, string> = {
  'what is vibelets': `**Vibelets** is an AI-powered ad creation platform that helps you create high-converting digital ad campaigns in minutes.

🎯 **What we do:**
• Automatically analyze your products from any URL
• Generate professional ad scripts using AI
• Create video ads with AI avatars
• Launch campaigns directly to Facebook Ads

No marketing expertise required — just paste a product URL and let AI do the heavy lifting!`,

  'what can i do': `Here's what you can do with Vibelets:

📦 **Product Analysis** — Paste any product URL and I'll extract images, descriptions, and key selling points

✍️ **Script Generation** — Choose from AI-generated scripts or write your own ad copy

🎬 **Creative Generation** — Get AI-generated video and image ads with professional avatars

🚀 **Campaign Launch** — Configure and publish your ads directly to Facebook

💡 **Tip:** Start by pasting a product URL to create your first ad!`,

  'how does it work': `Vibelets works in 5 simple steps:

1️⃣ **Paste Product URL** — Share your product page link
2️⃣ **Review Analysis** — See AI-extracted product data and insights
3️⃣ **Choose Script & Avatar** — Pick your ad style and AI presenter
4️⃣ **Select Creative** — Review generated ads and pick your favorite
5️⃣ **Launch Campaign** — Connect Facebook and publish!

The entire process takes about 5 minutes. Ready to try? Paste a product URL to get started!`,

  'pricing': `Vibelets offers flexible pricing:

🆓 **Free Trial** — Create your first campaign free
💼 **Pro Plan** — Unlimited campaigns, priority support
🏢 **Enterprise** — Custom solutions for agencies

Contact us for detailed pricing at hello@vibelets.ai`,

  'support': `Need help? Here's how to reach us:

📧 **Email:** support@vibelets.ai
💬 **Live Chat:** Available 9am-6pm EST
📚 **Help Center:** docs.vibelets.ai

For campaign issues, describe the problem here and I'll help troubleshoot!`,

  'default': `I'm your Vibelets AI assistant! 👋

I can help you with:
• **Platform questions** — "What is Vibelets?", "How does it work?"
• **Feature guidance** — "What can I do here?", "How to create a campaign?"
• **Support** — Troubleshooting and general help

💡 To create an ad campaign, paste your product URL below!`
};

const QUERY_PATTERNS: { pattern: RegExp; key: string }[] = [
  { pattern: /what\s+(is|are)\s+vibelets/i, key: 'what is vibelets' },
  { pattern: /what\s+(can|could)\s+i\s+do/i, key: 'what can i do' },
  { pattern: /how\s+(does|do)\s+(it|this)\s+work/i, key: 'how does it work' },
  { pattern: /how\s+to\s+(use|start|begin)/i, key: 'how does it work' },
  { pattern: /pric(e|ing|es)/i, key: 'pricing' },
  { pattern: /cost|payment|subscription/i, key: 'pricing' },
  { pattern: /help|support|contact/i, key: 'support' },
  { pattern: /who\s+are\s+you/i, key: 'default' },
  { pattern: /what\s+are\s+you/i, key: 'default' },
];

// Detect if a query is a general/RAG query vs campaign-related
export const isGeneralQuery = (message: string): boolean => {
  const generalKeywords = [
    'what is vibelets',
    'what can i do',
    'how does it work',
    'who are you',
    'what are you',
    'help me',
    'pricing',
    'support',
    'contact',
    'features',
    'about',
    'explain',
    'tell me about',
  ];
  
  const messageLower = message.toLowerCase().trim();
  
  // Check for URL patterns (campaign intent)
  if (messageLower.includes('http') || messageLower.includes('www.') || messageLower.includes('.com')) {
    return false;
  }
  
  // Check for campaign-related keywords
  const campaignKeywords = ['campaign', 'ad', 'product', 'publish', 'facebook', 'creative', 'script', 'avatar', 'budget'];
  const hasCampaignIntent = campaignKeywords.some(kw => messageLower.includes(kw));
  
  // If it has campaign keywords and looks like an action, it's campaign-related
  if (hasCampaignIntent && (messageLower.includes('create') || messageLower.includes('start') || messageLower.includes('make'))) {
    return false;
  }
  
  // Check for general query patterns
  return generalKeywords.some(kw => messageLower.includes(kw)) || 
         QUERY_PATTERNS.some(({ pattern }) => pattern.test(messageLower));
};

const getRAGResponse = (query: string): string => {
  const queryLower = query.toLowerCase();
  
  for (const { pattern, key } of QUERY_PATTERNS) {
    if (pattern.test(queryLower)) {
      return RAG_RESPONSES[key];
    }
  }
  
  return RAG_RESPONSES['default'];
};

const createMessage = (role: 'user' | 'assistant', content: string): AssistantMessage => ({
  id: crypto.randomUUID(),
  role,
  content,
  timestamp: new Date(),
});

export const useAssistantChat = () => {
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isAssistantMode, setIsAssistantMode] = useState(false);

  const sendMessage = useCallback(async (content: string) => {
    const sanitizedContent = content.trim();
    if (!sanitizedContent) return;

    // Add user message
    setMessages(prev => [...prev, createMessage('user', sanitizedContent)]);
    
    // Simulate typing
    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 700));
    setIsTyping(false);

    // Get RAG response
    const response = getRAGResponse(sanitizedContent);
    setMessages(prev => [...prev, createMessage('assistant', response)]);
  }, []);

  const clearChat = useCallback(() => {
    setMessages([]);
    setIsAssistantMode(false);
  }, []);

  return {
    messages,
    isTyping,
    sendMessage,
    clearChat,
    isAssistantMode,
    setIsAssistantMode,
  };
};
