import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TimePeriodSelector, TimePeriod } from './TimePeriodSelector';
import { LoadingExperience } from './LoadingExperience';
import { AuditView } from './AuditView';
import { DailyView } from './DailyView';
import { WeeklyView } from './WeeklyView';
import { BiweeklyView } from './BiweeklyView';
import { NotificationSettings } from './NotificationSettings';
import { ActionsImpactBadge } from './ActionsImpactBadge';
import { FacebookConnectCard } from '@/components/dashboard/FacebookConnectCard';
import { useCommandCenterNotifications } from '@/hooks/useCommandCenterNotifications';
import { mockTodayInsights, mockLiveAlerts } from './mockData';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface CommandCenterLayoutProps {
  isConnected?: boolean;
}

export const CommandCenterLayout = ({ isConnected: initialConnected = false }: CommandCenterLayoutProps) => {
  const navigate = useNavigate();
  const [isConnected, setIsConnected] = useState(initialConnected);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoadedBefore, setHasLoadedBefore] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('30-day');
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const { notifyDataUpdate, simulateNewAlert } = useCommandCenterNotifications();

  const handleConnect = () => {
    setIsConnected(true);
    setIsLoading(true);
  };

  const handleLoadingComplete = useCallback(() => {
    setIsLoading(false);
    setHasLoadedBefore(true);
    setLastRefresh(new Date());
    
    // Initialize notification tracking with current data
    notifyDataUpdate({
      alerts: mockTodayInsights.alerts,
      quickWins: mockTodayInsights.quickWins,
      changes: mockTodayInsights.changes,
    });

    // Show welcome toast
    toast.success('Account analysis complete!', {
      description: 'Your 30-day audit report is ready. Notifications are enabled for real-time updates.',
      duration: 5000,
    });
  }, [notifyDataUpdate]);

  const handleRefresh = () => {
    setIsLoading(true);
  };

  // Simulate real-time polling for the "Today" view
  useEffect(() => {
    if (!isConnected || isLoading || selectedPeriod !== 'today') return;

    const pollInterval = setInterval(() => {
      // In production, this would fetch new data from the API
      // For demo, we occasionally simulate new alerts
      const shouldSimulate = Math.random() > 0.85; // 15% chance every 30s
      if (shouldSimulate) {
        simulateNewAlert();
      }
    }, 30000); // Poll every 30 seconds

    return () => clearInterval(pollInterval);
  }, [isConnected, isLoading, selectedPeriod, simulateNewAlert]);

  const renderContent = () => {
    switch (selectedPeriod) {
      case '30-day':
        return <AuditView />;
      case '15-day':
        return <BiweeklyView />;
      case '7-day':
        return <WeeklyView />;
      case 'today':
        return <DailyView />;
      default:
        return <AuditView />;
    }
  };

  // Show loading experience for first-time connection
  if (isLoading) {
    return <LoadingExperience onComplete={handleLoadingComplete} />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="border-b border-border/30 bg-background/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/')}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>

            {isConnected && (
              <div className="flex items-center gap-4">
                <TimePeriodSelector 
                  selected={selectedPeriod} 
                  onSelect={setSelectedPeriod} 
                />
                <div className="flex items-center gap-1">
                  {selectedPeriod === 'today' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={simulateNewAlert}
                      className="text-muted-foreground hover:text-primary"
                      title="Simulate a new alert (demo)"
                    >
                      <Zap className="w-4 h-4" />
                    </Button>
                  )}
                  <NotificationSettings />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRefresh}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {!isConnected ? (
          // Not Connected State
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
              <svg className="w-10 h-10 text-[#1877F2]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-3">
              Connect Your Facebook Ads Account
            </h1>
            <p className="text-muted-foreground max-w-md mb-8">
              Get a comprehensive 30-day audit of your ad performance with AI-powered insights and actionable recommendations.
            </p>
            <div className="w-full max-w-md">
              <FacebookConnectCard 
                onConnect={handleConnect}
                isConnected={isConnected}
              />
            </div>
          </div>
        ) : (
          // Connected State - Show Selected View
          <>
            {/* Period Description */}
            <div className="mb-6">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-foreground">
                  {selectedPeriod === '30-day' && '30-Day Audit Report'}
                  {selectedPeriod === '15-day' && '15-Day Performance Overview'}
                  {selectedPeriod === '7-day' && 'Weekly Performance Summary'}
                  {selectedPeriod === 'today' && 'Today\'s Live Dashboard'}
                </h1>
                {selectedPeriod === '30-day' && (
                  <span className="px-2 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-medium text-primary">
                    Full Report
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Last updated: {lastRefresh.toLocaleTimeString()}
              </p>
            </div>

            {/* Content */}
            {renderContent()}
            
            {/* Actions Impact Badge - Floating */}
            <ActionsImpactBadge />
          </>
        )}
      </main>
    </div>
  );
};
