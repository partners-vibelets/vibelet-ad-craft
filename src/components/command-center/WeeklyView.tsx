import { Calendar, DollarSign, ShoppingCart, TrendingUp, Award, AlertTriangle } from 'lucide-react';
import { mock7DayInsights, mockTrendingChanges } from './mockData';
import { QuickWinsPanel } from './QuickWinsPanel';
import { LiveAlertsSection } from './LiveAlertsSection';
import { InsightsSidebar } from './InsightsSidebar';
import { ActionsImpactPanel } from './ActionsImpactPanel';

export const WeeklyView = () => {
  const data = mock7DayInsights;
  // Get weekly-relevant changes
  const weeklyChanges = mockTrendingChanges.filter(c => c.since === 'vs last week' || c.since === 'vs yesterday');

  return (
    <div className="animate-fade-in">
      {/* Two Column Layout: Main Content + Insights Sidebar */}
      <div className="flex gap-6">
        {/* Main Content - Left */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* Header */}
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Last 7 Days Summary</span>
          </div>

          {/* Weekly Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-card/50 border border-border/50">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Weekly Spend</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{data.weeklySpend}</p>
            </div>
            <div className="p-4 rounded-xl bg-card/50 border border-border/50">
              <div className="flex items-center gap-2 mb-2">
                <ShoppingCart className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Weekly Sales</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{data.weeklySales}</p>
            </div>
            <div className="p-4 rounded-xl bg-card/50 border border-border/50">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Weekly ROI</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{data.weeklyROI}</p>
            </div>
          </div>

          {/* Top & Bottom Performers */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-medium text-emerald-400 uppercase tracking-wider">Top Performer</span>
              </div>
              <p className="text-sm font-medium text-foreground">{data.topPerformer}</p>
              <p className="text-xs text-muted-foreground mt-1">Best conversion rate this week</p>
            </div>
            <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-medium text-amber-400 uppercase tracking-wider">Needs Attention</span>
              </div>
              <p className="text-sm font-medium text-foreground">{data.underperformer}</p>
              <p className="text-xs text-muted-foreground mt-1">Consider pausing or refreshing</p>
            </div>
          </div>

          {/* Alerts from this week */}
          <LiveAlertsSection alerts={data.alerts} title="This Week's Highlights" />

          {/* Quick Wins */}
          <QuickWinsPanel quickWins={data.quickWins} title="Recommended This Week" />
        </div>
        
        {/* Sidebars - Right */}
        <div className="flex flex-col gap-4">
          {/* Actions Impact Panel */}
          <ActionsImpactPanel />
          
          {/* Insights Sidebar */}
          <InsightsSidebar 
            title="Weekly Insights"
            subtitle="Performance shifts this week"
            changes={weeklyChanges}
            quickWins={data.quickWins}
          />
        </div>
      </div>
    </div>
  );
};
