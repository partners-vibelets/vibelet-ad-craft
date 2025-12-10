import { useState, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface ImageMagnifierProps {
  src: string;
  alt: string;
  zoomLevel?: number;
  magnifierSize?: number;
  className?: string;
  imageClassName?: string;
}

export const ImageMagnifier = ({
  src,
  alt,
  zoomLevel = 2.5,
  magnifierSize = 150,
  className,
  imageClassName,
}: ImageMagnifierProps) => {
  const [showMagnifier, setShowMagnifier] = useState(false);
  const [magnifierPosition, setMagnifierPosition] = useState({ x: 0, y: 0 });
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = useCallback(() => {
    setShowMagnifier(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setShowMagnifier(false);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Calculate position as percentage
    const xPercent = (x / rect.width) * 100;
    const yPercent = (y / rect.height) * 100;

    setCursorPosition({ x, y });
    setMagnifierPosition({ x: xPercent, y: yPercent });
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn('relative overflow-hidden cursor-zoom-in', className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
    >
      <img
        src={src}
        alt={alt}
        className={cn('w-full h-full object-cover', imageClassName)}
      />

      {/* Magnifier Lens */}
      <div
        className={cn(
          'absolute pointer-events-none rounded-full border-2 border-primary/60 shadow-lg transition-opacity duration-200 z-50',
          'bg-background/5 backdrop-blur-[1px]',
          showMagnifier ? 'opacity-100' : 'opacity-0'
        )}
        style={{
          width: magnifierSize,
          height: magnifierSize,
          left: cursorPosition.x - magnifierSize / 2,
          top: cursorPosition.y - magnifierSize / 2,
          backgroundImage: `url(${src})`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: `${zoomLevel * 100}% ${zoomLevel * 100}%`,
          backgroundPosition: `${magnifierPosition.x}% ${magnifierPosition.y}%`,
          boxShadow: '0 4px 20px hsl(var(--primary) / 0.2), 0 0 0 1px hsl(var(--border))',
        }}
      >
        {/* Inner ring for glass effect */}
        <div className="absolute inset-1 rounded-full border border-primary/20" />
        
        {/* Center crosshair */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3 h-[1px] bg-primary/40" />
          <div className="absolute w-[1px] h-3 bg-primary/40" />
        </div>
      </div>
    </div>
  );
};
