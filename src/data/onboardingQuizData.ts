export interface QuizOption {
  value: string;
  label: string;
  desc?: string;
  emoji?: string;
}

export interface QuizQuestion {
  id: string;
  label: string;
  type: 'select' | 'multiselect' | 'boolean';
  required: boolean;
  options?: QuizOption[];
  default?: any;
  help?: string;
  show_if?: Record<string, any>;
  ui_hint?: string;
}

export const onboardingQuizQuestions: QuizQuestion[] = [
  {
    id: 'role',
    label: 'Which best describes your role?',
    type: 'select',
    required: true,
    options: [
      { value: 'founder', label: 'Founder / Brand', emoji: '🚀' },
      { value: 'performance_marketer', label: 'Performance Marketer', emoji: '📊' },
      { value: 'automation_engineer', label: 'Vibe Coder / Automation-first', emoji: '⚡' },
      { value: 'agency', label: 'Agency / Consultant', emoji: '🏢' },
    ],
    help: 'Helps us pick templates and tone.',
  },
  {
    id: 'top_objective',
    label: 'What outcome do you want most from ads right now?',
    type: 'select',
    required: true,
    options: [
      { value: 'sales', label: 'Sales / Revenue', emoji: '💰' },
      { value: 'leads', label: 'Leads / Signups', emoji: '📋' },
      { value: 'awareness', label: 'Brand awareness / Reach', emoji: '📣' },
      { value: 'experimentation', label: 'Test new products / ideas', emoji: '🧪' },
    ],
    help: "We'll tailor drafts, KPIs and signals to this objective.",
  },
  {
    id: 'monthly_budget_range',
    label: 'Monthly ad budget (approx.)',
    type: 'select',
    required: true,
    options: [
      { value: '<$500', label: 'Under $500', emoji: '🌱' },
      { value: '$500-2500', label: '$500–2.5k', emoji: '📈' },
      { value: '$2.5k-10k', label: '$2.5k–10k', emoji: '🚀' },
      { value: '>$10k', label: '> $10k', emoji: '🏢' },
    ],
    help: 'Used to size audiences, pacing and optimization suggestions.',
  },
  {
    id: 'num_products',
    label: 'How many distinct products do you advertise?',
    type: 'select',
    required: true,
    options: [
      { value: '1', label: '1', emoji: '🎯' },
      { value: '2-5', label: '2–5', emoji: '📦' },
      { value: '6+', label: '6 or more', emoji: '🏪' },
    ],
    help: 'Helps choose campaign structure templates.',
  },
  {
    id: 'creative_availability',
    label: 'Do you already have creatives (images / videos) ready?',
    type: 'select',
    required: true,
    options: [
      { value: 'yes', label: 'Yes — I will upload', emoji: '📤' },
      { value: 'some', label: 'Some — mix of upload & AI generate', emoji: '🔀' },
      { value: 'no', label: 'No — generate for me', emoji: '✨' },
    ],
    help: "We'll prefill creative prompts and credit-saving suggestions accordingly.",
  },
  {
    id: 'ai_autonomy',
    label: 'How hands-on do you want the AI assistant to be?',
    type: 'select',
    required: true,
    options: [
      { value: 'observational', label: 'Observational — suggestions only', emoji: '👁️', desc: 'Show suggestions, never act' },
      { value: 'assistive', label: 'Assistive — propose & wait', emoji: '🤝', desc: 'Propose changes, wait for your approval' },
      { value: 'autonomous', label: 'Autonomous — apply low-risk actions', emoji: '🤖', desc: 'Auto-pause on CPA spikes, etc. (you can undo)' },
    ],
    help: 'Set how aggressive the assistant can be — you can change this later.',
  },
  {
    id: 'generate_now',
    label: 'Create an initial campaign draft now?',
    type: 'boolean',
    required: true,
    default: true,
    help: "We'll generate a ready-to-review campaign draft using your answers (no publish).",
  },
  {
    id: 'consent_personalization',
    label: 'Use my connected account data to personalize recommendations?',
    type: 'boolean',
    required: true,
    default: true,
    help: 'Anonymized & reversible. You can change this anytime in settings.',
  },
];

export const advancedQuizQuestions: QuizQuestion[] = [
  {
    id: 'primary_metric',
    label: 'Primary metric you optimize for',
    type: 'select',
    required: false,
    options: [
      { value: 'roas', label: 'ROAS', emoji: '💹' },
      { value: 'cpa', label: 'CPA / Cost per action', emoji: '🎯' },
      { value: 'ctr', label: 'CTR / Engagement', emoji: '👆' },
      { value: 'conversion_volume', label: 'Conversion volume / scale', emoji: '📈' },
    ],
    help: 'Used to rank AI recommendations by the metric you care about.',
  },
  {
    id: 'how_involved',
    label: 'How involved are you in day-to-day ad decisions?',
    type: 'select',
    required: false,
    options: [
      { value: 'very_involved', label: 'Very involved — make most changes', emoji: '🎛️' },
      { value: 'review_occasional', label: 'Review occasionally', emoji: '📋' },
      { value: 'delegate', label: 'Delegate fully to team/agency', emoji: '🤝' },
    ],
  },
  {
    id: 'tools_connected',
    label: 'Which tools are you currently using?',
    type: 'multiselect',
    required: false,
    options: [
      { value: 'facebook', label: 'Facebook / Meta', emoji: '📘' },
      { value: 'tiktok', label: 'TikTok Ads', emoji: '🎵' },
      { value: 'google', label: 'Google Ads', emoji: '🔍' },
      { value: 'slack', label: 'Slack / Notifications', emoji: '💬' },
      { value: 'analytics', label: 'Third-party analytics (e.g., GA)', emoji: '📊' },
    ],
    help: "We'll surface relevant integrations and setup steps.",
  },
];
