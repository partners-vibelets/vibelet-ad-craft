import { useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import { LiveAlert, QuickWin, TrendingChange } from '@/components/command-center/types';
import { useNotifications } from './useNotifications';

interface NotificationState {
  alertIds: string[];
  quickWinIds: string[];
  changeIds: string[];
}

export const useCommandCenterNotifications = () => {
  const { playNotificationSound, getSettings } = useNotifications();
  const previousStateRef = useRef<NotificationState>({
    alertIds: [],
    quickWinIds: [],
    changeIds: [],
  });
  const isFirstLoadRef = useRef(true);

  const showAlertToast = useCallback((alert: LiveAlert) => {
    const isPositive = alert.type === 'positive';
    
    toast(alert.message, {
      description: alert.details,
      duration: 8000,
      icon: isPositive ? '📈' : '⚠️',
      action: {
        label: 'View Action',
        onClick: () => {
          // Could scroll to the alert or expand it
          console.log('View action for alert:', alert.id);
        },
      },
      className: isPositive 
        ? 'border-emerald-500/30 bg-emerald-500/10' 
        : 'border-amber-500/30 bg-amber-500/10',
    });
  }, []);

  const showQuickWinToast = useCallback((quickWin: QuickWin) => {
    toast('New Quick Win Available', {
      description: quickWin.title,
      duration: 6000,
      icon: '⚡',
      action: {
        label: 'Apply Now',
        onClick: () => {
          console.log('Apply quick win:', quickWin.id);
        },
      },
    });
  }, []);

  const showTrendChangeToast = useCallback((change: TrendingChange) => {
    const isPositive = change.direction === 'up' 
      ? change.metric.includes('Cost') ? false : true
      : change.metric.includes('Cost') ? true : false;

    toast(`${change.metric} ${change.change}`, {
      description: change.context,
      duration: 5000,
      icon: isPositive ? '✅' : '📉',
    });
  }, []);

  const checkForNewAlerts = useCallback((alerts: LiveAlert[]) => {
    if (isFirstLoadRef.current) {
      previousStateRef.current.alertIds = alerts.map(a => a.id);
      return;
    }

    const settings = getSettings();
    const previousIds = previousStateRef.current.alertIds;
    const newAlerts = alerts.filter(a => !previousIds.includes(a.id));

    if (newAlerts.length > 0 && (settings.soundEnabled || settings.browserNotificationsEnabled)) {
      playNotificationSound();
      
      // Show toast for each new alert (limit to 3 to avoid spam)
      newAlerts.slice(0, 3).forEach((alert, index) => {
        setTimeout(() => showAlertToast(alert), index * 500);
      });

      if (newAlerts.length > 3) {
        setTimeout(() => {
          toast.info(`+${newAlerts.length - 3} more alerts`, {
            description: 'Check the dashboard for all updates',
            duration: 4000,
          });
        }, 2000);
      }
    }

    previousStateRef.current.alertIds = alerts.map(a => a.id);
  }, [getSettings, playNotificationSound, showAlertToast]);

  const checkForNewQuickWins = useCallback((quickWins: QuickWin[]) => {
    if (isFirstLoadRef.current) {
      previousStateRef.current.quickWinIds = quickWins.map(q => q.id);
      return;
    }

    const settings = getSettings();
    const previousIds = previousStateRef.current.quickWinIds;
    const newQuickWins = quickWins.filter(q => !previousIds.includes(q.id));

    // Only notify for high-confidence quick wins
    const highConfidenceWins = newQuickWins.filter(q => q.confidence >= 80);

    if (highConfidenceWins.length > 0 && settings.soundEnabled) {
      playNotificationSound();
      highConfidenceWins.slice(0, 2).forEach((win, index) => {
        setTimeout(() => showQuickWinToast(win), index * 600);
      });
    }

    previousStateRef.current.quickWinIds = quickWins.map(q => q.id);
  }, [getSettings, playNotificationSound, showQuickWinToast]);

  const checkForSignificantChanges = useCallback((changes: TrendingChange[]) => {
    if (isFirstLoadRef.current) {
      previousStateRef.current.changeIds = changes.map(c => c.id);
      isFirstLoadRef.current = false;
      return;
    }

    const settings = getSettings();
    const previousIds = previousStateRef.current.changeIds;
    const newChanges = changes.filter(c => !previousIds.includes(c.id));

    // Only notify for significant changes (>20%)
    const significantChanges = newChanges.filter(c => {
      const changeValue = parseInt(c.change.replace(/[^0-9-]/g, ''));
      return Math.abs(changeValue) >= 20;
    });

    if (significantChanges.length > 0 && settings.soundEnabled) {
      significantChanges.slice(0, 2).forEach((change, index) => {
        setTimeout(() => showTrendChangeToast(change), index * 700);
      });
    }

    previousStateRef.current.changeIds = changes.map(c => c.id);
  }, [getSettings, showTrendChangeToast]);

  const notifyDataUpdate = useCallback((data: {
    alerts?: LiveAlert[];
    quickWins?: QuickWin[];
    changes?: TrendingChange[];
  }) => {
    if (data.alerts) checkForNewAlerts(data.alerts);
    if (data.quickWins) checkForNewQuickWins(data.quickWins);
    if (data.changes) checkForSignificantChanges(data.changes);
  }, [checkForNewAlerts, checkForNewQuickWins, checkForSignificantChanges]);

  const simulateNewAlert = useCallback(() => {
    const mockNewAlert: LiveAlert = {
      id: `alert-${Date.now()}`,
      message: '🚨 Conversion rate just dropped 40% in "Summer Sale"',
      time: 'Just now',
      type: 'negative',
      details: 'Your Summer Sale campaign experienced a sudden drop in conversions. This might be due to ad fatigue or a competitor entering the market.',
      metric: 'Conversion Rate',
      change: '-40%',
      suggestedAction: {
        title: 'Pause underperforming ads',
        description: 'Stop spending on ads with conversion rates below 1% to save budget.',
        impact: 'Save ₹200 daily'
      }
    };

    showAlertToast(mockNewAlert);
    playNotificationSound();
  }, [showAlertToast, playNotificationSound]);

  return {
    notifyDataUpdate,
    simulateNewAlert,
    showAlertToast,
    showQuickWinToast,
    showTrendChangeToast,
  };
};
