import { useState, useCallback } from 'react';
import { CampaignState, CampaignStep, Message, ProductData, ScriptOption, AvatarOption, CreativeOption, CampaignConfig, AdAccount } from '@/types/campaign';
import { mockProductData, mockCreatives } from '@/data/mockData';

const initialState: CampaignState = {
  step: 'welcome',
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

const createMessage = (role: 'user' | 'assistant', content: string): Message => ({
  id: crypto.randomUUID(),
  role,
  content,
  timestamp: new Date(),
});

export const useCampaignFlow = () => {
  const [state, setState] = useState<CampaignState>(initialState);
  const [messages, setMessages] = useState<Message[]>([
    createMessage('assistant', "Hey there! 👋 I'm your Vibelets AI assistant. I'll help you create a high-converting ad campaign in minutes.\n\nJust paste your product URL to get started, and I'll handle the rest!")
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const addMessage = useCallback((role: 'user' | 'assistant', content: string) => {
    setMessages(prev => [...prev, createMessage(role, content)]);
  }, []);

  const simulateTyping = useCallback(async (content: string, delay = 1500) => {
    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, delay));
    setIsTyping(false);
    addMessage('assistant', content);
  }, [addMessage]);

  const handleUserMessage = useCallback(async (content: string) => {
    addMessage('user', content);
    
    // Handle different steps
    if (state.step === 'welcome' || state.step === 'product-url') {
      // Check if it looks like a URL
      if (content.includes('.') || content.includes('http')) {
        setState(prev => ({ ...prev, step: 'product-analysis', productUrl: content }));
        
        await simulateTyping("Perfect! I'm analyzing your product page now... 🔍", 1000);
        
        // Simulate product analysis
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        setState(prev => ({ ...prev, productData: mockProductData }));
        await simulateTyping(
          `Great news! I've extracted your product details:\n\n**${mockProductData.title}**\n💰 ${mockProductData.price}\n📦 SKU: ${mockProductData.sku}\n\nI've also identified ${mockProductData.images.length} product images. Now let's choose a script style for your ad creative. Check out the options in the panel →`,
          1500
        );
        setState(prev => ({ ...prev, step: 'script-selection' }));
      } else {
        await simulateTyping("I'd love to help! Please share your product URL and I'll analyze it to create the perfect ad campaign for you.");
      }
    }
  }, [state.step, addMessage, simulateTyping]);

  const selectScript = useCallback(async (script: ScriptOption) => {
    setState(prev => ({ ...prev, selectedScript: script }));
    addMessage('user', `I'll go with the "${script.name}" script style.`);
    
    await simulateTyping(
      `Excellent choice! The ${script.name} style works great for conversion ads. 🎬\n\nNow, let's pick an AI avatar to present your product. Choose someone who matches your brand voice →`,
      1200
    );
    setState(prev => ({ ...prev, step: 'avatar-selection' }));
  }, [addMessage, simulateTyping]);

  const selectAvatar = useCallback(async (avatar: AvatarOption) => {
    setState(prev => ({ ...prev, selectedAvatar: avatar }));
    addMessage('user', `Let's use ${avatar.name} as the presenter.`);
    
    await simulateTyping(
      `${avatar.name} is a great pick! Their ${avatar.style.toLowerCase()} tone will resonate well with your audience. 🎥\n\nI'm now generating your ad creatives... This usually takes about 30 seconds.`,
      1000
    );
    setState(prev => ({ ...prev, step: 'creative-generation' }));
    
    // Simulate creative generation
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setState(prev => ({ ...prev, creatives: mockCreatives }));
    await simulateTyping(
      `Done! I've generated ${mockCreatives.length} creative variations for you:\n• 2 Video ads (15s and 30s)\n• 2 Image ads (Static and Carousel)\n\nReview them in the panel and select your favorite to proceed →`,
      1500
    );
    setState(prev => ({ ...prev, step: 'creative-review' }));
  }, [addMessage, simulateTyping]);

  const selectCreative = useCallback(async (creative: CreativeOption) => {
    setState(prev => ({ ...prev, selectedCreative: creative }));
    addMessage('user', `I'll use the "${creative.name}" for my campaign.`);
    
    await simulateTyping(
      `Perfect! I'm rendering your final creative now... ⏳\n\nWhile that's processing, let's set up your campaign details. I'll need a few quick answers about your campaign goals →`,
      1200
    );
    setState(prev => ({ ...prev, step: 'campaign-setup' }));
  }, [addMessage, simulateTyping]);

  const setCampaignConfig = useCallback(async (config: CampaignConfig) => {
    setState(prev => ({ ...prev, campaignConfig: config }));
    addMessage('user', `Objective: ${config.objective}, Budget: ${config.budget}/day, CTA: ${config.cta}`);
    
    await simulateTyping(
      `Great configuration! 🎯\n\n✅ Your creative has finished rendering!\n\nNow I need to connect to your Facebook Ads account to publish this campaign. Click "Connect Facebook" in the panel to authorize access →`,
      1500
    );
    setState(prev => ({ ...prev, step: 'facebook-integration' }));
  }, [addMessage, simulateTyping]);

  const connectFacebook = useCallback(async () => {
    addMessage('user', "I've connected my Facebook account.");
    
    await simulateTyping(
      `Facebook connected successfully! 🔗\n\nI found 3 ad accounts linked to your profile. Please select the one you'd like to use for this campaign →`,
      1200
    );
    setState(prev => ({ ...prev, facebookConnected: true, step: 'ad-account-selection' }));
  }, [addMessage, simulateTyping]);

  const selectAdAccount = useCallback(async (account: AdAccount) => {
    setState(prev => ({ ...prev, selectedAdAccount: account }));
    addMessage('user', `Use "${account.name}" for this campaign.`);
    
    await simulateTyping(
      `Perfect! I've selected **${account.name}** and automatically fetched:\n✅ Facebook Pixel\n✅ Business Page\n\nEverything's ready! Review your campaign summary and click "Publish" when you're ready to go live →`,
      1500
    );
    setState(prev => ({ ...prev, step: 'campaign-preview' }));
  }, [addMessage, simulateTyping]);

  const publishCampaign = useCallback(async () => {
    addMessage('user', "Let's publish this campaign!");
    setState(prev => ({ ...prev, step: 'publishing' }));
    
    await simulateTyping(
      `Publishing your campaign to Facebook... 🚀`,
      1000
    );
    
    // Simulate publishing
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    await simulateTyping(
      `🎉 **Campaign Published Successfully!**\n\nYour ad has been submitted to Facebook for review. This typically takes 24-48 hours.\n\n**What's Next:**\n• Monitor performance in your dashboard\n• I'll notify you when the ad is approved\n• Optimization suggestions coming soon!\n\nWant to create another campaign? Just paste a new product URL!`,
      2000
    );
    setState(prev => ({ ...prev, step: 'published' }));
  }, [addMessage, simulateTyping]);

  const resetFlow = useCallback(() => {
    setState(initialState);
    setMessages([
      createMessage('assistant', "Ready for your next campaign! 🚀 Paste a product URL to get started.")
    ]);
  }, []);

  return {
    state,
    messages,
    isTyping,
    handleUserMessage,
    selectScript,
    selectAvatar,
    selectCreative,
    setCampaignConfig,
    connectFacebook,
    selectAdAccount,
    publishCampaign,
    resetFlow,
  };
};
