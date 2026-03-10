import { useState, useCallback } from 'react';

export interface UserState {
  connected_facebook: boolean;
  has_published_campaign: boolean;
  has_draft: boolean;
  onboarding_answers: OnboardingAnswers | null;
  last_active: string | null;
  apps: { slack_connected: boolean };
  paused_alerts: string[];
}

export interface OnboardingAnswers {
  objective?: string;
  monthly_budget?: string;
  platforms?: string[];
  creatives?: string;
  audience?: string;
  style?: string;
  generate_now?: boolean;
}

const STORAGE_KEY = 'vibelets-user-state';

function loadState(): UserState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {
    connected_facebook: false,
    has_published_campaign: false,
    has_draft: false,
    onboarding_answers: null,
    last_active: null,
    apps: { slack_connected: false },
    paused_alerts: [],
  };
}

export function useUserState() {
  const [state, setState] = useState<UserState>(loadState);

  const update = useCallback((partial: Partial<UserState>) => {
    setState(prev => {
      const next = { ...prev, ...partial };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const connectFacebook = useCallback(() => {
    update({ connected_facebook: true, last_active: new Date().toISOString() });
  }, [update]);

  const disconnectFacebook = useCallback(() => {
    update({ connected_facebook: false });
  }, [update]);

  const saveOnboardingAnswers = useCallback((answers: OnboardingAnswers) => {
    update({ onboarding_answers: answers });
  }, [update]);

  const publishDraft = useCallback(() => {
    update({ has_draft: false, has_published_campaign: true });
  }, [update]);

  const createDraft = useCallback(() => {
    update({ has_draft: true });
  }, [update]);

  const pauseAlert = useCallback((alertId: string) => {
    setState(prev => {
      const next = { ...prev, paused_alerts: [...prev.paused_alerts, alertId] };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const connectSlack = useCallback(() => {
    update({ apps: { ...state.apps, slack_connected: true } });
  }, [update, state.apps]);

  const resetState = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setState(loadState());
  }, []);

  return {
    state,
    update,
    connectFacebook,
    disconnectFacebook,
    saveOnboardingAnswers,
    publishDraft,
    createDraft,
    pauseAlert,
    connectSlack,
    resetState,
  };
}
