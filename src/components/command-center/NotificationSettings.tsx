import { useState, useEffect } from 'react';
import { Bell, BellOff, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useNotifications, NotificationSettings as Settings } from '@/hooks/useNotifications';

export const NotificationSettings = () => {
  const { getSettings, updateSettings, requestBrowserPermission } = useNotifications();
  const [settings, setSettings] = useState<Settings>(getSettings());
  const [browserPermission, setBrowserPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if ('Notification' in window) {
      setBrowserPermission(Notification.permission);
    }
  }, []);

  const handleSoundToggle = (enabled: boolean) => {
    updateSettings({ soundEnabled: enabled });
    setSettings(prev => ({ ...prev, soundEnabled: enabled }));
  };

  const handleBrowserToggle = async (enabled: boolean) => {
    if (enabled && browserPermission !== 'granted') {
      const granted = await requestBrowserPermission();
      if (granted) {
        setBrowserPermission('granted');
        updateSettings({ browserNotificationsEnabled: true });
        setSettings(prev => ({ ...prev, browserNotificationsEnabled: true }));
      }
    } else {
      updateSettings({ browserNotificationsEnabled: enabled });
      setSettings(prev => ({ ...prev, browserNotificationsEnabled: enabled }));
    }
  };

  const hasActiveNotifications = settings.soundEnabled || settings.browserNotificationsEnabled;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground relative"
        >
          {hasActiveNotifications ? (
            <Bell className="w-4 h-4" />
          ) : (
            <BellOff className="w-4 h-4" />
          )}
          {hasActiveNotifications && (
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-primary rounded-full" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72" align="end">
        <div className="space-y-4">
          <div className="space-y-1">
            <h4 className="font-medium text-sm">Notification Settings</h4>
            <p className="text-xs text-muted-foreground">
              Get alerted when important changes happen
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {settings.soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-primary" />
                ) : (
                  <VolumeX className="w-4 h-4 text-muted-foreground" />
                )}
                <Label htmlFor="sound" className="text-sm">Sound alerts</Label>
              </div>
              <Switch
                id="sound"
                checked={settings.soundEnabled}
                onCheckedChange={handleSoundToggle}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {settings.browserNotificationsEnabled ? (
                  <Bell className="w-4 h-4 text-primary" />
                ) : (
                  <BellOff className="w-4 h-4 text-muted-foreground" />
                )}
                <Label htmlFor="browser" className="text-sm">Browser notifications</Label>
              </div>
              <Switch
                id="browser"
                checked={settings.browserNotificationsEnabled}
                onCheckedChange={handleBrowserToggle}
                disabled={browserPermission === 'denied'}
              />
            </div>

            {browserPermission === 'denied' && (
              <p className="text-xs text-amber-500">
                Browser notifications blocked. Enable in browser settings.
              </p>
            )}
          </div>

          <div className="pt-2 border-t border-border/50">
            <p className="text-xs text-muted-foreground">
              You'll be notified about high-priority recommendations and significant performance changes.
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
