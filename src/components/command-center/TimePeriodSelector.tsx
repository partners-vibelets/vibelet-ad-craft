import { cn } from '@/lib/utils';

export type TimePeriod = '30-day' | '15-day' | '7-day' | 'today';

interface TimePeriodSelectorProps {
  selected: TimePeriod;
  onSelect: (period: TimePeriod) => void;
}

const periods: { value: TimePeriod; label: string; sublabel: string }[] = [
  { value: '30-day', label: '30-Day Audit', sublabel: 'Full Report' },
  { value: '15-day', label: '15 Days', sublabel: 'Bi-weekly' },
  { value: '7-day', label: '7 Days', sublabel: 'Weekly' },
  { value: 'today', label: 'Today', sublabel: 'Live' },
];

export const TimePeriodSelector = ({ selected, onSelect }: TimePeriodSelectorProps) => {
  return (
    <div className="inline-flex items-center p-1 rounded-xl bg-muted/50 border border-border/50 backdrop-blur-sm">
      {periods.map((period) => {
        const isSelected = selected === period.value;
        const isLive = period.value === 'today';
        
        return (
          <button
            key={period.value}
            onClick={() => onSelect(period.value)}
            className={cn(
              "relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
              "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-1",
              isSelected
                ? "bg-background text-foreground shadow-sm border border-border/50"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            <div className="flex items-center gap-2">
              {isLive && (
                <span className={cn(
                  "w-2 h-2 rounded-full",
                  isSelected ? "bg-emerald-400 animate-pulse" : "bg-muted-foreground/50"
                )} />
              )}
              <div className="text-left">
                <span className="block">{period.label}</span>
                <span className={cn(
                  "block text-xs",
                  isSelected ? "text-muted-foreground" : "text-muted-foreground/70"
                )}>
                  {period.sublabel}
                </span>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};
