import { Calendar, DollarSign, ShoppingCart, TrendingUp, Sparkles } from 'lucide-react';
import { mock15DayInsights } from './mockData';
import { QuickWinsPanel } from './QuickWinsPanel';
import { TrendingChanges } from './TrendingChanges';
import { InsightsSidebar } from './InsightsSidebar';
import { ActionsImpactPanel } from './ActionsImpactPanel';

export const BiweeklyView = () => {
  const data = mock15DayInsights;

  return (
    <div className="animate-fade-in">
      {/* Two Column Layout: Main Content + Insights Sidebar */}
      <div className="flex gap-6">
        {/* Main Content - Left */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* Header */}
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Last 15 Days Overview</span>
          </div>

          {/* Biweekly Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-card/50 border border-border/50">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">15-Day Spend</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{data.biweeklySpend}</p>
            </div>
            <div className="p-4 rounded-xl bg-card/50 border border-border/50">
              <div className="flex items-center gap-2 mb-2">
                <ShoppingCart className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">15-Day Sales</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{data.biweeklySales}</p>
            </div>
            <div className="p-4 rounded-xl bg-card/50 border border-border/50">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">15-Day ROI</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{data.biweeklyROI}</p>
            </div>
          </div>

          {/* Trend Summary */}
          <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-xs font-medium text-primary uppercase tracking-wider">Trend Summary</span>
            </div>
            <p className="text-sm text-foreground">{data.trendSummary}</p>
          </div>

          {/* Trending Changes */}
          <TrendingChanges changes={data.changes} />

          {/* Quick Wins */}
          <QuickWinsPanel quickWins={data.quickWins} title="Opportunities This Period" />
        </div>
        
        {/* Sidebars - Right */}
        <div className="flex flex-col gap-4">
          {/* Actions Impact Panel */}
          <ActionsImpactPanel />
          
          {/* Insights Sidebar */}
          <InsightsSidebar 
            title="15-Day Insights"
            subtitle="Key patterns from this period"
            changes={data.changes}
            quickWins={data.quickWins.slice(0, 2)}
          />
        </div>
      </div>
    </div>
  );
};
