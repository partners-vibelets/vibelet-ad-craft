import { useState } from 'react';
import { Star } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

const ratingLabels: Record<number, string> = {
  1: 'Poor',
  2: 'Fair',
  3: 'Good',
  4: 'Great',
  5: 'Excellent'
};

type StarRatingSize = 'sm' | 'md' | 'lg';

interface StarRatingProps {
  value?: number;
  onChange?: (rating: number) => void;
  size?: StarRatingSize;
  disabled?: boolean;
  showTooltips?: boolean;
  className?: string;
}

const sizeClasses: Record<StarRatingSize, { star: string; gap: string }> = {
  sm: { star: 'w-3.5 h-3.5', gap: 'gap-0' },
  md: { star: 'w-4 h-4', gap: 'gap-0.5' },
  lg: { star: 'w-10 h-10', gap: 'gap-2' }
};

export const StarRating = ({
  value = 0,
  onChange,
  size = 'md',
  disabled = false,
  showTooltips = true,
  className
}: StarRatingProps) => {
  const [hoveredRating, setHoveredRating] = useState(0);
  const { star: starSize, gap } = sizeClasses[size];

  const handleClick = (rating: number) => {
    if (!disabled && onChange) {
      onChange(rating);
    }
  };

  const renderStars = () => (
    <div className={cn('flex items-center', gap)}>
      {[1, 2, 3, 4, 5].map((starValue) => {
        const isActive = starValue <= (hoveredRating || value);
        
        const starButton = (
          <button
            key={starValue}
            onClick={() => handleClick(starValue)}
            onMouseEnter={() => !disabled && setHoveredRating(starValue)}
            onMouseLeave={() => setHoveredRating(0)}
            disabled={disabled}
            className={cn(
              'p-0.5 transition-all duration-200 focus:outline-none rounded',
              !disabled && 'hover:scale-110',
              disabled && 'cursor-default'
            )}
          >
            <Star
              className={cn(
                'transition-all duration-200',
                starSize,
                isActive
                  ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.4)]'
                  : 'text-muted-foreground/40',
                !disabled && !isActive && 'hover:text-amber-400/60'
              )}
            />
          </button>
        );

        if (showTooltips && !disabled) {
          return (
            <Tooltip key={starValue}>
              <TooltipTrigger asChild>
                {starButton}
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                {starValue} - {ratingLabels[starValue]}
              </TooltipContent>
            </Tooltip>
          );
        }

        return starButton;
      })}
    </div>
  );

  return (
    <div className={cn('inline-flex', className)}>
      {showTooltips && !disabled ? (
        <TooltipProvider delayDuration={200}>
          {renderStars()}
        </TooltipProvider>
      ) : (
        renderStars()
      )}
    </div>
  );
};
