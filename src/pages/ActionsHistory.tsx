import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  ArrowLeft,
  Activity, 
  TrendingUp, 
  TrendingDown,
  Clock,
  CheckCircle2,
  XCircle,
  Calendar,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTrackedActions } from '@/hooks/useTrackedActions';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const formatDate = (isoString: string) => {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatTimeAgo = (isoString: string) => {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  
  if (diffDays > 0) return `${diffDays}d ago`;
  if (diffHours > 0) return `${diffHours}h ago`;
  return 'Just now';
};

const StatusIcon = ({ status }: { status: string }) => {
  switch (status) {
    case 'monitoring':
      return <Clock className="w-4 h-4 text-blue-400" />;
    case 'positive':
      return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
    case 'negative':
      return <XCircle className="w-4 h-4 text-rose-400" />;
    default:
      return <Activity className="w-4 h-4 text-muted-foreground" />;
  }
};

const StatusBadge = ({ status }: { status: string }) => {
  const variants: Record<string, string> = {
    monitoring: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    positive: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    negative: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    neutral: 'bg-muted/30 text-muted-foreground border-border/50'
  };

  const labels: Record<string, string> = {
    monitoring: 'Monitoring',
    positive: 'Positive Impact',
    negative: 'Needs Review',
    neutral: 'No Change'
  };

  return (
    <Badge variant="outline" className={cn("text-xs", variants[status] || variants.neutral)}>
      {labels[status] || 'Unknown'}
    </Badge>
  );
};

const CategoryBadge = ({ category }: { category: string }) => {
  const colors: Record<string, string> = {
    budget: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    creative: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
    targeting: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    schedule: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    pause: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    resume: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
  };

  return (
    <Badge variant="outline" className={cn("text-xs capitalize", colors[category] || 'bg-muted/30')}>
      {category}
    </Badge>
  );
};

export default function ActionsHistory() {
  const navigate = useNavigate();
  const { trackedActions, getSummary } = useTrackedActions();
  const summary = getSummary();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/95 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/command-center')}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Command Center
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Activity className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Actions History</h1>
              <p className="text-sm text-muted-foreground">
                Track the impact of all recommendations you've applied
              </p>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="p-4 rounded-xl border border-border/50 bg-card">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Total Actions</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{summary.total}</p>
          </div>
          
          <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/5">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-blue-400">Monitoring</span>
            </div>
            <p className="text-2xl font-bold text-blue-400">{summary.monitoring}</p>
          </div>
          
          <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="text-xs text-emerald-400">Positive Impact</span>
            </div>
            <p className="text-2xl font-bold text-emerald-400">{summary.positive}</p>
          </div>
          
          <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/5">
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="w-4 h-4 text-rose-400" />
              <span className="text-xs text-rose-400">Needs Review</span>
            </div>
            <p className="text-2xl font-bold text-rose-400">{summary.negative}</p>
          </div>
        </div>

        {/* Actions Table */}
        <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
          <div className="px-4 py-3 border-b border-border/30 bg-muted/20">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-foreground">All Actions</h2>
              <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
                <Filter className="w-4 h-4" />
                Filter
              </Button>
            </div>
          </div>

          {trackedActions.length === 0 ? (
            <div className="p-12 text-center">
              <Activity className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">No actions tracked yet</p>
              <p className="text-sm text-muted-foreground/70 mt-1">
                Apply recommendations from the Command Center to start tracking their impact
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Action</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Expected Impact</TableHead>
                  <TableHead>Actual Impact</TableHead>
                  <TableHead>Applied</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trackedActions.map((action) => (
                  <TableRow key={action.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <StatusIcon status={action.status} />
                        <span className="font-medium text-foreground">{action.title}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <CategoryBadge category={action.category} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={action.status} />
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">{action.expectedImpact}</span>
                    </TableCell>
                    <TableCell>
                      {action.actualImpact ? (
                        <div className="flex items-center gap-1">
                          {action.actualImpact.direction === 'up' ? (
                            <TrendingUp className="w-4 h-4 text-emerald-400" />
                          ) : action.actualImpact.direction === 'down' ? (
                            <TrendingDown className="w-4 h-4 text-rose-400" />
                          ) : null}
                          <span className={cn(
                            "text-sm font-medium",
                            action.actualImpact.direction === 'up' && "text-emerald-400",
                            action.actualImpact.direction === 'down' && "text-rose-400"
                          )}>
                            {action.actualImpact.change}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-blue-400 flex items-center gap-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                          Monitoring
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="w-3.5 h-3.5" />
                        <span title={formatDate(action.appliedAt)}>{formatTimeAgo(action.appliedAt)}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </main>
    </div>
  );
}
