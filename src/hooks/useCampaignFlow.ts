import { useState, useCallback } from 'react';
import { CampaignState, CampaignStep, Message, ProductData, ScriptOption, AvatarOption, CreativeOption, CampaignConfig, AdAccount, InlineQuestion } from '@/types/campaign';
import { mockProductData, mockCreatives, scriptOptions, avatarOptions, mockAdAccounts, campaignObjectives, ctaOptions } from '@/data/mockData';

const STEP_ORDER: CampaignStep[] = [
  'welcome',
  'product-url',
  'product-analysis',
  'script-selection',
  'avatar-selection',
  'creative-generation',
  'creative-review',
  'campaign-setup',
  'facebook-integration',
  'ad-account-selection',
  'campaign-preview',
  'publishing',
  'published'
];

const initialState: CampaignState = {
  step: 'welcome',
  stepHistory: ['welcome'],
  productUrl: null,
  productData: null,
  selectedScript: null,
  selectedAvatar: null,
  creatives: [],
  selectedCreative: null,
  campaignConfig: null,
  facebookConnected: false,
  selectedAdAccount: null,
  isStepLoading: false,
  isRegenerating: null,
  isCustomScriptMode: false,
  isCustomCreativeMode: false,
};

const createMessage = (
  role: 'user' | 'assistant', 
  content: string, 
  options?: { inlineQuestion?: InlineQuestion; stepId?: CampaignStep; showCampaignSlider?: boolean; showFacebookConnect?: boolean }
): Message => ({
  id: crypto.randomUUID(),
  role,
  content,
  timestamp: new Date(),
  ...options
});

export const useCampaignFlow = () => {
  const [state, setState] = useState<CampaignState>(initialState);
  const [messages, setMessages] = useState<Message[]>([
    createMessage('assistant', "Hey! 👋 I'm your Vibelets AI assistant. I'll help you create a high-converting ad campaign in minutes.\n\nJust paste your product URL below to get started.", { stepId: 'welcome' })
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const addMessage = useCallback((role: 'user' | 'assistant', content: string, options?: { inlineQuestion?: InlineQuestion; stepId?: CampaignStep; showCampaignSlider?: boolean; showFacebookConnect?: boolean }) => {
    setMessages(prev => [...prev, createMessage(role, content, options)]);
  }, []);

  const simulateTyping = useCallback(async (content: string, options?: { inlineQuestion?: InlineQuestion; stepId?: CampaignStep; showCampaignSlider?: boolean; showFacebookConnect?: boolean }, delay = 1500) => {
    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, delay));
    setIsTyping(false);
    addMessage('assistant', content, options);
  }, [addMessage]);

  const goToStep = useCallback((targetStep: CampaignStep) => {
    const targetIndex = STEP_ORDER.indexOf(targetStep);
    const currentIndex = STEP_ORDER.indexOf(state.step);
    
    if (targetIndex < currentIndex) {
      setState(prev => {
        const newState = { ...prev, step: targetStep };
        
        if (targetIndex <= STEP_ORDER.indexOf('product-analysis')) {
          newState.productData = null;
          newState.selectedScript = null;
          newState.selectedAvatar = null;
          newState.creatives = [];
          newState.selectedCreative = null;
          newState.campaignConfig = null;
          newState.facebookConnected = false;
          newState.selectedAdAccount = null;
        } else if (targetIndex <= STEP_ORDER.indexOf('script-selection')) {
          newState.selectedScript = null;
          newState.selectedAvatar = null;
          newState.creatives = [];
          newState.selectedCreative = null;
          newState.campaignConfig = null;
        } else if (targetIndex <= STEP_ORDER.indexOf('avatar-selection')) {
          newState.selectedAvatar = null;
          newState.creatives = [];
          newState.selectedCreative = null;
          newState.campaignConfig = null;
        } else if (targetIndex <= STEP_ORDER.indexOf('creative-review')) {
          newState.selectedCreative = null;
          newState.campaignConfig = null;
        } else if (targetIndex <= STEP_ORDER.indexOf('campaign-setup')) {
          newState.campaignConfig = null;
        }
        
        newState.stepHistory = [...prev.stepHistory, targetStep];
        return newState;
      });
      
      addMessage('assistant', `No problem! Let's go back and make changes. ${getStepPrompt(targetStep)}`, { stepId: targetStep });
    }
  }, [state.step, addMessage]);

  const getStepPrompt = (step: CampaignStep): string => {
    const prompts: Record<CampaignStep, string> = {
      'welcome': "Paste your product URL to begin.",
      'product-url': "Paste a new product URL.",
      'product-analysis': "Analyzing your product...",
      'script-selection': "Choose a script style for your ad.",
      'avatar-selection': "Select an AI presenter.",
      'creative-generation': "Generating your creatives...",
      'creative-review': "Review and select a creative.",
      'campaign-setup': "Configure your campaign settings.",
      'facebook-integration': "Connect your Facebook account.",
      'ad-account-selection': "Select your ad account.",
      'campaign-preview': "Review and publish your campaign.",
      'publishing': "Publishing your campaign...",
      'published': "Campaign published successfully!"
    };
    return prompts[step];
  };

  const handleUserMessage = useCallback(async (content: string) => {
    addMessage('user', content);
    
    if (state.step === 'welcome' || state.step === 'product-url') {
      if (content.includes('.') || content.includes('http')) {
        setState(prev => ({ ...prev, step: 'product-analysis', productUrl: content, stepHistory: [...prev.stepHistory, 'product-analysis'], isStepLoading: true }));
        
        await simulateTyping("Perfect! Analyzing your product page now... 🔍", { stepId: 'product-analysis' }, 1000);
        
        await new Promise(resolve => setTimeout(resolve, 2500));
        
        setState(prev => ({ ...prev, productData: mockProductData, isStepLoading: false }));
        
        // Show product analysis first, then ask about continuing
        const continueQuestion: InlineQuestion = {
          id: 'product-continue',
          question: 'Ready to create your ad?',
          options: [
            { id: 'continue', label: 'Continue', description: 'Proceed to script selection' },
            { id: 'change', label: 'Change URL', description: 'Use a different product' }
          ]
        };
        
        await simulateTyping(
          `I've analyzed your product page and found some great insights!\n\n**${mockProductData.title}** looks perfect for video ads. I've identified ${mockProductData.images.length} high-quality images and extracted key product details.\n\nCheck the preview panel for full details. Ready to proceed?`,
          { inlineQuestion: continueQuestion, stepId: 'product-analysis' },
          1500
        );
      } else {
        await simulateTyping("Please share your product URL (e.g., https://yourstore.com/product) and I'll analyze it for you.");
      }
    }
  }, [state.step, addMessage, simulateTyping]);

  const handleCampaignConfigComplete = useCallback(async (config: Record<string, string>) => {
    // Transform slider output to full CampaignConfig
    const productTitle = state.productData?.title || 'Campaign';
    const fullConfig: CampaignConfig = {
      campaignName: productTitle,
      objective: config.objective || 'Sales',
      budgetType: 'daily',
      adSetName: productTitle,
      budgetAmount: config.budget || '50',
      duration: config.duration || '14',
      fbPixelId: '',
      fbPageId: '',
      adName: productTitle,
      primaryText: state.productData?.description?.slice(0, 125) || 'Check out this amazing product!',
      cta: config.cta || 'Shop Now',
      websiteUrl: state.productUrl || ''
    };
    
    setState(prev => ({ ...prev, campaignConfig: fullConfig, isStepLoading: true }));
    
    const budgetDisplay = `$${fullConfig.budgetAmount}/day`;
    const durationDisplay = fullConfig.duration === 'ongoing' ? 'Ongoing' : `${fullConfig.duration} days`;
    
    addMessage('user', `Campaign configured: ${fullConfig.objective} • ${budgetDisplay} • ${durationDisplay}`);
    
    // Check if Facebook was already connected in a previous session
    await simulateTyping(
      `Your campaign is configured:\n• **Objective:** ${fullConfig.objective}\n• **Budget:** ${budgetDisplay}\n• **Duration:** ${durationDisplay}\n\nNow let's connect your Facebook Ads account:`,
      { showFacebookConnect: true, stepId: 'facebook-integration' },
      1200
    );
    setState(prev => ({ ...prev, step: 'facebook-integration', stepHistory: [...prev.stepHistory, 'facebook-integration'], isStepLoading: false }));
  }, [state.productData, state.productUrl, addMessage, simulateTyping]);

  const handleFacebookConnect = useCallback(async () => {
    addMessage('user', "Connecting Facebook account...");
    setState(prev => ({ ...prev, facebookConnected: true, isStepLoading: true }));
    
    // Simulate OAuth popup return
    await simulateTyping("Redirecting to Facebook...", {}, 500);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const accountQuestion: InlineQuestion = {
      id: 'ad-account-selection',
      question: 'Which ad account should we use?',
      options: mockAdAccounts.map(a => ({ id: a.id, label: a.name, description: `Status: ${a.status}` }))
    };
    
    await simulateTyping(
      `Facebook connected! 🔗\n\nI found ${mockAdAccounts.length} ad accounts. Select one to continue:`,
      { inlineQuestion: accountQuestion, stepId: 'ad-account-selection' },
      800
    );
    setState(prev => ({ ...prev, step: 'ad-account-selection', stepHistory: [...prev.stepHistory, 'ad-account-selection'], isStepLoading: false }));
  }, [addMessage, simulateTyping]);

  const handleQuestionAnswer = useCallback(async (questionId: string, answerId: string) => {
    if (questionId === 'product-continue') {
      if (answerId === 'continue') {
        addMessage('user', "Let's continue!");
        setState(prev => ({ ...prev, isStepLoading: true }));
        
        const scriptQuestion: InlineQuestion = {
          id: 'script-selection',
          question: 'Choose a script style that matches your brand voice:',
          options: [
            ...scriptOptions.map(s => ({ id: s.id, label: s.name, description: s.description })),
            { id: 'custom-script', label: '✍️ Write My Own', description: 'Create custom ad copy' }
          ]
        };
        
        await simulateTyping(
          `Great! Now let's choose how to tell your product's story:`,
          { inlineQuestion: scriptQuestion, stepId: 'script-selection' },
          800
        );
        setState(prev => ({ ...prev, step: 'script-selection', stepHistory: [...prev.stepHistory, 'script-selection'], isStepLoading: false }));
      } else {
        addMessage('user', "I want to change the product URL.");
        setState(prev => ({ ...prev, step: 'product-url', productUrl: null, productData: null }));
        await simulateTyping("No problem! Paste a new product URL to analyze.", { stepId: 'product-url' }, 500);
      }
    } else if (questionId === 'script-selection') {
      if (answerId === 'custom-script') {
        setState(prev => ({ ...prev, isCustomScriptMode: true, step: 'script-selection', stepHistory: [...prev.stepHistory, 'script-selection'] }));
        addMessage('user', "I'll write my own script.");
        await simulateTyping(
          `Great! You can write your own ad copy in the panel. I'll guide you with Facebook's best practices for character limits. ✍️`,
          { stepId: 'script-selection' },
          800
        );
      } else {
        const script = scriptOptions.find(s => s.id === answerId);
        if (script) {
          setState(prev => ({ ...prev, selectedScript: script, isStepLoading: true, isCustomScriptMode: false }));
          addMessage('user', `I'll use the "${script.name}" script.`);
          
          const avatarQuestion: InlineQuestion = {
            id: 'avatar-selection',
            question: 'Select an AI presenter for your video:',
            options: avatarOptions.map(a => ({ id: a.id, label: a.name, description: a.style }))
          };
          
          await simulateTyping(
            `Great choice! The ${script.name} style is proven to drive conversions. 🎬\n\nNow let's pick an AI avatar to present your product:`,
            { inlineQuestion: avatarQuestion, stepId: 'avatar-selection' },
            1200
          );
          setState(prev => ({ ...prev, step: 'avatar-selection', stepHistory: [...prev.stepHistory, 'avatar-selection'], isStepLoading: false }));
        }
      }
    } else if (questionId === 'avatar-selection') {
      const avatar = avatarOptions.find(a => a.id === answerId);
      if (avatar) {
        setState(prev => ({ ...prev, selectedAvatar: avatar, isStepLoading: true }));
        addMessage('user', `${avatar.name} will be the presenter.`);
        
        await simulateTyping(
          `${avatar.name} is perfect! 🎥 Now generating your ad creatives...\n\nThis usually takes about 30 seconds.`,
          { stepId: 'creative-generation' },
          1000
        );
        setState(prev => ({ ...prev, step: 'creative-generation', stepHistory: [...prev.stepHistory, 'creative-generation'], isStepLoading: false }));
        
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        setState(prev => ({ ...prev, creatives: mockCreatives, isStepLoading: true }));
        
        const creativeQuestion: InlineQuestion = {
          id: 'creative-selection',
          question: 'Select your preferred creative:',
          options: [
            ...mockCreatives.map(c => ({ 
              id: c.id, 
              label: c.name, 
              description: c.type === 'video' ? 'Video format' : 'Image format'
            })),
            { id: 'custom-creative', label: '📤 Upload My Own', description: 'Use your own image or video' }
          ]
        };
        
        await simulateTyping(
          `Done! I've generated ${mockCreatives.length} creative variations:\n• 2 Video ads (15s and 30s)\n• 2 Image ads (Static and Carousel)\n\nWhich one would you like to use?`,
          { inlineQuestion: creativeQuestion, stepId: 'creative-review' },
          1500
        );
        setState(prev => ({ ...prev, step: 'creative-review', stepHistory: [...prev.stepHistory, 'creative-review'], isStepLoading: false }));
      }
    } else if (questionId === 'creative-selection') {
      if (answerId === 'custom-creative') {
        setState(prev => ({ ...prev, isCustomCreativeMode: true, step: 'creative-review', stepHistory: [...prev.stepHistory, 'creative-review'] }));
        addMessage('user', "I'll upload my own creative.");
        await simulateTyping(
          `Perfect! Upload your image or video in the panel. I'll validate it against Facebook's ad specifications. 📤`,
          { stepId: 'creative-review' },
          800
        );
      } else {
        const creative = mockCreatives.find(c => c.id === answerId);
        if (creative) {
          setState(prev => ({ ...prev, selectedCreative: creative, isStepLoading: true, isCustomCreativeMode: false }));
          addMessage('user', `I'll use the "${creative.name}" creative.`);
          
          await simulateTyping(
            `Excellent choice! Your ${creative.name} is ready. ⏳\n\nLet's quickly configure your campaign:`,
            { showCampaignSlider: true, stepId: 'campaign-setup' },
            1200
          );
          setState(prev => ({ ...prev, step: 'campaign-setup', stepHistory: [...prev.stepHistory, 'campaign-setup'], isStepLoading: false }));
        }
      }
    } else if (questionId === 'ad-account-selection') {
      const account = mockAdAccounts.find(a => a.id === answerId);
      if (account) {
        setState(prev => ({ ...prev, selectedAdAccount: account, isStepLoading: true }));
        addMessage('user', `Using "${account.name}" account.`);
        
        const publishQuestion: InlineQuestion = {
          id: 'publish-confirm',
          question: 'Ready to launch your campaign?',
          options: [
            { id: 'publish', label: 'Publish Campaign', description: 'Submit for Facebook review', icon: 'play' },
            { id: 'preview', label: 'Review Details', description: 'Check campaign summary first', icon: 'target' }
          ]
        };
        
        await simulateTyping(
          `Great! I've selected **${account.name}** and auto-fetched:\n✅ Facebook Pixel\n✅ Business Page\n\nYour campaign is ready! What would you like to do?`,
          { inlineQuestion: publishQuestion, stepId: 'campaign-preview' },
          1500
        );
        setState(prev => ({ ...prev, step: 'campaign-preview', stepHistory: [...prev.stepHistory, 'campaign-preview'], isStepLoading: false }));
      }
    } else if (questionId === 'publish-confirm') {
      if (answerId === 'publish') {
        addMessage('user', "Publish the campaign!");
        setState(prev => ({ ...prev, step: 'publishing', stepHistory: [...prev.stepHistory, 'publishing'], isStepLoading: true }));
        
        await simulateTyping(`Publishing to Facebook... 🚀`, { stepId: 'publishing' }, 1000);
        
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        await simulateTyping(
          `🎉 **Campaign Published!**\n\nYour ad has been submitted for review (typically 24-48 hours).\n\n**What's next:**\n• Monitor performance in your dashboard\n• I'll notify you when approved\n• Optimization tips coming soon!\n\nWant to create another campaign? Just paste a new product URL!`,
          { stepId: 'published' },
          2000
        );
        setState(prev => ({ ...prev, step: 'published', stepHistory: [...prev.stepHistory, 'published'], isStepLoading: false }));
      } else {
        await simulateTyping(
          `Take your time to review. Check the campaign preview on the right, and when you're ready, just say "publish" or select Publish Campaign above.`,
          {},
          1000
        );
      }
    }
  }, [addMessage, simulateTyping]);

  // Legacy functions for backward compatibility (now handled via inline questions)
  const selectScript = useCallback(async (script: ScriptOption) => {
    await handleQuestionAnswer('script-selection', script.id);
  }, [handleQuestionAnswer]);

  const selectAvatar = useCallback(async (avatar: AvatarOption) => {
    await handleQuestionAnswer('avatar-selection', avatar.id);
  }, [handleQuestionAnswer]);

  const selectCreative = useCallback(async (creative: CreativeOption) => {
    await handleQuestionAnswer('creative-selection', creative.id);
  }, [handleQuestionAnswer]);

  const setCampaignConfig = useCallback(async (config: CampaignConfig) => {
    // Config is now set via inline questions step by step
  }, []);

  const connectFacebook = useCallback(async () => {
    await handleQuestionAnswer('facebook-connect', 'connect');
  }, [handleQuestionAnswer]);

  const selectAdAccount = useCallback(async (account: AdAccount) => {
    await handleQuestionAnswer('ad-account-selection', account.id);
  }, [handleQuestionAnswer]);

  const publishCampaign = useCallback(async () => {
    await handleQuestionAnswer('publish-confirm', 'publish');
  }, [handleQuestionAnswer]);

  const resetFlow = useCallback(() => {
    setState(initialState);
    setMessages([
      createMessage('assistant', "Ready for your next campaign! 🚀 Paste a product URL to get started.", { stepId: 'welcome' })
    ]);
  }, []);

  const getCompletedSteps = useCallback((): CampaignStep[] => {
    const currentIndex = STEP_ORDER.indexOf(state.step);
    return STEP_ORDER.slice(0, currentIndex);
  }, [state.step]);

  // Regenerate handlers for AI-generated content
  const regenerateProductAnalysis = useCallback(async () => {
    if (!state.productUrl) return;
    
    setState(prev => ({ ...prev, isRegenerating: 'product' }));
    addMessage('assistant', "Regenerating product analysis with fresh AI insights... ✨");
    
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    // In real implementation, this would call the AI API
    // For now, we simulate with slightly modified mock data
    const refreshedData = {
      ...mockProductData,
      insights: mockProductData.insights?.map(insight => ({
        ...insight,
        value: insight.value // In real app, AI would generate new insights
      }))
    };
    
    setState(prev => ({ ...prev, productData: refreshedData, isRegenerating: null }));
    addMessage('assistant', "Product analysis refreshed! I've generated new insights based on the latest AI models.");
  }, [state.productUrl, addMessage]);

  const regenerateScripts = useCallback(async () => {
    setState(prev => ({ ...prev, isRegenerating: 'scripts', selectedScript: null }));
    addMessage('assistant', "Generating new script variations... 🎬");
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // In real implementation, this would call the AI API for new scripts
    setState(prev => ({ ...prev, isRegenerating: null }));
    
    const scriptQuestion: InlineQuestion = {
      id: 'script-selection',
      question: 'Here are fresh script options:',
      options: scriptOptions.map(s => ({ id: s.id, label: s.name, description: s.description }))
    };
    
    await simulateTyping(
      "I've generated new script variations! Choose the one that best fits your brand:",
      { inlineQuestion: scriptQuestion, stepId: 'script-selection' },
      500
    );
  }, [addMessage, simulateTyping]);

  const regenerateCreatives = useCallback(async () => {
    setState(prev => ({ ...prev, isRegenerating: 'creatives', selectedCreative: null, step: 'creative-generation' }));
    addMessage('assistant', "Regenerating ad creatives with new AI variations... 🎨");
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setState(prev => ({ ...prev, creatives: mockCreatives, isRegenerating: null }));
    
    const creativeQuestion: InlineQuestion = {
      id: 'creative-selection',
      question: 'Here are your new creative options:',
      options: mockCreatives.map(c => ({ 
        id: c.id, 
        label: c.name, 
        description: c.type === 'video' ? 'Video format' : 'Image format'
      }))
    };
    
    await simulateTyping(
      "Fresh creatives ready! I've generated new variations based on your product and script:",
      { inlineQuestion: creativeQuestion, stepId: 'creative-review' },
      1500
    );
    setState(prev => ({ ...prev, step: 'creative-review' }));
  }, [addMessage, simulateTyping]);

  // Custom script/creative handlers
  const handleCustomScriptSubmit = useCallback(async (script: ScriptOption) => {
    setState(prev => ({ ...prev, selectedScript: script, isCustomScriptMode: false, isStepLoading: true }));
    addMessage('user', `Custom script: "${script.customContent?.headline || 'My Script'}"`);
    
    const avatarQuestion: InlineQuestion = {
      id: 'avatar-selection',
      question: 'Select an AI presenter for your video:',
      options: avatarOptions.map(a => ({ id: a.id, label: a.name, description: a.style }))
    };
    
    await simulateTyping(
      `Great custom script! Your ad copy looks compelling. ✍️\n\nNow let's pick an AI avatar to present your product:`,
      { inlineQuestion: avatarQuestion, stepId: 'avatar-selection' },
      1200
    );
    setState(prev => ({ ...prev, step: 'avatar-selection', stepHistory: [...prev.stepHistory, 'avatar-selection'], isStepLoading: false }));
  }, [addMessage, simulateTyping]);

  const handleCustomScriptCancel = useCallback(() => {
    setState(prev => ({ ...prev, isCustomScriptMode: false }));
    
    const scriptQuestion: InlineQuestion = {
      id: 'script-selection',
      question: 'Choose a script style that matches your brand voice:',
      options: [
        ...scriptOptions.map(s => ({ id: s.id, label: s.name, description: s.description })),
        { id: 'custom-script', label: '✍️ Write My Own', description: 'Create custom ad copy' }
      ]
    };
    
    addMessage('assistant', "No problem! Here are the AI-generated script options:", { inlineQuestion: scriptQuestion, stepId: 'script-selection' });
  }, [addMessage]);

  const handleCustomCreativeSubmit = useCallback(async (creative: CreativeOption) => {
    setState(prev => ({ ...prev, selectedCreative: creative, isCustomCreativeMode: false, isStepLoading: true }));
    addMessage('user', `Uploaded custom ${creative.type}: "${creative.name}"`);
    
    await simulateTyping(
      `Your custom ${creative.type} looks great and meets Facebook's ad specifications! 📤\n\nLet's configure your campaign:`,
      { showCampaignSlider: true, stepId: 'campaign-setup' },
      1200
    );
    setState(prev => ({ ...prev, step: 'campaign-setup', stepHistory: [...prev.stepHistory, 'campaign-setup'], isStepLoading: false }));
  }, [addMessage, simulateTyping]);

  const handleCustomCreativeCancel = useCallback(() => {
    setState(prev => ({ ...prev, isCustomCreativeMode: false }));
    
    const creativeQuestion: InlineQuestion = {
      id: 'creative-selection',
      question: 'Select your preferred creative:',
      options: [
        ...mockCreatives.map(c => ({ 
          id: c.id, 
          label: c.name, 
          description: c.type === 'video' ? 'Video format' : 'Image format'
        })),
        { id: 'custom-creative', label: '📤 Upload My Own', description: 'Use your own image or video' }
      ]
    };
    
    addMessage('assistant', "No problem! Here are the AI-generated creative options:", { inlineQuestion: creativeQuestion, stepId: 'creative-review' });
  }, [addMessage]);

  return {
    state,
    messages,
    isTyping,
    handleUserMessage,
    handleQuestionAnswer,
    handleCampaignConfigComplete,
    handleFacebookConnect,
    resetFlow,
    goToStep,
    getCompletedSteps,
    regenerateProductAnalysis,
    regenerateScripts,
    regenerateCreatives,
    handleCustomScriptSubmit,
    handleCustomScriptCancel,
    handleCustomCreativeSubmit,
    handleCustomCreativeCancel,
  };
};
