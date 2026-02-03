import { useState, useCallback } from 'react';
import { 
  CreateTemplate, 
  CreateMessage, 
  CreateSession, 
  CollectedInput,
  GeneratedCreative,
  CREATE_TEMPLATES,
  CreateInputDefinition
} from '@/types/create';

const generateId = () => Math.random().toString(36).substring(2, 9);

const createAssistantMessage = (content: string, extras?: Partial<CreateMessage>): CreateMessage => ({
  id: generateId(),
  role: 'assistant',
  content,
  timestamp: new Date(),
  ...extras,
});

const createUserMessage = (content: string, extras?: Partial<CreateMessage>): CreateMessage => ({
  id: generateId(),
  role: 'user',
  content,
  timestamp: new Date(),
  ...extras,
});

export const useCreateFlow = () => {
  const [session, setSession] = useState<CreateSession>({
    id: generateId(),
    template: null,
    collectedInputs: [],
    status: 'idle',
    canvasState: 'template-selection',
    outputs: [],
  });

  const [messages, setMessages] = useState<CreateMessage[]>([
    createAssistantMessage("Hey! What would you like to create today? Pick a template or just describe what you have in mind."),
  ]);

  const [currentInputId, setCurrentInputId] = useState<string | undefined>();
  const [isGenerating, setIsGenerating] = useState(false);

  // Get all inputs for current template (required first, then optional)
  const getAllInputs = useCallback((): CreateInputDefinition[] => {
    if (!session.template) return [];
    return [...session.template.requiredInputs, ...session.template.optionalInputs];
  }, [session.template]);

  // Get remaining required inputs
  const getRemainingRequiredInputs = useCallback((): CreateInputDefinition[] => {
    if (!session.template) return [];
    const collectedIds = session.collectedInputs.map(i => i.inputId);
    return session.template.requiredInputs.filter(input => !collectedIds.includes(input.id));
  }, [session.template, session.collectedInputs]);

  // Check if all required inputs are collected
  const hasAllRequiredInputs = useCallback((): boolean => {
    return getRemainingRequiredInputs().length === 0;
  }, [getRemainingRequiredInputs]);

  // Select a template
  const selectTemplate = useCallback((templateId: string) => {
    const template = CREATE_TEMPLATES.find(t => t.id === templateId);
    if (!template) return;

    setSession(prev => ({
      ...prev,
      template,
      canvasState: 'input-collection',
      status: 'collecting',
      collectedInputs: [],
    }));

    setCurrentInputId(undefined); // Let the canvas panel handle input collection

    // Add conversational messages
    const userMsg = createUserMessage(`I want to create a ${template.name}`);
    
    // For video templates, give guidance about the setup panel
    const isVideo = template.outputType === 'video';
    const assistantMsg = createAssistantMessage(
      isVideo 
        ? `Great choice! I've opened the video setup panel for you. Fill in the details on the right – upload your product image, add a description, and optionally pick an AI presenter. Hit "Generate Video" when you're ready! 🎬`
        : `Let's create something amazing! ${template.description}. Start by providing the required information.`
    );

    setMessages(prev => [...prev, userMsg, assistantMsg]);
  }, []);

  // Handle generic prompt (custom creation)
  const handleGenericPrompt = useCallback((prompt: string) => {
    const customTemplate = CREATE_TEMPLATES.find(t => t.id === 'custom-prompt');
    if (!customTemplate) return;

    setSession(prev => ({
      ...prev,
      template: customTemplate,
      canvasState: 'generating',
      status: 'generating',
      collectedInputs: [{ inputId: 'custom-prompt', value: prompt, type: 'text' }],
    }));

    setCurrentInputId(undefined);

    const userMsg = createUserMessage(prompt);
    const assistantMsg = createAssistantMessage("Great choice! I'll create that for you. Give me a moment...");

    setMessages(prev => [...prev, userMsg, assistantMsg]);

    simulateGeneration(prompt);
  }, []);

  // Provide input value - works for both chat and canvas inputs
  const provideInput = useCallback((inputId: string, value: string | File) => {
    const input = getAllInputs().find(i => i.id === inputId);
    if (!input) return;

    // Check if this input already exists (for updates)
    const existingIndex = session.collectedInputs.findIndex(i => i.inputId === inputId);
    
    let newCollectedInputs: CollectedInput[];
    if (existingIndex >= 0) {
      // Update existing
      newCollectedInputs = [...session.collectedInputs];
      newCollectedInputs[existingIndex] = { inputId, value, type: input.type };
    } else {
      // Add new
      newCollectedInputs = [...session.collectedInputs, { inputId, value, type: input.type }];
    }
    
    setSession(prev => ({
      ...prev,
      collectedInputs: newCollectedInputs,
    }));

    // Add chat message for feedback
    const displayValue = typeof value === 'string' ? value : (value as File).name;
    const feedbackMessages: Record<string, string> = {
      'product-image': `📸 Product image uploaded!`,
      'product-description': `✍️ Description saved: "${displayValue.slice(0, 50)}${displayValue.length > 50 ? '...' : ''}"`,
      'avatar': `👤 Avatar selected: ${value}`,
      'script': value === 'generate' ? `✨ AI will generate a script for you` : `📝 Script saved`,
      'duration': `⏱️ Duration set to ${value} seconds`,
    };

    const userMsg = createUserMessage(
      feedbackMessages[inputId] || displayValue,
      input.type === 'image' ? { uploadedImage: typeof value === 'string' ? value : URL.createObjectURL(value) } : undefined
    );
    
    setMessages(prev => [...prev, userMsg]);

    // Add encouraging response for key milestones
    const collectedCount = newCollectedInputs.length;
    const requiredCount = session.template?.requiredInputs.length || 0;
    
    if (inputId === 'product-image' && !session.collectedInputs.find(i => i.inputId === 'product-description')) {
      setTimeout(() => {
        setMessages(prev => [...prev, createAssistantMessage("Looking good! Now add a brief product description.")]);
      }, 300);
    } else if (collectedCount >= requiredCount && existingIndex < 0) {
      setTimeout(() => {
        setMessages(prev => [...prev, createAssistantMessage("🎉 All set! You can generate now or customize more options.")]);
      }, 300);
    }
  }, [getAllInputs, session.collectedInputs, session.template]);

  // Skip optional input
  const skipInput = useCallback((inputId: string) => {
    const userMsg = createUserMessage(`Skipping ${inputId.replace('-', ' ')}`);
    setMessages(prev => [...prev, userMsg]);
  }, []);

  // Start generation
  const startGeneration = useCallback(() => {
    setSession(prev => ({
      ...prev,
      canvasState: 'generating',
      status: 'generating',
    }));

    const assistantMsg = createAssistantMessage("🚀 Generating your video now. This may take a couple of minutes...");
    setMessages(prev => [...prev, assistantMsg]);

    simulateGeneration();
  }, []);

  // Simulate generation (mock for now)
  const simulateGeneration = useCallback((prompt?: string) => {
    setIsGenerating(true);

    const isVideo = session.template?.outputType === 'video';
    const delay = isVideo ? 4000 + Math.random() * 2000 : 3000 + Math.random() * 2000;

    setTimeout(() => {
      const mockOutputs: GeneratedCreative[] = [
        {
          id: generateId(),
          type: isVideo ? 'video' : 'image',
          url: isVideo 
            ? 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4'
            : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800',
          thumbnailUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
          format: isVideo ? 'mp4' : 'jpg',
          width: 1080,
          height: 1920,
          duration: isVideo ? 30 : undefined,
          prompt: prompt || 'Generated creative',
        },
      ];

      setSession(prev => ({
        ...prev,
        canvasState: 'result',
        status: 'complete',
        outputs: mockOutputs,
      }));

      const assistantMsg = createAssistantMessage(
        "🎉 Your video is ready! Preview it, download, or use it in a campaign."
      );
      setMessages(prev => [...prev, assistantMsg]);
      setIsGenerating(false);
    }, delay);
  }, [session.template]);

  // Regenerate
  const regenerate = useCallback(() => {
    setSession(prev => ({
      ...prev,
      canvasState: 'generating',
      status: 'generating',
      outputs: [],
    }));

    const assistantMsg = createAssistantMessage("Regenerating with fresh variations...");
    setMessages(prev => [...prev, assistantMsg]);

    simulateGeneration();
  }, [simulateGeneration]);

  // Reset flow
  const reset = useCallback(() => {
    setSession({
      id: generateId(),
      template: null,
      collectedInputs: [],
      status: 'idle',
      canvasState: 'template-selection',
      outputs: [],
    });
    setMessages([
      createAssistantMessage("Hey! What would you like to create today? Pick a template or just describe what you have in mind."),
    ]);
    setCurrentInputId(undefined);
  }, []);

  // Handle user message (natural language)
  const handleUserMessage = useCallback((message: string) => {
    if (!session.template) {
      const matchedTemplate = CREATE_TEMPLATES.find(t => 
        message.toLowerCase().includes(t.name.toLowerCase()) ||
        message.toLowerCase().includes(t.id.replace('-', ' '))
      );

      if (matchedTemplate) {
        selectTemplate(matchedTemplate.id);
      } else {
        handleGenericPrompt(message);
      }
      return;
    }

    // Check for generate commands
    if (message.toLowerCase().includes('generate') || 
        message.toLowerCase().includes('create now') ||
        message.toLowerCase().includes('start')) {
      if (hasAllRequiredInputs()) {
        startGeneration();
        return;
      }
    }

    // Treat as product description if that's what we're waiting for
    const hasDescription = session.collectedInputs.find(i => i.inputId === 'product-description');
    if (!hasDescription && message.length > 10) {
      provideInput('product-description', message);
    } else {
      // Echo other messages
      const userMsg = createUserMessage(message);
      setMessages(prev => [...prev, userMsg]);
    }
  }, [session.template, session.collectedInputs, selectTemplate, handleGenericPrompt, provideInput, startGeneration, hasAllRequiredInputs]);

  return {
    session,
    messages,
    templates: CREATE_TEMPLATES,
    isGenerating,
    currentInputId,
    selectTemplate,
    handleGenericPrompt,
    provideInput,
    skipInput,
    startGeneration,
    regenerate,
    reset,
    handleUserMessage,
    hasAllRequiredInputs,
    getRemainingRequiredInputs,
  };
};
