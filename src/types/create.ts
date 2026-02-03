// Create Module Types

export type CreateInputType = 'image' | 'text' | 'avatar' | 'script' | 'select';
export type CreateOutputType = 'image' | 'video';
export type CanvasState = 'template-selection' | 'input-collection' | 'generating' | 'result' | 'error';
export type GenerationStatus = 'idle' | 'collecting' | 'generating' | 'complete' | 'error';

export interface CreateInputDefinition {
  id: string;
  type: CreateInputType;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: { id: string; label: string; preview?: string }[];
}

export interface CreateTemplate {
  id: string;
  name: string;
  icon: string;
  description: string;
  outputType: CreateOutputType;
  requiredInputs: CreateInputDefinition[];
  optionalInputs: CreateInputDefinition[];
  estimatedTime?: string;
}

export interface CreateInputRequest {
  id: string;
  type: CreateInputType;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: { id: string; label: string; preview?: string }[];
}

export interface CreateMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  inputRequest?: CreateInputRequest;
  uploadedImage?: string;
  templateSelection?: string;
  isTyping?: boolean;
}

export interface CollectedInput {
  inputId: string;
  value: string | File;
  type: CreateInputType;
}

export interface GeneratedCreative {
  id: string;
  type: CreateOutputType;
  url: string;
  thumbnailUrl?: string;
  format: string;
  width?: number;
  height?: number;
  duration?: number; // for videos, in seconds
  prompt?: string;
}

export interface CreateSession {
  id: string;
  template: CreateTemplate | null;
  collectedInputs: CollectedInput[];
  status: GenerationStatus;
  canvasState: CanvasState;
  outputs: GeneratedCreative[];
  error?: string;
}

// Template definitions
export const CREATE_TEMPLATES: CreateTemplate[] = [
  {
    id: 'product-in-hand',
    name: 'Product in Hand',
    icon: 'hand',
    description: 'Showcase your product held naturally by a hand model',
    outputType: 'image',
    estimatedTime: '~30 seconds',
    requiredInputs: [
      { id: 'product-image', type: 'image', label: 'Product Image', placeholder: 'Upload your product image', required: true },
      { id: 'product-description', type: 'text', label: 'Product Description', placeholder: 'Describe your product briefly...', required: true },
    ],
    optionalInputs: [
      { 
        id: 'hand-model', 
        type: 'select', 
        label: 'Hand Model Style', 
        required: false,
        options: [
          { id: 'feminine', label: 'Feminine' },
          { id: 'masculine', label: 'Masculine' },
          { id: 'neutral', label: 'Neutral' },
        ]
      },
      { id: 'background', type: 'text', label: 'Background Style', placeholder: 'e.g., minimalist white, outdoor nature', required: false },
    ],
  },
  {
    id: 'avatar-video',
    name: 'Avatar Video',
    icon: 'video',
    description: 'AI presenter showcasing and talking about your product',
    outputType: 'video',
    estimatedTime: '~2 minutes',
    requiredInputs: [
      { id: 'product-image', type: 'image', label: 'Product Image', placeholder: 'Upload your product image', required: true },
      { id: 'product-description', type: 'text', label: 'Product Description', placeholder: 'Describe your product briefly...', required: true },
    ],
    optionalInputs: [
      { 
        id: 'avatar', 
        type: 'avatar', 
        label: 'Avatar', 
        required: false,
        options: [
          { id: 'emma', label: 'Emma', preview: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100' },
          { id: 'james', label: 'James', preview: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100' },
          { id: 'sophia', label: 'Sophia', preview: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100' },
        ]
      },
      { id: 'script', type: 'script', label: 'Custom Script', placeholder: 'Write your own script or let AI generate one...', required: false },
      { 
        id: 'duration', 
        type: 'select', 
        label: 'Video Duration', 
        required: false,
        options: [
          { id: '15', label: '15 seconds' },
          { id: '30', label: '30 seconds' },
          { id: '60', label: '60 seconds' },
        ]
      },
    ],
  },
  {
    id: 'product-photoshoot',
    name: 'Product Photoshoot',
    icon: 'camera',
    description: 'Professional product photography in various settings',
    outputType: 'image',
    estimatedTime: '~30 seconds',
    requiredInputs: [
      { id: 'product-image', type: 'image', label: 'Product Image', placeholder: 'Upload your product image', required: true },
    ],
    optionalInputs: [
      { 
        id: 'scene', 
        type: 'select', 
        label: 'Scene', 
        required: false,
        options: [
          { id: 'studio', label: 'Studio' },
          { id: 'lifestyle', label: 'Lifestyle' },
          { id: 'outdoor', label: 'Outdoor' },
          { id: 'minimal', label: 'Minimal' },
        ]
      },
      { 
        id: 'lighting', 
        type: 'select', 
        label: 'Lighting', 
        required: false,
        options: [
          { id: 'natural', label: 'Natural' },
          { id: 'dramatic', label: 'Dramatic' },
          { id: 'soft', label: 'Soft' },
          { id: 'golden', label: 'Golden Hour' },
        ]
      },
      { 
        id: 'angle', 
        type: 'select', 
        label: 'Camera Angle', 
        required: false,
        options: [
          { id: 'front', label: 'Front' },
          { id: 'hero', label: 'Hero Shot' },
          { id: 'flat-lay', label: 'Flat Lay' },
          { id: '45-degree', label: '45° Angle' },
        ]
      },
    ],
  },
  {
    id: 'social-post',
    name: 'Social Post',
    icon: 'share',
    description: 'Engaging social media content with your product',
    outputType: 'image',
    estimatedTime: '~30 seconds',
    requiredInputs: [
      { id: 'product-image', type: 'image', label: 'Product Image', placeholder: 'Upload your product image', required: true },
      { id: 'caption-idea', type: 'text', label: 'Caption Idea', placeholder: 'What message do you want to convey?', required: true },
    ],
    optionalInputs: [
      { 
        id: 'platform-format', 
        type: 'select', 
        label: 'Platform Format', 
        required: false,
        options: [
          { id: '1:1', label: 'Square (1:1)' },
          { id: '9:16', label: 'Stories (9:16)' },
          { id: '4:5', label: 'Portrait (4:5)' },
          { id: '16:9', label: 'Landscape (16:9)' },
        ]
      },
    ],
  },
  {
    id: 'unboxing',
    name: 'Unboxing',
    icon: 'package',
    description: 'Exciting unboxing experience video',
    outputType: 'video',
    estimatedTime: '~2 minutes',
    requiredInputs: [
      { id: 'product-image', type: 'image', label: 'Product Image', placeholder: 'Upload your product image', required: true },
      { id: 'product-description', type: 'text', label: 'Product Description', placeholder: 'Describe your product briefly...', required: true },
    ],
    optionalInputs: [
      { 
        id: 'avatar', 
        type: 'avatar', 
        label: 'Avatar', 
        required: false,
        options: [
          { id: 'emma', label: 'Emma', preview: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100' },
          { id: 'james', label: 'James', preview: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100' },
          { id: 'sophia', label: 'Sophia', preview: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100' },
        ]
      },
      { 
        id: 'duration', 
        type: 'select', 
        label: 'Video Duration', 
        required: false,
        options: [
          { id: '30', label: '30 seconds' },
          { id: '60', label: '60 seconds' },
        ]
      },
    ],
  },
  {
    id: 'custom-prompt',
    name: 'Custom Prompt',
    icon: 'sparkles',
    description: 'Describe anything and let AI create it',
    outputType: 'image',
    estimatedTime: '~30 seconds',
    requiredInputs: [
      { id: 'custom-prompt', type: 'text', label: 'Your Prompt', placeholder: 'Describe what you want to create...', required: true },
    ],
    optionalInputs: [
      { id: 'reference-image', type: 'image', label: 'Reference Image', placeholder: 'Upload a reference image (optional)', required: false },
    ],
  },
];
