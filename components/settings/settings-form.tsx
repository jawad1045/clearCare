"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sun, Moon, Monitor, Bell, BellOff, Settings2, Save } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const NOTIF_KEY = "hwp:notif-prefs";

interface NotifPrefs {
  emailNotifications: boolean;
  inAppNotifications: boolean;
}

const defaultNotifPrefs: NotifPrefs = {
  emailNotifications: true,
  inAppNotifications: true,
};

const themes = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
] as const;

const navItems = [
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "appearance", label: "Appearance", icon: Sun },
  { id: "system", label: "System", icon: Settings2 },
] as const;

type NavId = (typeof navItems)[number]["id"];

// ─── Sections ─────────────────────────────────────────────────────────────────

function NotificationsSection() {
  const [prefs, setPrefs] = useState<NotifPrefs>(defaultNotifPrefs);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(NOTIF_KEY);
      if (stored) setPrefs(JSON.parse(stored));
    } catch { /* ignore */ }
  }, []);

  function handleChange(key: keyof NotifPrefs, value: boolean) {
    const updated = { ...prefs, [key]: value };
    setPrefs(updated);
    localStorage.setItem(NOTIF_KEY, JSON.stringify(updated));
    toast.success("Preference saved");
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Notifications</h3>
        <p className="text-sm text-muted-foreground">
          Configure how you receive notifications from the portal.
        </p>
      </div>
      <Separator />
      <div className="space-y-4">
        {([
          { key: "emailNotifications", label: "Email Notifications", desc: "Receive referral updates and status changes via email." },
          { key: "inAppNotifications", label: "In-App Notifications", desc: "Show the notification bell and real-time alerts in the portal." },
        ] as const).map(({ key, label, desc }) => (
          <div key={key} className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label className="text-base">{label}</Label>
              <p className="text-sm text-muted-foreground">{desc}</p>
            </div>
            <div className="flex items-center gap-2">
              {prefs[key] ? <Bell className="h-4 w-4 text-emerald-500" /> : <BellOff className="h-4 w-4 text-muted-foreground" />}
              <Switch checked={prefs[key]} onCheckedChange={(v) => handleChange(key, v)} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AppearanceSection() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Appearance</h3>
        <p className="text-sm text-muted-foreground">
          Customize how the portal looks on your device.
        </p>
      </div>
      <Separator />
      <div className="space-y-2">
        <Label>Theme</Label>
        <p className="text-sm text-muted-foreground">Select the theme for the portal.</p>
        <div className="grid grid-cols-3 gap-3 pt-1">
          {themes.map(({ value, label, icon: Icon }) => {
            const active = mounted && theme === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => { setTheme(value); toast.success(`Theme set to ${label}`); }}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-lg border-2 p-6 transition-all hover:border-primary/60",
                  active ? "border-primary bg-primary/5" : "border-border bg-card"
                )}
              >
                <Icon className={cn("h-6 w-6", active ? "text-primary" : "text-muted-foreground")} />
                <span className={cn("text-sm font-medium", active ? "text-primary" : "text-muted-foreground")}>
                  {label}
                </span>
                {active && <Badge variant="secondary" className="text-xs">Active</Badge>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SystemSection() {
  const [companyName, setCompanyName] = useState("HWP Portal");
  const [supportEmail, setSupportEmail] = useState("support@hwp.com");
  const [saving, setSaving] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    setSaving(false);
    toast.success("System settings saved");
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">System</h3>
        <p className="text-sm text-muted-foreground">
          Global application settings for the portal.
        </p>
      </div>
      <Separator />
      <form onSubmit={handleSave} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="company-name">Portal Name</Label>
          <Input id="company-name" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="HWP Portal" />
          <p className="text-sm text-muted-foreground">Displayed in the browser tab and outgoing emails.</p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="support-email">Support Email</Label>
          <Input id="support-email" type="email" value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)} placeholder="support@hwp.com" />
          <p className="text-sm text-muted-foreground">Used as the reply-to address for system emails.</p>
        </div>
        <Button type="submit" disabled={saving} className="flex items-center gap-2">
          <Save className="h-4 w-4" />
          {saving ? "Saving…" : "Save changes"}
        </Button>
      </form>
    </div>
  );
}

// ─── Animated sidebar nav ─────────────────────────────────────────────────────

function SidebarNav({ active, onChange }: { active: NavId; onChange: (id: NavId) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ top: 0, height: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const activeEl = container.querySelector<HTMLButtonElement>(`[data-nav="${active}"]`);
    if (!activeEl) return;
    setIndicatorStyle({
      top: activeEl.offsetTop,
      height: activeEl.offsetHeight,
    });
  }, [active]);

  return (
    <div ref={containerRef} className="relative flex flex-col space-y-1">
      {/* sliding bar */}
      <span
        className="absolute left-0 w-0.5 rounded-full bg-primary transition-all duration-300 ease-in-out"
        style={{ top: indicatorStyle.top, height: indicatorStyle.height }}
      />

      {navItems.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          data-nav={id}
          type="button"
          onClick={() => onChange(id)}
          className={cn(
            "flex items-center gap-2 rounded-md pl-4 pr-3 py-2 text-sm font-medium transition-colors w-full text-left",
            active === id
              ? "text-foreground font-semibold"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          )}
        >
          <Icon className="h-4 w-4 shrink-0" />
          {label}
        </button>
      ))}
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export function SettingsForm() {
  const [active, setActive] = useState<NavId>("notifications");

  const sectionMap: Record<NavId, React.ReactNode> = {
    notifications: <NotificationsSection />,
    appearance: <AppearanceSection />,
    system: <SystemSection />,
  };

  return (
    <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
      <aside className="lg:w-48 shrink-0">
        <SidebarNav active={active} onChange={setActive} />
      </aside>
      <div className="flex-1 max-w-2xl">
        {sectionMap[active]}
      </div>
    </div>
  );
}
