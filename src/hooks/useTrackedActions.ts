import { useState, useEffect, useCallback } from 'react';
import { TrackedAction } from '@/components/command-center/types';

const STORAGE_KEY = 'vibelets_tracked_actions';

// Mock data for demonstration - simulating actions taken and their impacts
const mockTrackedActions: TrackedAction[] = [
  {
    id: 'ta-1',
    recommendationId: 'qw-1',
    recommendationType: 'quick_win',
    title: 'Paused "Summer Sale" carousel',
    category: 'pause',
    appliedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    expectedImpact: 'Save ₹85/day',
    status: 'positive',
    actualImpact: {
      metric: 'Daily Spend',
      before: '₹340',
      after: '₹255',
      change: '-₹85',
      direction: 'down'
    },
    monitoringPeriod: '7 days',
    confidence: 89
  },
  {
    id: 'ta-2',
    recommendationId: 'action-1',
    recommendationType: 'action_item',
    title: 'Moved ₹450 to Search campaign',
    category: 'budget',
    appliedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    expectedImpact: '+12% more sales',
    status: 'positive',
    actualImpact: {
      metric: 'Conversions',
      before: '8/day',
      after: '11/day',
      change: '+37.5%',
      direction: 'up'
    },
    monitoringPeriod: '14 days',
    confidence: 88
  },
  {
    id: 'ta-3',
    recommendationId: 'qw-3',
    recommendationType: 'quick_win',
    title: 'Adjusted ad schedule to 6 PM - 11 PM',
    category: 'schedule',
    appliedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    expectedImpact: '+40% better timing',
    status: 'monitoring',
    monitoringPeriod: '7 days',
    confidence: 78
  }
];

export const useTrackedActions = () => {
  const [trackedActions, setTrackedActions] = useState<TrackedAction[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setTrackedActions(JSON.parse(stored));
      } catch {
        // If parsing fails, use mock data
        setTrackedActions(mockTrackedActions);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(mockTrackedActions));
      }
    } else {
      // Initialize with mock data for demonstration
      setTrackedActions(mockTrackedActions);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mockTrackedActions));
    }
  }, []);

  // Save to localStorage whenever actions change
  const saveActions = useCallback((actions: TrackedAction[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(actions));
    setTrackedActions(actions);
  }, []);

  // Track a new action
  const trackAction = useCallback((
    recommendationId: string,
    recommendationType: TrackedAction['recommendationType'],
    title: string,
    category: TrackedAction['category'],
    expectedImpact: string,
    confidence: number,
    monitoringPeriod: string = '7 days'
  ) => {
    const newAction: TrackedAction = {
      id: `ta-${Date.now()}`,
      recommendationId,
      recommendationType,
      title,
      category,
      appliedAt: new Date().toISOString(),
      expectedImpact,
      status: 'monitoring',
      monitoringPeriod,
      confidence
    };

    const updated = [newAction, ...trackedActions];
    saveActions(updated);
    return newAction;
  }, [trackedActions, saveActions]);

  // Update action status/impact
  const updateActionImpact = useCallback((
    actionId: string,
    status: TrackedAction['status'],
    actualImpact?: TrackedAction['actualImpact']
  ) => {
    const updated = trackedActions.map(action => 
      action.id === actionId 
        ? { ...action, status, actualImpact }
        : action
    );
    saveActions(updated);
  }, [trackedActions, saveActions]);

  // Get actions by status
  const getMonitoringActions = useCallback(() => 
    trackedActions.filter(a => a.status === 'monitoring'), 
    [trackedActions]
  );

  const getCompletedActions = useCallback(() => 
    trackedActions.filter(a => a.status !== 'monitoring'),
    [trackedActions]
  );

  // Summary stats
  const getSummary = useCallback(() => {
    const monitoring = trackedActions.filter(a => a.status === 'monitoring').length;
    const positive = trackedActions.filter(a => a.status === 'positive').length;
    const negative = trackedActions.filter(a => a.status === 'negative').length;
    const neutral = trackedActions.filter(a => a.status === 'neutral').length;
    
    return { monitoring, positive, negative, neutral, total: trackedActions.length };
  }, [trackedActions]);

  return {
    trackedActions,
    trackAction,
    updateActionImpact,
    getMonitoringActions,
    getCompletedActions,
    getSummary
  };
};
