import { useState } from 'react';
import { HelpCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface AssistantFloatingButtonProps {
  onClick: () => void;
  hasNotification?: boolean;
}

export const AssistantFloatingButton = ({ 
  onClick, 
  hasNotification 
}: AssistantFloatingButtonProps) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={onClick}
            size="icon"
            className={cn(
              "h-10 w-10 rounded-full shadow-lg",
              "bg-primary hover:bg-primary/90 text-primary-foreground",
              "transition-all duration-200 hover:scale-105",
              "relative"
            )}
          >
            <HelpCircle className="h-5 w-5" />
            {hasNotification && (
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-secondary rounded-full animate-pulse border-2 border-background" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left">
          <p>Need help? Ask the assistant</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
