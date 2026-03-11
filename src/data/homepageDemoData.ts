// Demo data for state-aware homepage

export interface DemoKPI {
  id: string;
  label: string;
  value: string;
  previousValue: string;
  delta: number; // percentage change
  direction: 'up' | 'down';
  good: boolean; // whether the direction is positive
  dataPoints: number;
}

export interface DemoAlert {
  id: string;
  title: string;
  rationale: string;
  kpi: string;
  delta: number;
  estimatedImpact: number;
  severity: 'high' | 'medium' | 'low';
  status: 'active' | 'paused' | 'resolved';
  microActions: { label: string; action: string }[];
  campaignName: string;
}

export interface DemoAsset {
  id: string;
  name: string;
  type: 'image' | 'video';
  thumbnail: string;
  dimensions: string;
  date: string;
}

export const demoKPIs: DemoKPI[] = [
  { id: 'spend', label: 'Spend', value: '$2,847', previousValue: '$2,420', delta: 17.6, direction: 'up', good: false, dataPoints: 14 },
  { id: 'roas', label: 'ROAS', value: '3.2x', previousValue: '3.8x', delta: -15.8, direction: 'down', good: false, dataPoints: 14 },
  { id: 'cpa', label: 'CPA', value: '$18.40', previousValue: '$12.20', delta: 50.8, direction: 'up', good: false, dataPoints: 14 },
  { id: 'ctr', label: 'CTR', value: '2.1%', previousValue: '2.8%', delta: -25.0, direction: 'down', good: false, dataPoints: 14 },
  { id: 'top-ad', label: 'Top Ad', value: 'Spring Sale — Retargeting', previousValue: '', delta: 0, direction: 'up', good: true, dataPoints: 14 },
];

export function generateAlerts(kpis: DemoKPI[]): DemoAlert[] {
  const alerts: DemoAlert[] = [];
  kpis.forEach(kpi => {
    if (kpi.id === 'top-ad') return;
    const absDelta = Math.abs(kpi.delta);
    if (absDelta > 20) {
      const impact = Math.round(absDelta * 0.45);
      alerts.push({
        id: `alert-${kpi.id}`,
        title: `${kpi.label} shifted ${kpi.direction === 'up' ? '↑' : '↓'} ${absDelta.toFixed(1)}%`,
        rationale: `${kpi.label} went from ${kpi.previousValue} → ${kpi.value}`,
        kpi: kpi.label,
        delta: kpi.delta,
        estimatedImpact: impact,
        severity: absDelta > 40 ? 'high' : absDelta > 25 ? 'medium' : 'low',
        status: 'active',
        microActions: [
          { label: 'Pause underperformer', action: `pause-${kpi.id}` },
          { label: 'Reallocate budget', action: `realloc-${kpi.id}` },
        ],
        campaignName: 'Spring Sale Campaign',
      });
    }
  });
  return alerts;
}

export const demoAssets: DemoAsset[] = [
  { id: 'asset-1', name: 'hero-banner-spring.png', type: 'image', thumbnail: '', dimensions: '1200×628', date: '2 days ago' },
  { id: 'asset-2', name: 'product-demo-v3.mp4', type: 'video', thumbnail: '', dimensions: '1080×1920', date: '4 days ago' },
  { id: 'asset-3', name: 'ugc-testimonial.mp4', type: 'video', thumbnail: '', dimensions: '1080×1080', date: '1 week ago' },
];

interface ActionCandidate {
  id: string;
  label: string;
  rationale: string;
  friction: number;
  icon: string;
}

const actionCandidates: ActionCandidate[] = [
  { id: 'pause', label: 'Pause low-performing adset', rationale: 'Stop bleeding spend on underperformers', friction: 1, icon: '⏸️' },
  { id: 'regenerate', label: 'Regenerate creative', rationale: 'Fresh creatives can lift CTR by 15-30%', friction: 2, icon: '🔄' },
  { id: 'increase-budget', label: 'Increase budget for winner', rationale: 'Your top ad has room to scale', friction: 2, icon: '💰' },
  { id: 'publish-draft', label: 'Publish draft campaign', rationale: 'Your draft is ready — go live now', friction: 3, icon: '🚀' },
];

export function computePrimaryAction(kpis: DemoKPI[], hasDraft: boolean): { label: string; rationale: string; icon: string; action: string } {
  let bestScore = -1;
  let bestAction = actionCandidates[0];

  actionCandidates.forEach(candidate => {
    if (candidate.id === 'publish-draft' && !hasDraft) return;

    let impactEstimate = 0;
    kpis.forEach(kpi => {
      if (kpi.id === 'top-ad') return;
      impactEstimate += Math.abs(kpi.delta);
    });

    const confidence = Math.min(1, kpis.reduce((sum, k) => sum + k.dataPoints, 0) / 10);
    const score = (impactEstimate * confidence) / candidate.friction;

    if (score > bestScore) {
      bestScore = score;
      bestAction = candidate;
    }
  });

  // Override if user has a draft
  if (hasDraft) {
    bestAction = actionCandidates.find(a => a.id === 'publish-draft')!;
  }

  return {
    label: bestAction.label,
    rationale: bestAction.rationale,
    icon: bestAction.icon,
    action: bestAction.id,
  };
}

// Re-export quiz questions from new location for backward compat
export { onboardingQuizQuestions } from '@/data/onboardingQuizData';

// Demo campaign draft auto-generated from onboarding
export function generateCampaignDraft(answers: Record<string, any>) {
  const objectiveMap: Record<string, string> = {
    sales: 'Conversions — Sales',
    leads: 'Lead Generation',
    awareness: 'Brand Awareness',
    experimentation: 'A/B Testing',
  };
  const budgetMap: Record<string, number> = {
    '<$500': 15,
    '$500-2500': 50,
    '$2.5k-10k': 150,
    '>$10k': 400,
  };

  return {
    name: `${answers.top_objective ? objectiveMap[answers.top_objective] || 'New' : 'New'} Campaign — Draft`,
    objective: objectiveMap[answers.top_objective] || 'Sales',
    dailyBudget: budgetMap[answers.monthly_budget_range] || 50,
    platforms: answers.tools_connected || ['facebook'],
    audience: 'interest_based',
    style: answers.creative_availability === 'no' ? 'ai-generated' : 'upload',
    creativePrompt: `Create ad creatives for a ${answers.top_objective || 'sales'} campaign with ${answers.monthly_budget_range || 'moderate'} budget`,
  };
}

// ---- Money Flow data by persona context ----
import { MoneyFlowData } from '@/components/workspace/homepage/MoneyFlowCard';
import { KeyMoment } from '@/components/workspace/homepage/KeyMomentsPanel';
import { RecentDecision } from '@/components/workspace/homepage/RecentDecisionsCard';

export const moneyFlowData: Record<string, MoneyFlowData> = {
  '30days': {
    period: 'LAST 30 DAYS',
    spent: '$19,289',
    spentContext: 'Spread across 30 campaigns',
    sales: '5,616',
    salesContext: 'From 105 active ads',
    earned: '$20,533',
    earnedContext: '$1.08 back for every $1 spent',
    profit: '$1,244',
    profitContext: 'Resulted in a profit',
    profitPositive: true,
  },
  '7days': {
    period: 'LAST 7 DAYS',
    spent: '$6,541',
    spentContext: 'Spread across top 4 campaigns',
    sales: '1,831',
    salesContext: 'From your top 5 performing ads',
    earned: '$6,680',
    earnedContext: 'Only $0.98 back for every $1 spent',
    profit: '$140',
    profitContext: 'Resulted in a profit',
    profitPositive: true,
  },
  today: {
    period: 'TODAY',
    spent: '$847',
    spentContext: 'Across 12 active campaigns',
    sales: '234',
    salesContext: 'From 38 running ads',
    earned: '$912',
    earnedContext: '$1.08 back for every $1 spent',
    profit: '$65',
    profitContext: 'On track for daily target',
    profitPositive: true,
  },
  'returning': {
    period: 'SINCE YOU LEFT',
    spent: '$4,120',
    spentContext: 'Over 3 days across 18 campaigns',
    sales: '1,102',
    salesContext: 'From 42 active ads',
    earned: '$3,890',
    earnedContext: '$0.94 back for every $1 spent',
    profit: '-$230',
    profitContext: 'Below breakeven — needs attention',
    profitPositive: false,
  },
};

export const demoKeyMoments: KeyMoment[] = [
  {
    id: 'km-1',
    campaignName: 'ROAS -10 oct san no var -cbo pic - ss – Copy',
    description: 'Restart campaign with a daily budget of $880',
    metric: 'Previous ROAS',
    metricValue: '1.5x',
    riskLevel: 'MEDIUM RISK',
    actionType: 'play',
    actionLabel: 'Play',
    category: 'working',
    strategyLogic: 'It previously had a 1.49x return on your spend. You got 5 sales for just $49.57 last time.',
    empiricalData: 'In October month, it had a 1.49x return with 5 sales on $49.57 spent.',
  },
  {
    id: 'km-2',
    campaignName: '19 nov backless No var -cbo pic - ss –app – clone',
    description: 'Restart campaign with a daily budget of $170',
    metric: 'Previous ROAS',
    metricValue: '1.4x',
    riskLevel: 'MEDIUM RISK',
    actionType: 'play',
    actionLabel: 'Play',
    category: 'working',
  },
  {
    id: 'km-3',
    campaignName: '02 Feb - 410',
    description: 'Increase budget by $86 into top performing campaign',
    metric: '+$127 daily revenue',
    metricValue: '',
    riskLevel: 'MEDIUM RISK',
    actionType: 'increase',
    actionLabel: 'Increase',
    category: 'working',
  },
  {
    id: 'km-4',
    campaignName: '19 nov backless No var -cbo pic - ss –app – clone',
    description: 'Increase budget by $34 into top performing campaign',
    metric: '+$47 daily revenue',
    metricValue: '',
    riskLevel: 'MEDIUM RISK',
    actionType: 'increase',
    actionLabel: 'Increase',
    category: 'working',
  },
  {
    id: 'km-5',
    campaignName: '20 jan video -cbo-ss - L_PL372 – Copy',
    description: 'Reduce budget by $24 from underperforming campaign',
    metric: 'Save $24/day',
    metricValue: '',
    riskLevel: 'LOW RISK',
    actionType: 'decrease',
    actionLabel: 'Decrease',
    category: 'not_working',
  },
  {
    id: 'km-6',
    campaignName: '07cbo oct - No creatives var - ss –pic – rejected',
    description: 'Pause this ad to stop wasting money',
    metric: 'Save $18/day',
    metricValue: '',
    riskLevel: 'HIGH RISK',
    actionType: 'pause',
    actionLabel: 'Pause',
    category: 'not_working',
  },
];

export const demoRecentDecisions: RecentDecision[] = [
  {
    id: 'rd-1',
    title: 'Campaign Paused',
    details: 'Campaign 14 | Purchase | High Value | 27th Jan',
    confidence: 90,
    daysAgo: 21,
  },
  {
    id: 'rd-2',
    title: 'Ad Paused',
    details: 'tr+prog_st - Made with Clipchamp.mp4',
    confidence: 100,
    daysAgo: 22,
  },
];
