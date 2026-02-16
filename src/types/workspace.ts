// Workspace & Thread types for AI-native marketing OS

export interface Workspace {
  id: string;
  name: string;
  clientName: string;
  threads: Thread[];
  createdAt: Date;
}

export interface Thread {
  id: string;
  title: string;
  workspaceId: string;
  messages: ThreadMessage[];
  artifacts: Artifact[];
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface ThreadMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  artifactIds?: string[]; // artifacts spawned by this message
  isStreaming?: boolean;
}

export type ArtifactType = 
  | 'campaign-plan'
  | 'creative-image'
  | 'creative-video'
  | 'performance-report'
  | 'audit-report'
  | 'ai-signals'
  | 'automation-rule'
  | 'ad-preview';

export type ArtifactStatus = 'draft' | 'ready' | 'published' | 'archived';

export interface Artifact {
  id: string;
  type: ArtifactType;
  title: string;
  status: ArtifactStatus;
  data: Record<string, any>;
  version: number;
  isCollapsed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CampaignPlanData {
  objective: string;
  platform: string;
  budget: { daily: number; total: number };
  targeting: { ageRange: string; interests: string[]; locations: string[] };
  schedule: { startDate: string; endDate: string };
  adSets: number;
  status: 'planning' | 'configured' | 'ready' | 'published';
}

export interface CreativeImageData {
  imageUrl: string;
  prompt: string;
  dimensions: string;
  format: string;
  variants: number;
}

export interface PerformanceReportData {
  dateRange: string;
  metrics: {
    spent: number;
    revenue: number;
    roi: number;
    conversions: number;
    ctr: number;
    impressions: number;
  };
  topCampaign: string;
  recommendations: string[];
}

export interface AuditReportData {
  healthScore: number;
  wastedSpend: number;
  findings: { severity: 'critical' | 'warning' | 'info'; title: string; description: string }[];
  actions: { priority: number; title: string; impact: string }[];
}

export interface AISignalData {
  type: 'anomaly' | 'opportunity' | 'trend' | 'alert';
  severity: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  metric: string;
  change: number;
  suggestedAction: string;
}

export interface AutomationRuleData {
  name: string;
  trigger: string;
  condition: string;
  action: string;
  isActive: boolean;
  autoExecute: boolean;
  lastTriggered?: string;
}
