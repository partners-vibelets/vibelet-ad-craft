import { ScriptOption, AvatarOption, CreativeOption, AdAccount, ProductData } from '@/types/campaign';

export const mockProductData: ProductData = {
  title: "Premium Wireless Earbuds Pro",
  price: "$149.99",
  description: "Experience crystal-clear audio with our Premium Wireless Earbuds Pro. Featuring active noise cancellation, 40-hour battery life, and seamless Bluetooth 5.3 connectivity.",
  images: [
    "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400",
    "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=400",
    "https://images.unsplash.com/photo-1598331668826-20cecc596b86?w=400"
  ],
  sku: "EAR-PRO-001",
  category: "Electronics / Audio",
  pageScreenshot: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800",
  insights: [
    { label: "Market Fit", value: "High Demand", icon: "trending-up" },
    { label: "Ad Potential", value: "Excellent", icon: "star" },
    { label: "Target Audience", value: "Tech Enthusiasts", icon: "users" },
    { label: "Best Format", value: "Video Ads", icon: "video" },
    { label: "Suggested Budget", value: "$50-100/day", icon: "dollar-sign" }
  ]
};

export const scriptOptions: ScriptOption[] = [
  {
    id: 'script-1',
    name: 'Problem-Solution',
    description: 'Opens with a relatable problem, then showcases your product as the perfect solution.',
    duration: '15-30 seconds',
    style: 'Engaging & Direct'
  },
  {
    id: 'script-2',
    name: 'Lifestyle Feature',
    description: 'Shows the product in real-life scenarios, highlighting key benefits naturally.',
    duration: '30-45 seconds',
    style: 'Aspirational'
  },
  {
    id: 'script-3',
    name: 'Quick Demo',
    description: 'Fast-paced product demonstration with feature callouts and social proof.',
    duration: '15 seconds',
    style: 'Dynamic & Fast'
  },
  {
    id: 'script-4',
    name: 'Testimonial Style',
    description: 'Avatar presents as a satisfied customer sharing their genuine experience.',
    duration: '30 seconds',
    style: 'Authentic & Trustworthy'
  }
];

export const avatarOptions: AvatarOption[] = [
  {
    id: 'avatar-1',
    name: 'Sarah',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
    style: 'Professional & Friendly'
  },
  {
    id: 'avatar-2',
    name: 'Marcus',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
    style: 'Energetic & Casual'
  },
  {
    id: 'avatar-3',
    name: 'Emma',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200',
    style: 'Warm & Relatable'
  },
  {
    id: 'avatar-4',
    name: 'James',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
    style: 'Authoritative & Trustworthy'
  }
];

export const mockCreatives: CreativeOption[] = [
  {
    id: 'creative-1',
    type: 'video',
    thumbnail: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400',
    name: 'Video Ad - 15s'
  },
  {
    id: 'creative-2',
    type: 'video',
    thumbnail: 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=400',
    name: 'Video Ad - 30s'
  },
  {
    id: 'creative-3',
    type: 'image',
    thumbnail: 'https://images.unsplash.com/photo-1598331668826-20cecc596b86?w=400',
    name: 'Static Image Ad'
  },
  {
    id: 'creative-4',
    type: 'image',
    thumbnail: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400',
    name: 'Carousel Ad'
  }
];

export const mockAdAccounts: AdAccount[] = [
  { id: 'act_123456789', name: 'Main Business Account', status: 'Active' },
  { id: 'act_987654321', name: 'E-commerce Store', status: 'Active' },
  { id: 'act_456789123', name: 'Brand Awareness', status: 'Limited' }
];

export const campaignObjectives = [
  { id: 'sales', name: 'Sales', description: 'Drive purchases on your website' },
  { id: 'leads', name: 'Lead Generation', description: 'Collect leads for your business' },
  { id: 'traffic', name: 'Website Traffic', description: 'Send people to your website' },
  { id: 'awareness', name: 'Brand Awareness', description: 'Reach people likely to remember your ads' }
];

export const ctaOptions = [
  'Shop Now',
  'Learn More',
  'Sign Up',
  'Get Offer',
  'Book Now',
  'Contact Us'
];
