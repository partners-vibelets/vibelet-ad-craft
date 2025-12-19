import { useEffect, useState, useMemo } from 'react';
import { AIRecommendation, PublishedCampaign, RecommendationLevel, RecommendationStatus } from '@/types/campaign';
import { 
  Bell, Clock, Check, X, TrendingUp, Copy, Play, Pause, DollarSign, 
  ArrowLeft, Filter, Calendar, Search, Layers, Target, Image, Megaphone,
  ChevronDown, AlertTriangle, Timer, Archive
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { mockRecommendations, mockPublishedCampaigns } from '@/data/mockPerformanceData';
import { formatNotificationTime, formatFullDate, getDateGroupLabel } from '@/lib/timeUtils';

// Status badge component
const StatusBadge = ({ status }: { status: RecommendationStatus }) => {
  const config = {
    pending: { label: 'Pending', icon: Clock, className: 'bg-amber-500/20 text-amber-600 border-amber-500/30' },
    applied: { label: 'Applied', icon: Check, className: 'bg-secondary/20 text-secondary border-secondary/30' },
    dismissed: { label: 'Dismissed', icon: X, className: 'bg-muted text-muted-foreground border-border' },
    deferred: { label: 'Deferred', icon: Timer, className: 'bg-blue-500/20 text-blue-600 border-blue-500/30' },
    expired: { label: 'Expired', icon: AlertTriangle, className: 'bg-destructive/20 text-destructive border-destructive/30' }
  };

  const { label, icon: Icon, className } = config[status];

  return (
    <Badge variant="outline" className={cn("text-xs px-2 py-0.5 gap-1", className)}>
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  );
};

// Priority badge component
const PriorityBadge = ({ priority }: { priority: AIRecommendation['priority'] }) => {
  const config = {
    high: { label: 'Urgent', className: 'bg-amber-500/20 text-amber-600 border-amber-500/30' },
    medium: { label: 'Medium', className: 'bg-muted text-muted-foreground border-border' },
    suggestion: { label: 'Tip', className: 'bg-muted text-muted-foreground border-border' }
  };

  const { label, className } = config[priority];

  return (
    <Badge variant="outline" className={cn("text-xs px-2 py-0.5", className)}>
      {label}
    </Badge>
  );
};

// Level badge component
const LevelBadge = ({ level }: { level: RecommendationLevel }) => {
  const config = {
    campaign: { label: 'Campaign', icon: Megaphone, className: 'bg-primary/10 text-primary border-primary/20' },
    adset: { label: 'Ad Set', icon: Target, className: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
    ad: { label: 'Ad', icon: Layers, className: 'bg-purple-500/10 text-purple-600 border-purple-500/20' },
    creative: { label: 'Creative', icon: Image, className: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20' }
  };

  const { label, icon: Icon, className } = config[level];

  return (
    <Badge variant="outline" className={cn("text-xs px-2 py-0.5 gap-1", className)}>
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  );
};

// Type icon component
const TypeIcon = ({ type }: { type: AIRecommendation['type'] }) => {
  const icons = {
    'budget-increase': TrendingUp,
    'budget-decrease': DollarSign,
    'pause-creative': Pause,
    'resume-campaign': Play,
    'clone-creative': Copy
  };
  const Icon = icons[type];
  
  return (
    <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 bg-muted text-muted-foreground">
      <Icon className="h-4 w-4" />
    </div>
  );
};

// Notification card for the log
const NotificationLogCard = ({ recommendation }: { recommendation: AIRecommendation }) => {
  const isActionable = recommendation.status === 'pending';
  
  return (
    <div className={cn(
      "glass-card p-4 rounded-xl transition-all duration-300",
      "hover:shadow-lg hover:shadow-primary/5 hover:border-primary/30",
      !isActionable && "opacity-75"
    )}>
      <div className="flex items-start gap-4">
        <TypeIcon type={recommendation.type} />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <StatusBadge status={recommendation.status} />
            <PriorityBadge priority={recommendation.priority} />
            <LevelBadge level={recommendation.level} />
          </div>
          
          <p className="text-xs text-primary font-medium mb-1">{recommendation.campaignName}</p>
          <h4 className="text-sm font-semibold text-foreground mb-1">{recommendation.title}</h4>
          <p className="text-sm text-muted-foreground line-clamp-2">{recommendation.reasoning}</p>
          
          {/* Time info */}
          <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>Sent: {formatNotificationTime(recommendation.createdAt)}</span>
            </div>
            {recommendation.actionTakenAt && (
              <div className="flex items-center gap-1">
                <Check className="h-3 w-3" />
                <span>Action: {formatNotificationTime(recommendation.actionTakenAt)}</span>
              </div>
            )}
            {recommendation.expiresAt && recommendation.status === 'pending' && (
              <div className="flex items-center gap-1">
                <Timer className="h-3 w-3" />
                <span>Expires: {formatNotificationTime(recommendation.expiresAt)}</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Quick stats */}
        {recommendation.projectedImpact && recommendation.projectedImpact.length > 0 && (
          <div className="hidden md:flex flex-col gap-1 text-right">
            {recommendation.projectedImpact.slice(0, 2).map((impact, i) => (
              <div key={i} className="text-xs">
                <span className="text-muted-foreground">{impact.label}: </span>
                <span className="font-medium text-foreground">{impact.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default function NotificationLog() {
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<string>('all');

  useEffect(() => {
    // Load data from sessionStorage or use mock data
    const storedRecommendations = sessionStorage.getItem('vibelets_all_recommendations');
    if (storedRecommendations) {
      setRecommendations(JSON.parse(storedRecommendations));
    } else {
      setRecommendations(mockRecommendations);
    }
  }, []);

  const handleGoBack = () => {
    window.history.back();
  };

  // Filter by date range
  const filterByDate = (rec: AIRecommendation): boolean => {
    const createdAt = new Date(rec.createdAt);
    const now = new Date();
    
    switch (dateFilter) {
      case 'today':
        return createdAt.toDateString() === now.toDateString();
      case 'yesterday': {
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        return createdAt.toDateString() === yesterday.toDateString();
      }
      case 'week': {
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return createdAt >= weekAgo;
      }
      case 'month': {
        const monthAgo = new Date(now);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return createdAt >= monthAgo;
      }
      default:
        return true;
    }
  };

  // Filter recommendations
  const filteredRecommendations = useMemo(() => {
    return recommendations.filter(rec => {
      // Tab filter
      if (activeTab !== 'all' && rec.status !== activeTab) return false;
      
      // Search
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          rec.title.toLowerCase().includes(query) ||
          rec.reasoning.toLowerCase().includes(query) ||
          rec.campaignName.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }
      
      // Filters
      const matchesStatus = statusFilter === 'all' || rec.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || rec.priority === priorityFilter;
      const matchesLevel = levelFilter === 'all' || rec.level === levelFilter;
      const matchesDate = filterByDate(rec);
      
      return matchesStatus && matchesPriority && matchesLevel && matchesDate;
    });
  }, [recommendations, activeTab, searchQuery, statusFilter, priorityFilter, levelFilter, dateFilter]);

  // Group recommendations by date
  const groupedRecommendations = useMemo(() => {
    const groups: Record<string, AIRecommendation[]> = {};
    
    filteredRecommendations.forEach(rec => {
      const group = getDateGroupLabel(rec.createdAt);
      if (!groups[group]) groups[group] = [];
      groups[group].push(rec);
    });
    
    // Sort each group by date (newest first)
    Object.values(groups).forEach(group => {
      group.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    });
    
    return groups;
  }, [filteredRecommendations]);

  // Stats
  const stats = useMemo(() => ({
    total: recommendations.length,
    pending: recommendations.filter(r => r.status === 'pending').length,
    applied: recommendations.filter(r => r.status === 'applied').length,
    dismissed: recommendations.filter(r => r.status === 'dismissed').length,
    expired: recommendations.filter(r => r.status === 'expired').length,
    deferred: recommendations.filter(r => r.status === 'deferred').length
  }), [recommendations]);

  const groupOrder = ['Today', 'Yesterday', 'This Week', 'This Month', 'Older'];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={handleGoBack} className="text-muted-foreground">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div className="h-6 w-px bg-border" />
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <Bell className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-foreground">Notification History</h1>
                  <p className="text-sm text-muted-foreground">
                    {stats.total} total recommendations
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Bar */}
      <div className="border-b border-border/50 bg-background">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10">
              <Clock className="h-4 w-4 text-amber-600" />
              <span className="text-sm font-medium text-amber-600">{stats.pending} pending</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/10">
              <Check className="h-4 w-4 text-secondary" />
              <span className="text-sm font-medium text-secondary">{stats.applied} applied</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted">
              <X className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">{stats.dismissed} dismissed</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-destructive/10">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <span className="text-sm font-medium text-destructive">{stats.expired} expired</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
            <TabsTrigger value="applied">Applied ({stats.applied})</TabsTrigger>
            <TabsTrigger value="dismissed">Dismissed ({stats.dismissed})</TabsTrigger>
            <TabsTrigger value="expired">Expired ({stats.expired})</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Search and Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search recommendations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-muted/30"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-[130px] h-9 text-sm bg-muted/30">
                <Calendar className="h-3.5 w-3.5 mr-2" />
                <SelectValue placeholder="Date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="yesterday">Yesterday</SelectItem>
                <SelectItem value="week">Last 7 Days</SelectItem>
                <SelectItem value="month">Last 30 Days</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[110px] h-9 text-sm bg-muted/30">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="high">Urgent</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="suggestion">Tips</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className="w-[110px] h-9 text-sm bg-muted/30">
                <SelectValue placeholder="Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="campaign">Campaign</SelectItem>
                <SelectItem value="adset">Ad Set</SelectItem>
                <SelectItem value="ad">Ad</SelectItem>
                <SelectItem value="creative">Creative</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results */}
        {filteredRecommendations.length === 0 ? (
          <div className="text-center py-16 glass-card rounded-xl">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Archive className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-semibold text-foreground mb-2">No notifications found</h2>
            <p className="text-muted-foreground">Try adjusting your filters or search query</p>
          </div>
        ) : (
          <div className="space-y-6">
            {groupOrder.map(groupName => {
              const group = groupedRecommendations[groupName];
              if (!group || group.length === 0) return null;
              
              return (
                <div key={groupName}>
                  <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {groupName}
                    <span className="text-xs bg-muted px-2 py-0.5 rounded-full">{group.length}</span>
                  </h3>
                  <div className="space-y-3">
                    {group.map(rec => (
                      <NotificationLogCard key={rec.id} recommendation={rec} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
