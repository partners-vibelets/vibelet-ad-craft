import { cn } from '@/lib/utils';
import { Clock, DollarSign, ShoppingCart, Radio, Zap } from 'lucide-react';
import { mockTodayInsights } from './mockData';
import { QuickWinsPanel } from './QuickWinsPanel';
import { TrendingChanges } from './TrendingChanges';
import { LiveAlertsSection } from './LiveAlertsSection';

export const DailyView = () => {
  const data = mockTodayInsights;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Today's Snapshot */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-sm font-medium text-emerald-400">Live Monitoring</span>
        <span className="text-xs text-muted-foreground">Last updated: Just now</span>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-card/50 border border-border/50">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Spent Today</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{data.todaySpend}</p>
        </div>
        <div className="p-4 rounded-xl bg-card/50 border border-border/50">
          <div className="flex items-center gap-2 mb-2">
            <ShoppingCart className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Sales Today</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{data.todaySales}</p>
        </div>
        <div className="p-4 rounded-xl bg-card/50 border border-border/50">
          <div className="flex items-center gap-2 mb-2">
            <Radio className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Active Ads</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{data.activeAds}</p>
        </div>
      </div>

      {/* Live Alerts */}
      <LiveAlertsSection alerts={data.alerts} />

      {/* Trending Changes */}
      <TrendingChanges changes={data.changes} />

      {/* Quick Wins */}
      <QuickWinsPanel quickWins={data.quickWins} title="Immediate Action" />
    </div>
  );
};
