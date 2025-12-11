import { UnifiedMetrics, PerformanceMetric } from '@/types/campaign';
import { useCountUp, formatMetricValue, calculateTrendPercentage } from '@/hooks/useCountUp';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricsGridProps {
  metrics: UnifiedMetrics;
}

interface MetricCardProps {
  metric: PerformanceMetric;
  index: number;
}

const MetricCard = ({ metric, index }: MetricCardProps) => {
  const animatedValue = useCountUp(metric.value, { 
    delay: index * 100, 
    decimals: metric.format === 'number' ? 0 : 2 
  });

  const trendPercentage = calculateTrendPercentage(metric.value, metric.previousValue);

  const TrendIcon = metric.trend === 'up' ? TrendingUp : metric.trend === 'down' ? TrendingDown : Minus;

  return (
    <div className="glass-card p-4 rounded-xl animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
      <p className="text-xs text-muted-foreground mb-1">{metric.label}</p>
      <p className="text-2xl font-bold text-foreground">
        {formatMetricValue(animatedValue, metric.format)}
      </p>
      <div className={cn(
        "flex items-center gap-1 mt-1 text-xs",
        metric.trend === 'up' && "text-secondary",
        metric.trend === 'down' && "text-destructive",
        metric.trend === 'neutral' && "text-muted-foreground"
      )}>
        <TrendIcon className="h-3 w-3" />
        <span>{trendPercentage}</span>
        <span className="text-muted-foreground">vs last 7 days</span>
      </div>
    </div>
  );
};

export const MetricsGrid = ({ metrics }: MetricsGridProps) => {
  const metricsList = [
    metrics.totalSpent,
    metrics.profit,
    metrics.roi,
    metrics.conversions,
    metrics.aov,
    metrics.ctr
  ];

  return (
    <div className="p-4">
      <h3 className="text-sm font-medium text-muted-foreground mb-3">Overall Performance</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {metricsList.map((metric, index) => (
          <MetricCard key={metric.id} metric={metric} index={index} />
        ))}
      </div>
    </div>
  );
};
