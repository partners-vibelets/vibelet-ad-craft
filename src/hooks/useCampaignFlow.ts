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
};

const createMessage = (
  role: 'user' | 'assistant', 
  content: string, 
  options?: { inlineQuestion?: InlineQuestion; stepId?: CampaignStep }
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

  const addMessage = useCallback((role: 'user' | 'assistant', content: string, options?: { inlineQuestion?: InlineQuestion; stepId?: CampaignStep }) => {
    setMessages(prev => [...prev, createMessage(role, content, options)]);
  }, []);

  const simulateTyping = useCallback(async (content: string, options?: { inlineQuestion?: InlineQuestion; stepId?: CampaignStep }, delay = 1500) => {
    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, delay));
    setIsTyping(false);
    addMessage('assistant', content, options);
  }, [addMessage]);

  const goToStep = useCallback((targetStep: CampaignStep) => {
    const targetIndex = STEP_ORDER.indexOf(targetStep);
    const currentIndex = STEP_ORDER.indexOf(state.step);
    
    if (targetIndex < currentIndex) {
      // Going back - reset state from that step forward
      setState(prev => {
        const newState = { ...prev, step: targetStep };
        
        // Reset subsequent data based on step
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
        setState(prev => ({ ...prev, step: 'product-analysis', productUrl: content, stepHistory: [...prev.stepHistory, 'product-analysis'] }));
        
        await simulateTyping("Perfect! Analyzing your product page now... 🔍", { stepId: 'product-analysis' }, 1000);
        
        await new Promise(resolve => setTimeout(resolve, 2500));
        
        setState(prev => ({ ...prev, productData: mockProductData }));
        
        const scriptQuestion: InlineQuestion = {
          id: 'script-selection',
          question: 'Choose a script style that matches your brand voice:',
          options: scriptOptions.map(s => ({ id: s.id, label: s.name, description: s.description }))
        };
        
        await simulateTyping(
          `I've analyzed your product page and found some great insights!\n\n**${mockProductData.title}** looks perfect for video ads. I've identified ${mockProductData.images.length} high-quality images and extracted key product details.\n\nNow, let's choose how to tell your product's story:`,
          { inlineQuestion: scriptQuestion, stepId: 'script-selection' },
          1500
        );
        setState(prev => ({ ...prev, step: 'script-selection', stepHistory: [...prev.stepHistory, 'script-selection'] }));
      } else {
        await simulateTyping("Please share your product URL (e.g., https://yourstore.com/product) and I'll analyze it for you.");
      }
    }
  }, [state.step, addMessage, simulateTyping]);

  const handleQuestionAnswer = useCallback(async (questionId: string, answerId: string) => {
    if (questionId === 'script-selection') {
      const script = scriptOptions.find(s => s.id === answerId);
      if (script) {
        await selectScript(script);
      }
    } else if (questionId === 'avatar-selection') {
      const avatar = avatarOptions.find(a => a.id === answerId);
      if (avatar) {
        await selectAvatar(avatar);
      }
    } else if (questionId === 'objective-selection') {
      // Handle in campaign setup
    }
  }, []);

  const selectScript = useCallback(async (script: ScriptOption) => {
    setState(prev => ({ ...prev, selectedScript: script }));
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
    setState(prev => ({ ...prev, step: 'avatar-selection', stepHistory: [...prev.stepHistory, 'avatar-selection'] }));
  }, [addMessage, simulateTyping]);

  const selectAvatar = useCallback(async (avatar: AvatarOption) => {
    setState(prev => ({ ...prev, selectedAvatar: avatar }));
    addMessage('user', `${avatar.name} will be the presenter.`);
    
    await simulateTyping(
      `${avatar.name} is perfect! 🎥 Now generating your ad creatives...\n\nThis usually takes about 30 seconds.`,
      { stepId: 'creative-generation' },
      1000
    );
    setState(prev => ({ ...prev, step: 'creative-generation', stepHistory: [...prev.stepHistory, 'creative-generation'] }));
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setState(prev => ({ ...prev, creatives: mockCreatives }));
    await simulateTyping(
      `Done! I've generated ${mockCreatives.length} creative variations:\n• 2 Video ads (15s and 30s)\n• 2 Image ads (Static and Carousel)\n\nReview them in the panel and select your favorite →`,
      { stepId: 'creative-review' },
      1500
    );
    setState(prev => ({ ...prev, step: 'creative-review', stepHistory: [...prev.stepHistory, 'creative-review'] }));
  }, [addMessage, simulateTyping]);

  const selectCreative = useCallback(async (creative: CreativeOption) => {
    setState(prev => ({ ...prev, selectedCreative: creative }));
    addMessage('user', `I'll use the "${creative.name}" creative.`);
    
    const objectiveQuestion: InlineQuestion = {
      id: 'campaign-setup',
      question: "What's your main campaign goal?",
      options: campaignObjectives.map(o => ({ id: o.id, label: o.name, description: o.description }))
    };
    
    await simulateTyping(
      `Excellent choice! Your creative is now rendering in the background. ⏳\n\nLet's set up your campaign while it processes:`,
      { inlineQuestion: objectiveQuestion, stepId: 'campaign-setup' },
      1200
    );
    setState(prev => ({ ...prev, step: 'campaign-setup', stepHistory: [...prev.stepHistory, 'campaign-setup'] }));
  }, [addMessage, simulateTyping]);

  const setCampaignConfig = useCallback(async (config: CampaignConfig) => {
    setState(prev => ({ ...prev, campaignConfig: config }));
    addMessage('user', `Campaign: ${config.objective}, $${config.budget}/day, "${config.cta}" CTA`);
    
    await simulateTyping(
      `Perfect! Your creative is ready. 🎉\n\nNow let's connect your Facebook Ads account to publish this campaign. Click the button in the panel to authorize →`,
      { stepId: 'facebook-integration' },
      1500
    );
    setState(prev => ({ ...prev, step: 'facebook-integration', stepHistory: [...prev.stepHistory, 'facebook-integration'] }));
  }, [addMessage, simulateTyping]);

  const connectFacebook = useCallback(async () => {
    addMessage('user', "Facebook account connected.");
    
    const accountQuestion: InlineQuestion = {
      id: 'ad-account-selection',
      question: 'Which ad account should we use?',
      options: mockAdAccounts.map(a => ({ id: a.id, label: a.name, description: `Status: ${a.status}` }))
    };
    
    await simulateTyping(
      `Facebook connected! 🔗\n\nI found ${mockAdAccounts.length} ad accounts. Select one to continue:`,
      { inlineQuestion: accountQuestion, stepId: 'ad-account-selection' },
      1200
    );
    setState(prev => ({ ...prev, facebookConnected: true, step: 'ad-account-selection', stepHistory: [...prev.stepHistory, 'ad-account-selection'] }));
  }, [addMessage, simulateTyping]);

  const selectAdAccount = useCallback(async (account: AdAccount) => {
    setState(prev => ({ ...prev, selectedAdAccount: account }));
    addMessage('user', `Using "${account.name}" account.`);
    
    await simulateTyping(
      `Great! I've selected **${account.name}** and auto-fetched:\n✅ Facebook Pixel\n✅ Business Page\n\nReview your campaign summary and click Publish when ready →`,
      { stepId: 'campaign-preview' },
      1500
    );
    setState(prev => ({ ...prev, step: 'campaign-preview', stepHistory: [...prev.stepHistory, 'campaign-preview'] }));
  }, [addMessage, simulateTyping]);

  const publishCampaign = useCallback(async () => {
    addMessage('user', "Publish the campaign!");
    setState(prev => ({ ...prev, step: 'publishing', stepHistory: [...prev.stepHistory, 'publishing'] }));
    
    await simulateTyping(`Publishing to Facebook... 🚀`, { stepId: 'publishing' }, 1000);
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    await simulateTyping(
      `🎉 **Campaign Published!**\n\nYour ad has been submitted for review (typically 24-48 hours).\n\n**What's next:**\n• Monitor performance in your dashboard\n• I'll notify you when approved\n• Optimization tips coming soon!\n\nWant to create another campaign? Just paste a new product URL!`,
      { stepId: 'published' },
      2000
    );
    setState(prev => ({ ...prev, step: 'published', stepHistory: [...prev.stepHistory, 'published'] }));
  }, [addMessage, simulateTyping]);

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

  return {
    state,
    messages,
    isTyping,
    handleUserMessage,
    handleQuestionAnswer,
    selectScript,
    selectAvatar,
    selectCreative,
    setCampaignConfig,
    connectFacebook,
    selectAdAccount,
    publishCampaign,
    resetFlow,
    goToStep,
    getCompletedSteps,
  };
};
