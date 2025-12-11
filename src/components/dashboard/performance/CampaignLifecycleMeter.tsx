import { CampaignLifecycleStage } from '@/types/campaign';
import { FlaskConical, Settings, Rocket } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CampaignLifecycleMeterProps {
  stage: CampaignLifecycleStage;
  progress: number;
  description: string;
}

const stages: { id: CampaignLifecycleStage; label: string; icon: typeof FlaskConical }[] = [
  { id: 'testing', label: 'Testing', icon: FlaskConical },
  { id: 'optimizing', label: 'Optimizing', icon: Settings },
  { id: 'scaling', label: 'Scaling', icon: Rocket }
];

export const CampaignLifecycleMeter = ({ stage, progress, description }: CampaignLifecycleMeterProps) => {
  const currentIndex = stages.findIndex(s => s.id === stage);

  return (
    <div className="p-4">
      <h4 className="text-sm font-medium text-muted-foreground mb-3">Campaign Stage</h4>
      
      <div className="glass-card p-4 rounded-xl">
        {/* Stage pills */}
        <div className="flex items-center justify-between mb-4">
          {stages.map((s, index) => {
            const Icon = s.icon;
            const isActive = s.id === stage;
            const isPast = index < currentIndex;

            return (
              <div key={s.id} className="flex flex-col items-center flex-1">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300",
                  isActive && "bg-primary shadow-glow animate-pulse",
                  isPast && "bg-secondary",
                  !isActive && !isPast && "bg-muted"
                )}>
                  <Icon className={cn(
                    "h-5 w-5",
                    isActive && "text-primary-foreground",
                    isPast && "text-secondary-foreground",
                    !isActive && !isPast && "text-muted-foreground"
                  )} />
                </div>
                <span className={cn(
                  "text-xs mt-2 font-medium",
                  isActive && "text-primary",
                  isPast && "text-secondary",
                  !isActive && !isPast && "text-muted-foreground"
                )}>
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Progress bar */}
        <div className="h-2 bg-muted rounded-full overflow-hidden mb-3">
          <div 
            className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-1000 ease-out rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground text-center">
          {description}
        </p>
      </div>
    </div>
  );
};
