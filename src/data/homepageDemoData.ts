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
      const severity = absDelta > 40 ? 'high' : absDelta > 25 ? 'medium' : 'low';
      alerts.push({
        id: `alert-${kpi.id}`,
        title: `${kpi.label} ${kpi.direction === 'up' ? '↑' : '↓'} ${absDelta.toFixed(0)}% vs last 7d`,
        rationale: `Your ${kpi.label} moved from ${kpi.previousValue} to ${kpi.value} — ${!kpi.good ? 'this needs attention' : 'great progress'}`,
        kpi: kpi.label,
        delta: kpi.delta,
        estimatedImpact: impact,
        severity,
        status: 'active',
        microActions: getMicroActions(kpi),
        campaignName: 'Spring Sale 2026',
      });
    }
  });
  return alerts;
}

function getMicroActions(kpi: DemoKPI): { label: string; action: string }[] {
  if (kpi.id === 'cpa') return [
    { label: '🔄 Regenerate creative', action: 'regenerate' },
    { label: '⏸️ Pause low performers', action: 'pause' },
  ];
  if (kpi.id === 'roas') return [
    { label: '💰 Adjust budget', action: 'adjust-budget' },
    { label: '👁️ View details', action: 'view' },
  ];
  if (kpi.id === 'ctr') return [
    { label: '🎨 New creative test', action: 'regenerate' },
    { label: '🎯 Refine targeting', action: 'view' },
  ];
  return [{ label: '👁️ View', action: 'view' }];
}

export const demoAssets: DemoAsset[] = [
  { id: 'asset-1', name: 'Spring Banner Hero', type: 'image', thumbnail: '🖼️', dimensions: '1200×628', date: 'Mar 5' },
  { id: 'asset-2', name: 'Product Showcase Reel', type: 'video', thumbnail: '🎬', dimensions: '1080×1920', date: 'Mar 3' },
  { id: 'asset-3', name: 'Carousel Card Set', type: 'image', thumbnail: '🖼️', dimensions: '1080×1080', date: 'Mar 1' },
  { id: 'asset-4', name: 'UGC Avatar Ad', type: 'video', thumbnail: '🎬', dimensions: '1080×1080', date: 'Feb 28' },
];

// Primary action selection heuristic
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

export const onboardingQuizQuestions = [
  { id: 'objective', label: "What's your top objective?", type: 'select' as const, options: ['sales', 'leads', 'awareness', 'app_installs'] },
  { id: 'monthly_budget', label: 'Monthly ad budget range?', type: 'select' as const, options: ['<$500', '$500-2.5k', '$2.5k-10k', '>$10k'] },
  { id: 'platforms', label: 'Which platforms?', type: 'multiselect' as const, options: ['Facebook', 'Instagram', 'TikTok', 'Google'], default: ['Facebook'] },
  { id: 'creatives', label: 'Do you have creatives?', type: 'select' as const, options: ['yes', 'no'] },
  { id: 'audience', label: 'Primary audience?', type: 'select' as const, options: ['existing_customers', 'lookalike', 'interest_based'] },
  { id: 'style', label: 'Preferred creative style?', type: 'select' as const, options: ['UGC', 'lifestyle', 'demo'] },
  { id: 'generate_now', label: 'Create a campaign draft now?', type: 'boolean' as const, default: true },
];

// Demo campaign draft auto-generated from onboarding
export function generateCampaignDraft(answers: Record<string, any>) {
  const objectiveMap: Record<string, string> = {
    sales: 'Conversions — Sales',
    leads: 'Lead Generation',
    awareness: 'Brand Awareness',
    app_installs: 'App Installs',
  };
  const budgetMap: Record<string, number> = {
    '<$500': 15,
    '$500-2.5k': 50,
    '$2.5k-10k': 150,
    '>$10k': 400,
  };

  return {
    name: `${answers.objective ? objectiveMap[answers.objective] || 'New' : 'New'} Campaign — Draft`,
    objective: objectiveMap[answers.objective] || 'Sales',
    dailyBudget: budgetMap[answers.monthly_budget] || 50,
    platforms: answers.platforms || ['Facebook'],
    audience: answers.audience || 'interest_based',
    style: answers.style || 'UGC',
    creativePrompt: `Create ${answers.style || 'UGC'}-style ad creatives for a ${answers.objective || 'sales'} campaign targeting ${answers.audience || 'interest-based'} audiences on ${(answers.platforms || ['Facebook']).join(', ')}`,
  };
}
