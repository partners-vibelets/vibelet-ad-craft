import { useEffect, useRef, useCallback } from 'react';
import { AIRecommendation } from '@/types/campaign';

// Notification sound as a base64-encoded short beep
const NOTIFICATION_SOUND_URL = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleRwnU46l49GkdDw7Y4Gg18+ZVxQpZZ6t39qvfkg2T3qPt9XAjkchPnCSwM6pcRsVVZCz5eatYAQJWZe84+CPRhMiTIKi1NWrcD40W3yMq8fJnl0jGkl/nLrVsn9AOEtziJ655bx/IxdMga/Sv4RNKDdmh6LPwIpRIyVTepuu0bp8RT5Pc4GYsMupaTsmSGl+kKW/s31FO1VugpKtvbZ/SDlQboCSr7i1fEY8UG6BkrC5tn1GPFBugZKwubZ9RjxQboGSsLm2fUY8UG6BkrC5tn1GPFBugZKwubZ9RjxQboGSsLm2fUY8UG6BkrC5tn1GPFBugZKwubZ9RjxQboGSsLm2fUY8UG6BkrC5tn1GPFBugZKwubZ9RjxQboGSsLm2fUY8UG6BkrC5tn1GPFBugZKwubZ9RjxQboGSsLm2fUY8UG6BkrC5tn1GPFBugZKwubZ9RjxQboGSsLm2fUY8UG6BkrC5tn1GPFBugZKwubZ9RjxQboGSsLm2fUY8UG6BkrC5tn1GPFBugZKwubZ9RjxQboGSsLm2fUY8UG6BkrC5tn1GPFBugZKwubZ9RjxQboGSsLm2fUY8UG6BkrC5tn1GPFBugZKwubZ9RjxQboGSsLm2fUY8UG6BkrC5tn1GPFBugZKwubZ9RjxQboGSsLm2fUY8UG6BkrC5tn1GPFBugZKwubZ9RjxQboGSsLm2fUY8UG6BkrC5tn1GPFBugZKwubZ9RjxQboGSsLm2fUY8UG6BkrC5tn1GPFBugZKwubZ9RjxQboGSsLm2fUY8UG6BkrC5tn1GPFBugZKwubZ9RjxQboGSsLm2fUY8UG6BkrC5tn1GPFBugZKwubZ9RjxQboGSsLm2fUY8UG6BkrC5tn1GPFBugZKwubZ9RjxQboGSsLm2fUY8UG6BkrC5tn1GPFBugZKwubZ9RjxQboGSsLm2fUY8UG6BkrC5tn1GPFBugZKwubZ9RjxQboGSsLm2fUY8UG6BkrC5tn1GPFBugZKwubZ9RjxQboGSsLm2fUY8UG6BkrC5tn1GPFBugZKwubZ9RjxQboGSsLm2fUY8UG6BkrC5tn1GPFBugZKwubZ9RjxQboGSsLm2fUY8UG6BkrC5tn1GPFBugZKwubZ9RjxQboGSsLm2fUY8UG6BkrC5tn1GPFBugZKwubZ9RjxQboGSsLm2fUY8UG6BkrC5tn1GPFBugZKwubZ9RjxQboGSsLm2fUY8UG6BkrC5tn1GPFBugZKwubZ9RjxQboGSsLm2fUY8UG6BkrC5tn1GPFBugZKwubZ9RjxQboGSsLm2fUY8UG6BkrC5tn1GPFBugZKwubZ9RjxQboGSsLm2fUY8UG6BkrC5tn1GPFBugZKwubZ9RjxQboGSsLm2fUY8UG6BkrC5tn1GPFBugZKwubZ9RjxQboGSsLm2fUY8UG6BkrC5tn1GPFBugZKwubZ9RjxQboGSsLm2fUY8UG6BkrC5tn1GPFBugZKwubZ9RjxQboGSsLm2fUY8UG6BkrC5tn1GPFBugZKwubZ9RjxQboGSsLm2fUY8UG6BkrC5tn1GPFBugZKwubZ9RjxQboGSsLm2fUY8UG6BkrC5tn1GPFBugZKwubZ9RjxQboGSsLm2fUY8UG6BkrC5tn1GPFBugZKwubZ9RjxQboGSsLm2fUY8UG6BkrC5tn1GPFBugZKwubZ9RjxQboGSsLm2fUY8UG6BkrC5tn1GPFBugZKwubZ9RjxQboGSsLm2fUY8UG6BkrC5tn1GPFBugZKwubZ9RjxQboGSsLm2fUY8UG6BkrC5tn1GPFBugZKwubZ9RjxQboGSsLm2fQ==';

interface NotificationSettings {
  soundEnabled: boolean;
  browserNotificationsEnabled: boolean;
}

const STORAGE_KEY = 'vibelets_notification_settings';

const getStoredSettings = (): NotificationSettings => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to parse notification settings:', e);
  }
  return { soundEnabled: true, browserNotificationsEnabled: true };
};

const saveSettings = (settings: NotificationSettings) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
};

export const useNotifications = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const previousRecommendationsRef = useRef<string[]>([]);
  const settingsRef = useRef<NotificationSettings>(getStoredSettings());

  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio(NOTIFICATION_SOUND_URL);
    audioRef.current.volume = 0.5;
  }, []);

  const requestBrowserPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      console.log('Browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }, []);

  const playNotificationSound = useCallback(() => {
    if (settingsRef.current.soundEnabled && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(err => {
        console.log('Could not play notification sound:', err);
      });
    }
  }, []);

  const showBrowserNotification = useCallback((recommendation: AIRecommendation) => {
    if (!settingsRef.current.browserNotificationsEnabled) return;
    
    if ('Notification' in window && Notification.permission === 'granted') {
      const priorityLabel = recommendation.priority === 'high' ? '🔴 Urgent: ' : '';
      const notification = new Notification(`${priorityLabel}AI Recommendation`, {
        body: recommendation.title,
        icon: '/favicon.ico',
        tag: recommendation.id,
        requireInteraction: recommendation.priority === 'high'
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      // Auto-close after 5 seconds for non-urgent notifications
      if (recommendation.priority !== 'high') {
        setTimeout(() => notification.close(), 5000);
      }
    }
  }, []);

  const notifyNewRecommendations = useCallback((recommendations: AIRecommendation[]) => {
    const currentIds = recommendations.map(r => r.id);
    const previousIds = previousRecommendationsRef.current;
    
    // Find new recommendations
    const newRecommendations = recommendations.filter(
      r => !previousIds.includes(r.id) && r.status === 'pending'
    );

    if (newRecommendations.length > 0) {
      // Play sound for any new recommendation
      playNotificationSound();

      // Show browser notification for the highest priority new recommendation
      const sortedByPriority = [...newRecommendations].sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, suggestion: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });

      showBrowserNotification(sortedByPriority[0]);
    }

    // Update previous recommendations ref
    previousRecommendationsRef.current = currentIds;
  }, [playNotificationSound, showBrowserNotification]);

  const updateSettings = useCallback((updates: Partial<NotificationSettings>) => {
    settingsRef.current = { ...settingsRef.current, ...updates };
    saveSettings(settingsRef.current);
  }, []);

  const getSettings = useCallback(() => settingsRef.current, []);

  return {
    requestBrowserPermission,
    playNotificationSound,
    showBrowserNotification,
    notifyNewRecommendations,
    updateSettings,
    getSettings
  };
};

export type { NotificationSettings };
