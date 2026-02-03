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

    const firstInput = template.requiredInputs[0];

    setSession(prev => ({
      ...prev,
      template,
      canvasState: 'input-collection',
      status: 'collecting',
      collectedInputs: [],
    }));

    setCurrentInputId(firstInput?.id);

    // Add user message showing selection
    const userMsg = createUserMessage(`I want to create a ${template.name}`);
    
    // Prepare the first input request
    const assistantMsg = createAssistantMessage(
      `Great choice! ${template.description}. Let's get started.`,
    );

    // Second message asking for first input
    const inputRequestMsg = createAssistantMessage(
      getInputPrompt(firstInput),
      { inputRequest: firstInput }
    );

    setMessages(prev => [...prev, userMsg, assistantMsg, inputRequestMsg]);
  }, []);

  // Handle generic prompt (custom creation)
  const handleGenericPrompt = useCallback((prompt: string) => {
    // For generic prompts, use the custom-prompt template
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

    // Simulate generation
    simulateGeneration(prompt);
  }, []);

  // Provide input value
  const provideInput = useCallback((inputId: string, value: string | File) => {
    const input = getAllInputs().find(i => i.id === inputId);
    if (!input) return;

    // Add to collected inputs
    const newCollectedInputs = [...session.collectedInputs, { inputId, value, type: input.type }];
    
    setSession(prev => ({
      ...prev,
      collectedInputs: newCollectedInputs,
    }));

    // Add user message
    const displayValue = typeof value === 'string' ? value : (value as File).name;
    const userMsg = createUserMessage(
      input.type === 'image' ? `[Uploaded: ${displayValue}]` : 
      input.type === 'avatar' ? `Selected avatar: ${value}` :
      displayValue,
      input.type === 'image' ? { uploadedImage: typeof value === 'string' ? value : URL.createObjectURL(value) } : undefined
    );
    setMessages(prev => [...prev, userMsg]);

    // Check what's next
    setTimeout(() => {
      checkNextStep(inputId, newCollectedInputs);
    }, 500);
  }, [getAllInputs, session.collectedInputs, session.template]);

  // Skip optional input
  const skipInput = useCallback((inputId: string) => {
    const userMsg = createUserMessage("Skip this");
    setMessages(prev => [...prev, userMsg]);

    setTimeout(() => {
      checkNextStep(inputId, session.collectedInputs);
    }, 300);
  }, [session.collectedInputs, session.template]);

  // Check what to do next after input
  const checkNextStep = useCallback((lastInputId: string, currentCollected: CollectedInput[]) => {
    if (!session.template) return;

    const allInputs = [...session.template.requiredInputs, ...session.template.optionalInputs];
    const lastIndex = allInputs.findIndex(i => i.id === lastInputId);
    const nextInput = allInputs[lastIndex + 1];

    const collectedIds = currentCollected.map(i => i.inputId);
    const remainingRequired = session.template.requiredInputs.filter(
      i => !collectedIds.includes(i.id)
    );

    // If all required inputs are collected
    if (remainingRequired.length === 0) {
      // Check if there are optional inputs to offer
      const nextOptionalInput = session.template.optionalInputs.find(
        i => !collectedIds.includes(i.id)
      );

      if (nextOptionalInput) {
        setCurrentInputId(nextOptionalInput.id);
        const assistantMsg = createAssistantMessage(
          getOptionalPrompt(nextOptionalInput),
          { inputRequest: nextOptionalInput }
        );
        setMessages(prev => [...prev, assistantMsg]);
      } else {
        // All done, start generating
        setCurrentInputId(undefined);
        startGeneration();
      }
    } else if (nextInput) {
      // Move to next required input
      setCurrentInputId(nextInput.id);
      const assistantMsg = createAssistantMessage(
        getInputPrompt(nextInput),
        { inputRequest: nextInput }
      );
      setMessages(prev => [...prev, assistantMsg]);
    }
  }, [session.template]);

  // Start generation
  const startGeneration = useCallback(() => {
    setSession(prev => ({
      ...prev,
      canvasState: 'generating',
      status: 'generating',
    }));

    const assistantMsg = createAssistantMessage("Perfect! I'm generating your video now. This may take a couple of minutes...");
    setMessages(prev => [...prev, assistantMsg]);

    // Simulate generation
    simulateGeneration();
  }, []);

  // Simulate generation (mock for now)
  const simulateGeneration = useCallback((prompt?: string) => {
    setIsGenerating(true);

    // Mock delay of 4-6 seconds for video
    const isVideo = session.template?.outputType === 'video';
    const delay = isVideo ? 4000 + Math.random() * 2000 : 3000 + Math.random() * 2000;

    setTimeout(() => {
      // Mock generated outputs - realistic video thumbnails
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
        "🎉 Your video is ready! You can preview it, download it, or use it directly in a campaign."
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
    // If no template selected, check if it's a generic prompt or template reference
    if (!session.template) {
      // Check if user is selecting a template by name
      const matchedTemplate = CREATE_TEMPLATES.find(t => 
        message.toLowerCase().includes(t.name.toLowerCase()) ||
        message.toLowerCase().includes(t.id.replace('-', ' '))
      );

      if (matchedTemplate) {
        selectTemplate(matchedTemplate.id);
      } else {
        // Treat as generic prompt
        handleGenericPrompt(message);
      }
      return;
    }

    // Check for generate/create commands
    if (message.toLowerCase().includes('generate') || 
        message.toLowerCase().includes('create now') ||
        message.toLowerCase().includes('start generating')) {
      if (hasAllRequiredInputs()) {
        startGeneration();
        return;
      }
    }

    // If in input collection, treat as input value based on current input type
    if (currentInputId) {
      const currentInput = getAllInputs().find(i => i.id === currentInputId);
      if (currentInput && (currentInput.type === 'text' || currentInput.type === 'script')) {
        provideInput(currentInputId, message);
      }
    }
  }, [session.template, currentInputId, selectTemplate, handleGenericPrompt, provideInput, startGeneration, hasAllRequiredInputs, getAllInputs]);

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

// Helper function to get conversational prompt for each input type
function getInputPrompt(input: CreateInputDefinition): string {
  const prompts: Record<string, string> = {
    'product-image': "First, upload your product image. You can drag & drop it on the canvas or use the upload button.",
    'product-description': "Tell me about your product – what makes it special? You can type in the canvas or here in chat.",
    'hand-model': "What style of hand would you like holding your product?",
    'background': "Any specific background style in mind?",
    'avatar': "Now, pick an AI presenter for your video. Click any avatar to see a preview of their style!",
    'script': "Would you like to write a custom script or let AI generate one for you?",
    'duration': "How long should the video be?",
    'scene': "What kind of scene works best for your product?",
    'lighting': "What lighting style would you prefer?",
    'angle': "What camera angle works best?",
    'caption-idea': "What message do you want to convey in your post?",
    'platform-format': "What platform format do you need?",
    'custom-prompt': "Describe what you'd like me to create.",
    'reference-image': "Do you have a reference image to guide the style?",
  };

  return prompts[input.id] || `Please provide the ${input.label.toLowerCase()}.`;
}

// Helper function for optional input prompts
function getOptionalPrompt(input: CreateInputDefinition): string {
  const prompts: Record<string, string> = {
    'avatar': "Looking good! Would you like to choose a specific AI presenter, or should I pick the best match for your product?",
    'script': "Almost there! Would you like to write your own script, or should I generate one based on your product?",
    'duration': "How long should your video be? (You can skip this for a 30-second default)",
  };

  return prompts[input.id] || `Would you like to customize the ${input.label.toLowerCase()}? You can skip this if you'd like.`;
}
