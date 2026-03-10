import { Link2, Check, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface App {
  id: string;
  name: string;
  icon: string;
  connected: boolean;
}

interface AppsIntegrationsProps {
  connectedFacebook: boolean;
  slackConnected: boolean;
  onConnect: (appId: string) => void;
}

export const AppsIntegrations = ({ connectedFacebook, slackConnected, onConnect }: AppsIntegrationsProps) => {
  const apps: App[] = [
    { id: 'facebook', name: 'Facebook Ads', icon: '📘', connected: connectedFacebook },
    { id: 'trackers', name: 'Trackers (Pixel)', icon: '📊', connected: connectedFacebook },
    { id: 'slack', name: 'Slack Notifications', icon: '💬', connected: slackConnected },
  ];

  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2">
        <Link2 className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-medium text-foreground">Apps & Integrations</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        {apps.map(app => (
          <div
            key={app.id}
            className="flex items-center gap-3 rounded-xl border border-border/40 bg-card/60 p-3 hover:bg-muted/30 transition-all"
          >
            <span className="text-lg">{app.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground">{app.name}</p>
            </div>
            {app.connected ? (
              <span className="flex items-center gap-1 text-[10px] text-secondary font-medium px-2 py-0.5 rounded-full bg-secondary/10">
                <Check className="w-3 h-3" /> Connected
              </span>
            ) : (
              <button
                onClick={() => onConnect(app.id)}
                className="flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-lg bg-muted/50 border border-border/40 text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
              >
                <Plus className="w-3 h-3" /> Connect
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
