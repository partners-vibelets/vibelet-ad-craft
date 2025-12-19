import { formatDistanceToNow, format, isToday, isYesterday, isThisWeek, isThisMonth } from 'date-fns';

/**
 * Format a date as relative time (e.g., "2 hours ago", "3 days ago")
 */
export const formatRelativeTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return formatDistanceToNow(dateObj, { addSuffix: true });
};

/**
 * Format a date for display in notification cards
 * Shows relative time for recent, full date for older
 */
export const formatNotificationTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  
  if (diffHours < 1) {
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    if (diffMinutes < 1) return 'Just now';
    return `${diffMinutes}m ago`;
  }
  
  if (diffHours < 24) {
    return `${Math.floor(diffHours)}h ago`;
  }
  
  if (isYesterday(dateObj)) {
    return `Yesterday at ${format(dateObj, 'h:mm a')}`;
  }
  
  if (isThisWeek(dateObj)) {
    return format(dateObj, 'EEEE');
  }
  
  if (isThisMonth(dateObj)) {
    return format(dateObj, 'MMM d');
  }
  
  return format(dateObj, 'MMM d, yyyy');
};

/**
 * Get a human-readable date group label
 */
export const getDateGroupLabel = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isToday(dateObj)) return 'Today';
  if (isYesterday(dateObj)) return 'Yesterday';
  if (isThisWeek(dateObj)) return 'This Week';
  if (isThisMonth(dateObj)) return 'This Month';
  return 'Older';
};

/**
 * Format full date for detailed view
 */
export const formatFullDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, "MMM d, yyyy 'at' h:mm a");
};
