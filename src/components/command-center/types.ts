export interface Reason {
  id: string;
  title: string;
  explanation: string[];
  dataWindow: string;
  confidence: number;
  icon: 'budget' | 'fatigue' | 'waste';
}

export interface ActionItem {
  id: string;
  title: string;
  impact: string;
  confidence: number;
  risk: 'Low' | 'Medium' | 'High';
  whyWorks: string[];
  dataUsed: string;
  variance: 'Low' | 'Medium' | 'High';
  consequence: string;
}

export interface WasteItem {
  id: string;
  name: string;
  type: 'campaign' | 'adset';
  amount: string;
  reason: string;
  confidence: number;
}

export interface LiveAlert {
  id: string;
  message: string;
  time: string;
  type: 'positive' | 'negative';
  details: string;
  metric: string;
  change: string;
  suggestedAction: {
    title: string;
    description: string;
    impact: string;
  };
}

export interface HealthMetric {
  label: string;
  value: number;
  status: 'good' | 'warning' | 'critical';
}

export interface QuickWin {
  id: string;
  title: string;
  impact: string;
  timeToApply: string;
  confidence: number;
  category: 'budget' | 'creative' | 'targeting' | 'schedule';
}

export interface TrendingChange {
  id: string;
  metric: string;
  change: string;
  direction: 'up' | 'down';
  context: string;
  since: string;
}
