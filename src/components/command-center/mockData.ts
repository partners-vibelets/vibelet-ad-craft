import { Reason, ActionItem, WasteItem, LiveAlert, HealthMetric, QuickWin, TrendingChange } from './types';

// 30-Day Audit Data
export const mockReasons: Reason[] = [
  {
    id: '1',
    title: 'Money going to the wrong places',
    explanation: [
      'Most of your daily budget is being spent on ads that aren\'t performing well',
      'Your best ads are only getting a small share of the budget'
    ],
    dataWindow: 'Last 30 days',
    confidence: 91,
    icon: 'budget'
  },
  {
    id: '2',
    title: 'Some ads are being shown too often',
    explanation: [
      'People are seeing the same ads repeatedly and clicking less',
      'The same audience has seen your ads too many times'
    ],
    dataWindow: 'Last 14 days',
    confidence: 88,
    icon: 'fatigue'
  },
  {
    id: '3',
    title: '₹900 spent without getting results',
    explanation: [
      'Clicks came from people who weren\'t likely to buy',
      'Some locations aren\'t generating sales'
    ],
    dataWindow: 'Last 7 days',
    confidence: 79,
    icon: 'waste'
  }
];

export const mockActions: ActionItem[] = [
  {
    id: '1',
    title: 'Move ₹450 to your best-performing campaign',
    impact: '+12% more sales expected',
    confidence: 88,
    risk: 'Low',
    whyWorks: [
      'This campaign brings in more than twice as many sales',
      'Other businesses saw similar improvements with this change'
    ],
    dataUsed: 'Based on 34 days of data',
    variance: 'Low',
    consequence: 'If you skip this, you might waste about ₹1,200 over the next week'
  },
  {
    id: '2',
    title: 'Replace overused ads in "Summer Sale"',
    impact: '+8% more clicks expected',
    confidence: 84,
    risk: 'Low',
    whyWorks: [
      'Fresh ads usually start performing better within 2-3 days',
      'Your audience responds well to new visuals'
    ],
    dataUsed: 'Based on 21 days of data',
    variance: 'Medium',
    consequence: 'Costs will keep rising as people ignore the same old ads'
  },
  {
    id: '3',
    title: 'Stop showing ads in areas that don\'t buy',
    impact: 'Save ₹180 daily',
    confidence: 76,
    risk: 'Medium',
    whyWorks: [
      'Some areas take 22% of your budget but bring only 4% of sales',
      'Your best customers won\'t be affected'
    ],
    dataUsed: 'Based on 28 days of data',
    variance: 'Medium',
    consequence: 'You\'ll keep spending money in places that don\'t convert'
  }
];

export const mockWasteItems: WasteItem[] = [
  {
    id: '1',
    name: 'Evergreen Content - Broad Interests',
    type: 'adset',
    amount: '₹420',
    reason: 'Spent money but got no sales in the last week',
    confidence: 92
  },
  {
    id: '2',
    name: 'Summer Sale - Retargeting Lookalike',
    type: 'adset',
    amount: '₹310',
    reason: 'Costing 4x more per sale than your other ads',
    confidence: 85
  },
  {
    id: '3',
    name: 'Brand Awareness - Video Views',
    type: 'campaign',
    amount: '₹170',
    reason: 'No sales resulted from this campaign',
    confidence: 71
  }
];

export const mockLiveAlerts: LiveAlert[] = [
  { 
    id: '1', 
    message: 'Great news! Sales are up 23% in your Search campaign', 
    time: '1h ago', 
    type: 'positive',
    details: 'Your Search campaign is doing really well! More people are buying after clicking your ads - sales jumped 23% in the last 3 hours.',
    metric: 'Sales Rate',
    change: '+23%',
    suggestedAction: {
      title: 'Boost your budget by 20%',
      description: 'Your ads are working great right now. Spend a bit more to reach even more buyers while things are going well.',
      impact: 'Could earn ₹180 more daily'
    }
  },
  { 
    id: '2', 
    message: 'Heads up: Fewer people clicking Summer Sale ads', 
    time: '2h ago', 
    type: 'negative',
    details: 'People are clicking on your Summer Sale ads less often. This usually happens when the same people see your ads too many times.',
    metric: 'Clicks',
    change: '-33%',
    suggestedAction: {
      title: 'Switch to fresh ads',
      description: 'Pause the ads that aren\'t getting clicks and try some new ones. Fresh visuals usually get more attention.',
      impact: 'Could improve clicks by 8%'
    }
  },
  { 
    id: '3', 
    message: 'Good news! Getting customers for less money', 
    time: '3h ago', 
    type: 'positive',
    details: 'It\'s now cheaper to get each new customer - costs dropped from ₹145 to ₹112. Your targeting is really working well.',
    metric: 'Cost Per Customer',
    change: '-23%',
    suggestedAction: {
      title: 'Reach more potential buyers',
      description: 'Since you\'re getting customers for less, try reaching more people who visited your site recently.',
      impact: 'Could reach 35% more people'
    }
  }
];

export const mockHealthMetrics: HealthMetric[] = [
  { label: 'Steady Results', value: 87, status: 'good' },
  { label: 'Ad Freshness', value: 34, status: 'warning' },
  { label: 'Stable Performance', value: 92, status: 'good' }
];

// Daily/Weekly Quick Wins Data
export const mockQuickWins: QuickWin[] = [
  {
    id: 'qw-1',
    title: 'Pause "Summer Sale" carousel - it\'s underperforming today',
    impact: 'Save ₹85 today',
    timeToApply: '1 click',
    confidence: 89,
    category: 'creative'
  },
  {
    id: 'qw-2',
    title: 'Boost "Product Demo" ad - it\'s converting 2x better',
    impact: '+₹120 potential',
    timeToApply: '1 click',
    confidence: 84,
    category: 'budget'
  },
  {
    id: 'qw-3',
    title: 'Your ads perform 40% better after 6 PM',
    impact: 'Optimize schedule',
    timeToApply: '2 mins',
    confidence: 78,
    category: 'schedule'
  }
];

export const mockTrendingChanges: TrendingChange[] = [
  {
    id: 'tc-1',
    metric: 'Cost per Sale',
    change: '-15%',
    direction: 'down',
    context: 'Getting cheaper to convert customers',
    since: 'vs yesterday'
  },
  {
    id: 'tc-2',
    metric: 'Click Rate',
    change: '+8%',
    direction: 'up',
    context: 'More people clicking your ads',
    since: 'vs last week'
  },
  {
    id: 'tc-3',
    metric: 'Reach',
    change: '-22%',
    direction: 'down',
    context: 'Fewer people seeing your ads',
    since: 'vs yesterday'
  }
];

// 7-day specific data
export const mock7DayInsights = {
  weeklySpend: '₹4,230',
  weeklySales: 47,
  weeklyROI: '3.2x',
  topPerformer: 'Product Demo Video',
  underperformer: 'Summer Sale Carousel',
  quickWins: mockQuickWins.slice(0, 2),
  alerts: mockLiveAlerts.slice(0, 2),
};

// 15-day specific data  
export const mock15DayInsights = {
  biweeklySpend: '₹8,920',
  biweeklySales: 98,
  biweeklyROI: '3.4x',
  trendSummary: 'Performance improving week over week',
  quickWins: mockQuickWins,
  changes: mockTrendingChanges,
};

// Today specific data
export const mockTodayInsights = {
  todaySpend: '₹342',
  todaySales: 4,
  activeAds: 12,
  alerts: mockLiveAlerts,
  quickWins: mockQuickWins.slice(0, 1),
  changes: mockTrendingChanges.filter(c => c.since === 'vs yesterday'),
};
